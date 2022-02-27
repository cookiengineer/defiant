
import { isObject  } from '../extern/base.mjs';
import { isDefiant } from '../source/Defiant.mjs';



export const isCurator = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Curator]';
};



const Curator = function(settings, defiant, api) {

	settings = isObject(settings) ? settings : {};
	defiant  = isDefiant(defiant) ? defiant  : null;
	api      = api !== undefined  ? api      : null;


	this.settings = settings;
	this.defiant  = defiant;
	this.api      = api;

	this.__state = {
		connected: false
	};

};


Curator.prototype = {

	[Symbol.toStringTag]: 'Curator',

	toJSON: function() {

		return {
			'type': 'Curator',
			'data': this.settings
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			if (this.api[Symbol.for('BROWSER')] === 'Chrome') {

				let origin_exceptions = [];

				if (this.settings.levels.length > 0) {

					this.settings.levels.forEach((level) => {

						if (level.level === 'beta' || level.level === 'gamma') {
							origin_exceptions.push('https://' + level.domain);
							origin_exceptions.push('http://' + level.domain);
						}

					});

				}

				this.api['browsingData'].remove({
					since:          0,
					excludeOrigins: origin_exceptions,
					originTypes:    {
						unprotectedWeb: true
					}
				}, {

					// Keep Cache, History and Passwords
					cache:          false,
					history:        false,
					passwords:      false,

					// Remove all Tracking Storages
					appcache:       true,
					cacheStorage:   true,
					cookies:        true,
					downloads:      true,
					fileSystems:    true,
					formData:       true,
					indexedDB:      true,
					localStorage:   true,
					serviceWorkers: true,
					webSQL:         true

				}, () => {
					this.__state.connected = true;
				});

			} else if (this.api[Symbol.for('BROWSER')] === 'Firefox') {

				let hostname_exceptions = [];

				if (this.settings.levels.length > 0) {

					this.settings.levels.forEach((level) => {

						if (level.level === 'beta' || level.level === 'gamma') {
							hostname_exceptions.push(level.domain);
						}

					});

				}

				this.api['browsingData'].remove({
					since:       0,
					hostnames:   hostname_exceptions,
					originTypes: {
						unprotectedWeb: true
					}
				}, {

					// Keep Cache, History and Passwords
					cache:          false,
					history:        false,
					passwords:      false,

					// Need to be cleared separately
					cookies:        false,
					localStorage:   false,

					// Remove all Tracking Storages
					appcache:       true,
					cacheStorage:   true,
					downloads:      true,
					fileSystems:    true,
					formData:       true,
					indexedDB:      true,
					serviceWorkers: true,
					webSQL:         true

				}, () => {

					this.api['browsingData'].remove({
						since:          0,
						hostnames:      hostname_exceptions,
						originTypes:    {
							extensions:     false,
							protectedWeb:   false,
							unprotectedWeb: true
						}
					}, {
						cookies:        true,
						localStorage:   true
					}, () => {
						this.__state.connected = true;
					});

				});

			}


			return true;

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			// TODO: Clear History again?
			this.__state.connected = false;

			return true;

		}


		return false;

	}

};


export { Curator };

