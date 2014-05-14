xjsfl.init(this);

document = fl.createDocument();

var dialog = new XUL("Choose json file");
dialog.addTextbox("JSON path", "json_path");
dialog.addButton("Browse...", "browse");
dialog.addEvent("browse", "click", onJsonBrowse);
dialog.addTextbox("Graphics path", "bitmap_path");
dialog.addButton("Browse...", "browseFolder");
dialog.addEvent("browseFolder", "click", onFolderBrowse);
dialog.show(onAccept);

var folderURI;

//onAccept(
//    "D:/Projects/dev/as/plexonic/misc/xJSFL/test/button_original.json",
//    "D:/Projects/dev/as/plexonic/misc/xJSFL/test/graphics/sd");

function onAccept(jsonPath, graphicsPath) {
    folderURI = URI.toURI(graphicsPath);
    var json = new File(URI.toURI(jsonPath)).contents;
    var movieClips = JSON.decode(json);
    document.library.newFolder("png");
    for (var curMovieClipName in movieClips) {
        var layers = movieClips[curMovieClipName];
        if (!document.library.itemExists("symbols/" + curMovieClipName)) {
            document.library.addNewItem("movie clip", "symbols/" + curMovieClipName);
            document.library.editItem("symbols/" + curMovieClipName);
            modifyMC(layers, curMovieClipName, true);
        }
    }
}
function modifyMC(layers, MCname, reverse) {
    for (var i = 0; i < layers.length; i++) {
        var timeline = document.getTimeline();
        var curLayer = layers[i];
        var curLayerInfo = curLayer.layerMeta;
        var folderName=curLayerInfo.folder;
        timeline.addNewLayer(curLayerInfo.name, "normal",false);
        if (folderName!="")
        {
            if (!timeline.findLayerIndex(folderName)) {
                timeline.addNewLayer(folderName, "folder");
            }
            timeline.cutLayers(timeline.findLayerIndex(curLayerInfo.name).pop());
            timeline.pasteLayers(timeline.findLayerIndex(folderName).pop());
        }
        var elements = curLayer.children;
        if (reverse)
            elements = elements.reverse();
        for (var j = 0; j < elements.length; j++) {
            var curElement = elements[j];
            var kind = curElement.kind;
            switch (kind) {
                case "quad":
                    var fill = document.getCustomFill();
                    fill.color = curElement.color;
                    fill.style = "solid";
                    document.setCustomFill(fill);
                    document.addNewRectangle({left: curElement.x, top: curElement.y, right: curElement.width + curElement.x, bottom: curElement.height + curElement.y}, 0, false, true);
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.skewSelection(curElement.skewX, curElement.skewY);
                    document.rotateSelection(radToDeg(curElement.rotation));
                    document.selectNone();
                    break;
                case "image":
                    var addItem = true;

                    if (document.library.itemExists("png/" + curElement.name)) {
                        document.library.selectItem(curElement.name, true);
                    }
                    else {
                        var bitmapURI = folderURI + "/" + curElement.name + ".png";
                        if (FLfile.exists(bitmapURI)) {
                            document.importFile(bitmapURI, true);
                            document.library.selectItem(curElement.name + ".png", true);
                            document.library.renameItem(curElement.name);
                            document.library.moveToFolder("png");
                        }
                        else {
                            addItem = false;
                            trace(bitmapURI + " does not exist!");
                        }

                    }
                    if (addItem) {
                        document.library.addItemToDocument({x: 0, y: 0}, "png/" + curElement.name);
                        var image = document.selection[0];
                        image.scaleX = curElement.scaleX;
                        image.scaleY = curElement.scaleY;
                        image.x = curElement.x;
                        image.y = curElement.y;
                        image.skewX = curElement.skewX;
                        image.skewY = curElement.skewY;
                        image.rotation = radToDeg(curElement.rotation);
                    }
                    break;
                case "text":
                    document.addNewText({left: curElement.x, top: curElement.y, right: (curElement.x + curElement.width), bottom: (curElement.y + curElement.height)});
                    document.setTextString(curElement.characters);
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.skewSelection(curElement.skewX, curElement.skewY);
                    document.setElementProperty("name", curElement.name);
                    var curFilters=[];
                    var filtersToSet = curElement.filters;
                    for (var f = 0; f < filtersToSet.length; f++) {
                        var q;
                        switch (filtersToSet[f].quality) {
                            case "1":
                                q= "low";
                                break;
                            case 2:
                                q= "medium";
                                break;
                            case 3:
                                q= "high";
                                break;
                        }
                        curFilters.push({name:filtersToSet[f].name,angle:filtersToSet[f].angle,blurX:filtersToSet[f].blurX,blurY:filtersToSet[f].blurY,distance:filtersToSet[f].distance,color:filtersToSet[f].color,quality:q,strength:filtersToSet[f].strength*100,knockout:false,inner:false,hideObject:false});
                    }
                    document.setFilters(curFilters);
                    document.selection[0].setTextAttr("face", curElement.fontFamily);
                    document.selection[0].setTextAttr("bold", curElement.bold);
                    document.selection[0].setTextAttr("italic", curElement.italic);
                    document.selection[0].setTextAttr("fillColor", curElement.color);
                    document.selection[0].setTextAttr("size", curElement.size);
                    document.selection[0].setTextAttr("alignment", curElement.alignment);
                    document.rotateSelection(radToDeg(curElement.rotation));
                    break;
                case "sprite":
                    if (document.library.itemExists("symbols/" + curElement.libraryName)) {
                        document.library.addItemToDocument({x: curElement.x, y: curElement.y}, "symbols/" + curElement.libraryName);
                    }
                    else {
                        document.library.addNewItem("movie clip", "symbols/" + curElement.libraryName);
                        document.library.addItemToDocument({x: curElement.x, y: curElement.y}, "symbols/" + curElement.libraryName);
                        document.library.editItem("symbols/" + curElement.libraryName);
                        modifyMC(curElement.layers, curElement.libraryName, false);
                        document.library.editItem("symbols/" + MCname);
                    }
                    document.setElementProperty("name", curElement.name);
                    document.setInstanceAlpha(curElement.alpha * 100);
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.skewSelection(curElement.skewX, curElement.skewY);
                    document.rotateSelection(radToDeg(curElement.rotation));
                    break;
            }
            document.selectNone();
        }
        timeline.currentLayer=0;
    }
    timeline.deleteLayer(0);

}
function onFolderBrowse(event) {
    this.controls.bitmap_path.value = URI.toPath(fl.browseForFolderURL("Choose graphics folder"));
}
function radToDeg(angleInRad) {
    return angleInRad * 180 / Math.PI;
}


function onJsonBrowse(event) {
    var jsonURI = fl.browseForFileURL("open", "Choose json file");
    this.controls.json_path.value = URI.toPath(jsonURI);
}
