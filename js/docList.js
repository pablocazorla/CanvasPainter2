// Doc List
App.DocList = (function() {
	'use strict';

	var list = Utils.observableArray([]),
		docum = Utils.observable(),
		$container = $('<div id="docList-container"/>').appendTo(App.$container),
		createDoc = function(options) {
			var d = Doc(options);
			list.push(d);
			selectDoc(d.id);
		},
		selectDoc = function(id) {
			var d,
				l = list.len();
			for (var i = 0; i < l; i++) {
				if (list(i).id === id) {
					d = list(i);
				}
			}
			docum(d);
		};

	docum.subscribe(function(d) {
		var l = list.len();
		for (var i = 0; i < l; i++) {
			list(i).hide();
		}
		d.show();
		App.Header.docList.update();
	});
	list.subscribe(function() {
		App.Header.docList.update();
	});

	return {

		$container: $container,
		createDoc: createDoc,
		selectDoc: selectDoc,
		get doc(){
			var d = docum();
			return d;
		},
		get list() {
			return list;
		}
	};
})();