// set observer service global reference
let ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);

// set some common constants
const cmtName = "color-my-tabs";
const cmtJSPath = "chrome://" + cmtName + "/content/js/";
const cmtStyleSheetId = "cmtStyle";
const cmtIndBarId = "cmtIndBar";
const cmtTabId = "cmtTab";

// future global references from module symbols
let Prefs = null;
let Windows = null;
let RGBColorStore = null;

function startup(data, reason) {
    // import own modules
    Components.utils.import(cmtJSPath + "prefs.js");
    Components.utils.import(cmtJSPath + "stylesheets.js");
    Components.utils.import(cmtJSPath + "rgbcolor.js");
    Components.utils.import(cmtJSPath + "hslcolor.js");
    Components.utils.import(cmtJSPath + "store.js");
    Components.utils.import(cmtJSPath + "gfx.js");
    Components.utils.import(cmtJSPath + "cssrule.js");
    Components.utils.import(cmtJSPath + "cssrules.js");
    Components.utils.import(cmtJSPath + "indbars.js");
    Components.utils.import(cmtJSPath + "tabhandlers.js");
    Components.utils.import(cmtJSPath + "tabs.js");
    Components.utils.import(cmtJSPath + "windows.js");
    
    // link object references with module symbols
    let RGBColor = _RGBColor;
    let HSLColor = _HSLColor;
    let Store = _Store;
    let CSSRule = _CSSRule;
    
    // create new Store objects
    let TabHandlerStore = new Store();
    RGBColorStore = new Store(500); // colors cache limited to 500 entries
    
    // create new objects from module symbols with passed dependencies
    Prefs = new _Prefs(cmtName);
    let StyleSheets = new _StyleSheets(cmtStyleSheetId);
    let Gfx = new _Gfx(Prefs, RGBColor, RGBColorStore);
    let CSSRules = new _CSSRules(CSSRule, HSLColor, Prefs, Gfx, cmtTabId, cmtIndBarId);
    let IndicationBars = new _IndicationBars(StyleSheets, CSSRules, cmtIndBarId, Prefs);
    let TabHandlers = new _TabHandlers(Prefs, HSLColor, RGBColor, CSSRules, Gfx, StyleSheets, cmtTabId, IndicationBars);
    let Tabs = new _Tabs(TabHandlers, TabHandlerStore);
    Windows = new _Windows(StyleSheets, IndicationBars, Tabs);
    
    // overwrite onApply event in Prefs because it'll have to call Windows methods to reinit everything
    Prefs.onApply = {
        observe: function(aSubject, aTopic, aData) {
            Prefs.saveFromPrefWindow(aSubject);
            Windows.clear();
            Windows.init();
        }
    };
    
    // init
    Prefs.init();
    Windows.init(); // this will do the rest (chained initialization)
    
    // add preferences window event observers
    ObserverService.addObserver(Prefs.onOpen, "cmtPrefsOpen", false);
    ObserverService.addObserver(Prefs.onReset, "cmtPrefsReset", false);
    ObserverService.addObserver(Prefs.onApply, "cmtPrefsApply", false);
}

function shutdown(data, reason) {
    // remove preferences window event observers
    ObserverService.removeObserver(Prefs.onOpen, "cmtPrefsOpen");
    ObserverService.removeObserver(Prefs.onReset, "cmtPrefsReset");
    ObserverService.removeObserver(Prefs.onApply, "cmtPrefsApply");
    
    // cleanup
    Windows.clear();
    RGBColorStore.removeAllItems();
    
    // unload own modules
    Components.utils.unload(cmtJSPath + "prefs.js");
    Components.utils.unload(cmtJSPath + "stylesheets.js");
    Components.utils.unload(cmtJSPath + "rgbcolor.js");
    Components.utils.unload(cmtJSPath + "hslcolor.js");
    Components.utils.unload(cmtJSPath + "store.js");
    Components.utils.unload(cmtJSPath + "gfx.js");
    Components.utils.unload(cmtJSPath + "cssrule.js");
    Components.utils.unload(cmtJSPath + "cssrules.js");
    Components.utils.unload(cmtJSPath + "indbars.js");
    Components.utils.unload(cmtJSPath + "tabhandlers.js");
    Components.utils.unload(cmtJSPath + "tabs.js");
    Components.utils.unload(cmtJSPath + "windows.js");
}

function install(data, reason) {
    // dummy
}

function uninstall(data, reason) {
    // dummy
}