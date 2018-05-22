/**
 * Created with IntelliJ IDEA.
 * User: Gor
 * Date: 5/18/2018
 * Time: 17:06
 * To change this template use File | Settings | File Templates.
 */

var Animate = function () {
	this.dom = fl.getDocumentDOM();
	this.timeline = this.dom.getTimeline();

	this.frameByFrameLayerName = "frameByFrameLayer";
	this.rotationDelta = 70;

	this.frameMetadatas = [];

	this.generateMovieClips();
	this.generateAvailableRotations();
};

Animate.prototype.generateMovieClips = function () {
	var frameItems = $$("frame_*").elements;
	for (var i = 0, len = frameItems.length; i < len; i++) {
		if (frameItems[i].itemType === "movie clip") {
			this.frameMetadatas.push({
				movieClip: frameItems[i]
			});
		}
	}
};

Animate.prototype.generateAvailableRotations = function () {
	var count = this.frameMetadatas.length;
	var halfCount = Math.floor(count / 2);
	var rotations = [];
	var rotationPerFrame = this.rotationDelta / halfCount;
	for (var i = 0; i < halfCount; i++) {
		rotations[i] = (i + 1) * rotationPerFrame;
	}

	var negativeRotations = rotations.map(function(rotation) { return -1 * rotation });
	var generatedRotations = [].concat(rotations.reverse(), [0], negativeRotations);

	for (var j = 0; j < generatedRotations.length; j++) {
		this.frameMetadatas[j].rotation = generatedRotations[j];
	}
};

Animate.prototype.findClosestRotationIndex = function (rotation) {
	var values = this.frameMetadatas.map(function( metadata ) { return metadata.rotation });
	var smallestDiff = Math.abs(rotation - values[0]);
	var closest = 0;

	for (var i = 1; i < values.length; i++) {
		var currentDiff = Math.abs(rotation - values[i]);
		if (currentDiff < smallestDiff) {
			smallestDiff = currentDiff;
			closest = i;
		}
	}

	return closest;
};

Animate.prototype.init = function (layerName) {
	this.duplicateLayer(layerName);

	this.timeline.copyLayers(0);
	this.timeline.deleteLayer(0);

	this.createNewSymbol();
};

Animate.prototype.generateFrames = function () {
	var frames = this.timeline.layers[0].frames;
	for (var i = 0; i < frames.length; i++) {
		var element = frames[i].elements[0];
		element.libraryItem = this.frameMetadatas[this.findClosestRotationIndex(element.rotation)].movieClip;
		element.rotation = 0;
	}
};

Animate.prototype.duplicateLayer = function (layerName) {
	var layerIndex = Number(this.timeline.findLayerIndex(layerName));
	var selectedLayer = this.timeline.layers[layerIndex];
	this.timeline.setSelectedLayers(layerIndex, true);
	this.timeline.copyFrames();
	var duplicatedLayerIndex = this.timeline.addNewLayer(this.frameByFrameLayerName, selectedLayer.layerType);
	this.timeline.setSelectedLayers(duplicatedLayerIndex, true);
	this.timeline.pasteFrames();
	this.timeline.convertToKeyframes();
	this.timeline.removeMotionObject();
	this.timeline.reorderLayer(duplicatedLayerIndex, 0, true);
};

Animate.prototype.createNewSymbol = function () {
	var library = this.dom.library;

	if (library.itemExists("car_animation")) {
		library.deleteItem("car_animation");
	}

	library.addNewItem("movie clip", "car_animation");
	library.editItem("car_animation");
	this.timeline = this.dom.getTimeline();
	this.timeline.pasteLayers(0);

	this.generateFrames();
};

(function () {
	xjsfl.init(this);

	var animate = new Animate();
	animate.init("reference");
})();