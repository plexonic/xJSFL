xjsfl.init(this);

var dialog=new XUL("Choose json file");
dialog.addTextbox("JSON path","path");
dialog.addButton("Browse...","browse");
dialog.addEvent("browse","click",onBrowse);
dialog.show();

function onBrowse(event)
{
    var jsonURI=fl.browseForFileURL("open","Choose json file");
    this.controls.path.value=URI.toPath(jsonURI);
    var json=new File(jsonURI).contents;
    var movieClips=JSON.decode(json);
    for (var curMovieClip in movieClips)
    {
        trace(curMovieClip);
    }
}
