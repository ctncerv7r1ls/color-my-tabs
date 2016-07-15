/* SDK includes */

let Tabs = require("sdk/tabs");
let TabsUtils  = require("sdk/tabs/utils");
let Windows = require("sdk/windows");
let WindowUtils = require("sdk/window/utils");
let CorePromise = require("sdk/core/promise");
let Self = require("sdk/self");
let PreferencesService = require("sdk/preferences/service");
let SystemUnload = require("sdk/system/unload");
let SystemEvents = require("sdk/system/events");
let EventCore = require("sdk/event/core");



/* Common constants */

const xhtmlNS = "http://www.w3.org/1999/xhtml";
const xulNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"

const cmtStyleSheetId = "cmtStyle";
const cmtIndBarId = "cmtIndBar";
const cmtTabId = "cmtTab";



/* Default prefs */

defaultPrefs = {
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



/* Prefs functions */

function getFullPrefName(pref) {
    return "extensions." + Self.id + "." + pref;
}

function getPrefValue(pref) {
    let fullPref = getFullPrefName(pref);
    return PreferencesService.get(fullPref);
}

function feedPrefsWindow(windowDoc, feedDefaults) {
    for (let pref in defaultPrefs) {
        let prefControl = windowDoc.getElementById(pref);
        
        if (prefControl) {
            let fullPrefName = getFullPrefName(pref); 
            let prefValue = feedDefaults ? defaultPrefs[pref] : getPrefValue(pref);
            
            if (prefControl.type == "number") {
                prefControl.valueNumber = prefValue;
            } else if (prefControl.tagName == "checkbox") {
                prefControl.checked = prefValue;
            } else {
                prefControl.value = prefValue;
            }
        }
    }
}

function saveFromPrefsWindow(windowDoc) {
    for (let pref in defaultPrefs) {
        let prefControl = windowDoc.getElementById(pref);
        
        if (prefControl) {
            let fullPrefName = getFullPrefName(pref);
            let prefValue = null;
            
            if (prefControl.type == "number" || prefControl.tagName == "menulist") {
                prefValue = parseInt(prefControl.value);
            } else if (prefControl.tagName == "checkbox") {
                prefValue = prefControl.checked;
            } else {
                prefValue = prefControl.value;
            }
            
            PreferencesService.set(fullPrefName, prefValue);
        }
    }
}



/* SDK to low level functions */

function getDomWindow(window) {
    for (let domWindow of WindowUtils.windows("navigator:browser")) {
        if (Windows.BrowserWindow({window: domWindow}) === window) {
            return domWindow;
        }
    }
    
    return null;
}

function getXulTab(tab) {
    for (let xulTab of TabsUtils.getTabs()) {
        if (TabsUtils.getTabId(xulTab) == tab.id) {
            return xulTab;
        }
    }
    
    return null;
}



/* Style sheet functions */

function embedStyleSheet(windowDoc) {
    let style = windowDoc.createElementNS(xhtmlNS, "style");
    style.setAttribute("type", "text/css");
    style.setAttribute("id", cmtStyleSheetId);
    windowDoc.documentElement.appendChild(style);
    
    let generalTabCssRule = new GeneralTabCssRule();
    generalTabCssRule.apply(style.sheet);
}

function removeStyleSheet(windowDoc) {
    let style = windowDoc.getElementById(cmtStyleSheetId);
    
    if (style) {
        windowDoc.documentElement.removeChild(style);
    }
}

function getCssRuleIndex(styleSheet, cssRule) {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        if (styleSheet.cssRules[i] == cssRule) {
            return i;
        }
    }
    
    return null;
}



/* Store class */

function Store(maxItems) {
    this.items = {};
    this.itemsCounter = 0;
    this.maxItems = maxItems;
}

Store.prototype.addItem = function(key, item) {
    if (!this.maxItems || this.itemsCounter < this.maxItems) {
        this.items[key] = item;
        this.itemsCounter++;
    } else {
        this.removeItem();
    }
};

Store.prototype.removeItem = function(key, processItem) {
    if (key && this.items[key]) {
        if (processItem) {
            processItem(this.items[key]);
        }
        
        this.items[key] = undefined;
        this.itemsCounter--;
    }
};

