/**
 * Finds items in the current document according to criteria you set
 * @icon {iconsURI}actions/find/find.png
 */
xjsfl.init(this);
var findDialog = new XUL("Find");
findDialog.addTextbox("Search", "Search");
findDialog.addCheckbox("All library items", "all_items", null, {checked: true});
//findDialog.addCheckbox("Stage", "stage_elements", null, {enabled: false});
findDialog.addButton("Find", "Find");
findDialog.addEvent("Find", "click", onFind);
findDialog.show();

function onFind(event) {
    var keyword = this.controls.Search.value;
    if (keyword == null)
        alert("Type searchable keyword!");
    else {
        if (this.controls.all_items.value) {
            var count = 0;
            trace("--- Library items");
            $$("*").each(
                function (element, index) {
                    var curName = new File(element.name).name; //nkar1

                    if (curName.substring(0, keyword.length) == keyword) {
                        if (element.itemType == "movie clip" || element.itemType == "graphic" || element.itemType == "button" || element.itemType == "bitmap") {
                            trace(element.itemType + " " + curName);
                            count++;
                            findUsage(element);
                        }
                    }
                });
            if (count == 0)
                trace("Nothing found matching keywords!");
        }
    }
}

function findUsage(selectedValue) {
    var curSymbolName;
    var usageCount = 0;

    function elementCallback(element, index, elements, context) {
        if (element.libraryItem == selectedValue) {
            trace("     FOUND IN: " + curSymbolName);
            usageCount++;
        }
    }

    function itemCallback(item, index, items, context) {
        if (item.itemType != "movie clip" && item.itemType != "graphic" && item.itemType != "button")
            return false;
        else
            curSymbolName = item.name;
    }

    Iterators.items(null, itemCallback, null, null, elementCallback);
    if (usageCount == 0) {
        trace("     FREE OF USE!");
    }
    else {
        trace("     FOUND " + usageCount + " time(s)!");
    }
    trace();
}