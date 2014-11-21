/**
 * Created with IntelliJ IDEA.
 * User: Karen Javadyan
 * Date: 6/30/2014
 * Time: 1:32 AM
 * To change this template use File | Settings | File Templates.
 */
xjsfl.init(this);
var dialog = new XUL("Choose image from graphics folder");
dialog.addTextbox("Image  path", "png_path");
dialog.addButton("Browse...", "browse");
dialog.addEvent("browse", "click", onPngBrowse);
dialog.show(onAccept);
var pngName;
var tpsUri;
var tpsName = "";


function onPngBrowse(event) {
    var pngURI = fl.browseForFileURL("open", "Choose png file");
    this.controls.png_path.value = URI.toPath(pngURI);
}
function onAccept(pngPath) {

    Utils.walkFolder(tpsFolderPathFromPNGPath(pngPath), callback);
    if (tpsName == "") {
        alert("NO PNG IN ATLASES!");
    }

}
function callback(element, index, level, indent) {
    trace("callback called!");
    if (element instanceof File) {
        var elementContent = element.contents;
        if (elementContent.indexOf(pngName) != -1) {
            tpsName = element.name;
            alert(tpsName);
        }
    }
}
function tpsFolderPathFromPNGPath(pngPath) {
    var tpsPathArr;
    var PNGPathArr = pngPath.split('/');
    pngName = PNGPathArr[PNGPathArr.length - 1 ];
    var type = "";
    if (PNGPathArr[PNGPathArr.length - 2 ] != "graphics") {
        type = PNGPathArr[PNGPathArr.length - 2];
    }

    if (type == "") {
        tpsPathArr = PNGPathArr.slice(0, PNGPathArr.length - 3);
    }
    else {
        tpsPathArr = PNGPathArr.slice(0, PNGPathArr.length - 4);
    }
    tpsUri = tpsPathArr.join("/");
    if (type == "") {
        tpsUri += "/iphone";
    }
    else {
        tpsUri += "/ipad";
    }
    tpsUri += "/tps/";
    if (type != "") {
        tpsUri += type;
    }

    return tpsUri;

}