Store.prototype.removeAllItems = function(processItem) {
    for (let item in this.items) {
        if (this.items[item]) {
            if (processItem) {
                processItem(this.items[item]);
            }
            
            this.items[item] = undefined;
        }
    }
    
    this.itemsCounter = 0;
};

Store.prototype.processAllItems = function(processItem) {
    if (processItem) {
        for (let item in this.items) {
            if (this.items[item]) {
                processItem(this.items[item]);
            }
        }
    }
};
    
Store.prototype.getItem = function(key) {
    return this.items[key];
};



/* Rgb color class */

function RgbColor(r, g, b) {
    if (r == undefined || g == undefined || b == undefined) {
        this.load(0, 0, 0);
    } else {
        this.load(r, g, b);
    }
}

RgbColor.prototype.load = function(r, g, b) {
    this.r = Math.min(r, 255);
    this.g = Math.min(g, 255);
    this.b = Math.min(b, 255);
};

RgbColor.prototype.loadFromRgbColor = function(rgbColor) {
    this.load(rgbColor.r, rgbColor.g, rgbColor.b);
};

RgbColor.prototype.loadFromHslColor = function(hslColor) {
    let c = (1 - Math.abs(2 * hslColor.l - 1)) * hslColor.s;
    let x = c * (1 - Math.abs((hslColor.h / 60) % 2 - 1));
    let m = hslColor.l - c / 2;
    let r, g, b;
    
    if (hslColor.h >= 0 && hslColor.h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (hslColor.h >= 60 && hslColor.h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (hslColor.h >= 120 && hslColor.h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (hslColor.h >= 180 && hslColor.h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (hslColor.h >= 240 && hslColor.h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }
    
    r += m;
    g += m;
    b += m;
    
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    
    this.load(r, g, b);
};

RgbColor.prototype.loadFromHtmlColor = function(htmlColor) {
    let regexM = null;
    let r = 0, g = 0, b = 0;
    
    if (regexM = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(htmlColor)) {
        r = parseInt(regexM[1], 16);
        g = parseInt(regexM[2], 16);
        b = parseInt(regexM[3], 16);
    } else if (regexM = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i.exec(htmlColor)) {
        r = regexM[1];
        g = regexM[2];
        b = regexM[3];
    }
    
    this.load(r, g, b);
};

RgbColor.prototype.getHtmlColor = function() {
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
};

RgbColor.prototype.isTooDark = function() {
    return (this.r < 70 && this.g < 70 && this.b < 70);
};

RgbColor.prototype.isTooBright = function() {
    return (this.r > 220 && this.g > 220 && this.b > 220);
};



/* Hsl color class */

function HslColor(h, s, l) {
    if (h == undefined || s == undefined || l == undefined) {
        this.load(0, 0, 0);
    } else {
        this.load(h, s, l);
    }
}

HslColor.prototype.load = function(h, s, l) {
    this.h = Math.min(h, 360);
    this.s = Math.min(s, 1);
    this.l = Math.min(l, 1);
};

HslColor.prototype.loadFromHslColor = function(hslColor) {
    this.load(hslColor.h, hslColor.s, hslColor.l);
};

HslColor.prototype.loadFromRgbColor = function(rgbColor) {
    let r = rgbColor.r / 255;
    let g = rgbColor.g / 255;
    let b = rgbColor.b / 255;
    let cMax = Math.max(r, g, b);
    let cMin = Math.min(r, g, b);
    let delta = cMax - cMin;
    let h, s, l;
    
    l = (cMax + cMin) / 2;
    
    if (delta == 0) {
        s = 0;
        h = 0;
    } else {
        s = delta / (1 - Math.abs(2 * l - 1));
        
        if (cMax == r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (cMax == g) {
            h = 60 * (((b - r) / delta) + 2);
        } else {
            h = 60 * (((r - g) / delta) + 4);
        }
    }
    
    if (h < 0) {
        h += 360;
    }
    
    this.load(h, s, l);
};

HslColor.prototype.getHtmlColor = function() {
    return "hsl("
        + Math.round(this.h) + ","
        + Math.round(this.s * 100) + "%,"
        + Math.round(this.l * 100)
        + "%)";
};



/* Css rule class */

function CssRule() {
    this.selectors = null;
    this.style = {};
}

CssRule.prototype.apply = function(styleSheet, ruleIndex) {  
    if (this.selectors) {
        let rule = this.selectors + "{";
        let ruleBody = "";
        
        for (let attr in this.style) {
            if (this.style[attr]) {
                ruleBody += attr + ":" + this.style[attr] + ";";
            }
        }
        
        rule += ruleBody + "}";
        
        if (ruleIndex != undefined) {
            styleSheet.cssRules[ruleIndex].style.cssText = ruleBody;
        } else {
            styleSheet.insertRule(rule, styleSheet.cssRules.length);
            
            return styleSheet.cssRules[styleSheet.cssRules.length - 1];
        }
    }
};



/* Css rule implementations */

function ActiveTabCssRule(cmtTabId, rgbColor, defaultColor) {
    CssRule.call(this);
        
    let hslColor = new HslColor();
    hslColor.loadFromRgbColor(rgbColor);
    
    hslColor.s = hslColor.s * (getPrefValue("activeTabSaturation") / 50);
    hslColor.l = getBrightnessMod(hslColor, getPrefValue("activeTabBrightness"), defaultColor);
    
    this.hslColor = hslColor;
    
    this.selectors = "#" + cmtTabId + "[selected]";
    this.style["background-image"] = createGradient(
            hslColor,
            getPrefValue("activeTabFadingRange"),
            getPrefValue("activeTabFadingPower")
        ) + "!important";
        
    this.style["opacity"] = getPrefValue("activeTabOpacity") / 100;
    
    if (getPrefValue("boldActiveTabTitle")) {
        this.style["font-weight"] = "bold";
    }
}

ActiveTabCssRule.prototype = new CssRule();


function InactiveTabCssRule(cmtTabId, rgbColor, defaultColor) {
    CssRule.call(this);
    
    let hslColor = new HslColor();
    hslColor.loadFromRgbColor(rgbColor);
    
    hslColor.s = hslColor.s * (getPrefValue("inactiveTabSaturation") / 50);
    hslColor.l = getBrightnessMod(hslColor, getPrefValue("inactiveTabBrightness"), defaultColor);
    
    this.selectors = "#" + cmtTabId;
    this.style["background-image"] = createGradient(
            hslColor,
            getPrefValue("inactiveTabFadingRange"),
            getPrefValue("inactiveTabFadingPower"),
            true
        ) + "!important";
        
    this.style["opacity"] = getPrefValue("inactiveTabOpacity") / 100;
}

InactiveTabCssRule.prototype = new CssRule();


function HoveredTabCssRule(cmtTabId, rgbColor, defaultColor) {
    CssRule.call(this);
    
    let hslColor = new HslColor();
    hslColor.loadFromRgbColor(rgbColor);
    
    hslColor.s = hslColor.s * (getPrefValue("hoveredTabSaturation") / 50);
    hslColor.l = getBrightnessMod(hslColor, getPrefValue("hoveredTabBrightness"), defaultColor);
    
    this.selectors = "#" + cmtTabId + ":not([selected]):hover";
    this.style["background-image"] = createGradient(
            hslColor,
            getPrefValue("hoveredTabFadingRange"),
            getPrefValue("hoveredTabFadingPower"),
            true
        ) + "!important";
        
    this.style["opacity"] = getPrefValue("hoveredTabOpacity") / 100;
}

HoveredTabCssRule.prototype = new CssRule();


function IndicationBarCssRule(navToolboxId, cmtIndBarId) {
    CssRule.call(this);
    
    this.selectors = "#" + navToolboxId + "[tabsontop='false']>#" + cmtIndBarId;
    this.style["height"] = "5px";
    this.style["-moz-box-ordinal-group"] = "101";
}

IndicationBarCssRule.prototype = new CssRule();


function IndicationBarTabsOnTopCssRule(navToolboxId, cmtIndBarId) {
    CssRule.call(this);
    
    this.selectors = "#" + navToolboxId + "[tabsontop='true']>#" + cmtIndBarId;
    this.style["height"] = "5px";
    this.style["-moz-box-ordinal-group"] = "49";
}

IndicationBarTabsOnTopCssRule.prototype = new CssRule();


function GeneralTabCssRule() {
    CssRule.call(this);
    
    this.selectors = ".tabbrowser-tab";
    this.style["color"] = getPrefValue("activeTabFontColor");
    
    if (getPrefValue("showTabTitleShadow")) {
        this.style["text-shadow"] = "0px 0px 4px " + getPrefValue("activeTabFontShadowColor");
    }
}

GeneralTabCssRule.prototype = new CssRule();



/* Indication bar functions */

function embedIndicationBar(windowDoc) {    
    let navToolbox = windowDoc.getElementById("navigator-toolbox");
    let indBar = windowDoc.createElementNS(xulNS, "static-bar");
    
    indBar.setAttribute("id", cmtIndBarId);
    navToolbox.appendChild(indBar);
    
    let style = windowDoc.getElementById(cmtStyleSheetId);
    let styleSheet = style.sheet;
    
    let indBarCssRule = new IndicationBarCssRule("navigator-toolbox", cmtIndBarId);
    indBarCssRule.apply(styleSheet);
    
    let indBarTabsOnTopCssRule = new IndicationBarTabsOnTopCssRule("navigator-toolbox", cmtIndBarId);
    indBarTabsOnTopCssRule.apply(styleSheet);
}

function removeIndicationBar(windowDoc) {
    let indBar = windowDoc.getElementById(cmtIndBarId);
    if (indBar) {
        indBar.parentNode.removeChild(indBar);
    }
}

function changeIndicationBarColor(windowDoc, htmlColor) {
    let indBar = windowDoc.getElementById(cmtIndBarId);
    if (indBar) {
        indBar.style.setProperty("background-color", htmlColor);
    }
}



/* Tab handler class */

function TabHandler(xulTab) { 
    this.xulTab = xulTab;
    this.xulTabId = cmtTabId + "" + TabsUtils.getTabId(xulTab);
    this.xulTab.setAttribute("id", this.xulTabId);
    
    this.cssRules = [];    
    this.deferredColorAssignment = null;
    
    this.activeTabHslColor = new HslColor();
    
    let tabHandler = this;
    
    this.mutationObserver = new WindowUtils.getMostRecentBrowserWindow()
        .MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName == "image") {
                    tabHandler.refresh();
                } else if (tabHandler.xulTab.hasAttribute("selected")) {
                    
                    if (getPrefValue("showIndicationBar")) {
                        let tabWindow = TabsUtils.getOwnerWindow(tabHandler.xulTab);
                        
                        changeIndicationBarColor(
                            tabWindow.document,
                            tabHandler.activeTabHslColor.getHtmlColor()
                        );
                    }
                }
            });
        });
    
    this.mutationObserver.observe(this.xulTab, {
        attributes: true,
        attributeFilter: ["image", "selected"]
    });
}

