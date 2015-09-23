// UI components
App.UI.Expando = (function() {
	'use strict';
	var EXPANDO = function(options) {
		return this.init(options);
	};

	EXPANDO.prototype = {
		init: function(options) {
			this.config = $.extend({
				cssClassBase: 'expando',
				cssClass: '',
				text: 'Expando',
				open: false,
				duration: 300,
				afterExpand:function(){}
			}, options);

			this.$node = $('<div class="expando"/>');

			this.$expandoHeader = $('<div class="expando-header">' + this.config.text + '</div>').appendTo(this.$node);
			this.$content = $('<div class="expando-body"/>').hide().appendTo(this.$node);

			this.opened = this.config.open;
			this.moving = false;

			if (this.opened) {
				this.$node.addClass('open');
				this.$content.show();
			}

			return this.setEvents();
		},
		show: function() {
			var self = this;
			if (!this.moving && !this.opened) {
				this.moving = true;
				this.opened = true;
				this.$node.addClass('open');
				this.$content.slideDown(this.config.duration, function() {
					self.moving = false;
					self.config.afterExpand();
				});
			}
			return this;
		},
		hide: function() {
			var self = this;
			if (!this.moving && this.opened) {
				this.moving = true;
				this.opened = false;
				this.$node.removeClass('open');
				this.$content.slideUp(this.config.duration, function() {
					self.moving = false;
				});
			}
			return this;
		},
		setEvents: function() {
			var self = this;
			this.$expandoHeader.click(function() {
				if (self.opened) {
					self.hide();
				} else {
					self.show();
				}
			});
			return this;
		},
		addContent: function(content) {
			if (typeof content === 'string') {
				this.$content.html(content);
			} else {
				this.$content.append(content);
			}
			return this;
		}
	};

	return function(options) {
		return new EXPANDO(options);
	};
})();
App.UI.Slider = (function() {
	'use strict';
	var SLIDER = function(options) {
		return this.init(options);
	};

	SLIDER.prototype = {
		init: function(options) {
			this.config = $.extend({
				label: '',
				cssClass: '',
				min: 0,
				max: 100,
				value: 0,
				observable: null,
				integer: true
			}, options);

			this._val = (this.config.observable !== null) ? this.config.observable : CanvasPainter.Utils.observable(this.config.value);
			this.$node = $('<div class="slider ' + this.config.cssClass + '"/>');
			if (this.config.label !== '') {
				this.$label = $('<label>' + this.config.label + ':</label>').appendTo(this.$node);
			}
			this.$output = $('<div class="slider-output"/>').appendTo(this.$node);
			this.$input = $('<input type="text" value=""/>').appendTo(this.$node);
			this.$range = $('<div class="range"/>').appendTo(this.$node).html('<div class="range-line"></div>');
			this.$rangeButton = $('<div class="range-button animated"/>').appendTo(this.$range);
			this.setSubscriptions(this).setEvents(this);

			return this;
		},
		setSubscriptions: function(self) {
			this.config.observable.subscribe(function(v) {
				self.update(v);
			});
			return this;
		},
		update: function(v) {
			var fact = (this.config.max - this.config.min) / this.$range.width(),
				x = Math.round((v - this.config.min) / fact);
			this.$rangeButton.css('left', x + 'px');

			this.$output.text(v);
		},
		appendTo: function($parent) {
			this.$node.appendTo($parent);
			this.update(this.config.observable());
			return this;
		},
		setEvents: function(self) {
			var dragging = false,
				rangeX,
				rangeWidth,
				fact,
				setValue = function(e) {
					var x = e.pageX - rangeX;
					x = (x < 0) ? 0 : x;
					x = (x > rangeWidth) ? rangeWidth : x;

					var val = x * fact + self.config.min;
					val = (self.config.integer) ? Math.round(val) : val;
					self.config.observable(val);
				};

			this.$range.mousedown(function(e) {
				dragging = true;
				self.$rangeButton.removeClass('animated');

				rangeX = self.$range.offset().left;
				rangeWidth = self.$range.width();
				fact = (self.config.max - self.config.min) / rangeWidth;
				setValue(e);
			});

			$(window).mousemove(function(e) {
				if (dragging) {
					setValue(e);
				}
			}).mouseup(function() {
				if (dragging) {
					dragging = false;
					self.$rangeButton.addClass('animated');
				}
			});
			var prevValue;

			this.$output.click(function() {
				prevValue = self.config.observable();
				self.$input.val(prevValue).show().focus();
			});
			this.$input.blur(function() {
				var newValue = CanvasPainter.Utils.toNumber(self.$input.val(), prevValue);
				newValue = (self.config.integer) ? Math.round(newValue) : newValue;

				newValue = (newValue < self.config.min) ? self.config.min : newValue;
				newValue = (newValue > self.config.max) ? self.config.max : newValue;

				self.config.observable(newValue);
				self.$input.hide();
			});
			return this;
		}
	};

	return function(options) {
		return new SLIDER(options);
	};
})();