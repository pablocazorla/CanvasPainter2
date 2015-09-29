// Doc
var Doc = (function() {
	'use strict';
	var idDocCounter = 0;

	var d = function(options) {
		return this.init(options);
	};
	d.prototype = {
		init: function(options) {
			this.cfg = $.extend({
				width: 800,
				height: 600,
				name: null,
				parent: App.DocList.$container
			}, options);

			this.id = idDocCounter++;

			this.cfg.name = (this.cfg.name === null) ? 'Untitled-' + this.id : this.cfg.name;

			this.layers = [];
			this.currentLayer = null;
			this.currentLayerIndex = -1;
			this.layerNameCounter = 1;

			this.$doc = $('<div class="doc" id="doc-' + this.id + '"/>').appendTo(this.cfg.parent);
			this.$content = $('<div class="doc-content"/>').appendTo(this.$doc);
			this.$canvasBottom = $('<canvas class="canvas-bottom"/>').appendTo(this.$content);
			this.$canvas = $('<canvas class="canvas-medium"/>').appendTo(this.$content);
			this.$canvasTop = $('<canvas class="canvas-top"/>').appendTo(this.$content);



			return this.setSize().setPosition().addLayer().setEvents(this);
		},
		setSize: function() {
			this.$content.css({
				width: this.cfg.width + 'px',
				height: this.cfg.height + 'px'
			});
			this.$canvasBottom.add(this.$canvas).add(this.$canvasTop).attr({
				width: this.cfg.width,
				height: this.cfg.height
			});
			return this;
		},
		setPosition: function() {
			var top = (this.$doc.height() - this.cfg.height) / 2,
				left = (this.$doc.width() - this.cfg.width) / 2;
			top = (top < 10) ? 10 : top;
			left = (left < 10) ? 10 : left;

			this.$content.css({
				top: top + 'px',
				left: left + 'px'
			});

			return this;
		},

		// Layers
		addLayer: function() {
			var la = Layer({
				nameID: this.layerNameCounter++,
				parent: this
			});
			this.layers.push(la);
			return this.selectLayer(la.id);
		},
		selectLayer: function(id) {
			var l = this.layers.length;
			for (var i = 0; i < l; i++) {
				if (this.layers[i].id === id) {
					this.currentLayer = this.layers[i];
					this.currentLayerIndex = i;
				}
			}
			return this;
		},
		removeLayer: function() {
			var l = this.layers.length;
			if (l > 1) {
				var nextCurrentIndex = (this.currentLayerIndex > 0) ? this.currentLayerIndex - 1 : 0;
				this.layers.splice(this.currentLayerIndex, 1);
				this.selectLayer(this.layers[nextCurrentIndex].id);
			}
			return this;
		},
		orderLayer: function(oldIndex, newIndex) {
			if (oldIndex !== newIndex) {
				var l = this.layers.length;
				var oi = (oldIndex < 0) ? 0 : oldIndex;
				oi = (oi >= l) ? l - 1 : oi;
				var ni = (newIndex < 0) ? 0 : newIndex;
				ni = (ni >= l) ? l - 1 : ni;
				if (oi !== ni) {
					this.layers.splice(ni, 0, this.layers.splice(oi, 1)[0]);
				}
			}
			return this;
		},



		show: function() {
			this.$doc.show();
			return this;
		},
		hide: function() {
			this.$doc.hide();
			return this;
		},
		setEvents: function(self) {
			$(window).resize(function() {
				self.setPosition();
			});
			return this;
		}
	};
	return function(options) {
		return new d(options);
	}
})();