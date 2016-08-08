Components.utils.import("resource://gre/modules/Services.jsm");

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
    // object as a scope for imports
    let Imports = {};
    
    // import own modules
    Components.utils.import(cmtJSPath + "prefs.js", Imports);
    Components.utils.import(cmtJSPath + "stylesheets.js", Imports);
    Components.utils.import(cmtJSPath + "rgbcolor.js", Imports);
    Components.utils.import(cmtJSPath + "hslcolor.js", Imports);
    Components.utils.import(cmtJSPath + "store.js", Imports);
    Components.utils.import(cmtJSPath + "gfx.js", Imports);
    Components.utils.import(cmtJSPath + "cssrule.js", Imports);
    Components.utils.import(cmtJSPath + "cssrules.js", Imports);
    Components.utils.import(cmtJSPath + "indbars.js", Imports);
    Components.utils.import(cmtJSPath + "tabhandlers.js", Imports);
    Components.utils.import(cmtJSPath + "tabs.js", Imports);
    Components.utils.import(cmtJSPath + "windows.js", Imports);
    
    let RGBColor = Imports.RGBColor;
    let HSLColor = Imports.HSLColor;
    let Store = Imports.Store;
    let CSSRule = Imports.CSSRule;
    
    // create new Store objects for tab handlers and colors
    let TabHandlerStore = new Imports.Store();
    RGBColorStore = new Imports.Store(500); // colors cache limited to 500 entries
    
    // create new objects from module symbols with passed dependencies
    Prefs = new Imports.Prefs(cmtName);
    
    let Gfx = new Imports.Gfx(Prefs, RGBColor, RGBColorStore);
    let CSSRules = new Imports.CSSRules(CSSRule, HSLColor, Prefs, Gfx, cmtTabId, cmtIndBarId);
    let StyleSheets = new Imports.StyleSheets(cmtStyleSheetId, CSSRules);
    let IndicationBars = new Imports.IndicationBars(StyleSheets, CSSRules, cmtIndBarId, Prefs);
    let TabHandlers = new Imports.TabHandlers(Prefs, HSLColor, RGBColor, CSSRules, Gfx, StyleSheets,
                                              cmtTabId, IndicationBars);
    
    let Tabs = new Imports.Tabs(TabHandlers, TabHandlerStore);
    
    Windows = new Imports.Windows(StyleSheets, IndicationBars, Tabs);
    
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