TabHandler.prototype.assignColor = function() {
    let deferred = CorePromise.defer();
    
    if (this.deferredColorAssignment) {
        this.deferredColorAssignment.reject();
    }
    
    this.deferredColorAssignment = deferred;
    
    if (this.xulTab.hasAttribute("image")) {
        let faviconSrc = this.xulTab.getAttribute("image");
        let tabHandler = this;
        
        getFaviconRgbColor(faviconSrc).then(function(rgbColor) {
            tabHandler.deferredColorAssignment = null;
            deferred.resolve(rgbColor);
        });
    } else {
        let defaultColor = new RgbColor();
        
        defaultColor.loadFromHtmlColor(getPrefValue("tabDefaultColor"));
        
        this.deferredColorAssignment = null;
        
        deferred.resolve(defaultColor, true);
    }
    
    return deferred.promise;
};

TabHandler.prototype.applyStyling = function(rgbColor, defaultColor) {    
    let tabWindow = TabsUtils.getOwnerWindow(this.xulTab);
    let style = tabWindow.document.getElementById(cmtStyleSheetId);
    let styleSheet = style.sheet;
    
    if (styleSheet) {
        let activeTabCssRule = new ActiveTabCssRule(this.xulTabId, rgbColor, defaultColor);
        let inactiveTabCssRule = new InactiveTabCssRule(this.xulTabId, rgbColor, defaultColor);
        let hoveredTabCssRule = new HoveredTabCssRule(this.xulTabId, rgbColor, defaultColor);
        
        this.activeTabHslColor.loadFromHslColor(activeTabCssRule.hslColor);
        
        if (this.xulTab.selected) {
            changeIndicationBarColor(tabWindow.document, activeTabCssRule.hslColor.getHtmlColor());
        }
        
        if (this.cssRules.length > 0) {
            let cssRuleIndex = getCssRuleIndex(styleSheet, this.cssRules[0]);
            
            if (cssRuleIndex) {
                activeTabCssRule.apply(styleSheet, cssRuleIndex);
                inactiveTabCssRule.apply(styleSheet, cssRuleIndex + 1);
                hoveredTabCssRule.apply(styleSheet, cssRuleIndex + 2);
            }
        } else {
            this.cssRules.push(activeTabCssRule.apply(styleSheet));
            this.cssRules.push(inactiveTabCssRule.apply(styleSheet));
            this.cssRules.push(hoveredTabCssRule.apply(styleSheet));
        }
    }
};

