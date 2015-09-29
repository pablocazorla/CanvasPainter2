// Panel Constructor
var Panel = (function() {
	'use strict';

	var idCounterPanel = 0,
		fadeDuration = 120,
		panelList = [],
		setPanelZIndex = function() {
			var z = 1000;
			for (var i = 0; i < panelList.length; i++) {
				panelList[i].onTop = false;
				panelList[i].$panel.css({
					'z-index': z++
				});
			}
			panelList[panelList.length - 1].onTop = true;
		},
		minTop = 50;


	var p = function(options) {
		return this.init(options);
	};
	p.prototype = {
		init: function(options) {

			panelList.push(this);

			this.$window = $(window);
			this.id = idCounterPanel++;
			this.onTop = false;

			this.config = $.extend({
				title: 'Untitled',
				header: true,
				visible: true,
				width: 260,
				minWidth: 260,
				maxWidth: 260,
				height: 300,
				minHeight: 200,
				maxHeight: 1000,
				left: 15,
				top: 60,
				right: 'auto',
				resizable: true,
				iconic: false,
				icon: 'cog',
				classCss: ''
			}, options);

			this.config.top = (this.config.top < minTop) ? minTop : this.config.top;

			// If right is NOT auto, calculate th left according
			this.config.left = (this.config.right !== 'auto') ? App.$container.width() - this.config.width - this.config.right : this.config.left;

			// RENDER *******************
			// panel
			this.$panel = $('<div class="panel"/>').css({
				'left': this.config.left + 'px',
				'top': this.config.top + 'px'
			}).addClass(this.config.classCss).appendTo(App.$container);

			// icon
			this.$panelIcon = $('<div class="panel-icon"><i class="fa fa-' + this.config.icon + '"></i></div>').hide().appendTo(this.$panel);

			// body
			this.$panelBody = $('<div class="panel-body"/>').css({
				'width': this.config.width + 'px',
				'height': this.config.height + 'px'
			}).appendTo(this.$panel);

			// header
			if (this.config.header) {
				this.$header = $('<div class="header"></div>').appendTo(this.$panelBody);
				this.$title = $('<div class="title">' + this.config.title + '</div>').appendTo(this.$header);
				this.$close = $('<div class="close" title="Close Panel"><i class="fa fa-times"></i></div>').appendTo(this.$header).click($.proxy(this.hide, this));
				this.$iconic = $('<div class="iconic" title="Set to Icon"><i class="fa fa-compress"></i></div>').appendTo(this.$header).click($.proxy(this.setIconic, this));
				this.setDragable(this).setIconPosition();
			}

			// cont
			this.$cont = $('<div class="content"/>').appendTo(this.$panelBody);

			// content
			this.$content = $('<div class="panel-content ' + this.config.classCss + '-content"/>').appendTo(this.$cont);

			// resizable
			if (this.config.resizable) {
				this.$resizer = $('<div class="resizer" title="Resize Panel"/>').appendTo(this.$panelBody);
				this.setResizable(this);
			}

			// visible
			if (!this.config.visible) {
				this.$panel.hide();
			}

			// iconic
			if (this.config.iconic) {
				this.setIconic();
			}

			return this.setZindexEvent(this).setIconicEvents(this);
		},
		show: function() {
			this.$panel.fadeIn(fadeDuration);
			this.config.visible = true;
			return this;
		},
		hide: function() {
			this.$panel.fadeOut(fadeDuration);
			this.config.visible = false;
			return this;
		},
		toggle: function() {
			if (this.config.visible) {
				this.hide();
			} else {
				this.show();
			}
			return this;
		},
		setIconic: function() {
			if (this.iconic) {
				this.$panelIcon.hide();
				this.iconic = false;
			} else {
				this.$panelIcon.show();
				this.iconic = true;
			}
			return this;
		},
		setIconicEvents: function(self) {
			this.$panel.hover(function() {
				if (self.iconic && !self.transforming) {
					self.setZindex().$panelBody.fadeIn(.5 * fadeDuration);
				}
			}, function() {
				if (self.iconic && !self.transforming) {
					self.$panelBody.fadeOut(.5 * fadeDuration);
				}
			});
			return this;
		},
		setZindexEvent: function(self) {
			this.$panel.mousedown(function() {
				self.setZindex();
			});
			return this;
		},
		setZindex: function() {
			if (!this.onTop) {
				var iToChange = 0
				for (var i = 0; i < panelList.length; i++) {
					if (panelList[i].id === this.id) {
						iToChange = i;
					}
				}
				panelList.splice(iToChange, 1);
				panelList.push(this);
				setPanelZIndex();
			}
			return this;
		},
		setDragable: function(self) {
			var dragging = false,
				xDif = 0,
				yDif = 0,
				x = 0,
				y = 0,
				minX = 0,
				minY = minTop,
				maxX = 0,
				maxY = 0,
				classAdded = false;
			this.$title.mousedown(function(e) {
				dragging = true;
				self.transforming = true;
				maxX = App.$container.width() - self.$panelBody.width(),
					maxY = App.$container.height() - 10;
				var offset = self.$panel.offset();
				xDif = offset.left - e.pageX;
				yDif = offset.top - e.pageY;
			});
			this.$window.mousemove(function(e) {
				if (dragging) {
					if (!classAdded) {
						classAdded = true;
						self.$panel.addClass('dragging');
					}
					x = e.pageX + xDif;
					y = e.pageY + yDif;
					x = (x < minX) ? minX : x;
					x = (x > maxX) ? maxX : x;
					y = (y < minY) ? minY : y;
					y = (y > maxY) ? maxY : y;
					self.$panel.css({
						'left': x + 'px',
						'top': y + 'px'
					});
				}
			}).mouseup(function() {
				if (dragging) {
					dragging = false;
					classAdded = false;
					self.transforming = false;
					self.$panel.removeClass('dragging');
					self.setIconPosition();
				}
			});
			return this;
		},
		setResizable: function(self) {
			var resizing = false,
				xDif = 0,
				yDif = 0,
				w = 0,
				h = 0,
				offset = null,
				classAdded = false;
			this.$resizer.mousedown(function(e) {
				resizing = true;
				self.transforming = true;
				offset = self.$panel.offset();
				var offsetResizer = self.$resizer.offset();
				xDif = offsetResizer.left - e.pageX;
				yDif = offsetResizer.top - e.pageY;
			});
			this.$window.mousemove(function(e) {
				if (resizing) {
					if (!classAdded) {
						classAdded = true;
						self.$panel.addClass('resizing');
					}
					w = (e.pageX + xDif + 10) - offset.left;
					h = (e.pageY + yDif + 10) - offset.top;
					w = (w < self.config.minWidth) ? self.config.minWidth : w;
					w = (w > self.config.maxWidth) ? self.config.maxWidth : w;
					h = (h < self.config.minHeight) ? self.config.minHeight : h;
					h = (h > self.config.maxHeight) ? self.config.maxHeight : h;
					self.$panelBody.css({
						'width': w + 'px',
						'height': h + 'px'
					});
				}
			}).mouseup(function() {
				if (resizing) {
					resizing = false;
					classAdded = false;
					self.transforming = false;
					self.$panel.removeClass('resizing');
					self.setIconPosition();
				}
			});
			return this;
		},
		setIconPosition: function() {
			var mid = App.$container.width() / 2 - this.$panel.offset().left;
			if (mid > 0) {
				this.$panelIcon.css('left', '0px');
			} else {
				this.$panelIcon.css('left', this.$panelBody.width() - 40 + 'px');
			}
			return this;
		},
		get position() {
			return {
				'x': this.$panel.css('left'),
				'y': this.$panel.css('top'),
				'width': this.$panel.width(),
				'height': this.$panel.height()
			};
		},
		setContent: function(str) {
			if (typeof str === 'string') {
				this.$cont.html(str);
			} else {
				this.$cont.append(str);
			}
			return this;
		},
		get $container() {
			return this.$cont;
		}
	}

	return function(options) {
		return new p(options);
	};
})();