
import { isArray, isBoolean, isFunction, isObject } from '../extern/base.mjs';



export const isDefiant = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Defiant]';
};

export const isStorage = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Storage]';
};



const includes = (array, item) => {

	let result = false;

	for (let a = 0, al = array.length; a < al; a++) {

		if (array[a].domain === item.domain) {
			result = true;
			break;
		}

	}

	return result;

};



const Storage = function(settings, defiant, api) {

	settings = isObject(settings) ? settings : {};
	defiant  = isDefiant(defiant) ? defiant  : null;
	api      = api !== undefined  ? api      : null;


	this.settings = settings;
	this.defiant  = defiant;
	this.api      = api;


	if (this.api !== null) {

		fetch(this.api.runtime.getURL('extern/blockers.json')).then((response) => {
			return response.json();
		}).then((blockers) => {

			if (isArray(blockers) === true) {
				this.settings.blockers = blockers;
			}

		});

		fetch(this.api.runtime.getURL('extern/filters.json')).then((response) => {
			return response.json();
		}).then((filters) => {

			if (isArray(filters) === true) {
				this.settings.filters = filters;
			}

		});

		fetch(this.api.runtime.getURL('extern/distributors.json')).then((response) => {
			return response.json();
		}).then((distributors) => {

			if (isArray(distributors) === true) {

				distributors.forEach((distributor) => {

					if (includes(this.settings.distributors, distributor) === false) {
						this.settings.distributors.push(distributor);
					}

				});

			}

		});

		fetch(this.api.runtime.getURL('extern/identities.json')).then((response) => {
			return response.json();
		}).then((identities) => {

			if (isArray(identities) === true) {

				identities.forEach((identity) => {

					if (includes(this.settings.identities, identity) === false) {
						this.settings.identities.push(identity);
					}

				});

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


		if (this.api !== null) {

			this.api.storage.local.get('defiant', (blob) => {

				let data = blob['defiant'] || null;

				if (isObject(data) === true) {

					if (isBoolean(data.debug) === true) {
						this.settings.debug = data.debug;
					}

					if (isObject(data.policies) === true) {
						this.settings.policies = data.policies;
					}

					if (isArray(data.distributors) === true) {

						data.distributors.forEach((distributor) => {

							if (includes(this.settings.distributors, distributor) === false) {
								this.settings.distributors.push(distributor);
							}

						});

					}

					if (isArray(data.levels) === true) {

						data.levels.forEach((level) => {

							if (includes(this.settings.levels, level) === false) {
								this.settings.levels.push(level);
							}

						});

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


		if (this.api !== null) {

			this.api.storage.local.set({
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

