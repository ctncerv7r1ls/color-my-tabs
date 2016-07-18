let EXPORTED_SYMBOLS = ["_StyleSheets"];

let _StyleSheets = function(cmtStyleSheetId) {
    this.init = function(window) {
        let document = window.document;
        let style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
        
        style.setAttribute("type", "text/css");
        style.setAttribute("id", cmtStyleSheetId);
        
        document.documentElement.appendChild(style);
    };
    
    this.clear = function(window) {
        let style = window.document.getElementById(cmtStyleSheetId);
        
        if (style) {
            window.document.documentElement.removeChild(style);
        }
    };
    
    this.get = function(window) {
        let style = window.document.getElementById(cmtStyleSheetId);
        
        if (style) {
            return style.sheet;
        } else {
            return null;
        }
    };
    
    this.getCSSRuleIndex = function(styleSheet, cssRule) {
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i] == cssRule) {
                return i;
            }
        }
        
        return null;
    };
};