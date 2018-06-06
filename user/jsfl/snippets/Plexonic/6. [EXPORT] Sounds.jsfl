// Result of attempts to export will go to the output panel,
// so clear that first fl.outputPanel.clear();

// If bitmaps/audio in the library have been selected, export only
// those. Otherwise, export all bitmaps/audio in the library.

var lib;
if (fl.getDocumentDOM().library.getSelectedItems().length > 0) {
	lib = fl.getDocumentDOM().library.getSelectedItems();
} else {
	lib = fl.getDocumentDOM().library.items;
}

// Get destination directory for files
var imageFileURLBase = fl.browseForFolderURL("Select a folder.");
var imageFileURL;

var totalItems = lib.length;
// Iterate through items and save bitmaps and
// audio files to the selected directory.
for (var i = 0; i < totalItems; i++) {
	var libItem = lib[i];
	if (libItem.itemType === "sound") {
		// Check the audio files original Compression Type if "RAW" export only as a .wav file
		// Any other compression type then export as the libItem's name defines.
		if (libItem.itemType === "sound" && libItem.originalCompressionType === "RAW") {
			var wavName = libItem.name.split('.')[0] + '.wav';
			imageFileURL = imageFileURLBase + "/" + wavName;
		} else {
			imageFileURL = imageFileURLBase + "/" + libItem.name;
		}
		var success = libItem.exportToFile(imageFileURL);
		fl.trace(imageFileURL + ": " + success);
	}
}