let EXPORTED_SYMBOLS = ["_HSLColor"];

function _HSLColor(h, s, l) {
    if (h == undefined || s == undefined || l == undefined) {
        this.load(0, 0, 0);
    } else {
        this.load(h, s, l);
    }
}

_HSLColor.prototype.load = function(h, s, l) {
    this.h = Math.min(h, 360);
    this.s = Math.min(s, 1);
    this.l = Math.min(l, 1);
};

_HSLColor.prototype.loadFromHSLColor = function(hslColor) {
    this.load(hslColor.h, hslColor.s, hslColor.l);
};

_HSLColor.prototype.loadFromRGBColor = function(rgbColor) {
    // code adapted from http://www.rapidtables.com/convert/color/rgb-to-hsl.htm
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

_HSLColor.prototype.getHTMLColor = function() {
    return "hsl(" + Math.round(this.h) + "," + Math.round(this.s * 100) + "%," + Math.round(this.l * 100) + "%)";
};