TabHandler.prototype.removeStyling = function() {
    let tabWindow = TabsUtils.getOwnerWindow(this.xulTab);
    let style = tabWindow.document.getElementById(cmtStyleSheetId);
    
    if (style) {
        let styleSheet = style.sheet;
        
        if (styleSheet) {
            let cssRuleIndex = getCssRuleIndex(styleSheet, this.cssRules[0]);
            
            if (cssRuleIndex) {
                for (let rule of this.cssRules) {
                    styleSheet.deleteRule(cssRuleIndex);
                }
            }
        }
    }
};

TabHandler.prototype.refresh = function() {
    let deferred = CorePromise.defer();
    let tabHandler = this;

    this.assignColor().then(function(rgbColor) {
        tabHandler.applyStyling(rgbColor);
        deferred.resolve();
    });
    
    return deferred.promise;
};

TabHandler.prototype.clear = function() {
    this.xulTab.removeAttribute("id");
    this.mutationObserver.disconnect();
    this.removeStyling();
};



/* Graphics functions */

function getBrightnessMod(hslColor, val, defaultColor) {
    val /= 100;
    
    if (hslColor.l >= 0.75 || hslColor.l <= 0.25) {
        let brightnessFixes = getPrefValue("allowColorBrightnessFixes");
        
        if (brightnessFixes == 1
            || (brightnessFixes == 2 && defaultColor)
            || (brightnessFixes == 3 && !defaultColor)) {
                
            let d = Math.abs(hslColor.l - val);
            let n = d < val ? (val - d) * d : (d - val) * val;
            
            val += hslColor.l >= 0.75 ? n : -n;
        }
    }
    
    return val;
}

