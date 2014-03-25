xjsfl.init(this);
var allbitmaps=$$("/png/*");

allbitmaps.attr('sourceFilePath',function(element,index) {
			return element.sourceFilePath;
	});

alert("Done!");
