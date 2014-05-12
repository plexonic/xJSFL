xjsfl.init(this);

document=fl.createDocument();

var dialog=new XUL("Choose json file");
dialog.addTextbox("JSON path","json_path");
dialog.addButton("Browse...","browse");
dialog.addEvent("browse","click",onJsonBrowse);
dialog.addTextbox("Graphics path","bitmap_path");
dialog.addButton("Browse...","browseFolder");
dialog.addEvent("browseFolder","click",onFolderBrowse);
dialog.show(onAccept);

var folderURI;

function onAccept(jsonPath,graphicsPath)
{
    folderURI=URI.toURI(graphicsPath);
    var json=new File(URI.toURI(jsonPath)).contents;
    var movieClips=JSON.decode(json);
    document.library.newFolder("png");
    for (var curMovieClipName in movieClips)
    {
        var curMovieClip=movieClips[curMovieClipName];
        document.library.addNewItem("movie clip","symbols/"+curMovieClipName);
        document.library.editItem("symbols/"+curMovieClipName);
        addElementsToMC(curMovieClip,curMovieClipName);
    }
}
function onFolderBrowse(event)
{
    this.controls.bitmap_path.value=URI.toPath(fl.browseForFolderURL("Choose graphics folder"));
}
function radToDeg(angleInRad)
{
    return angleInRad*180/Math.PI;
}
function addElementsToMC(elements,MCname)
{
    for (var i=0;i<elements.length;i++)
    {
        var curElement=elements[i];
        var kind=curElement.kind;
        switch(kind)
        {
            case "quad":
                var fill=document.getCustomFill();
                fill.color=curElement.color;
                fill.style="solid";
                document.setCustomFill(fill);
                document.addNewRectangle({left:curElement.x,top:curElement.y,right:curElement.width+curElement.x,bottom:curElement.height+curElement.y},0);
                document.setSelectionRect({left:curElement.x,top:curElement.y,right:curElement.width+curElement.x,bottom:curElement.height+curElement.y},true);
                document.scaleSelection(curElement.scaleX,curElement.scaleY);
                document.skewSelection(curElement.skewX,curElement.skewY);
                document.rotateSelection(radToDeg(curElement.rotation));
                break;
            case "image":
                var bitmapURI=folderURI+"/"+curElement.name+".png";
                if (FLfile.exists(bitmapURI))
                {
                    document.importFile(bitmapURI,true);
                    document.library.selectItem(curElement.name+".png",true);
                    document.library.renameItem(curElement.name);
                    document.library.moveToFolder("png");
                    document.library.addItemToDocument({x:0,y:0},"png/"+curElement.name);
                    var image=document.selection[0];
                    image.scaleX=curElement.scaleX;
                    image.scaleY=curElement.scaleY;
                    image.x=curElement.x;
                    image.y=curElement.y;
                    image.skewX=curElement.skewX;
                    image.skewY=curElement.skewY;
                    image.rotation=radToDeg(curElement.rotation);
                }
                else
                {
                    trace(bitmapURI+ " does not exist!");
                }
                break;
            case "text":
                document.addNewText({left:curElement.x,top:curElement.y,right:(curElement.x+curElement.width),bottom:(curElement.y+curElement.height)});
                document.setTextString(curElement.characters);
                document.scaleSelection(curElement.scaleX,curElement.scaleY);
                document.skewSelection(curElement.skewX,curElement.skewY);
                document.setElementProperty("name",curElement.name);
                document.selection[0].setTextAttr("bold",curElement.bold);
                document.selection[0].setTextAttr("italic",curElement.italic);
                document.selection[0].setTextAttr("fillColor",curElement.color);
                document.selection[0].setTextAttr("size",curElement.size);
                document.rotateSelection(radToDeg(curElement.rotation));
                break;
            case "sprite":
                document.library.addNewItem("movie clip","symbols/"+curElement.libraryName);
                document.library.addItemToDocument({x:curElement.x,y:curElement.y},"symbols/"+curElement.libraryName);
                document.library.editItem("symbols/"+curElement.libraryName);
                addElementsToMC(curElement.children,curElement.libraryName);
                document.library.editItem("symbols/"+MCname);
                document.scaleSelection(curElement.scaleX,curElement.scaleY);
                document.skewSelection(curElement.skewX,curElement.skewY);
                document.rotateSelection(radToDeg(curElement.rotation));
                break;
        }
        document.selectNone();
    }
}

function onJsonBrowse(event)
{
    var jsonURI=fl.browseForFileURL("open","Choose json file");
    this.controls.json_path.value=URI.toPath(jsonURI);
}
     