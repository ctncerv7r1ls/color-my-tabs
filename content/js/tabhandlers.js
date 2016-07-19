let EXPORTED_SYMBOLS = ["_TabHandlers"];

Components.utils.import("resource://gre/modules/Promise.jsm");

let _TabHandlers = function(Prefs, HSLColor, RGBColor, CSSRules, Gfx, StyleSheets, cmtTabId, IndicationBars) {
    this.TabHandler = function(tab) { 
        this.tab = tab;
        this.tabId = cmtTabId + String.split(tab.linkedPanel, "panel").pop(); // extract only number from "linkedpanel123123123"
        tab.setAttribute("id", this.tabId); // set custom id for recognition purposes
        
        this.cssRules = []; // this will keep actual DOM CSS rule references
        this.deferredColorAssignment = null; // if set it means that color assignment is still executed
        this.activeTabHSLColor = new HSLColor(); // this will be used to set color of an indication bar
        
        let tabHandler = this;
        
        // mutation observer reacts to changes of tab's attributes
        this.mutationObserver = new tab.ownerDocument.defaultView.MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName == "image") {
                    tabHandler.refresh(); // refresh tab appearance when the image changes
                } else if (tabHandler.tab.hasAttribute("selected")) {
                    // when tab is being selected try to change color of window related indication bar
                    if (Prefs.getValue("showIndicationBar")) {
                        let tabWindow = tab.ownerDocument.defaultView; // get window related to this tab
                        IndicationBars.changeColorForWindow(tabWindow, tabHandler.activeTabHSLColor.getHTMLColor());
                    }
                }
            });
        });
        
        this.mutationObserver.observe(tab, {
            attributes: true, // yes we are interested in attributes
            attributeFilter: ["image", "selected"] // especially "image" and "selected" change
        });
    };

    this.TabHandler.prototype.assignColor = function() {
        let deferred = Promise.defer();
        
        if (this.deferredColorAssignment) {
            this.deferredColorAssignment.reject(); // stop previous method execution
        }
        
        this.deferredColorAssignment = deferred; // replace the reference with this executed right now
        
        if (this.tab.hasAttribute("image")) {
            let faviconSrc = this.tab.getAttribute("image"); // if tab has an image we will take its address
            let tabHandler = this;

            Gfx.getFaviconRGBColor(faviconSrc).then(function(rgbColor) {
                // this is executed when function successfully finds an RGB color
                tabHandler.deferredColorAssignment = null; // reset this reference, as this method is finished
                deferred.resolve(rgbColor);
            });
        } else {
            let defaultColor = new RGBColor(); // if tab has no image we will create a new RGB color
            defaultColor.loadFromHTMLColor(Prefs.getValue("tabDefaultColor")); // and load the default color from preferences
            
            this.deferredColorAssignment = null; // reset this reference, as this method is finished
            deferred.resolve(defaultColor, true);
        }

        return deferred.promise;
    };

    this.TabHandler.prototype.applyStyling = function(rgbColor, defaultColor) {   
        let tabWindow = this.tab.ownerDocument.defaultView; // get a window related to this tab
        let styleSheet = StyleSheets.get(tabWindow); // get a stylesheet embedded into this window
        
        if (styleSheet) {
            // create tab related CSS rules
            let activeTabCSSRule = new CSSRules.ActiveTabCSSRule(this.tabId, rgbColor, defaultColor);
            let inactiveTabCSSRule = new CSSRules.InactiveTabCSSRule(this.tabId, rgbColor, defaultColor);
            let hoveredTabCSSRule = new CSSRules.HoveredTabCSSRule(this.tabId, rgbColor, defaultColor);
            
            this.activeTabHSLColor.loadFromHSLColor(activeTabCSSRule.hslColor); // keep active tab color for indication bar...
            
            if (this.tab.selected) {
                IndicationBars.changeColorForWindow(tabWindow, activeTabCSSRule.hslColor.getHTMLColor()); // ...and change its color if tab is selected
            }
            
            if (this.cssRules.length > 0) {
                // if there is at least one applied CSS rule reference for this tab...
                let cssRuleIndex = StyleSheets.getCSSRuleIndex(styleSheet, this.cssRules[0]); // ...get index of the first one
                
                if (cssRuleIndex) {
                    // CSS rules are always applied and inserted into the list consecutively
                    activeTabCSSRule.apply(styleSheet, cssRuleIndex);
                    inactiveTabCSSRule.apply(styleSheet, cssRuleIndex + 1); // ...so just increase indices
                    hoveredTabCSSRule.apply(styleSheet, cssRuleIndex + 2); // ...
                }
            } else {
                // if there are no CSS rules stored it means that they must be firstly applied and then stored
                this.cssRules.push(activeTabCSSRule.apply(styleSheet));
                this.cssRules.push(inactiveTabCSSRule.apply(styleSheet));
                this.cssRules.push(hoveredTabCSSRule.apply(styleSheet));
                
                let pinnedNotifiedTabCSSRule = new CSSRules.PinnedNotifiedTabCSSRule(this.tabId); // one-time rule
                this.cssRules.push(pinnedNotifiedTabCSSRule.apply(styleSheet));
            }
        }
    };

    this.TabHandler.prototype.clearStyling = function() {
        let tabWindow = this.tab.ownerDocument.defaultView; // get related window for this tab
        let styleSheet = StyleSheets.get(tabWindow); // get related stylesheet to this window
        
        if (styleSheet) {
            // get only index of first rule
            let cssRuleIndex = StyleSheets.getCSSRuleIndex(styleSheet, this.cssRules[0]);
            
            if (cssRuleIndex) {
                for (let rule of this.cssRules) {
                    // after each deletion the list shifts but the index variable stays the same and points to a next rule
                    styleSheet.deleteRule(cssRuleIndex);
                }
            }
        }
    };

    this.TabHandler.prototype.refresh = function() {
        let deferred = Promise.defer();
        let tabHandler = this;

        this.assignColor().then(function(rgbColor) {
            // this is executed when color assignment is successful
            tabHandler.applyStyling(rgbColor);
            deferred.resolve();
        });
        
        return deferred.promise;
    };

    this.TabHandler.prototype.clear = function() {
        // reverts any changes for this tab
        this.tab.removeAttribute("id");
        this.mutationObserver.disconnect();
        this.clearStyling();
    };
};