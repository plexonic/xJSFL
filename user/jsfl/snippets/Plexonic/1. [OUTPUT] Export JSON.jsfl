﻿/*
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
ELEMENT_TYPE_HITAREA = "element_hitarea";
ELEMENT_TYPE_SHAPE = "element_shape";
ELEMENT_TYPE_POLYGON_SHAPE = "element_polygon_shape";
ELEMENT_TYPE_UNDEFINED = "undefined";

var ASPECT_RATIO_SUFFIXES = ["2_3", "3_4", "4_3", "9_16", "9_19"];

var $p = JsonStructurizer.prototype;
$p.dummyFolder = "";
$p.depth = 0;
$p.rootFolder = "_structures/";
$p.structureJson = "";
$p.currentItem = null;

$p.structurize = function (selectedItems, skipFilter, renameFilter) {
    var documentMetadata = {};
	var itemMetadata;
	var processedName;
	var baseItemName;
	var aspectRatio;

	var ratioEnabledItemNames = $p.getItemsNameRatioMap(selectedItems, skipFilter, renameFilter);

    for each (var item in selectedItems) {
	    if ($p.isItemSkipped(item.name, skipFilter)) {
            continue;
        }

	    itemMetadata = {};
        processedName = $p.getProcessedName(item.itemName, renameFilter, skipFilter);

        if (item.itemType === "graphic") {
            itemMetadata.image = {};
            $p.createImageMetadata(item, itemMetadata.image);
        }
        else {
            itemMetadata.layers = [];
            $p.createMovieClipMetadata(item, itemMetadata.layers);
        }

	    aspectRatio = ratioEnabledItemNames[processedName];
        if (!aspectRatio) {
	        documentMetadata[processedName] = itemMetadata;
        }
        else {
            baseItemName = aspectRatio !== "base" ? processedName.substr(0, processedName.indexOf(aspectRatio) - 1) : processedName;
            documentMetadata[baseItemName] = documentMetadata[baseItemName] || {};
            documentMetadata[baseItemName].multi = true;
            documentMetadata[baseItemName][aspectRatio] = itemMetadata;
        }
    }

    $p.structureJson = JSON.formatJson(JSON.encode(documentMetadata));
};

$p.getItemsNameRatioMap = function(items, skipFilter, renameFilter) {
	var itemName;
	var baseItemName;
	var names = {};
	var aspectRatiosCount = ASPECT_RATIO_SUFFIXES.length;
	var aspectRatio;

	for each(var item in items) {
	    if ($p.isItemSkipped(item.name, skipFilter)) {
	        continue;
        }

		itemName = $p.getProcessedName(item.itemName, renameFilter, skipFilter);

        for (var i = 0; i < aspectRatiosCount; i++) {
	        aspectRatio = ASPECT_RATIO_SUFFIXES[i];
	        var itemAspectRatio = itemName.substr(-1 * (aspectRatio.length), aspectRatio.length);
            if (itemAspectRatio === aspectRatio) {
                baseItemName = itemName.substr(0, itemName.length - aspectRatio.length - 1);
                if (!names[baseItemName]) {
                    names[baseItemName] = "base";
                }
                names[itemName] = aspectRatio;
            }
        }
    }

    return names;
};

$p.isItemSkipped = function(name, skipFilter) {
    return skipFilter && name.indexOf("ext_" + skipFilter + "_") !== -1;
};

$p.getProcessedName = function (name, renameFilter, skipFilter) {
    if (skipFilter && renameFilter) {
	    return name.split("_" + renameFilter + "_").join("_");
    }
    return name;
};

$p.saveStructure = function (renameFilter) {
    if ($p.getJsonUri(renameFilter) == "") {
        fl.getDocumentDOM().addDataToDocument("sourceJSONPath", "string",
            URI.toPath(fl.browseForFileURL(
                "save", //
                "Choose json file location", //
                "JSON File (*.json)", //
                "json" //
            )));
    }
    var file = new File($p.getJsonUri(renameFilter));
    file.write($p.structureJson);
    trace("[" + new Date().toLocaleTimeString() + "] JSON saved: " + $p.getJsonUri(renameFilter));
    file.save();
};

$p.getJsonUri = function (renameFilter) {
    if (renameFilter) {
        return $dom.pathURI.replace("media", "resources/structures").replace("fla/web", "web/" + renameFilter).replace(".fla", ".json");
    } else {
        return $dom.pathURI.replace("media", "resources/structures").replace("fla/", "").replace(".fla", ".json");
    }
};

$p.createImageMetadata = function (item, metadata) {
    var element = $p.getFirstChild(item);
    if (element == null) {
        alert("No image found in Graphic.");
        return;
    }

    var elementItem = element.libraryItem;
    $p.createExtractableImageGenericMetadata(element, metadata);
    metadata.libraryName = (new File(elementItem.name)).name.replace("@", "/");
    return metadata;
};

$p.getFirstChild = function (item) {
    for (var i = 0; i < item.timeline.layers.length; i++) {
        var layer = item.timeline.layers[i];

        // skip guide layers!
        if (layer.layerType == 'guide' || layer.layerType == 'folder' || layer.name[0] == '.') {
            continue;
        }

        var frame = layer.frames[0];
        var elements = frame.elements;
        if (elements.length == 0) {
            continue;
        }
        return elements[0];
    }

    return null;
};

$p.createMovieClipMetadata = function (item, metadata, image) {
    var q = 1;

    for (var i = 0; i < item.timeline.layers.length; i++) {
        var layer = item.timeline.layers[i];

        // skip guide layers!
        if (layer.layerType == 'guide' || layer.layerType == 'folder' || layer.name[0] == '.') {
            continue;
        }

        var layerObject = {};

        //UNCOMMENT IF NEEDED
        //------------------------------
        //var layerMeta = {};
        //if (item.timeline.findLayerIndex(layer.name).length == 1)
        //    layerMeta.name = layer.name;
        //else {
        //    layerMeta.name = layer.name + "_" + q;
        //    q++;
        //}
        //if (layer.parentLayer != null) {
        //    layerMeta.folder = layer.parentLayer.name;
        //}
        //else{
        //    layerMeta.folder = "";
        //}
        //layerMeta.layerType = layer.layerType;
        //layerObject.layerMeta = layerMeta;
        //------------------------------

        layerObject.children = [];

        $p.currentItem = item;

        for (var j = 0; j < layer.frames.length; j++) {
            var frame = layer.frames[j];
            if (j == frame.startFrame) {
                var elements = frame.elements;
                for (var k = 0; k < elements.length; k++) {
                    var element = elements[k];
                    // do something with element
                    // trace(item.name); //tracing item name in case of error
                    $p.createElementMetadata(element, layerObject.children);
                }
            }
        }
        metadata.push(layerObject);
    }

    return metadata;
};

$p.createElementMetadata = function (element, metadata) {
    var elementItem = element.libraryItem;
    var elementMetadata = $p.createElementGenericMetadata(element);
    var elementName = "";
    var elementLibraryName = "";
    var elementKind = "";
    var customMetadataSetter = null;

    switch (getElementType(element)) {
        case ELEMENT_TYPE_BITMAP:
            elementLibraryName = (new File(elementItem.name)).name;
            elementName = element.name;
            elementKind = "image";
            customMetadataSetter = $p.imageCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_SYMBOL:
            elementName = element.name;
            elementKind = "sprite";
            customMetadataSetter = $p.symbolCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_TEXTFIELD:
            elementName = element.name;
            elementKind = "text";
            customMetadataSetter = $p.textFieldCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_POLYGON_SHAPE:
            elementName = element.name;
            elementKind = "hitarea";
            customMetadataSetter = $p.polygonShapeCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_SHAPE:
            elementName = element.name;
            elementKind = "quad";
            customMetadataSetter = $p.shapeCustomMetadataSetter;
            break;
        case ELEMENT_TYPE_HITAREA:
            elementName = element.name;
            elementKind = "quad";
            customMetadataSetter = $p.hitareaCustomMetadataSetter;
            break;
        default:
            //inspect(element);
            break;
    }

    $p.setElementSpecificMetadata(elementName, elementLibraryName, elementKind, element, elementMetadata, customMetadataSetter);
    metadata.push(elementMetadata);
};

$p.setElementSpecificMetadata = function (name, libraryName, kind, element, elementMetadata, customMetadataSetter) {
    $p.setElementNameAndKind(name, libraryName, kind, elementMetadata);
    if (customMetadataSetter) {
        customMetadataSetter(element, elementMetadata);
    }
};

$p.polygonShapeCustomMetadataSetter = function (element, elementMetadata) {
    var vertices = [];
    var halfEdge = element.vertices[0].getHalfEdge();
    var startId = halfEdge.id;
    var id = 0;
    while (id != startId) {
        var vertex = halfEdge.getVertex();
        halfEdge = halfEdge.getPrev();
        vertices.push({x: vertex.x, y: vertex.y});
        id = halfEdge.id;
    }
    elementMetadata.vertices = vertices;
    elementMetadata.x = 0;
    elementMetadata.y = 0;
};

$p.shapeCustomMetadataSetter = function (element, elementMetadata) {
    elementMetadata.color = $p.formatColor(element.contours[1].fill.color);

    delete elementMetadata.scaleX;
    delete elementMetadata.scaleY;
    elementMetadata.x = element.left;
    elementMetadata.y = element.top;
    $p.setElementWidthAndHeightMetadata(element, elementMetadata);
};

$p.hitareaCustomMetadataSetter = function (element, elementMetadata) {
    elementMetadata.color = "0xfff";
    delete elementMetadata.scaleX;
    delete elementMetadata.scaleY;

    var shape = $p.getFirstChild(element.libraryItem);

    if (shape.left != 0) {
        elementMetadata.pivotX = parseFloat((-shape.left * element.scaleX).toFixed(2));
    }

    if (shape.top != 0) {
        elementMetadata.pivotY = parseFloat((-shape.top * element.scaleY).toFixed(2));
    }

    $p.setElementWidthAndHeightMetadata(element, elementMetadata);

};

$p.formatColor = function (colorString) {
    return "0x" + colorString.substr(1, colorString.length - 1);
};

$p.setElementWidthAndHeightMetadata = function (element, elementMetadata) {
    elementMetadata.width = element.width;
    elementMetadata.height = element.height;
};

$p.symbolCustomMetadataSetter = function (element, elementMetadata) {
    if (element.colorAlphaPercent != 100) {
        elementMetadata.alpha = element.colorAlphaPercent * 0.01;
    }

    if (element.colorMode == "brightness" && element.brightness != 0) {
        elementMetadata.brightness = element.brightness / 100;
    }

    elementMetadata.layers = $p.createMovieClipMetadata(element.libraryItem, []);
};

$p.imageCustomMetadataSetter = function (element, elementMetadata) {
    var rect = element.libraryItem.scalingGridRect;
    if (rect && element.libraryItem.itemType != "graphic") { //graphic type lirbrary item have a messed up grid value

        elementMetadata.grid = {
            x: rect.left < 0 ? 0 : rect.left,
            y: rect.top < 0 ? 0 : rect.top,
            width: rect.left < 0 ? 0 : parseFloat((rect.right - rect.left).toFixed(4)),
            height: rect.top < 0 ? 0 : parseFloat((rect.bottom - rect.top).toFixed(4))
        }
    }

    //TODO: add pivot point reading and assigning from child image in case of graphic
    //      (scale, rotation and other properties should be read from graphic only)
    if (element.libraryItem.itemType == "graphic") {

    }

    if (!isNaN(element.colorAlphaPercent) && element.colorAlphaPercent != 100) {
        elementMetadata.alpha = element.colorAlphaPercent * 0.01;
    }

    $p.setImageFiltersMetadata(element, elementMetadata);

};

$p.setImageFiltersMetadata = function (element, elementMetadata) {
    if (element.colorMode == "brightness" && element.brightness != 0) {
        elementMetadata.brightness = element.brightness / 100;
    }
};


$p.setElementNameAndKind = function (name, libraryName, kind, elementMetadata) {
    if (name != "") {
        elementMetadata.instanceName = name;
    }

    if (libraryName != "") {
        elementMetadata.libraryName = libraryName.replace("@", "/");
    }

    elementMetadata.kind = kind;
};

$p.textFieldCustomMetadataSetter = function (element, elementMetadata) {
    var textRun = element.textRuns[0];

    if(element.lineType != "multiline"){
        elementMetadata.wordWrap = false;
    }
    var textAttrs = textRun.textAttrs;
    $p.setElementWidthAndHeightMetadata(element, elementMetadata);
    elementMetadata.characters = textRun.characters;
    $p.setTextFieldAttrsMetadata(textAttrs, elementMetadata);
    $p.setTextFieldFiltersMetadata(element.filters, elementMetadata);
};


$p.setTextFieldFiltersMetadata = function (filters, elementMetadata) {
    if (!filters) {
        return;
    }
    var filtersMetadata = [];
    for (var i = 0; i < filters.length; ++i) {
        var filter = filters[i];
        //inspect(filter);
        filtersMetadata.push({
            name: filter.name,
            angle: filter.angle,
            blurX: filter.blurX,
            blurY: filter.blurY,
            distance: filter.distance,
            color: $p.formatColor(filter.color),
            quality: $p.formatFilterQuality(filter.quality),
            strength: filter.strength * 0.01
        });
    }
    elementMetadata.filters = filtersMetadata;
};

$p.formatFilterQuality = function (quality) {
    switch (quality) {
        case "low":
            return 1;
            break;
        case "medium":
            return 2;
            break;
        case "high":
            return 3;
            break;
    }
    return 3;
};

$p.setTextFieldAttrsMetadata = function (textAttrs, elementMetadata) {
    if (textAttrs.bold == true) {
        elementMetadata.bold = textAttrs.bold;
    }

    if (elementMetadata.bold == true && textAttrs.face.indexOf(" Bold") == -1) {
        elementMetadata.fontName = textAttrs.face + " Bold";
    } else {
        elementMetadata.fontName = textAttrs.face;
    }

    if (textAttrs.italic == true) {
        elementMetadata.italic = textAttrs.italic;
    }

    if (textAttrs.underline == true) {
        elementMetadata.italic = textAttrs.italic;
    }

    elementMetadata.color = $p.formatColor(textAttrs.fillColor);
    elementMetadata.size = textAttrs.size;
    elementMetadata.hAlign = textAttrs.alignment;

    if (textAttrs.lineSpacing != 0) {
        elementMetadata.leading = textAttrs.lineSpacing;
    }

    if (textAttrs.letterSpacing != 0) {
        elementMetadata.letterSpacing = textAttrs.letterSpacing;
    }
};

$p.createExtractableImageGenericMetadata = function (element, metadata) {
    var x = element.x;
    var y = element.y;

    var scaleX = element.scaleX;
    var scaleY = element.scaleY;
    var rotation = parseFloat(degToRad(element.rotation)).toFixed(4);
    var skewX = element.skewX;
    var skewY = element.skewY;

    //we are applying a workaround, as setying scale to -100 in Flash, sets the value to 180 deg skew
    if (skewY == 180) {
        scaleX *= -1;
    }

    if (skewX == 180) {
        scaleY *= -1;
    }

    var cos = Math.cos(degToRad(element.rotation));
    var sin = Math.sin(degToRad(element.rotation));
    var pivotX = -1 * ((x * cos + y * sin) / scaleX).toFixed(2);
    var pivotY = -1 * ((x * (-sin ) + y * cos) / scaleY).toFixed(2);

    if (pivotX != 0) {
        metadata.pivotX = pivotX;
    }

    if (pivotY != 0) {
        metadata.pivotY = pivotY;
    }

    scaleX = parseFloat(scaleX.toFixed(4));
    scaleY = parseFloat(scaleY.toFixed(4));


    if (scaleX != 1) {
        metadata.scaleX = scaleX;
    }

    if (scaleY != 1) {
        metadata.scaleY = scaleY;
    }

    if (rotation != 0) {
        metadata.rotation = rotation;
    }

    return metadata;
};

//we consider that shapes without fill are just polygonal shapes...
$p.isPolygonShape = function (element) {
    if (element.contours[1].fill.color == null) {
        if (element.isDrawingObject || element.isRectangleObject) {
            alert("ERROR ERROR ERROR ERROR ERROR ERROR ERROR\n\n" + "9 Slice is broken\n" + $p.currentItem.name);
        }

        if (element.contours[1].interior == false) {
            alert("ERROR ERROR ERROR ERROR ERROR ERROR ERROR\n\n" + element.libraryName + " is a polygon shape that is not INTERIOR.");
            return false
        }
        return true;
    }


    return false;
};

$p.createElementGenericMetadata = function (element) {
    var metadata = {};

    var x = parseFloat(element.x.toFixed(2));
    var y = parseFloat(element.y.toFixed(2));

    var scaleX = parseFloat(element.scaleX.toFixed(4));
    var scaleY = parseFloat(element.scaleY.toFixed(4));
    var skewX = parseFloat(degToRad(element.skewX).toFixed(4));
    var skewY = parseFloat(degToRad(element.skewY).toFixed(4));
    var rotation = parseFloat(degToRad(element.rotation.toFixed(4)));

    if (x != 0) {
        metadata.x = x;
    }

    if (y != 0) {
        metadata.y = y;
    }

    if (scaleX != 1) {
        metadata.scaleX = scaleX;
    }

    if (scaleY != 1) {
        metadata.scaleY = scaleY;
    }

    //if ((skewX != 0 || skewY != 0) && (Math.abs(skewX - skewY) >= 0.001 && (Math.abs(skewX - rotation) >= 0.001))) {
    if ((skewX != 0 || skewY != 0) && (Math.abs(skewX - skewY) >= 0.001)) {
        metadata.skewX = skewX;
        metadata.skewY = skewY;
    }

    if (rotation != 0) {
        metadata.rotation = rotation;
    }

    return metadata;
};


function degToRad(deg) {
    var rad;
    try {
        rad = deg / 180.0 * Math.PI;
    }
    catch (e) {
        rad = 0;
    }
    if (isNaN(rad)) {
        rad = 0;
    }
    return rad;
}

function getElementType(element) {
    switch (element.instanceType) {
        case "bitmap":
            return ELEMENT_TYPE_BITMAP;
            break;
        case "symbol":
            if (element.libraryItem.scalingGrid || element.libraryItem.itemType == "graphic") {
                return ELEMENT_TYPE_BITMAP;
            }

            if (element.name == "hitarea") {
                return ELEMENT_TYPE_HITAREA;
            }

            return ELEMENT_TYPE_SYMBOL;
            break;

        case undefined:
            if (element.toString() == "[object Text]") {
                return ELEMENT_TYPE_TEXTFIELD;
            } else if (element.elementType == "shape") {
                return $p.isPolygonShape(element) ? ELEMENT_TYPE_POLYGON_SHAPE : ELEMENT_TYPE_SHAPE;
            }
            return ELEMENT_TYPE_UNDEFINED;
            break;
    }
    return null;
}


(function () {
    xjsfl.init(this);
    structurizer = new JsonStructurizer();

    ////////////////////////////////////////////////////////////////////////////////////
    var elements = $$("ext_*").elements;
    var fbOkMode = false;
    for (var i = 0, len = elements.length; i < len; ++i) {
        if (elements[i].itemName.indexOf("_fb_") != -1 || elements[i].itemName.indexOf("_ok_") != -1) {
            fbOkMode = true;
            break;
        }
    }

    if (fbOkMode) {
        structurizer.structurize(elements, "ok", "fb");
        structurizer.saveStructure("fb");

        structurizer.structurize(elements, "fb", "ok");
        structurizer.saveStructure("ok");
        alert("EXPORT COMPLETE\nFB & OK");
    } else {
        structurizer.structurize(elements);
        structurizer.saveStructure();
        alert("EXPORT COMPLETE");
    }
    ////////////////////////////////////////////////////////////////////////////////////

    // var flaFolder = "file:///D|/Projects/dev/as/plexonic/games/meln-mobile/media/fla/web/";
    // // var flaFolder = "file:///Macintosh%20HD/Users/gevorg.sargsyan/Projects/dev/as/plexonic/games/meln-mobile/media/fla/web/";
    // var fileList = FLfile.listFolder(flaFolder + "*.fla", "files");
    //
    // for (var k = 0; k < fileList.length; ++k) {
    //    var doc = fl.openDocument(flaFolder + fileList[k]);
    //
    //    var elements = $$("ext_*").elements;
    //    var fbOkMode = false;
    //    for (var i = 0, len = elements.length; i < len; ++i) {
    //        if (elements[i].itemName.indexOf("_fb_") != -1 || elements[i].itemName.indexOf("_ok_") != -1) {
    //            fbOkMode = true;
    //            break;
    //        }
    //    }
    //
    //    if (fbOkMode) {
    //        structurizer.structurize(elements, "ok", "fb");
    //        structurizer.saveStructure("fb");
    //
    //        structurizer.structurize(elements, "fb", "ok");
    //        structurizer.saveStructure("ok");
    //        trace("EXPORT COMPLETE\nFB & OK - " + flaFolder + fileList[k]);
    //
    //    } else {
    //        structurizer.structurize(elements);
    //        structurizer.saveStructure();
    //        trace("EXPORT COMPLETE - " + flaFolder + fileList[k]);
    //    }
    //    fl.closeDocument(doc);
    // }


})();
