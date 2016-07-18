let EXPORTED_SYMBOLS = ["_Tabs"];

let _Tabs = function(TabHandlers, TabHandlerStore) {
    this.onOpen = function(event) {
        let tab = event.target;        
        let tabHandler = new TabHandlers.TabHandler(tab);
        TabHandlerStore.addItem(tabHandler.tabId, tabHandler);
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
        TabHandlerStore.removeAllItems(function(tabHandler) {
            tabHandler.clear();
        });
        
        let tabBrowser = window.gBrowser;
        tabBrowser.tabContainer.removeEventListener("TabOpen", this.onTabOpen, false);
        tabBrowser.tabContainer.removeEventListener("TabClose", this.onTabClose, false);
    };
};