let EXPORTED_SYMBOLS = ["_Gfx"];

Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://gre/modules/Promise.jsm");
let WindowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);

let _Gfx = function(Prefs, RGBColor, RGBColorStore) {    
    this.getBrightnessMod = function(hslColor, val, defaultColor) {
        // returns brightness value required to create gradients for each tab CSS rule
        
        val /= 100;
        
        if (hslColor.l >= 0.75 || hslColor.l <= 0.25) {
            let brightnessFixes = Prefs.getValue("allowColorBrightnessFixes");
            
            // apply some dumb color brightness fixes only under certain conditions specified in prefs
            // for all tabs or only for custom colored tabs or only for default color
            
            if (brightnessFixes == 1
                || (brightnessFixes == 2 && defaultColor)
                || (brightnessFixes == 3 && !defaultColor)) {
                
                // stupid variable mixing so it makes some brightness changes
                let d = Math.abs(hslColor.l - val);
                let n = d < val ? (val - d) * d * 2 : (d - val) * val * 2;
                
                val += hslColor.l >= 0.75 ? n : -n;
            }
        }
        
        return val;
    };

    this.createGradient = function(hslColor, fadingRange, fadingPower, appendDarkLine) {
        // creates gradient with specific parameters
        let mainColor = hslColor.getHTMLColor();
        let gradientBody = null;
        let direction = null;
        
        switch (Prefs.getValue("tabFadingStyle")) {
            case 1: {
                direction = "to bottom";
                break;
            }
            
            case 2: {
                direction = "to top";
                break;
            }
           
            case 3: {
                direction = "to right";
                break;
            }
            
            case 4: {
                direction = "to left";
                break;
            }
        }
        
        if (direction) {
            let fadingColor = Prefs.getValue("tabFadingColor");
            gradientBody = direction + "," + fadingColor + " " + fadingRange
                           + "%," + mainColor + " " + (fadingPower * 5 + fadingRange) + "%";
        } else {
            gradientBody = mainColor + "," + mainColor;
        }
        
        // appends dark line at the bottom, this is used as a visual separator for inactive tab gradients 
        let result = appendDarkLine ?
            "linear-gradient(to top,rgba(26,26,26,0.4) 1px,transparent 1px)," + "linear-gradient(" + gradientBody + ")"
          : "linear-gradient(" + gradientBody + ")";
        
        return result;
    };

    this.getImagePixelData = function(imgSrc) {
        let deferred = Promise.defer();
        
        let xhtmlNS = "http://www.w3.org/1999/xhtml";
        let doc = WindowMediator.getMostRecentWindow("navigator:browser").document;
        let img = doc.createElementNS(xhtmlNS, "img"); // create some img element inside some random window
        
        img.onload = function() {
            let canvas = doc.createElementNS(xhtmlNS, "canvas");
            canvas.width = img.width < 32 ? img.width : 32;
            canvas.height = img.height < 32 ? img.height : 32;
            
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // draw the image on canvas
            
            let imgPixelData = ctx.getImageData(0, 0, canvas.width, canvas.height); // get image pure pixels
            
            deferred.resolve(imgPixelData);
        };
        
        img.onerror = function() {
            deferred.reject(); // image failed to load (should not happen)
        };
        
        img.src = imgSrc; // load img with providing its source to the img element
        
        return deferred.promise;
    };

    this.getImageRGBColor = function(imgPixelData) {
        // this is a terrible algorithm of getting dominant RGB color of an image
        let rgbColorEntries = []; // keep entries of already captured colors in the image
        let pixelArray = imgPixelData.data;
        let totalPixels = imgPixelData.width * imgPixelData.height;
        let pixelRGBAColor = new RGBColor(); // temporary RGB color extended by alpha property
        
        for (let i = 0; i < totalPixels; i += 2) { // accuracy ~ every second pixel, it's faster and still enough
            let index = i * 4; // every pixel consists of three values R, G, B and Alpha.
            pixelRGBAColor.r = pixelArray[index];
            pixelRGBAColor.g = pixelArray[index + 1];
            pixelRGBAColor.b = pixelArray[index + 2];
            pixelRGBAColor.a = pixelArray[index + 3];
            
            if (pixelRGBAColor.a < 128 || pixelRGBAColor.isImproper()) {
                continue; // ignore this pixel if alpha is too low and color is not satysfying
            }
            
            let hit = false;
            
            for (let rgbColorEntry of rgbColorEntries) {
                // calc difference between iterated RGB color and current pixel color
                let diff = Math.abs(rgbColorEntry.rgbColor.r - pixelRGBAColor.r)
                         + Math.abs(rgbColorEntry.rgbColor.g - pixelRGBAColor.g)
                         + Math.abs(rgbColorEntry.rgbColor.b - pixelRGBAColor.b);
                         
                if (diff < 45) {
                    // if difference is lower than 45 it means that this color is similar...
                    rgbColorEntry.hits++; // ...so we bump its hit counter
                    hit = true; // set mark flag to true
                }
            }
            
            if (!hit) {
                // if there were no hits (none of existing colors was similar) we add a new entry for this color
                let rgbColorEntry = {};
                rgbColorEntry.hits = 1;
                rgbColorEntry.rgbColor = new RGBColor(pixelRGBAColor.r, pixelRGBAColor.g, pixelRGBAColor.b);
                rgbColorEntries.push(rgbColorEntry);
            }
        }
        
        let mostHits = 0;
        let mostHitRGBColor = null;
        
        for (let rgbColorEntry of rgbColorEntries) { // find most hit color...
            if (rgbColorEntry.hits > mostHits) {
                mostHits = rgbColorEntry.hits;
                mostHitRGBColor = rgbColorEntry.rgbColor;
            }
        }
        
        let imgRGBColor = new RGBColor();
        
        if (mostHitRGBColor) {
            imgRGBColor.loadFromRGBColor(mostHitRGBColor);
        }
        
        return imgRGBColor; // ... return either most hit color or empty color if something went wrong
    };

    this.getFaviconRGBColor = function(faviconSrc) {
        let deferred = Promise.defer();
        let rgbColor = RGBColorStore.getItem(faviconSrc); // try to get RGB color for this source from cache
        
        if (rgbColor) {
            // if getting from cache successful
            //console.log("favicon: " + faviconSrc + ", rgb color from cache: " + rgbColor.getHTMLColor());
            deferred.resolve(rgbColor);
        } else {
            let gfx = this;
            // if there is no RGB color for this source
            this.getImagePixelData(faviconSrc).then(function(imgPixelData) {
                // this is executed when image pixels returned successfully
                rgbColor = gfx.getImageRGBColor(imgPixelData); // get RGB color for image pixel data
                RGBColorStore.addItem(faviconSrc, rgbColor); // add this color to cache
                
                //console.log("favicon: " + faviconSrc + ", new rgb color: " + rgbColor.getHTMLColor());
                
                deferred.resolve(rgbColor);
            }, function() {
                deferred.reject();
            });
        }

        return deferred.promise;
    };
};