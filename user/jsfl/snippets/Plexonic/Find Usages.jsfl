/*
 * Copyright Teoken LLC. (c) 2013. All rights reserved.
 * Copying or usage of any piece of this source code without written notice from Teoken LLC is a major crime.
 * Այս կոդը Թեոկեն ՍՊԸ ընկերության սեփականությունն է:
 * Առանց գրավոր թույլտվության այս կոդի պատճենահանումը կամ օգտագործումը քրեական հանցագործություն է:
 */

/*
 * User: gsar
 * Date: 10/14/12
 * Time: 2:50 PM
 */





/*
 * Copyright Teoken LLC. (c) 2013. All rights reserved.
 * Copying or usage of any piece of this source code without written notice from Teoken LLC is a major crime.
 * Այս կոդը Թեոկեն ՍՊԸ ընկերության սեփականությունն է:
 * Առանց գրավոր թույլտվության այս կոդի պատճենահանումը կամ օգտագործումը քրեական հանցագործություն է:
 */

/**
 * User: gsar
 * Date: 10/14/12
 * Time: 2:50 PM
 */

//--------------------------------------------------------------//
var doc = fl.getDocumentDOM();
var lib = doc.library;
var trace = fl.outputPanel.trace;
//--------------------------------------------------------------//


ELEMENT_TYPE_BITMAP = "element_bitmap";
ELEMENT_TYPE_SYMBOL = "element_symbol";
ELEMENT_TYPE_TEXTFIELD = "element_textfield";
ELEMENT_TYPE_UNDEFINED = "undefined";

ITEM_TYPE_BITMAP = "item_bitmap";
ITEM_TYPE_SPRITE = "item_sprite";
ITEM_TYPE_FOLDER = "item_folder";
ITEM_TYPE_FONT = "item_font";
ITEM_TYPE_SOUND = "item_sound";


Util = function () {
};

ELEMENT_TYPE_BITMAP = "element_bitmap";
ELEMENT_TYPE_SYMBOL = "element_symbol";
ELEMENT_TYPE_TEXTFIELD = "element_textfield";
ELEMENT_TYPE_SHAPE = "element_shape";
ELEMENT_TYPE_UNDEFINED = "undefined";

var $p = Util.prototype;

$p.foundCount = 0;


$p.getNameFromURI = function (uri) {
    return uri.substring(uri.lastIndexOf("/") + 1);
};

$p.getFolderFromURI = function (uri) {
    return uri.substring(0, uri.lastIndexOf("/") + 1);
};

$p.getXFLRootFolderFromURI = function (uri) {
    uri = uri.substring(0, uri.lastIndexOf("/"));
    return uri.substring(0, uri.lastIndexOf("/") + 1);
};

$p.getRootFolderFromURI = function (uri) {
    return uri.substring(0, uri.indexOf("/"));
};


$p.getItemType = function (item) {
    switch (item.itemType) {
        case "bitmap":
            return ITEM_TYPE_BITMAP;
            break;
        case "movie clip":
            return ITEM_TYPE_SPRITE;
            break;
        case "sound":
            return ITEM_TYPE_SOUND;
            break;
        case "font":
            return ITEM_TYPE_FONT;
            break;
        case "folder":
            return ITEM_TYPE_FOLDER;
            break;
    }
    return null;
};

$p.getElementType = function (element) {
    switch (element.instanceType) {
        case "bitmap":
            return ELEMENT_TYPE_BITMAP;
            break;
        case "symbol":
            return ELEMENT_TYPE_SYMBOL;
            break;
        case undefined:
            if (element.toString() == "[object Text]") {
                return ELEMENT_TYPE_TEXTFIELD;
            } else {
                return ELEMENT_TYPE_UNDEFINED;
            }
            break;
    }
    return null;
};

$p.getElements = function (item) {
    var elements = [];
    var type = this.getItemType(item);
    if (item && type == ITEM_TYPE_SPRITE && item.timeline) {
        var layers = item.timeline.layers;
        var len = layers.length - 1;
        for (var i = len; i >= 0; --i) {
            var layer = layers[i];
            if (layer.layerType != "guide" && layer.layerType != "guided") {
                var frames = layers[i].frames;
                var lenFrames = frames.length;
                for (var j = 0; j < lenFrames; ++j) {
                    elements = elements.concat(frames[j].elements);
                }
            }
        }
    }
    return elements;
};

$p.distributeElementsToLayers = function () {
    doc.selectAll();
    if (doc.selection.length == 0) {
        return;
    }
    //doc.distributeToLayers();
    document.selectNone();
};

$p.deleteEmptyLayers = function () {
    var timeline = doc.getTimeline();
    if (timeline) {
        var layers = timeline.layers;
        var len = layers.length - 1;
        for (var i = len; i >= 0; --i) {
            var frames = layers[i].frames;
            if (frames.length == 1 && frames[0].elements.length == 0) {
                timeline.deleteLayer(i);
            }
        }
    }
};

