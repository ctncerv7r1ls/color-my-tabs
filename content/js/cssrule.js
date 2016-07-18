let EXPORTED_SYMBOLS = ["_CSSRule"];

function _CSSRule() {
    this.selectors = null; // this must be a string containing selectors
    this.style = {}; // this object must contain actual CSS properties
}

_CSSRule.prototype.apply = function(styleSheet, ruleIndex) {  
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
            // if ruleIndex is specified it means that it requires just a modification
            styleSheet.cssRules[ruleIndex].style.cssText = ruleBody;
        } else {
            // if ruleIndex is not specified it means that it requires to be created as a new rule...
            styleSheet.insertRule(rule, styleSheet.cssRules.length);
            return styleSheet.cssRules[styleSheet.cssRules.length - 1]; // .. and return its object to keep reference (list index is movable)
        }
    }
};