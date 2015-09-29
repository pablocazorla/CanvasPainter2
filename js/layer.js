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
			return this;
		}
	};
	return function(options) {
		return new la(options);
	}
})();