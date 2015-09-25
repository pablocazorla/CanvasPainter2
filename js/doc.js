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

			this.$doc = $('<div class="doc" id="doc-' + this.id + '"/>').appendTo(this.cfg.parent);



			return this;
		},
		show: function() {
			this.$doc.show();
			return this;
		},
		hide: function() {
			this.$doc.hide();
			return this;
		}
	};
	return function(options) {
		return new d(options);
	}
})();