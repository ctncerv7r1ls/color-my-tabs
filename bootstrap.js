Components.utils.import("resource://gre/modules/Services.jsm");

const extName = "color-my-tabs";
const extJSPath = "chrome://" + extName + "/content/js/";

// future global references of module symbols
let Prefs = null;
let Windows = null;
let RGBColorStore = null;

function startup(data, reason) {
    // object as a scope for imports
    let Imports = {};
    
    // import own modules
    Components.utils.import(extJSPath + "prefs.js", Imports);
    Components.utils.import(extJSPath + "stylesheets.js", Imports);
    Components.utils.import(extJSPath + "rgbcolor.js", Imports);
    Components.utils.import(extJSPath + "hslcolor.js", Imports);
    Components.utils.import(extJSPath + "store.js", Imports);
    Components.utils.import(extJSPath + "gfx.js", Imports);
    Components.utils.import(extJSPath + "cssrule.js", Imports);
    Components.utils.import(extJSPath + "cssrules.js", Imports);
    Components.utils.import(extJSPath + "indbars.js", Imports);
    Components.utils.import(extJSPath + "tabhandlers.js", Imports);
    Components.utils.import(extJSPath + "tabs.js", Imports);
    Components.utils.import(extJSPath + "windows.js", Imports);
    
    let RGBColor = Imports.RGBColor;
    let HSLColor = Imports.HSLColor;
    let Store = Imports.Store;
    let CSSRule = Imports.CSSRule;
    
    // create new Store objects for tab handlers and colors
    let TabHandlerStore = new Imports.Store();
    RGBColorStore = new Imports.Store(500); // colors cache limited to 500 entries
    
    // create new objects from module symbols with passed dependencies
    Prefs = new Imports.Prefs(extName);
    
    let Gfx = new Imports.Gfx(Prefs, RGBColor, RGBColorStore);
    let CSSRules = new Imports.CSSRules(CSSRule, HSLColor, Prefs, Gfx);
    let StyleSheets = new Imports.StyleSheets(CSSRules);
    let IndicationBars = new Imports.IndicationBars(StyleSheets, CSSRules, Prefs);
    let TabHandlers = new Imports.TabHandlers(Prefs, HSLColor, RGBColor, CSSRules, Gfx, StyleSheets, IndicationBars);
    
    let Tabs = new Imports.Tabs(TabHandlers, TabHandlerStore);
    
    Windows = new Imports.Windows(StyleSheets, IndicationBars, Tabs);
    
    // init
    Prefs.init();
    Windows.init(); // this will do the rest (chained initialization)
    
    // add preferences window event observers
    Services.obs.addObserver(Prefs.onOpen, "cmtPrefsOpen", false);
    Services.obs.addObserver(Prefs.onReset, "cmtPrefsReset", false);
    Services.obs.addObserver(Prefs.onApply, "cmtPrefsApply", false);
    Services.obs.addObserver(Windows.onPrefsApply, "cmtPrefsApply", false);
    Services.obs.addObserver(onCacheClear, "cmtPrefsCacheClear", false);
}

function onCacheClear() {
    if (RGBColorStore) {
        RGBColorStore.removeAllItems();
    }
}

function shutdown(data, reason) {
    // remove preferences window event observers
    Services.obs.removeObserver(Prefs.onOpen, "cmtPrefsOpen");
    Services.obs.removeObserver(Prefs.onReset, "cmtPrefsReset");
    Services.obs.removeObserver(Prefs.onApply, "cmtPrefsApply");
    Services.obs.removeObserver(Windows.onPrefsApply, "cmtPrefsApply");
    Services.obs.removeObserver(onCacheClear, "cmtPrefsCacheClear");
    
    // cleanup
    Windows.clear();
    RGBColorStore.removeAllItems();
    
    // unload own modules
    Components.utils.unload(extJSPath + "prefs.js");
    Components.utils.unload(extJSPath + "stylesheets.js");
    Components.utils.unload(extJSPath + "rgbcolor.js");
    Components.utils.unload(extJSPath + "hslcolor.js");
    Components.utils.unload(extJSPath + "store.js");
    Components.utils.unload(extJSPath + "gfx.js");
    Components.utils.unload(extJSPath + "cssrule.js");
    Components.utils.unload(extJSPath + "cssrules.js");
    Components.utils.unload(extJSPath + "indbars.js");
    Components.utils.unload(extJSPath + "tabhandlers.js");
    Components.utils.unload(extJSPath + "tabs.js");
    Components.utils.unload(extJSPath + "windows.js");
}

function install(data, reason) {} // dummy

function uninstall(data, reason) {} // dummy