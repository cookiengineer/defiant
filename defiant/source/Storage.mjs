
import { isArray, isBoolean, isFunction, isObject } from '../extern/base.mjs';



export const isDefiant = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Defiant]';
};

export const isStorage = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Storage]';
};



const Storage = function(settings, defiant, chrome) {

	settings = isObject(settings)   ? settings : {};
	defiant  = isDefiant(defiant)   ? defiant  : null;
	chrome   = chrome !== undefined ? chrome   : null;


	this.settings = settings;
	this.defiant  = defiant;
	this.chrome   = chrome;


	if (this.chrome !== null) {

		fetch(this.chrome.runtime.getURL('extern/blockers.json')).then((response) => {
			return response.json();
		}).then((blockers) => {

			if (isArray(blockers)) {
				this.settings.blockers = blockers;
			}

		});

		fetch(this.chrome.runtime.getURL('extern/filters.json')).then((response) => {
			return response.json();
		}).then((filters) => {

			if (isArray(filters)) {
				this.settings.filters = filters;
			}

		});

		fetch(this.chrome.runtime.getURL('extern/identities.json')).then((response) => {
			return response.json();
		}).then((identities) => {

			if (isArray(identities)) {
				this.settings.identities = identities;
			}

		});

	}

};


Storage.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Storage' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {
			return new Storage(data);
		}

	}


	return null;

};


Storage.prototype = {

	[Symbol.toStringTag]: 'Storage',

	toJSON: function() {

		return {
			'type': 'Storage',
			'data': this.settings
		};

	},

	read: function(callback) {

		callback = isFunction(callback) ? callback : () => {};


		if (this.chrome !== null) {

			this.chrome.storage.local.get('defiant', (blob) => {

				let data = blob['defiant'] || null;

				if (isObject(data) === true) {

					if (isBoolean(data.debug) === true) {
						this.settings.debug = data.debug;
					}

					if (isObject(data.policies) === true) {
						this.settings.policies = data.policies;
					}

					if (isArray(data.levels) === true) {
						this.settings.levels = data.levels;
					}

					if (isArray(data.statistics) === true) {
						this.settings.statistics = data.statistics;
					}

				}

				callback(true);

			});

		} else {

			callback(false);

		}

	},

	save: function(callback) {

		callback = isFunction(callback) ? callback : () => {};


		if (this.chrome !== null) {

			this.chrome.storage.local.set({
				'defiant': this.settings
			}, () => {

				callback(true);

			});

		} else {

			callback(false);

		}

	}

};


export { Storage };

