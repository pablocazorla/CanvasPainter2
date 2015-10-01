// Layer
var Layer = (function() {
	'use strict';
	var idLayerCounter = 0;

	var la = function(options) {
		return this.init(options);
	};
	la.prototype = {
		init: function(options) {
			this.cfg = $.extend({
				nameID: 1,
				parent: null
			}, options);

			this.id = idLayerCounter++;
			this.name = 'Layer-' + this.cfg.nameID;
			this.visible = true;
			this.opacity = 100;
			this.imagedata = null;


			return this;
		},
		toggleVisible: function() {
			if (this.visible) {
				this.visible = false;
			} else {
				this.visible = true;
			}
			this.cfg.parent.updateRenderer();
			return this;
		}
	};
	return function(options) {
		return new la(options);
	}
})();