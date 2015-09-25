// Header
App.Header = (function() {
	'use strict';

	var $container = $('<div id="header-container"/>').appendTo(App.$container),
		$menuContainer = $('<menu id="menu-container"/>').appendTo($container);

	var menuFile = Menu({
		label: 'File',
		buttons: [{
			label: 'New',
			classCss: '',
			action: function() {
				App.DocList.createDoc();
			}
		}],
		parent: $menuContainer
	});

	var menuView = Menu({
		label: 'View',
		buttons: [{
			label: 'Color Panel',
			classCss: '',
			action: function() {
				App.Panel.Color.toggle();
			}
		}],
		parent: $menuContainer
	});
	var menuHelp = Menu({
		label: 'Help',
		buttons: [{
			label: 'About',
			classCss: '',
			action: function() {}
		}],
		parent: $menuContainer
	});


	var docList = (function() {
		var noDocuments = '<span class="no-documents">No documents</span>',
			$listContainer = $('<div id="doc-selector-container">Document:</div>').appendTo($container),
			$list = $('<div id="doc-selector"/>').appendTo($listContainer),
			$label = $('<div id="doc-selector-label">' + noDocuments + '</div>').appendTo($list),
			$ul = $('<ul id="doc-selector-list"/>').appendTo($list);

		return {
			update: function() {
				var str = '',
					list = App.DocList.list(),
					l = list.length;

				if (App.DocList.doc) {
					$label.html(App.DocList.doc.cfg.name + ' <i class="fa fa-caret-down"></i>');
				}
				for (var i = 0; i < l; i++) {
					var d = list[i];
					var currClass = '';
					if (App.DocList.doc) {
						currClass = (App.DocList.doc.id === d.id) ? 'current' : '';
					}
					str += '<li class="' + currClass + '" data-id="' + d.id + '">' + d.cfg.name + '</li>';
				}
				$ul.html(str);


				$ul.find('li').click(function() {
					var id = parseInt($(this).attr('data-id'));
					App.DocList.selectDoc(id);
				});
			}
		};
	})();


	return {
		$container: $container,
		docList: docList
	};
})();