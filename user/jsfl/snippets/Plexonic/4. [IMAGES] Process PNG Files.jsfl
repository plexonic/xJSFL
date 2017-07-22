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
ITEM_TYPE_GRAPHIC = "item_graphic";
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
        case "graphic":
            return ITEM_TYPE_GRAPHIC;
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


(function () {
    xjsfl.init(this);
    var util = new Util();
    var selected = lib.getSelectedItems();
    if (selected.length == 0) {
        alert("No Selected Items in Library.");
        return;
    }

    for (var i = 0, len = selected.length; i < len; i++) {
        var item = selected[i];
        if ($p.getItemType(item) == ITEM_TYPE_BITMAP) {
            trace(item.name);

            if (item.name.indexOf(".png") != -1) {
                item.name = $p.getNameFromURI(item.name).replace(".png", "");
            }
            item.compressionType = "lossless";
            item.allowSmoothing = true;
        }
    }

    alert("PROCESSING COMPLETE\n\nItems: " + selected.length);
})();
