// Doc
var Doc = (function() {
	'use strict';
	var idDocCounter = 0,
		$window = $(window);

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

			this.zoomScale = 1;
			this.widthHalf = .5 * this.cfg.width;
			this.heightHalf = .5 * this.cfg.height;

			this.enabledOperate = true;


			this.$doc = $('<div class="doc" id="doc-' + this.id + '"/>').appendTo(this.cfg.parent);
			this.$content = $('<div class="doc-content"/>').appendTo(this.$doc);
			this.docNode = this.$content[0];
			this.$canvas = $('<canvas class="canvas-current" style="display:none" width="' + this.cfg.width + '" height="' + this.cfg.height + '"/>').appendTo(this.$content);
			this.$canvasPreRender = $('<canvas class="canvas-pre-render" style="display:none" width="' + this.cfg.width + '" height="' + this.cfg.height + '"/>').appendTo(this.$content);
			this.$canvasLowLayers = $('<canvas class="canvas-low-layers" style="display:none" width="' + this.cfg.width + '" height="' + this.cfg.height + '"/>').appendTo(this.$content);
			this.$canvasRender = $('<canvas class="canvas-render" width="' + this.cfg.width + '" height="' + this.cfg.height + '"/>').appendTo(this.$content);

			this.c = this.$canvas[0].getContext('2d');
			this.c_lowLayers = this.$canvasLowLayers[0].getContext('2d');
			this.cr = this.$canvasRender[0].getContext('2d');
			this.cpr = this.$canvasPreRender[0].getContext('2d');



			return this.setSize().setPosition().addLayer().setEvents(this);
		},
		setSize: function() {
			this.$content.css({
				width: this.cfg.width + 'px',
				height: this.cfg.height + 'px'
			});
			this.$canvasRender.add(this.$canvas).add(this.$canvasTop).attr({
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
			if (this.layers.length <= 0) {
				this.layers.push(la);
			} else {
				this.layers.splice(this.currentLayerIndex + 1, 0, la);
			}
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
			return this.updateRenderer();
		},
		getLayerById: function(id) {
			var l = this.layers.length,
				la = null;
			for (var i = 0; i < l; i++) {
				if (this.layers[i].id === id) {
					la = this.layers[i];
				}
			}
			return la;
		},
		removeLayer: function() {
			var l = this.layers.length;
			if (l > 1) {
				var nextCurrentIndex = (this.currentLayerIndex > 0) ? this.currentLayerIndex - 1 : 0;
				this.layers.splice(this.currentLayerIndex, 1);
				this.selectLayer(this.layers[nextCurrentIndex].id);
			}
			return this.updateRenderer();
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
					for (var i = 0; i < l; i++) {
						if (this.layers[i].id === this.currentLayer.id) {
							this.currentLayerIndex = i;
						}
					}
				}
			}
			return this.updateRenderer();
		},


		// OPERATIONS
		mousePosX: function(e) {
			return Math.round(this.widthHalf - ((1 / this.zoomScale) * (this.widthHalf - (e.pageX - this.docNode.offsetLeft))));
		},
		mousePosY: function(e) {
			return Math.round(this.heightHalf - ((1 / this.zoomScale) * (this.heightHalf - (e.pageY - this.docNode.offsetTop - 52))));
		},

		operateEvents: function() {
			if (this.enabledOperate) {
				var self = this,
					touching = false;

				this.$doc
					.mousedown(function(e) {
						touching = true;
						//self.c.globalAlpha = 0.01 * self.currentLayer.opacity;
						App.brush.init().draw(self.mousePosX(e), self.mousePosY(e));
						self.render();
					});


				$window
					.mousemove(function(e) {
						if (touching) {
							App.brush.draw(self.mousePosX(e), self.mousePosY(e));
							self.render();
						}
					})
					.mouseup(function(e) {
						if (touching) {
							touching = false;
						}
					});



			}
			return this;
		},
		render: function() {
			this.c.setTransform(1, 0, 0, 1, 0, 0);
			// get current image data
			this.currentLayer.imagedata = this.c.getImageData(0, 0, this.cfg.width, this.cfg.height);
			// render all layers
			this.cr.clearRect(0, 0, this.cfg.width, this.cfg.height);
			// render low layers
			this.cr.globalAlpha = 1;
			this.cr.drawImage(this.c_lowLayers.canvas, 0, 0,this.cfg.width, this.cfg.height);

			// render current and top layers
			var l = this.layers.length;
			for (var i = this.currentLayerIndex; i < l; i++) {
				var la = this.layers[i];
				if (la.imagedata !== null && la.visible) {					
					this.cpr.putImageData(la.imagedata, 0, 0);
					this.cr.globalAlpha = 0.01 * la.opacity;
					this.cr.drawImage(this.cpr.canvas, 0, 0,this.cfg.width, this.cfg.height);
				}
			}
			return this;
		},
		updateRenderer:function(){

			// Update of current canvas
			this.c.setTransform(1, 0, 0, 1, 0, 0);
			this.c.clearRect(0, 0, this.cfg.width, this.cfg.height);
			if (this.currentLayer.imagedata !== null) {
				this.c.putImageData(this.currentLayer.imagedata, 0, 0);
			}

			// render low layers
			this.c_lowLayers.clearRect(0, 0, this.cfg.width, this.cfg.height);
			var l = this.currentLayerIndex;
			for (var i = 0; i < l; i++) {
				var la = this.layers[i];
				if (la.imagedata !== null && la.visible) {					
					this.cpr.putImageData(la.imagedata, 0, 0);
					this.c_lowLayers.globalAlpha = 0.01 * la.opacity;
					this.c_lowLayers.drawImage(this.cpr.canvas, 0, 0,this.cfg.width, this.cfg.height);
				}
			}

			return this.render();
		},

		
		show: function() {
			this.$doc.show();
			this.enabledOperate = true;
			return this;
		},
		hide: function() {
			this.$doc.hide();
			this.enabledOperate = false;
			return this;
		},
		setEvents: function(self) {
			$window.resize(function() {
				self.setPosition();
			});
			return this.operateEvents();
		}
	};
	return function(options) {
		return new d(options);
	}
})();