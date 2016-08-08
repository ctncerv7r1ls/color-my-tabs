Components.utils.import("resource://gre/modules/Services.jsm");

// set some common constants
const cmtName = "color-my-tabs";
const cmtJSPath = "chrome://" + cmtName + "/content/js/";
const cmtStyleSheetId = "cmtStyle";
const cmtIndBarId = "cmtIndBar";
const cmtTabId = "cmtTab";

// object as a scope for global imports
let GlobalImports = {};

// future global references from module symbols
let Prefs = null;
let Windows = null;
let RGBColorStore = null;

function startup(data, reason) {
    // object as a scope for local imports
    let LocalImports = {};
    
    // import own modules
    Components.utils.import(cmtJSPath + "prefs.js", GlobalImports);
    Components.utils.import(cmtJSPath + "stylesheets.js", LocalImports);
    Components.utils.import(cmtJSPath + "rgbcolor.js", LocalImports);
    Components.utils.import(cmtJSPath + "hslcolor.js", LocalImports);
    Components.utils.import(cmtJSPath + "store.js", LocalImports);
    Components.utils.import(cmtJSPath + "gfx.js", LocalImports);
    Components.utils.import(cmtJSPath + "cssrule.js", LocalImports);
    Components.utils.import(cmtJSPath + "cssrules.js", LocalImports);
    Components.utils.import(cmtJSPath + "indbars.js", LocalImports);
    Components.utils.import(cmtJSPath + "tabhandlers.js", LocalImports);
    Components.utils.import(cmtJSPath + "tabs.js", LocalImports);
    Components.utils.import(cmtJSPath + "windows.js", GlobalImports);
    
    let RGBColor = LocalImports.RGBColor;
    let HSLColor = LocalImports.HSLColor;
    let Store = LocalImports.Store;
    let CSSRule = LocalImports.CSSRule;
    
    // create new Store objects for tab handlers and colors
    let TabHandlerStore = new LocalImports.Store();
    RGBColorStore = new LocalImports.Store(500); // colors cache limited to 500 entries
    
    // create new objects from module symbols with passed dependencies
    Prefs = new GlobalImports.Prefs(cmtName);
    
    let Gfx = new LocalImports.Gfx(Prefs, RGBColor, RGBColorStore);
    let CSSRules = new LocalImports.CSSRules(CSSRule, HSLColor, Prefs, Gfx, cmtTabId, cmtIndBarId);
    let StyleSheets = new LocalImports.StyleSheets(cmtStyleSheetId, CSSRules);
    let IndicationBars = new LocalImports.IndicationBars(StyleSheets, CSSRules, cmtIndBarId, Prefs);
    let TabHandlers = new LocalImports.TabHandlers(Prefs, HSLColor, RGBColor, CSSRules, Gfx, StyleSheets,
                                                   cmtTabId, IndicationBars);
    
    let Tabs = new LocalImports.Tabs(TabHandlers, TabHandlerStore);
    
    Windows = new GlobalImports.Windows(StyleSheets, IndicationBars, Tabs);
    
    // overwrite onApply method in Prefs - it'll have to call Windows methods to reinit everything
    Prefs.onApply = {
        observe: function(aSubject, aTopic, aData) {
            Prefs.saveFromPrefWindow(aSubject); // aSubject is a DOMWindow instance
            Windows.clear();
            Windows.init();
        }
    };
    
    // init
    Prefs.init();
    Windows.init(); // this will do the rest (chained initialization)
    
    // add preferences window event observers
    Services.obs.addObserver(Prefs.onOpen, "cmtPrefsOpen", false);
    Services.obs.addObserver(Prefs.onReset, "cmtPrefsReset", false);
    Services.obs.addObserver(Prefs.onApply, "cmtPrefsApply", false);
}

function shutdown(data, reason) {
    // remove preferences window event observers
    Services.obs.removeObserver(Prefs.onOpen, "cmtPrefsOpen");
    Services.obs.removeObserver(Prefs.onReset, "cmtPrefsReset");
    Services.obs.removeObserver(Prefs.onApply, "cmtPrefsApply");
    
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

function install(data, reason) {} // dummy

function uninstall(data, reason) {} // dummy