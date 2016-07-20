let EXPORTED_SYMBOLS = ["_IndicationBars"];

let _IndicationBars = function(StyleSheets, CSSRules, cmtIndBarId, Prefs) {
    this.init = function(window) {
        if (Prefs.getValue("showIndicationBar")) {
            let navToolbox = window.document.getElementById("navigator-toolbox");
            
            if (navToolbox) {
                let indBar = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "dummy");
                
                indBar.setAttribute("id", cmtIndBarId);
                navToolbox.appendChild(indBar);
                
                let styleSheet = StyleSheets.get(window);
                
                let indBarCSSRule = new CSSRules.IndicationBarCSSRule();
                indBarCSSRule.apply(styleSheet);
                
                let indBarTabsOnTopCSSRule = new CSSRules.IndicationBarTabsOnTopCSSRule();
                indBarTabsOnTopCSSRule.apply(styleSheet);
            }
        }
    };
    
    this.clear = function(window) {
        let indBar = window.document.getElementById(cmtIndBarId);
        
        if (indBar) {
            indBar.parentNode.removeChild(indBar);
        }
    };
    
    this.changeColorForWindow = function(window, htmlColor) {
        if (Prefs.getValue("showIndicationBar")) {
            let indBar = window.document.getElementById(cmtIndBarId);
            
            if (indBar) {
                indBar.style.setProperty("background-color", htmlColor);
            }
        }
    };
};