$p.getItemUsages = function (checkItem) {

    //TODO: @gsar try to use fl.findObjectInDocByName()
    var allItems = lib.items;
    var checkItemType = this.getItemType(checkItem);
    var checkItemName = checkItem.name;
    trace("------------------------------- SEARCHING");
    for (var i = 0, len = allItems.length; i < len; ++i) {
        var item = allItems[i];
        var itemType = this.getItemType(item);
        if (itemType == ITEM_TYPE_SPRITE && item != checkItem) {
            this.checkItemExistenceInside(item, checkItemName, checkItemType);
        }
    }
    var finalCount = this.foundCount;

    trace("------------------------------- FOUND: " + this.foundCount + "\n");
    this.foundCount = 0;

    return finalCount;
};

$p.checkItemExistenceInside = function (item, checkItemName, checkItemType) {
    var elements = this.getElements(item);

    for (var i = 0, len = elements.length; i < len; ++i) {
        var element = elements[i];
        var type = this.getElementType(element);
        if (checkItemType == ITEM_TYPE_BITMAP && type == ELEMENT_TYPE_BITMAP) {
            if (checkItemName == element.libraryItem.name) {
                ++this.foundCount;
                trace("BITMAP FOUND IN: " + item.name);
            }
        } else if (checkItemType == ITEM_TYPE_SPRITE && type == ELEMENT_TYPE_SYMBOL) {
            if (checkItemName == element.libraryItem.name) {
                ++this.foundCount;
                trace("INSTANCE FOUND IN: " + item.name);
            }
        }
    }
};

$p.findAllTextFields = function () {
    //TODO: @gsar try to use fl.findObjectInDocByType()
    var allItems = lib.items;
    trace("------------------------------- SEARCHING TEXTFIELDS");
    for (var i = 0, len = allItems.length; i < len; ++i) {
        var item = allItems[i];
        var itemType = this.getItemType(item);
        if (itemType == ITEM_TYPE_SPRITE) {
            this.findTextFieldsInside(item);
        }
    }
    trace("------------------------------- FOUND: " + this.foundCount + "\n");
    this.foundCount = 0;
};

$p.findTextFieldsInside = function (item) {
    var elements = this.getElements(item);
    for (var i = 0, len = elements.length; i < len; ++i) {
        var element = elements[i];
        var type = this.getElementType(element);
        if (type == ELEMENT_TYPE_TEXTFIELD) {
            ++this.foundCount;
            trace("TEXTFIELD FOUND IN: " + item.name);
            var textAttrs = element.textRuns[0].textAttrs;

            var isBold = textAttrs["bold"];
            var isItalic = textAttrs["italic"];
            var style = "";
            if (isBold && isItalic) {
                style = "BoldItalic";
            } else if (isBold) {
                style = "Bold";
            } else if (isItalic) {
                style = "Italic";
            } else {
                style = "Regular";
            }

            var size = textAttrs["size"];
            var fillColor = textAttrs["fillColor"];
            trace("TEXTFIELD Properties: STYLE: " + style + " COLOR: " + fillColor + " SIZE: " + size);
        }
    }
};

$p.removeBitmapExtension = function (items) {
    var bitmapName;
    var item;
    var count = 0;
    for (var i = 0, len = items.length; i < len; i++) {
        item = items[i];
        if (this.getItemType(item) == ITEM_TYPE_BITMAP) {
            ++count;
            if (item.name.indexOf(".png") != -1) {
                bitmapName = Util.getNameFromURI(item.name);
                bitmapName = bitmapName.substring(0, bitmapName.lastIndexOf("."));
                item.name = bitmapName;
            }
            item.compressionType = "lossless";
            item.linkageExportForAS = false;
        }
    }
    trace(count + " bitmaps renamed.");
};

$p.exportBitmapForAS = function (item, bitmapName) {
    item.linkageExportForAS = true;
    item.linkageExportInFirstFrame = true;
    item.linkageClassName = bitmapName;
    item.linkageBaseClass = "flash.display.BitmapData";
};

$p.exportSpriteForAS = function (item, spriteName) {
    item.linkageExportForAS = true;
    item.linkageExportInFirstFrame = true;
    item.linkageClassName = spriteName;
    item.linkageBaseClass = "flash.display.Sprite";
};


(function () {
    xjsfl.init(this);
    var util = new Util();
    var selected = lib.getSelectedItems();
    if (selected.length == 0) {
        alert("No Selected Items in Library.");
        return;
    }
    var item = selected[0];
    var finalCount = util.getItemUsages(item);

    alert("SEARCH COMPLETE\n\nItem: " + $p.getNameFromURI(item.name) + "\nUsages: " + finalCount);
})();
