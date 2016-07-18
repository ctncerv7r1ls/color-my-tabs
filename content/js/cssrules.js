let EXPORTED_SYMBOLS = ["_CSSRules"];

let _CSSRules = function(CSSRule, HSLColor, Prefs, Gfx, cmtTabId, cmtIndBarId) {
    this.ActiveTabCSSRule = function(cmtTabId, rgbColor, defaultColor) {
        CSSRule.call(this);
        
        let hslColor = new HSLColor();
        hslColor.loadFromRGBColor(rgbColor);
        
        hslColor.s = hslColor.s * (Prefs.getValue("activeTabSaturation") / 50);
        hslColor.l = Gfx.getBrightnessMod(hslColor, Prefs.getValue("activeTabBrightness"), defaultColor);
        
        this.hslColor = hslColor; // binding hslColor to this object as it'll be used by other module
        
        let gradient = Gfx.createGradient(hslColor, Prefs.getValue("activeTabFadingRange"), Prefs.getValue("activeTabFadingPower"));
        
        // actual CSS rule data
        this.selectors = "#" + cmtTabId + "[selected]";
        this.style["background-image"] = gradient + "!important";
        this.style["opacity"] = Prefs.getValue("activeTabOpacity") / 100;
        this.style["color"] = Prefs.getValue("activeTabFontColor");
        
        if (Prefs.getValue("boldActiveTabTitle")) {
            this.style["font-weight"] = "bold";
        }
        
        if (Prefs.getValue("showTabTitleShadow")) {
            this.style["text-shadow"] = "0px 0px 4px " + Prefs.getValue("activeTabFontShadowColor");
        }
    };

    this.InactiveTabCSSRule = function(cmtTabId, rgbColor, defaultColor) {
        CSSRule.call(this);
        
        let hslColor = new HSLColor();
        hslColor.loadFromRGBColor(rgbColor);
        
        hslColor.s = hslColor.s * (Prefs.getValue("inactiveTabSaturation") / 50);
        hslColor.l = Gfx.getBrightnessMod(hslColor, Prefs.getValue("inactiveTabBrightness"), defaultColor);
        
        let gradient = Gfx.createGradient(hslColor, Prefs.getValue("inactiveTabFadingRange"), Prefs.getValue("inactiveTabFadingPower"), true);
        
        // actual CSS rule data
        this.selectors = "#" + cmtTabId;
        this.style["background-image"] = gradient + "!important";
        this.style["opacity"] = Prefs.getValue("inactiveTabOpacity") / 100;
        this.style["color"] = Prefs.getValue("inactiveTabFontColor");
        
        if (Prefs.getValue("showTabTitleShadow")) {
            this.style["text-shadow"] = "0px 0px 4px " + Prefs.getValue("inactiveTabFontShadowColor");
        }
    };

    this.HoveredTabCSSRule = function(cmtTabId, rgbColor, defaultColor) {
        CSSRule.call(this);
        
        let hslColor = new HSLColor();
        hslColor.loadFromRGBColor(rgbColor);
        
        hslColor.s = hslColor.s * (Prefs.getValue("hoveredTabSaturation") / 50);
        hslColor.l = Gfx.getBrightnessMod(hslColor, Prefs.getValue("hoveredTabBrightness"), defaultColor);
        
        let gradient = Gfx.createGradient(hslColor, Prefs.getValue("hoveredTabFadingRange"), Prefs.getValue("hoveredTabFadingPower"), true);
        
        // actual CSS rule data
        this.selectors = "#" + cmtTabId + ":not([selected]):hover";
        this.style["background-image"] = gradient + "!important";
        this.style["opacity"] = Prefs.getValue("hoveredTabOpacity") / 100;
        this.style["color"] = Prefs.getValue("hoveredTabFontColor");
        
        if (Prefs.getValue("showTabTitleShadow")) {
            this.style["text-shadow"] = "0px 0px 4px " + Prefs.getValue("hoveredTabFontShadowColor");
        }
    };

    this.IndicationBarCSSRule = function() {
        CSSRule.call(this);
        
        // actual CSS rule data
        this.selectors = "#navigator-toolbox[tabsontop='false']>#" + cmtIndBarId;
        this.style["height"] = "5px";
        this.style["-moz-box-ordinal-group"] = "101";
    };
    
    this.IndicationBarTabsOnTopCSSRule = function() {
        CSSRule.call(this);
        
        // actual CSS rule data
        this.selectors = "#navigator-toolbox[tabsontop='true']>#" + cmtIndBarId;
        this.style["height"] = "5px";
        this.style["-moz-box-ordinal-group"] = "49";
    };

    this.ActiveTabCSSRule.prototype = new CSSRule();
    this.InactiveTabCSSRule.prototype = new CSSRule();
    this.HoveredTabCSSRule.prototype = new CSSRule();
    this.IndicationBarCSSRule.prototype = new CSSRule();
    this.IndicationBarTabsOnTopCSSRule.prototype = new CSSRule();
};