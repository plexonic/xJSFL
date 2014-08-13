xjsfl.init(this);
var lib=$dom.library;
$$("/*png*/*").each(function(element,index)
{
	lib.selectItem(element.name);
	lib.updateItem();
});
alert("Done!");