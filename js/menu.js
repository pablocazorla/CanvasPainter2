// Menu
var Menu = (function() {
	'use strict';

	var m = function(options) {
		return this.init(options);
	};
	m.prototype = {
		init: function(options) {

			this.cfg = $.extend({
				label: 'File',
				buttons: [{
					label: 'New',
					classCss: '',
					action: function() {}
				}, {
					label: 'Open',
					classCss: '',
					action: function() {}
				},
				'separator',
				 {
					label: 'Save',
					classCss: '',
					action: function() {}
				}],
				parent: null
			}, options);

			var $div = $('<div class="menu-div">'+this.cfg.label+'</div>').appendTo(this.cfg.parent);
			var $ul = $('<ul/>').appendTo($div);

			var l = this.cfg.buttons.length;
			for (var i = 0; i < l; i++) {
				var b = this.cfg.buttons[i];
				if(typeof b === 'string'){
					var $li = $('<li class="separator"><hr></li>').appendTo($ul);
				}else{
					var $li = $('<li class="' + b.classCss + '">' + b.label + '</li>').appendTo($ul).click(b.action);
				}				
			}
			return this;
		}
	};
	return function(options) {
		return new m(options);
	}
})();