function createGradient(hslColor, fadingRange, fadingPower, appendDarkLine) {
    let mainColor = hslColor.getHtmlColor();
    let gradientBody = null;
    let direction = null;
    
    switch (getPrefValue("tabFadingStyle")) {
        case 1: {
            direction = "to bottom";
        } break;
        case 2: {
            direction = "to top";
        } break;
        case 3: {
            direction = "to right";
        } break;
        case 4: {
            direction = "to left";
        } break;
    }
    
    if (direction) {
        let fadingColor = getPrefValue("tabFadingColor");
        
        gradientBody = direction + "," + fadingColor + " " + fadingRange
            + "%," + mainColor + " " + (fadingPower * 5 + fadingRange) + "%";
    } else {
        gradientBody = mainColor + "," + mainColor;
    }
    
    let result = appendDarkLine ?
        "linear-gradient(to top,rgba(26,26,26,0.4) 1px,transparent 1px),"
        + "linear-gradient(" + gradientBody + ")"
        : "linear-gradient(" + gradientBody + ")";
    
    return result;
}

function getFaviconRgbColor(faviconSrc) {
    let deferred = CorePromise.defer();
    let rgbColor = RgbColors.getItem(faviconSrc);
    
    if (rgbColor) {
        console.debug("favicon: " + faviconSrc + ", rgb color from cache: " + rgbColor.getHtmlColor());
        deferred.resolve(rgbColor);
    } else {
        getImagePixelData(faviconSrc).then(function(imgPixelData) {
            rgbColor = getImageRgbColor(imgPixelData);
            
            RgbColors.addItem(faviconSrc, rgbColor);
            
            console.debug("favicon: " + faviconSrc + ", new rgb color: " + rgbColor.getHtmlColor());
            
            deferred.resolve(rgbColor);
        }, function() {
            deferred.reject();
        });
    }
    
    return deferred.promise;
}

