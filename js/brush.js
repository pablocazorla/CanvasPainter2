App.brush = (function() {
	'use strict';

	var b = {
			size: Utils.observable(60),
			hardness: Utils.observable(1),
			opacity: Utils.observable(20),
			spacing: Utils.observable(1)
		},
		sizeHalf = 30,
		prevX = 0,
		prevY = 0,
		requirePrevPosition = true,

		c = null,

		fill = null,

		color = function() {
			var r = App.Color.Foreground.r(),
				g = App.Color.Foreground.g(),
				b = App.Color.Foreground.b();
			return 'rgba(' + r + ',' + g + ',' + b + ',';
		},


		render = function(x, y) {
			// draw shape
			c.setTransform(1, 0, 0, 1, x, y);
			//c.translate(x,y);
			c.fillRect(-sizeHalf, -sizeHalf, b.size(), b.size());
		};

	b.size.subscribe(function(v) {
		sizeHalf = .5 * v;
	});


	b.init = function() {
		requirePrevPosition = true;
		c = App.DocList.doc.c;

		fill = c.createRadialGradient(0, 0, 0, 0, 0, sizeHalf);

		var rgb = color();

		fill.addColorStop(0, rgb + (0.01 * b.opacity()) + ')');

		var hard = (b.hardness() < 1) ? b.hardness() : 0.99;

		fill.addColorStop(hard, rgb + (0.01 * b.opacity()) + ')');
		fill.addColorStop(1, rgb + '0)');

		c.fillStyle = fill;

		return b;
	}
	b.draw = function(x, y) {
		var prevCount = 0;
		if (requirePrevPosition) {
			prevX = x;
			prevY = y;
			requirePrevPosition = false;
		} else {
			prevCount = Math.floor(((prevX - x) * (prevX - x) + (prevY - y) * (prevY - y)) / (b.spacing()*b.size()));
		}
		if (prevCount > 0) {
			var dx = (x - prevX) / prevCount,
				dy = (y - prevY) / prevCount;

				for (var i = 1; i < prevCount; i++) {
					render(prevX + (dx * i), prevY + (dy * i));
				}

		}
		prevX = x;
			prevY = y;
		render(x, y);
	};
	return b;
})();