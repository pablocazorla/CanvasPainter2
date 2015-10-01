// Panel Layers
App.Panel.Layers = (function() {
	'use strict';
	var panel = Panel({
		title: 'Layers',
		top: 60,
		right: 10,
		height: 388,
		minHeight: 200,
		icon: 'adjust',
		classCss: 'panel-layers'
	});

	// Tools top
	var $layerToolsTop = $('<div id="layer-tools-top"/>').appendTo(panel.$content);

	var sliderOpacity = App.UI.Slider({
		label: 'Opacity',
		value: 100,
		enabled: false
	}).appendTo($layerToolsTop).subscribe(function(v) {
		App.DocList.doc.currentLayer.opacity = v;
		App.DocList.doc.updateRenderer();
	});

	// List
	var disabled = true,
		$layerContainer = $('<div id="layer-list-container"/>').appendTo(panel.$content),
		$layerList = $('<ul id="layer-list"/>').appendTo($layerContainer);

	panel.render = function() {
		$layerList.html('<div class="layer-list-empty">Not Document</div>');
		if (App.DocList.doc !== null) {
			panel.$content.removeClass('disabled');
			disabled = false;
			var list = App.DocList.doc.layers,
				l = list.length,
				current = App.DocList.doc.currentLayer,
				txt = '';

			var j = 0;
			for (var i = l - 1; i >= 0; i--) {
				var la = list[i],
					isCurrent = (la.id === current.id) ? ' class="current"' : '',
					visibleIcon = (la.visible) ? '<i class="fa fa-eye"></i>' : '<i class="fa fa-eye-slash"></i>',
					visibleTitle = (la.visible) ? 'Hide Layer' : 'Show Layer';

				txt += '<li' + isCurrent + ' data-index="' + i + '" data-id="' + la.id + '" style="top:' + (30 * j++) + 'px"><div class="ly-div ly-visible-icon" title="' + visibleTitle + '">' + visibleIcon + '</div><div class="ly-div ly-name">' + la.name + '</div></li>';
			}
			$layerList.html(txt);

			$layerList.find('li').each(function() {
				var $li = $(this),
					id = parseInt($li.attr('data-id'));

				// set visible
				$li.find('.ly-visible-icon')
					.mousedown(function() {
						App.DocList.doc.getLayerById(id).toggleVisible();
						panel.render();
					});

				var dragging = false,
					pageY = 0,
					dif = 0,
					top = parseInt($li.css('top')),
					index = parseInt($li.attr('data-index')),
					addedClassDragging = false;

				$li.mousedown(function(e) {
					dif = 0;
					pageY = e.pageY;
					dragging = true;
				});
				$(window).mousemove(function(e) {
						if (dragging) {
							dif = pageY - e.pageY;
							$li.css({
								top: (top - dif) + 'px'
							});
							if (!addedClassDragging) {
								addedClassDragging = true;
								$li.addClass('dragging');
							}
						}
					})
					.mouseup(function() {
						if (dragging) {
							dragging = false;
							if (addedClassDragging) {
								addedClassDragging = false;
								$li.removeClass('dragging');
							}
							if (Math.abs(dif) < 5) {
								// Select
								App.DocList.doc.selectLayer(id);
							} else {
								// Order
								var d = Math.floor(dif / 30);
								d = (d < 0) ? d + 1 : d;
								var newIndex = index + d;
								App.DocList.doc.orderLayer(index, newIndex);
							}
							panel.render();
						}
					});



			});
			//set Opacity of current layer
			sliderOpacity.enabled().val(App.DocList.doc.currentLayer.opacity);
		} else {
			panel.$content.addClass('disabled');
			disabled = true;
			sliderOpacity.disabled();
		}
	};

	// Tools bottom
	var $layerTools = $('<div id="layer-tools-container"/>').appendTo(panel.$content),
		$addLayer = $('<span class="layer-tool" id="layer-tool-add" title="New Layer"><i class="fa fa-file-o"></i></span>').appendTo($layerTools).click(function() {
			if (!disabled) {
				App.DocList.doc.addLayer();
				panel.render();
			}
		}),
		$removeLayer = $('<span class="layer-tool" id="layer-tool-remove" title="Remove Layer"><i class="fa fa-trash-o"></i></span>').appendTo($layerTools).click(function() {
			if (!disabled) {
				App.DocList.doc.removeLayer();
				panel.render();
			}
		});



	App.DocList.docObservable.subscribe(function() {
		panel.render();
	});

	panel.render();
	return panel;
})();