function getImagePixelData(imgSrc) {
    let deferred = CorePromise.defer();
    let doc = WindowUtils.getMostRecentBrowserWindow().document;
    let img = doc.createElementNS(xhtmlNS, "img");
    
    img.onload = function() {
        let canvas = doc.createElementNS(xhtmlNS, "canvas");
        canvas.width = img.width < 32 ? img.width : 32;
        canvas.height = img.height < 32 ? img.height : 32;
        
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        let imgPixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        deferred.resolve(imgPixelData);
    };
    
    img.onerror = function() {
        deferred.reject();
    };
    
    img.src = imgSrc;
    
    return deferred.promise;
}

function getImageRgbColor(imgPixelData) {
    let rgbColorEntries = [];
    let pixelArray = imgPixelData.data;
    let totalPixels = imgPixelData.width * imgPixelData.height;
    let pixelRgbaColor = new RgbColor();
    
    for (let i = 0; i < totalPixels; i += 2) {
        let idx = i * 4;
        pixelRgbaColor.r = pixelArray[idx];
        pixelRgbaColor.g = pixelArray[idx + 1];
        pixelRgbaColor.b = pixelArray[idx + 2];
        pixelRgbaColor.a = pixelArray[idx + 3];
        
        if (pixelRgbaColor.a < 128
            || pixelRgbaColor.isTooDark()
            || pixelRgbaColor.isTooBright()) {
            continue;
        }
        
        let hit = false;
        
        for (let rgbColorEntry of rgbColorEntries) {
            if (Math.abs(rgbColorEntry.rgbColor.r - pixelRgbaColor.r)
                + Math.abs(rgbColorEntry.rgbColor.g - pixelRgbaColor.g)
                + Math.abs(rgbColorEntry.rgbColor.b - pixelRgbaColor.b)
                < 45) {
                    
                rgbColorEntry.hits++;
                hit = true;
            }
        }
        
        if (!hit) {
            let rgbColorEntry = {};
            
            rgbColorEntry.hits = 1;
            rgbColorEntry.rgbColor = new RgbColor(pixelRgbaColor.r,
                    pixelRgbaColor.g, pixelRgbaColor.b
                );
                
            rgbColorEntries.push(rgbColorEntry);
        }
    }
    
    let mostHits = 0;
    let mostHitRgbColor = null;
    
    for (let rgbColorEntry of rgbColorEntries) {
        if (rgbColorEntry.hits > mostHits) {
            mostHits = rgbColorEntry.hits;
            mostHitRgbColor = rgbColorEntry.rgbColor;
        }
    }
    
    let imgRgbColor = new RgbColor();
    
    if (mostHitRgbColor) {
        imgRgbColor.loadFromRgbColor(mostHitRgbColor);
    }
    
    return imgRgbColor;
}



/* Event functions */

function onWindowOpen(window) {
    let domWindow = getDomWindow(window);
    
    if (domWindow && WindowUtils.isBrowser(domWindow)) {
        embedStyleSheet(domWindow.document);
        
        if (getPrefValue("showIndicationBar")) {
            embedIndicationBar(domWindow.document);
        }
    }
}

function onWindowClose(window) {
    let domWindow = getDomWindow(window);
    
    if (domWindow && WindowUtils.isBrowser(domWindow)) {
        removeStyleSheet(domWindow.document);
        
        if (getPrefValue("showIndicationBar")) {
            removeIndicationBar(domWindow.document);
        }
    }
}

