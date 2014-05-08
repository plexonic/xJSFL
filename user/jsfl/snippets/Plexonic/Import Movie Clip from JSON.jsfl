xjsfl.init(this);
var dialog=new XUL("Choose json file");
dialog.addTextbox("JSON path","path");
dialog.addButton("Browse...","browse");
dialog.addEvent("browse","click",onBrowse);
dialog.show();
function addElementsToMC(elements)
{
    for (var i=0;i<elements.length;i++)
    {
        var curElement=elements[i];
        var kind=curElement.kind;
        switch(kind)
        {
            case "image":
                document.library.addItemToDocument({x:0,y:0},"png/"+curElement.name);
                var image=document.selection[0];
                image.scaleX=curElement.scaleX;
                image.scaleY=curElement.scaleY;
                image.x=curElement.x;
                image.y=curElement.y;
                image.skewX=curElement.skewX;
                image.skewY=curElement.skewY;
                image.rotation=curElement.rotation;
                break;
            case "text":
                document.addNewText({left:curElement.x,top:curElement.y,right:(curElement.x+curElement.width),bottom:(curElement.y+curElement.height)});
                document.setTextString(curElement.characters);
                document.scaleSelection(curElement.scaleX,curElement.scaleY);
                document.skewSelection(curElement.skewX,curElement.skewY);
                document.rotateSelection(curElement.rotation);
                document.setElementProperty("name",curElement.name);
                document.selection[0].setTextAttr("bold",curElement.bold);
                document.selection[0].setTextAttr("italic",curElement.italic);
                document.selection[0].setTextAttr("fillColor",curElement.color);
                document.selection[0].setTextAttr("size",curElement.size);
                break;
            case "sprite":
                $dom.library.addNewItem("movie clip","symbols/"+curElement.libraryName);
                $dom.library.addItemToDocument({x:curElement.x,y:curElement.y},"symbols/"+curElement.libraryName);
                $dom.library.editItem("symbols/"+curElement.libraryName);
                addElementsToMC(curElement.children);
                break;
        }
        document.selectNone();
    }
}

function onBrowse(event)
{
    var jsonURI=fl.browseForFileURL("open","Choose json file");
    this.controls.path.value=URI.toPath(jsonURI);
    var json=new File(jsonURI).contents;
    var movieClips=JSON.decode(json);
    for (var curMovieClipName in movieClips)
    {
        var curMovieClip=movieClips[curMovieClipName];
        $dom.library.addNewItem("movie clip","symbols/"+curMovieClipName);
        $dom.library.editItem("symbols/"+curMovieClipName);
        addElementsToMC(curMovieClip);
    }
}
     