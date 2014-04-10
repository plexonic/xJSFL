xjsfl.init(this);
var existingItems=new Array();
var curDoc=new File($dom.path);
var curDocPath=curDoc.parent.parent;
var folderName=curDocPath.name;
var type;
if (folderName=="ipad")
{
	if(confirm("Use hd pictures?"))
		type="hd/";
	else
		type="sd/";
}
else if (folderName=="iphone")
{
	type="";
}

var pathToInspect=curDocPath.uri+"graphics/"+type;
$$("/*png*/*").each(function(element,index) {
	var curName=(new File(element.name)).name;
	if (FLfile.exists(pathToInspect+curName))
	{
		existingItems.push(curName);
		document.importFile(pathToInspect+curName,true);
		trace("existing item found : " + curName);
	}
});
$$(":symbol").each(function(element,index)
{
	var Timeline=element.timeline;
	var layers=Timeline.layers;
	var layerCount=layers.length;
	for (var i=0;i<layerCount;i++)
	{
		var Layer=layers[i];
		var frames=Layer.frames;
		var frameCount=frames.length;
		for (var j=0;j<frameCount;j++)
		{
			var Frame=frames[j];
			var elements=Frame.elements;
			var elementCount=elements.length;
			for (var k=0;k<elementCount;k++)
			{
				var Element=elements[k];
				if (Element.elementType=="instance")
					if (Element.instanceType=="bitmap")
					{
						for (var b=0;b<existingItems.length;b++)
						{
							if (Element.libraryItem.name=="png/"+existingItems[b])
							{
								var bi=$$(":bitmap").find(existingItems[b]).pop();
								Element.libraryItem=bi;
								break;
							}
						}
					}
			}
		}
	}
});
for (var i=0;i<existingItems.length;i++)
{
	$dom.library.deleteItem("png/"+existingItems[i]);
	$dom.library.moveToFolder("png",existingItems[i]);
}
alert("Done!");