function onTabOpen(tab) {    
    let xulTab = getXulTab(tab);
    
    if (xulTab) {
        let tabHandler = new TabHandler(xulTab);
        TabHandlers.addItem(tab.id, tabHandler);
        tabHandler.refresh();
    }
}

function onTabClose(tab) {
    TabHandlers.removeItem(tab.id, function(tabHandler) {
        tabHandler.clear();
    });
}

function onPrefsOpen(event) {
    let domWindowDoc = event.subject.document;
    
    feedPrefsWindow(domWindowDoc);
}

function onPrefsReset(event) {
    let domWindowDoc = event.subject.document;
    
    feedPrefsWindow(domWindowDoc, true);
}

function onPrefsApply(event) {
    let domWindowDoc = event.subject.document;
    
    saveFromPrefsWindow(domWindowDoc);
    
    clearIndicationBars();
    clearTabHandlers();
    clearStyleSheets();
    
    initStyleSheets();
    initIndicationBars();
    initTabHandlers();
}    

function onUnload() {
    clearTabEvents();
    clearWindowEvents();
    clearIndicationBars();
    clearPrefsEvents();
    clearTabHandlers();
    clearStyleSheets();
}



/* Init functions */

function initPrefs() {
    for (let pref in defaultPrefs) {
        let fullPref = getFullPrefName(pref);
        
        if (!PreferencesService.has(fullPref)) {
            PreferencesService.set(fullPref, defaultPrefs[pref]);
        }
    }
}

function initPrefsEvents() {
    SystemEvents.on("cmtPrefsOpen", onPrefsOpen);
    SystemEvents.on("cmtPrefsReset", onPrefsReset);
    SystemEvents.on("cmtPrefsApply", onPrefsApply);
}

function initStyleSheets() {
    for (let domWindow of WindowUtils.windows()) {
        if (WindowUtils.isBrowser(domWindow)) {
            embedStyleSheet(domWindow.document);
        }
    }
}

function initIndicationBars() {
    if (getPrefValue("showIndicationBar")) {
        for (let domWindow of WindowUtils.windows()) {
            if (WindowUtils.isBrowser(domWindow)) {
                embedIndicationBar(domWindow.document);
            }
        }
    }
}

function initWindowEvents() {
    Windows.browserWindows.on("open", onWindowOpen);
    Windows.browserWindows.on("close", onWindowClose);
}

function initTabEvents() {
    Tabs.on("open", onTabOpen);
    Tabs.on("close", onTabClose);
}

function initTabHandlers() {
    for (let xulTab of TabsUtils.getTabs()) {
        let tabHandler = new TabHandler(xulTab);
        let tabId = TabsUtils.getTabId(xulTab);
        
        TabHandlers.addItem(tabId, tabHandler);
        
        tabHandler.refresh();
    }
}

function init() {
    initPrefs();
    initPrefsEvents();
    initStyleSheets();
    initIndicationBars();
    initWindowEvents();
    initTabEvents();
    initTabHandlers();

    SystemUnload.when(onUnload);
}



/* Cleanup functions */

function clearPrefsEvents() {
    SystemEvents.off("cmtPrefsOpen", onPrefsOpen);
    SystemEvents.off("cmtPrefsReset", onPrefsReset);
    SystemEvents.off("cmtPrefsApply", onPrefsApply);
}

function clearStyleSheets() {
    for (let domWindow of WindowUtils.windows()) {
        if (WindowUtils.isBrowser(domWindow)) {
            removeStyleSheet(domWindow.document);
        }
    }
}

function clearIndicationBars() {
    for (let domWindow of WindowUtils.windows()) {
        if (WindowUtils.isBrowser(domWindow)) {
            removeIndicationBar(domWindow.document);
        }
    }
}

function clearWindowEvents() {
    EventCore.off(Windows.browserWindows, "open", onWindowOpen);
    EventCore.off(Windows.browserWindows, "close", onWindowClose);
}

function clearTabEvents() {
    EventCore.off(Tabs, "open", onTabOpen);
    EventCore.off(Tabs, "close", onTabClose);
}

function clearTabHandlers() {
    TabHandlers.removeAllItems(function(tabHandler) {
        tabHandler.clear();
    });
}



/* Init */

TabHandlers = new Store();
RgbColors = new Store(500);

init();
