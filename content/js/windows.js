let EXPORTED_SYMBOLS = ["_Windows"];

let WindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);

let _Windows = function(StyleSheets, IndicationBars, Tabs) {
    this.windowListener = {
        onOpenWindow: function(nsIObj) {
            let domWindow = nsIObj.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
            
            // window is useful only after DOM has been loaded so we must put proper methods in a temporary load event listener
            domWindow.addEventListener("load", function() {
                domWindow.removeEventListener("load", arguments.callee, false);
                domWindow.setTimeout( function() {
                    // execute only it this is a real browser window, not some kind of alert etc.
                    if (domWindow.document.documentElement.getAttribute("windowtype") === "navigator:browser") {
                        StyleSheets.init(domWindow);
                        IndicationBars.init(domWindow);
                        Tabs.init(domWindow);
                    }
                }, 0, domWindow );
            }, false);
        },
        
        onCloseWindow: function(nsIObj) {
            let domWindow = nsIObj.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
            // execute only it this is a real browser window, not some kind of alert etc.
            if (domWindow.document.documentElement.getAttribute("windowtype") === "navigator:browser") {
                StyleSheets.clear(domWindow);
                IndicationBars.clear(domWindow);
            }
        }
    };

    this.init = function() {          
        let windowsEnumerator = WindowMediator.getEnumerator("navigator:browser");
        
        while (windowsEnumerator.hasMoreElements()) {
            let window = windowsEnumerator.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
            
            StyleSheets.init(window);
            IndicationBars.init(window);
            Tabs.init(window);
        }
        
        WindowMediator.addListener(this.windowListener);
    };
    
    this.clear = function() {
        WindowMediator.removeListener(this.windowListener);
        
        let windowsEnumerator = WindowMediator.getEnumerator("navigator:browser");
        
        while (windowsEnumerator.hasMoreElements()) {
            let window = windowsEnumerator.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
            
            StyleSheets.clear(window);
            IndicationBars.clear(window);
            Tabs.clear(window);
        }
    }
};