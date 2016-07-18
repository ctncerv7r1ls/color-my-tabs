let EXPORTED_SYMBOLS = ["_Store"];

function _Store(maxItems) {
    this.items = {};
    this.itemsCounter = 0;
    this.maxItems = maxItems;
}

_Store.prototype.addItem = function(key, item) {
    // add item and if limit is reached remove some item and overwrite it
    if (!this.maxItems || this.itemsCounter < this.maxItems) {
        this.items[key] = item;
    } else {
        this.removeItem();
        this.items[0] = item;
    }
    
    this.itemsCounter++;
};

_Store.prototype.removeItem = function(key, processItem) {
    // processItem is a function called before item removal
    if (key && this.items[key]) {
        if (processItem) {
            processItem(this.items[key]);
        }
        
        this.items[key] = undefined;
    } else {
        this.items[0] = undefined;
    }
    
    this.itemsCounter--;
};

_Store.prototype.removeAllItems = function(processItem) {
    // processItem is a function called before each item removal
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

_Store.prototype.processAllItems = function(processItem) {
    // processItem is a function called for every item
    if (processItem) {
        for (let item in this.items) {
            if (this.items[item]) {
                processItem(this.items[item]);
            }
        }
    }
};
    
_Store.prototype.getItem = function(key) {
    return this.items[key];
};