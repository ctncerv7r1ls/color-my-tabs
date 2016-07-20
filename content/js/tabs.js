let EXPORTED_SYMBOLS = ["_Tabs"];

let _Tabs = function(TabHandlers, TabHandlerStore) {
    this.onOpen = function(event) {
        let tab = event.target;
        let tabPseudoId = tab.linkedPanel; // this will be used as a key for reference in store
        let tabHandler = new TabHandlers.TabHandler(tab);
        TabHandlerStore.addItem(tabPseudoId, tabHandler);
        tabHandler.refresh();
    };
    
    this.onClose = function(event) {
        let tab = event.target;
        TabHandlerStore.removeItem(tab.id, function(tabHandler) {
            tabHandler.clear();
        });
    };
    
    this.init = function(window) {
        let tabBrowser = window.gBrowser;
        
        for (let tab of tabBrowser.tabs) {
            let tabHandler = new TabHandlers.TabHandler(tab);
            TabHandlerStore.addItem(tabHandler.tabId, tabHandler);
            tabHandler.refresh();
        }
        
        tabBrowser.tabContainer.addEventListener("TabOpen", this.onOpen, false);
        tabBrowser.tabContainer.addEventListener("TabClose", this.onClose, false);
    };
    
    this.clear = function(window) {
        let tabBrowser = window.gBrowser;
        
        // clear only tab handlers with tabs which belong to currently cleared window
        for (let tab of tabBrowser.tabContainer.childNodes) {
            let tabHandler = TabHandlerStore.getItem(tab.linkedPanel);
            if (tabHandler) {
                tabHandler.clear();
            }
        }
        
        tabBrowser.tabContainer.removeEventListener("TabOpen", this.onTabOpen, false);
        tabBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose, false);
    };
};