let EXPORTED_SYMBOLS = ["Tabs"];

Components.utils.import("resource://gre/modules/Services.jsm");

let Tabs = function(TabHandlers, TabHandlerStore, IndicationBars) {
    this.onOpen = function(event) {
        let tab = event.target;
        let tabPseudoId = tab.linkedPanel; // this will be used as a reference key in store
        let tabHandler = new TabHandlers.TabHandler(tab);
        
        TabHandlerStore.addItem(tabPseudoId, tabHandler);
        tabHandler.refresh();
    };
    
    this.onClose = function(event) {
        let tab = event.target;
        
        TabHandlerStore.removeItem(tab.linkedPanel, function(tabHandler) {
            tabHandler.clear();
        });
    };
    
    this.onSelect = function(event) {
        let tab = event.target;
        let tabWindow = tab.ownerDocument.defaultView;
        let tabHandler = TabHandlerStore.getItem(tab.linkedPanel);
        IndicationBars.changeColorForWindow(tabWindow, tabHandler.activeTabHSLColor.getHTMLColor());
    };
    
    this.onTabProgress = {   
        onLinkIconAvailable: function(aBrowser) {
            let window = Services.wm.getMostRecentWindow("navigator:browser");
            let tab = window.gBrowser.getTabForBrowser ? window.gBrowser.getTabForBrowser(aBrowser) :
                                                         window.gBrowser._getTabForBrowser(aBrowser);
            let tabHandler = TabHandlerStore.getItem(tab.linkedPanel);
            tabHandler.refresh();
        }
    };
    
    this.init = function(window) {
        let tabBrowser = window.gBrowser;
        
        for (let tab of tabBrowser.tabs) {
            let tabPseudoId = tab.linkedPanel; // this will be used as a reference key in store
            let tabHandler = new TabHandlers.TabHandler(tab);
            
            TabHandlerStore.addItem(tabPseudoId, tabHandler);
            tabHandler.refresh();
        }
        
        tabBrowser.addTabsProgressListener(this.onTabProgress);
        tabBrowser.tabContainer.addEventListener("TabOpen", this.onOpen, false);
        tabBrowser.tabContainer.addEventListener("TabClose", this.onClose, false);
        tabBrowser.tabContainer.addEventListener("TabSelect", this.onSelect, false);
    };
    
    this.clear = function(window) {
        let tabBrowser = window.gBrowser;
        
        // clear only tab handlers with tabs from currently cleared window
        for (let tab of tabBrowser.tabs) {
            TabHandlerStore.removeItem(tab.linkedPanel, function(tabHandler) {
                tabHandler.clear();
            });
        }
        
        tabBrowser.removeTabsProgressListener(this.onTabProgress);
        tabBrowser.tabContainer.removeEventListener("TabOpen", this.onOpen, false);
        tabBrowser.tabContainer.removeEventListener("TabClose", this.onClose, false);
        tabBrowser.tabContainer.removeEventListener("TabSelect", this.onSelect, false);
    };
};