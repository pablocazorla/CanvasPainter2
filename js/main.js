// Main

var CanvasPainter = (function($) {
	'use strict';
	var actions = [],
		root = {};

	return {
		define: function(callback) {
			actions.push(callback);
		},
		init: function() {
			var actionsLength = actions.length;
			for (var actionsIndex = 0; actionsIndex < actionsLength; actionsIndex++) {
				actions[actionsIndex].apply(null, [$, root]);
			}
		}
	}
})(jQuery);