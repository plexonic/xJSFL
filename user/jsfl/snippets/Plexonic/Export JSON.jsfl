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




JsonStructurizer = function () {
};

ELEMENT_TYPE_BITMAP = "element_bitmap";
ELEMENT_TYPE_SYMBOL = "element_symbol";
ELEMENT_TYPE_TEXTFIELD = "element_textfield";
ELEMENT_TYPE_SHAPE = "element_shape";
ELEMENT_TYPE_UNDEFINED = "undefined";

var $p = JsonStructurizer.prototype;
$p.dummyFolder = "";
$p.depth = 0;
$p.rootFolder = "_structures/";
$p.structureJson = "";


$p.structurize = function (selectedItems) {
    var obj = {};
    for each (var item in selectedItems) {
        var itemJson = [];
        obj[item.itemName] = itemJson;
        $p.crateMovieClipMetadata(item, itemJson);
    }
    $p.structureJson = JSON.encode(obj);
};


$p.saveStructure = function () {
    var file = new File($p.getJsonUri());
    file.write($p.structureJson);
    file.save();
};

$p.getJsonUri = function () {
    return $dom.pathURI.replace("media", "resources/structures").replace("fla/", "").replace(".fla", ".json");
};

$p.crateMovieClipMetadata = function (item, obj) {
    for (var i = 0; i < item.timeline.layers.length; i++) {
        var layer = item.timeline.layers[i];
        //skipping guide layers!
        if (layer.layerType == 'guide') {
            continue;
        }
        for (var j = 0; j < layer.frames.length; j++) {
            var frame = layer.frames[j];
            if (j == frame.startFrame) {
                var elements = frame.elements;
                for (var k = 0; k < elements.length; k++) {
                    var element = elements[k];
                    // do something with element
                    $p.crateElementMetadata(element, obj);
                }
            }
        }
    }
    return obj;
};

$p.crateElementMetadata = function (element, obj) {
    var elementMetadata = $p.crateElementGenericMetadata(element);
    switch (getElementType(element)) {
        case ELEMENT_TYPE_BITMAP:
            elementMetadata.kind = "image";
            elementMetadata.name = element.libraryItem.itemName;
            break;
        case ELEMENT_TYPE_SYMBOL:
            elementMetadata.kind = "sprite";
            elementMetadata.name = element.name;
            elementMetadata.children = $p.crateMovieClipMetadata(element.libraryItem, []);
            break;
        case ELEMENT_TYPE_TEXTFIELD:
            elementMetadata.kind = "text";
            elementMetadata.name = element.name;
            $p.setTextFieldSpecificMetadata(element, elementMetadata);
            break;
        case ELEMENT_TYPE_SHAPE:
            elementMetadata.kind = "quad";
            elementMetadata.name = element.name;
            elementMetadata.color = element.contours[1].fill.color;
            elementMetadata.width = element.width;
            elementMetadata.height = element.height;
            break;
        default:
            inspect(element);
            break;
    }
    obj.push(elementMetadata);
};

$p.setTextFieldSpecificMetadata = function (element, elementMetadata) {
    elementMetadata.width = element.width;
    elementMetadata.height = element.height;
    var textRun = element.textRuns[0];
    elementMetadata.characters = textRun.characters;
    var textAttrs = textRun.textAttrs;
    $p.setTextFieldAttrsMetadata(textAttrs, elementMetadata);
    $p.setTextFieldFiltersMetadata(element.filters, elementMetadata);
};


$p.setTextFieldFiltersMetadata = function (filters, elementMetadata) {
    var filtersMetadata = [];
    for (var i = 0; i < filters.length; ++i) {
        var filter = filters[i];
        filtersMetadata.push({
            name: filter.name,
            angle: filter.angle,
            blurX: filter.blurX,
            blurY: filter.blurY,
            distance: filter.distance,
            color: filter.color,
            quality: filter.quality,
            strength: filter.strength
        });
    }
    elementMetadata.filters = filtersMetadata;
};

$p.setTextFieldAttrsMetadata = function (textAttrs, elementMetadata) {
    elementMetadata.bold = textAttrs.bold;
    elementMetadata.italic = textAttrs.italic;
    elementMetadata.fontFamily = textAttrs.face;
    elementMetadata.color = textAttrs.fillColor;
    elementMetadata.size = textAttrs.size;
    elementMetadata.alignment = textAttrs.alignment;
};

$p.crateElementGenericMetadata = function (element) {
    return {
        x: element.x,
        y: element.y,
        scaleX: element.scaleX,
        scaleY: element.scaleY,
        skewX: element.skewX,
        skewY: element.skewY,
        rotation: element.rotation
    }
};

function getElementType(element) {
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
            } else if (element.elementType == "shape") {
                return ELEMENT_TYPE_SHAPE;
            }
            return ELEMENT_TYPE_UNDEFINED;
            break;
    }
    return null;
}

(function()
{
    xjsfl.init(this);
    var elements = $$(':selected').elements;
    var structurizer = new JsonStructurizer();
    structurizer.structurize(elements);
    structurizer.saveStructure();
    alert("Done!");
    
})()