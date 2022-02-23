
import { Emitter, isArray, isBoolean, isObject, isString } from '../extern/base.mjs';
import { Interceptor                                     } from '../source/Interceptor.mjs';
import { Storage                                         } from '../source/Storage.mjs';
import { Tab                                             } from '../source/Tab.mjs';
import { URL                                             } from '../source/parser/URL.mjs';


export { console } from '../extern/base.mjs';

export const isDefiant = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Defiant]';
};

export const isLevel = function(payload) {

	if (
		isObject(payload) === true
		&& isString(payload.domain) === true
		&& isString(payload.level) === true
		&& [ 'zero', 'alpha', 'beta', 'gamma' ].includes(payload.level) === true
	) {
		return true;
	}


	return false;

};



const Defiant = function(settings, api) {

	settings = isObject(settings) ? settings : {};


	this.settings = Object.assign({

		// Extension Data
		blockers:     [],
		distributors: [],
		filters:      [],
		identities:   [],

		// User Settings
		debug:      false,
		policies:   { cookies: 'none' },

		// User Data
		levels:     [],
		statistics: []

	}, settings);


	this.interceptor = new Interceptor(this.settings, this, api);
	this.storage     = new Storage(this.settings, this, api);
	this.tab         = null;
	this.tabs        = [];


	Emitter.call(this);


	this.storage.read(() => {
		this.interceptor.connect();
	});

};


Defiant.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Defiant' ? json.type : null;
		let data = isObject(json.data)     ? json.data : null;

		if (type !== null && data !== null) {

			let defiant = new Defiant({
				debug:  isBoolean(data.debug) ? data.debug  : null,
				levels: isArray(data.levels)  ? data.levels : null
			});

			return defiant;

		}

	}


	return null;

};


Defiant.isLevel   = isLevel;
Defiant.isDefiant = isDefiant;


Defiant.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Defiant',

	toJSON: function() {

		let blob = Emitter.prototype.toJSON.call(this);
		let data = {
			events:   blob.data.events,
			journal:  blob.data.journal,
			settings: Object.assign({}, this.settings)
		};

		return {
			'type': 'Defiant',
			'data': data
		};

	},

	destroy: function() {

		this.interceptor.disconnect();

	},

	toLevel: function(domain) {

		domain = isString(domain) ? domain : null;


		if (domain !== null) {

			let levels = this.settings.levels.filter((l) => URL.isDomain(l.domain, domain));
			if (levels.length > 1) {

				return levels.sort((a, b) => {
					if (a.domain.length > b.domain.length) return -1;
					if (b.domain.length > a.domain.length) return  1;
					return 0;
				})[0];

			} else if (levels.length === 1) {

				return levels[0];

			} else {

				return {
					domain: domain,
					level:  'zero'
				};

			}

		}


		return null;

	},

	setLevel: function(level) {

		level = isLevel(level) ? level : null;


		if (level !== null) {

			let found = this.settings.levels.find((l) => l.domain === level.domain) || null;
			if (found !== null) {

				found.level = level.level;

				this.tabs.filter((tab) => {
					return tab.level === found;
				}).forEach((tab) => {

					if (tab === this.tab) {
						this.emit('change', [ this.tab ]);
					}

				});

			} else {
				this.settings.levels.push(level);
			}

			this.storage.save();

			return true;

		}


		return false;

	},

	toTab: function(id) {

		id = isString(id) ? id : null;


		if (id !== null) {

			let tab = this.tabs.find((t) => t.id === id) || null;
			if (tab === null) {

				tab = new Tab({
					id: id
				});

				this.tabs.push(tab);

			}

			return tab;

		}


		return null;

	},

	toIdentity: function(domain) {

		domain = isString(domain) ? domain : null;


		if (domain !== null) {

			let identity = this.settings.identities.find((i) => this.isDomain(i.domain, domain)) || null;
			if (identity !== null) {
				return identity;
			}

		}


		return null;

	},

	isBlocked: function(domain) {

		domain = isString(domain) ? domain : null;


		if (domain !== null) {

			let blocker = this.settings.blockers.find((b) => this.isDomain(b.domain, domain)) || null;
			if (blocker !== null) {
				return true;
			}

		}


		return false;

	},

	isDomain: function(domain, other) {

		domain = isString(domain) ? domain : null;
		other  = isString(other)  ? other  : null;

		if (domain !== null && other !== null) {

			if (
				other === domain
				|| other.endsWith('.' + domain) === true
			) {
				return true;
			}

		}


		return false;

	},

	isCDN: function(domain) {

		domain = isString(domain) ? domain : null;


		if (domain !== null) {

			let distributor = this.settings.distributors.find((d) => d.domain === domain) || null;
			if (distributor !== null) {
				return true;
			}

		}


		return false;

	}

});


export { Defiant };

