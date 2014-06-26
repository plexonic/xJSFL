xjsfl.init(this);

document = fl.createDocument();

var dialog = new XUL("Choose json file");
dialog.addTextbox("JSON path", "json_path");
dialog.addButton("Browse...", "browse");
dialog.addEvent("browse", "click", onJsonBrowse);
dialog.show(onAccept);

var folderURI;

//onAccept(
//    "D:/Projects/dev/as/plexonic/misc/xJSFL/test/button_original.json",
//    "D:/Projects/dev/as/plexonic/misc/xJSFL/test/graphics/sd");

function onAccept(jsonPath) {
    folderURI = URI.toURI( graphicsPathFromJSONPath(jsonPath));
    fl.getDocumentDOM().addDataToDocument("sourceJSONPath", "string", jsonPath);
    if(!FLfile.exists(folderURI)){
        alert("Please select JSON file \n included in project! ");
        return;
    }
    var json = new File(URI.toURI(jsonPath)).contents;
    var movieClips = JSON.decode(json);
    document.library.newFolder("[png]");
    for (var curMovieClipName in movieClips) {
        var layers = movieClips[curMovieClipName].layers;
        if (!document.library.itemExists(movieClips[curMovieClipName].libraryName)) {
            document.library.addNewItem("movie clip", movieClips[curMovieClipName].libraryName);
            document.library.editItem(movieClips[curMovieClipName].libraryName);
            modifyMC(layers, movieClips[curMovieClipName].libraryName, false);
        }
    }
}
function modifyMC(layers, MCname, reverse) {
    for (var i = layers.length - 1; i >= 0; i--) {
        var timeline = document.getTimeline();
        timeline.currentLayer = 0;
        var curLayer = layers[i];
        var curLayerInfo = curLayer.layerMeta;
        var folderName = curLayerInfo.folder;
        timeline.addNewLayer(curLayerInfo.name, "normal", false);
        if (folderName != "") {
            if (!timeline.findLayerIndex(folderName)) {
                timeline.addNewLayer(folderName, "folder");
            }
            timeline.cutLayers(timeline.findLayerIndex(curLayerInfo.name).pop());
            timeline.pasteLayers(timeline.findLayerIndex(folderName).pop());
        }
        timeline.currentLayer = timeline.findLayerIndex(curLayerInfo.name).pop();
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
                    document.selectNone();
                    break;
                case "image":
                    var addItem = true;

                    if (document.library.itemExists("[png]/" + curElement.name)) {
                        document.library.selectItem(curElement.name, true);
                    }
                    else {
                        var bitmapURI = folderURI + "/" + curElement.name + ".png";
                        if (FLfile.exists(bitmapURI)) {
                            document.importFile(bitmapURI, true);
                            document.library.selectItem(curElement.name + ".png", true);
                            document.library.renameItem(curElement.name);
                            document.library.moveToFolder("[png]");
                        }
                        else {
                            addItem = false;
                            trace(MCname + " requires " + bitmapURI + " which cannot be found!");
                        }

                    }
                    if (addItem) {
                        document.library.addItemToDocument({x:curElement.x, y: curElement.y}, "[png]/" + curElement.name);
                        var image = document.selection[0];
                        image.scaleX = curElement.scaleX;
                        image.scaleY = curElement.scaleY;
                        image.skewX = curElement.skewX;
                        image.skewY = curElement.skewY;
                        image.rotation = radToDeg(curElement.rotation);
                        image.x = curElement.x;
                        image.y = curElement.y;
                    }
                    break;
                case "text":
                    document.addNewText({left: curElement.x, top: curElement.y, right: (curElement.x + curElement.width), bottom: (curElement.y + curElement.height)});
                    document.setTextString(curElement.characters);
                    document.selection[0].setTextAttr("size", curElement.size);
                    document.selection[0].setTextAttr("face", curElement.fontFamily);
                    document.selection[0].setTextAttr("bold", curElement.bold);
                    document.selection[0].setTextAttr("italic", curElement.italic);
                    document.selection[0].setTextAttr("fillColor", curElement.color);
                    document.selection[0].setTextAttr("alignment", curElement.alignment);
                    document.height = curElement.height;
                    //ToDo:: @javd, @ulix ::: set textFieldProperty from json file!!!
                    document.setElementProperty('textType', 'dynamic');
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.skewSelection(curElement.skewX, curElement.skewY);
                    document.setElementProperty("name", curElement.name);
                    var curFilters = [];
                    var filtersToSet = curElement.filters;
                    for (var f = 0; f < filtersToSet.length; f++) {
                        var q;
                        switch (filtersToSet[f].quality) {
                            case "1":
                                q = "low";
                                break;
                            case 2:
                                q = "medium";
                                break;
                            case 3:
                                q = "high";
                                break;
                        }
                        curFilters.push({name: filtersToSet[f].name, angle: filtersToSet[f].angle, blurX: filtersToSet[f].blurX, blurY: filtersToSet[f].blurY, distance: filtersToSet[f].distance, color: filtersToSet[f].color, quality: q, strength: filtersToSet[f].strength * 100, knockout: false, inner: false, hideObject: false});
                    }
                    document.setFilters(curFilters);
                    break;
                case "sprite":
                    if (document.library.itemExists(curElement.libraryName)) {
                        document.library.addItemToDocument({x: 0, y: 0}, curElement.libraryName);
                    }
                    else {
                        document.library.addNewItem("movie clip", curElement.libraryName);
                        document.library.addItemToDocument({x: 0, y: 0}, curElement.libraryName);
                        document.library.editItem(curElement.libraryName);
                        modifyMC(curElement.layers, curElement.libraryName, false);
                        document.library.editItem(MCname);
                    }
                    document.scaleSelection(curElement.scaleX, curElement.scaleY);
                    document.skewSelection(curElement.skewX, curElement.skewY);
                    document.rotateSelection(radToDeg(curElement.rotation));
                    document.setElementProperty("x", curElement.x);
                    document.setElementProperty("y", curElement.y);
                    document.setElementProperty("name", curElement.name);
                    document.setInstanceAlpha(curElement.alpha * 100);

                    //document.rotateSelection(radToDeg(curElement.rotation));

                    break;
            }
            document.selectNone();
        }
    }
    timeline.deleteLayer(0);

}
function radToDeg(angleInRad) {
    return angleInRad * 180 / Math.PI;
}
function graphicsPathFromJSONPath(jsonPath) {

    var graphicsPath;
    var JSONPathArr = jsonPath.split('/');
    var deviceType = JSONPathArr[JSONPathArr.length - 2];
    var osType = JSONPathArr[JSONPathArr.length - 3];
    var graphicsPathArr = JSONPathArr.slice(0, JSONPathArr.length - 5);

    graphicsPath = graphicsPathArr.join('/');
    graphicsPath += "/media";
    graphicsPath +=("/"+ osType);
    graphicsPath +=("/"+ deviceType);
    graphicsPath+="/graphics";

    if(deviceType == "ipad"){
        graphicsPath+="/sd";
    }
    return graphicsPath;
}


function onJsonBrowse(event) {
    var jsonURI = fl.browseForFileURL("open", "Choose json file");
    this.controls.json_path.value = URI.toPath(jsonURI);
}
