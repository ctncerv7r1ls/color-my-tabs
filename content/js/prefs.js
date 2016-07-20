let EXPORTED_SYMBOLS = ["_Prefs"];

Components.utils.import("resource://gre/modules/devtools/Console.jsm");

let _Prefs = function(cmtName) {
    this.defaultPrefs = {
        tabDefaultColor: "#E0E0E0",
        tabFadingColor: "#F0F0F0",
        tabFadingStyle: 1,
        
        activeTabFadingRange: 5,
        activeTabFadingPower: 5,
        activeTabSaturation: 40,
        activeTabBrightness: 70,
        activeTabOpacity: 100,
        activeTabFontColor: "#000000",
        activeTabFontShadowColor: "#FFFFFF",
        
        inactiveTabFadingRange: 5,
        inactiveTabFadingPower: 5,
        inactiveTabSaturation: 30,
        inactiveTabBrightness: 60,
        inactiveTabOpacity: 100,
        inactiveTabFontColor: "#000000",
        inactiveTabFontShadowColor: "#FFFFFF",
        
        hoveredTabFadingRange: 5,
        hoveredTabFadingPower: 5,
        hoveredTabSaturation: 35,
        hoveredTabBrightness: 65,
        hoveredTabOpacity: 100,
        hoveredTabFontColor: "#000000",
        hoveredTabFontShadowColor: "#FFFFFF",
        
        allowColorBrightnessFixes: 1,
        boldActiveTabTitle: true,
        showTabTitleShadow: true,
        showIndicationBar: true
    };
    
    this.currentPrefs = {};
    
    this.prefsBranch = Components.classes["@mozilla.org/preferences-service;1"]
                                 .getService(Components.interfaces.nsIPrefService)
                                 .getBranch("extensions." + cmtName + ".");
                                
    this.init = function() {
        // loads all saved preferences into currentPrefs
        // if a pref is not saved it's firstly saved with default value and then loaded into currentPrefs
        for (let prefName in this.defaultPrefs) {
            let prefNotExists = !this.prefsBranch.getPrefType(prefName);
            let prefValue = this.defaultPrefs[prefName];
            let prefType = typeof prefValue;
            
            switch (prefType) {
                case "string": {
                    if (prefNotExists) {
                        this.prefsBranch.setCharPref(prefName, prefValue);
                    }
                    this.currentPrefs[prefName] = this.prefsBranch.getCharPref(prefName);
                    break;
                }
                
                case "number": {
                    if (prefNotExists) {
                        this.prefsBranch.setIntPref(prefName, prefValue);
                    }
                    this.currentPrefs[prefName] = this.prefsBranch.getIntPref(prefName);
                    break;
                }
                
                case "boolean": {
                    if (prefNotExists) {
                        this.prefsBranch.setBoolPref(prefName, prefValue);
                    }
                    this.currentPrefs[prefName] = this.prefsBranch.getBoolPref(prefName);
                    break;
                }
            }
        }
    };
    
    
    this.save = function() {
        // saves all preferences stored in currentPrefs
         for (let prefName in this.currentPrefs) {
            let prefValue = this.currentPrefs[prefName];
            let prefType = typeof prefValue;
            
            switch (prefType) {
                case "string": {
                    this.prefsBranch.setCharPref(prefName, prefValue);
                    break;
                }
                
                case "number": {
                    this.prefsBranch.setIntPref(prefName, prefValue);
                    break;
                }
                
                case "boolean": {
                    this.prefsBranch.setBoolPref(prefName, prefValue);
                    break;
                }
            }
        }   
    };
    
    this.getValue = function(prefName) {
        return this.currentPrefs[prefName];
    };
    
    this.feedPrefWindow = function(window, feedDefaults) {
        // sets values for preference input fields inside preferences window
        let windowDoc = window.document;

        for (let prefName in this.defaultPrefs) {
            let prefControl = windowDoc.getElementById(prefName);
            
            if (prefControl) {
                let prefValue = feedDefaults ? this.defaultPrefs[prefName] : this.currentPrefs[prefName];
                
                if (prefControl.type == "number") {
                    prefControl.valueNumber = prefValue;
                } else if (prefControl.tagName == "checkbox") {
                    prefControl.checked = prefValue;
                } else {
                    prefControl.value = prefValue;
                }
            }
        }
    };
    
    this.saveFromPrefWindow = function(window) {
        // saves all values from preference input fields inside preferences window
        let windowDoc = window.document;

        for (let prefName in this.currentPrefs) {
            let prefControl = windowDoc.getElementById(prefName);
            
            if (prefControl) {
                let prefValue = null;
                
                if (prefControl.type == "number" || prefControl.tagName == "menulist") {
                    prefValue = parseInt(prefControl.value);
                } else if (prefControl.tagName == "checkbox") {
                    prefValue = prefControl.checked;
                } else {
                    prefValue = prefControl.value;
                }
                
                if (prefValue != null) {
                    this.currentPrefs[prefName] = prefValue;
                }
            }
        }
       
        this.save();
    };
    
    this.onOpen = {
        prefs: this,
        feedPrefWindow: this.feedPrefWindow,
        observe: function(aSubject, aTopic, aData) {
            this.feedPrefWindow.call(this.prefs, aSubject);
        }
    };
    
    this.onReset = {
        prefs: this,
        feedPrefWindow: this.feedPrefWindow,
        observe: function(aSubject, aTopic, aData) {
            this.feedPrefWindow.call(this.prefs, aSubject, true);
        }
    };
    
    this.onApply = {
        // this should be overwritten to get Windows access which is unavailable here (terrible dependency)
        
        //prefs: this,
        //saveFromPrefWindow: this.saveFromPrefWindow,
        observe: function(aSubject, aTopic, aData) {
            //this.saveFromPrefWindow.call(this.prefs, aSubject);
            //Windows.clear();
            //Windows.init();
        }
    };
};