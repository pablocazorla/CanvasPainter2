// App Color
(function() {
	'use strict';

	// color operations
	var rgbTohsv = function(red, green, blue) {
			var r = red / 255,
				g = green / 255,
				b = blue / 255;

			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, v = max;
			var d = max - min;
			s = max == 0 ? 0 : d / max;
			if (max == min) {
				h = 0; // achromatic
			} else {
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}
			return [Math.round(h * 100), Math.round(s * 100), Math.round(v * 100)];
		},
		hsvTorgb = function(hue, sat, val) {
			var h = parseFloat(hue / 100),
				s = parseFloat(sat / 100),
				v = parseFloat(val / 100);
			var r, g, b;
			var i = Math.floor(h * 6);
			var f = h * 6 - i;
			var p = v * (1 - s);
			var q = v * (1 - f * s);
			var t = v * (1 - (1 - f) * s);
			switch (i % 6) {
				case 0:
					r = v, g = t, b = p;
					break;
				case 1:
					r = q, g = v, b = p;
					break;
				case 2:
					r = p, g = v, b = t;
					break;
				case 3:
					r = p, g = q, b = v;
					break;
				case 4:
					r = t, g = p, b = v;
					break;
				case 5:
					r = v, g = p, b = q;
					break;
			}
			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
		},
		hexTorgb = function(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
		},
		rgbTohex = function(r, g, b) {
			var componentToHex = function(c) {
				var hex = c.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			};
			return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		},
		hexTohsv = function(hex) {
			var rgb = hexTorgb(hex);
			return rgbTohsv(rgb[0], rgb[1], rgb[2]);
		},
		hsvTohex = function(h, s, v) {
			var rgb = hsvTorgb(h, s, v);
			return rgbTohex(rgb[0], rgb[1], rgb[2]);
		};



	// Color
	var col = function(color) {
		return this.init(color);
	};
	col.prototype = {
		init: function(color) {
			var c = color || '#000000';

			this.r = Utils.observable(0);
			this.g = Utils.observable(0);
			this.b = Utils.observable(0);

			this.h = Utils.observable(0);
			this.s = Utils.observable(0);
			this.v = Utils.observable(0);

			this.hex = Utils.observable('#000000');

			// subscriptions
			var self = this,
				from = null,
				update = function() {
					if (from === 'rgb') {
						// RGB
						var hsv = rgbTohsv(self.r(), self.g(), self.b());
						var hex = rgbTohex(self.r(), self.g(), self.b());
						self.h(hsv[0]);
						self.s(hsv[1]);
						self.v(hsv[2]);
						self.hex(hex);

					} else if (from === 'hsv') {
						// HSV
						var rgb = hsvTorgb(self.h(), self.s(), self.v());
						var hex = hsvTohex(self.h(), self.s(), self.v());

						self.r(rgb[0]);
						self.g(rgb[1]);
						self.b(rgb[2]);
						self.hex(hex);
					} else if (from === 'hex') {
						// hex
						var rgb = hexTorgb(self.hex());
						var hsv = hexTohsv(self.hex());
						self.r(rgb[0]);
						self.g(rgb[1]);
						self.b(rgb[2]);
						self.h(hsv[0]);
						self.s(hsv[1]);
						self.v(hsv[2]);
					}
					from = null;
				};

			this.r.subscribe(function() {
				if (from === null) {
					from = 'rgb';
					update();
				}
			});
			this.g.subscribe(function() {
				if (from === null) {
					from = 'rgb';
					update();
				}
			});
			this.b.subscribe(function() {
				if (from === null) {
					from = 'rgb';
					update();
				}
			});

			this.h.subscribe(function() {
				if (from === null) {
					from = 'hsv';
					update();
				}
			});
			this.s.subscribe(function() {
				if (from === null) {
					from = 'hsv';
					update();
				}
			});
			this.v.subscribe(function() {
				if (from === null) {
					from = 'hsv';
					update();
				}
			});
			this.hex.subscribe(function() {
				if (from === null) {
					from = 'hex';
					update();
				}
			});

			this.hex(c);

			return this;
		},
		get hue() {
			return hsvTorgb(this.h(), 100, 100);
		}
	};

	// App Colors
	App.Color.Foreground = new col('#000000');
	App.Color.Background = new col('#FFFFFF');
	App.Color.swap = function() {
		var foregroundColor = App.Color.Foreground.hex(),
			backgroundColor = App.Color.Background.hex();

		App.Color.Foreground.hex(backgroundColor);
		App.Color.Background.hex(foregroundColor);
	};
	App.Color.forceUpdate = function() {
		var foregroundColor = App.Color.Foreground.hex(),
			tempColor = (foregroundColor === '#000000') ? '#111111' : '#000000';
		App.Color.Foreground.hex(tempColor);
		App.Color.Foreground.hex(foregroundColor);

		var backgroundColor = App.Color.Background.hex();
			tempColor = (backgroundColor === '#000000') ? '#111111' : '#000000';
		App.Color.Background.hex(tempColor);
		App.Color.Background.hex(backgroundColor);
	};
})();