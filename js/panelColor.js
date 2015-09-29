// Panel Color
App.Panel.Color = (function() {
	'use strict';
	var panel = Panel({
			title: 'Color',
			top:50,
			left: 0,
			height: 264,
			minHeight: 200,
			icon: 'adjust',
			classCss: 'panel-color'
		}),
		$content = panel.$content;

	/* COLOR QUAD **************************************/

	var $colorQuadContainer = $('<div class="color-quad-container"/>').appendTo($content);

	// Quad Samples
	var $sampleBackground = $('<div class="color-quad-sample background"/>').appendTo($colorQuadContainer);
	var $sampleForeground = $('<div class="color-quad-sample foreground"/>').appendTo($colorQuadContainer);

	var $colorSwap = $('<div class="color-quad-swap" title="Swap colors"><i class="fa fa-reply"></i></div>').appendTo($colorQuadContainer).click(App.Color.swap);

	App.Color.Foreground.hex.subscribe(function(v) {
		$sampleForeground.css('background-color', v);
	});
	App.Color.Background.hex.subscribe(function(v) {
		$sampleBackground.css('background-color', v);
	});



	// Quad GRADIENT
	var $colorQuad = $('<div class="color-quad"/>').appendTo($colorQuadContainer),
		$cnvSatVal = $('<canvas id="color-cnv-gradient-sat-val" width="140" height="140" />').appendTo($colorQuad),
		$cnvHue = $('<canvas id="color-cnv-gradient-hue" width="20" height="140" />').appendTo($colorQuad),
		$cursorSatVal = $('<span class="color-cursor"/>').appendTo($colorQuad),
		$cursorHue = $('<span class="color-cursor cursor-hue"/>').appendTo($colorQuad);



	// Hue Gradient
	var cH = $cnvHue[0].getContext('2d'),
		gr = cH.createLinearGradient(0, 0, 0, 140);
	gr.addColorStop(0, 'rgb(255,0,0)');
	gr.addColorStop(1 / 6, 'rgb(255,255,0)');
	gr.addColorStop(1 / 3, 'rgb(0,255,0)');
	gr.addColorStop(0.5, 'rgb(0,255,255)');
	gr.addColorStop(2 / 3, 'rgb(0,0,255)');
	gr.addColorStop(5 / 6, 'rgb(255,0,255)');
	gr.addColorStop(1, 'rgb(255,0,0)');
	cH.fillStyle = gr;
	cH.fillRect(0, 0, 20, 140);

	// Val Gradient
	var cSV = $cnvSatVal[0].getContext('2d'),
		valGr = cSV.createLinearGradient(0, 0, 0, 140);
	valGr.addColorStop(0, 'rgba(0,0,0,0)');
	valGr.addColorStop(1, 'rgba(0,0,0,1)');
	var drawSatVal = function() {
		var rgb = App.Color.Foreground.hue;
		// Sat Gradient
		var satGr = cSV.createLinearGradient(0, 0, 140, 0);
		satGr.addColorStop(0, 'rgb(255,255,255)');
		satGr.addColorStop(1, 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');

		cSV.fillStyle = satGr;
		cSV.fillRect(0, 0, 140, 140);

		cSV.fillStyle = valGr;
		cSV.fillRect(0, 0, 140, 140);
	};

	App.Color.Foreground.r.subscribe(drawSatVal);
	App.Color.Foreground.g.subscribe(drawSatVal);
	App.Color.Foreground.b.subscribe(drawSatVal);
	App.Color.Foreground.h.subscribe(function(v) {
		drawSatVal();
		$cursorHue.css({
			'top': Math.round(v * 1.4) + 'px'
		});
	});
	App.Color.Foreground.s.subscribe(function(v) {
		$cursorSatVal.css({
			'left': Math.round(v * 1.4) + 'px'
		});
	});
	App.Color.Foreground.v.subscribe(function(v) {
		$cursorSatVal.css({
			'top': (140 - Math.round(v * 1.4)) + 'px'
		});
	});

	var dragHue = false,
		dragSatVal = false,
		hueY = 0,
		satValX = 0,
		satValY = 0,
		setHue = function(e) {
			var v = Math.round((e.pageY - hueY) / 1.4);
			v = (v < 0) ? 0 : ((v > 100) ? 100 : v);
			App.Color.Foreground.h(v);
		},
		setSatVal = function(e) {

			var sat = Math.round((e.pageX - satValX) / 1.4);
			sat = (sat < 0) ? 0 : ((sat > 100) ? 100 : sat);


			var val = 100 - Math.round((e.pageY - satValY) / 1.4);
			val = (val < 0) ? 0 : ((val > 100) ? 100 : val);
			App.Color.Foreground.s(sat);
			App.Color.Foreground.v(val);
		};

	$cnvHue.add($cursorHue).mousedown(function(e) {
		dragHue = true;
		hueY = $cnvHue.offset().top;
		setHue(e);
	});

	$cnvSatVal.add($cursorSatVal).mousedown(function(e) {
		dragSatVal = true;
		satValX = $cnvSatVal.offset().left;
		satValY = $cnvSatVal.offset().top;
		setSatVal(e);
	});

	$(window).mousemove(function(e) {
		if (dragHue) {
			setHue(e);
		}
		if (dragSatVal) {
			setSatVal(e);
		}
	}).mouseup(function() {
		if (dragHue) {
			dragHue = false;
		}
		if (dragSatVal) {
			dragSatVal = false;
		}
	});

	/* EXPANDOS **************************************/
	var expandoHSV = App.UI.Expando({
			//open: true,
			cssClass: 'expand-hsv',
			text: 'Hue/Saturation/Value',
			afterExpand: App.Color.forceUpdate
		}),
		expandoRGB = App.UI.Expando({
			//open: true,
			cssClass: 'expand-rgb',
			text: 'Red/Green/Blue',
			afterExpand: App.Color.forceUpdate
		});
	expandoHSV.$node.appendTo($content);
	expandoRGB.$node.appendTo($content);

	/* SLIDERS **************************************/
	// HSV
	var sliderH = App.UI.Slider({
		label: 'Hue',
		observable: App.Color.Foreground.h
	}).appendTo(expandoHSV.$content);
	var sliderS = App.UI.Slider({
		label: 'Saturation',
		observable: App.Color.Foreground.s
	}).appendTo(expandoHSV.$content);
	var sliderV = App.UI.Slider({
		label: 'Value',
		observable: App.Color.Foreground.v
	}).appendTo(expandoHSV.$content);
	// RGB
	var sliderR = App.UI.Slider({
		label: 'Red',
		max: 255,
		observable: App.Color.Foreground.r
	}).appendTo(expandoRGB.$content);
	var sliderS = App.UI.Slider({
		label: 'Green',
		max: 255,
		observable: App.Color.Foreground.g
	}).appendTo(expandoRGB.$content);
	var sliderV = App.UI.Slider({
		label: 'Blue',
		max: 255,
		observable: App.Color.Foreground.b
	}).appendTo(expandoRGB.$content);

	App.Color.forceUpdate();
	return panel;
})();