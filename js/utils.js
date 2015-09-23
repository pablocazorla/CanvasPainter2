// Utils
var Utils = (function() {
	'use strict';

	var idCounterObservable = 0;

	return {
		toNumber: function(num, defaultValue) {
			return isNaN(parseFloat(num)) ? (defaultValue || 0) : parseFloat(num);
		},
		observable: function(val) {
			var currentValue = (typeof val === 'undefined') ? undefined : val,
				subscriptions = [],
				length = 0,
				enabledSubscr = true,
				locked = false,
				obs = function(val) {
					if (typeof val === 'undefined') {
						return currentValue;
					} else {
						if (currentValue !== val && !locked) {
							currentValue = val;
							if (enabledSubscr) {
								for (var i = 0; i < length; i++) {
									subscriptions[i](currentValue);
								}
							}
						}
						return this;
					}
				};
			obs.id = idCounterObservable++;
			obs.subscribe = function(handler) {
				if (typeof handler === 'function') {
					subscriptions.push(handler);
					length++;
				}
				return this;
			};
			obs.lock = function(flag) {
				var fl = flag || true;
				locked = fl;
				return this;
			};
			obs.enabledSubscriptions = function(flag) {
				var fl = flag || true;
				enabledSubscr = fl;
				return this;
			};
			return obs;
		}
	}
})();