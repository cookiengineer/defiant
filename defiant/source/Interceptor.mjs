
import { console, Emitter, isNumber, isObject, isString } from '../extern/base.mjs';
import { isDefiant                             } from '../source/Defiant.mjs';
import { URL                                   } from '../source/parser/URL.mjs';



const BYPASS = {
	'mannheimer-morgen.de': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
};

export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};

const filter = function(headers, names) {

	for (let h = 0; h < headers.length; h++) {

		let name = headers[h].name.toLowerCase();
		if (names.includes(name) === true) {
			headers.splice(h, 1);
		}

	}

};

const toCookies = function(headers, name) {

	let cookies = [];

	for (let h = 0; h < headers.length; h++) {

		if (headers[h].name.toLowerCase() === name) {

			let chunks = (headers[h].value || '').split(';').map((c) => c.trim());

			console.log(chunks);

		}

	}

	return cookies;

};

const toValue = function(headers, name) {

	let value = null;

	for (let h = 0; h < headers.length; h++) {

		if (headers[h].name.toLowerCase() === name) {
			value = headers[h].value || null;
		}

		if (value !== null) {
			break;
		}

	}

	return value;

};



const Interceptor = function(settings, defiant, chrome) {

	settings = isObject(settings)   ? settings : {};
	defiant  = isDefiant(defiant)   ? defiant  : null;
	chrome   = chrome !== undefined ? chrome   : null;


	this.settings = settings;
	this.defiant  = defiant;
	this.chrome   = chrome;

	this.__state = {
		connected: false,
		listeners: {}
	};

	this.__state.listeners['request'] = (details) => {

		let url = URL.parse(details.url);
		let tab = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('chrome-' + details.tabId);
		}

		let blocked = false;
		let report  = false;
		let domain  = null;
		let level   = 'zero';
		let type    = 'request';

		if (tab !== null && tab.level !== null) {
			domain = tab.level.domain;
			level  = tab.level.level;
		}


		if (
			url.mime.format === 'text/css'
		) {

			type = 'style';

			if (level === 'zero' || level === 'alpha' || level === 'beta') {

				if (URL.isDomain(domain, URL.toDomain(url)) === true) {
					blocked = false;
				} else if (URL.isCDN(URL.toDomain(url)) === true) {
					blocked = false;
				} else {
					report  = true;
					blocked = true;
				}

			} else if (level === 'gamma') {
				blocked = false;
			}

		} else if (
			url.mime.format === 'application/javascript'
			|| url.mime.format === 'application/typescript'
		) {

			type = 'script';

			if (level === 'zero') {
				blocked = true;
			} else if (level === 'alpha' || level === 'beta') {

				if (URL.isDomain(domain, URL.toDomain(url)) === true) {
					blocked = false;
				} else if (URL.isCDN(URL.toDomain(url)) === true) {
					blocked = false;
				} else {
					report  = true;
					blocked = true;
				}

			} else if (level === 'gamma') {
				blocked = false;
			}

		} else if (
			url.mime.format.startsWith('font/')
		) {

			type    = 'asset';
			blocked = true;

		}


		if (blocked === false) {

			let blockers = this.defiant.settings.blockers;

			for (let b = 0, bl = blockers.length; b < bl; b++) {

				let blocker = blockers[b];

				if (URL.isDomain(blocker.domain, URL.toDomain(url)) === true) {
					report  = true;
					blocked = true;
					break;
				}

			}

		}


		if (blocked === true && report === true) {

			this.report({
				domain: domain,
				link:   URL.render(url),
				level:  level,
				type:   type
			});

		}


		return {
			cancel: blocked
		};

	};

	this.__state.listeners['filter-request-headers'] = (details) => {

		let url = URL.parse(details.url);
		let tab = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('chrome-' + details.tabId);
		}

		let domain = null;
		let level  = 'zero';

		if (tab !== null && tab.level !== null) {
			domain = tab.level.domain;
			level  = tab.level.level;
		}


		if (level === 'zero' || level === 'alpha') {

			filter(details.requestHeaders, [
				'origin',
				'referer'
			]);

		} else if (level === 'beta') {

			// TODO: Allow Referer and Origin for first-party and second-party domain

		} else if (level === 'gamma') {
			// Do Nothing
		}


		if (level === 'zero' || level === 'alpha') {

			filter(details.requestHeaders, [
				'cookie'
			]);

		} else if (level === 'beta' || level === 'gamma') {

			// TODO: Enable Cookies from first-party or second-party domain

		}


		filter(details.requestHeaders, [
			'a-im',
			'accept-charset',
			'accept-datetime',
			'cache-control',
			'from',
			'http2-settings',
			'host',
			'if-match',
			'if-modified-since',
			'if-none-match',
			'if-range',
			'if-unmodified-since',
			'max-forwards',
			'pragma',
			'proxy-authorization',
			'upgrade',
			'user-agent',
			'via',
			'warning'
		]);


		let bypass = BYPASS[url.domain] || null;
		if (bypass !== null) {

			details.requestHeaders.push({
				name:  'user-agent',
				value: bypass
			});

		}


		return {
			requestHeaders: details.requestHeaders
		};

	};

	this.__state.listeners['filter-response-headers'] = (details) => {

		let url = URL.parse(details.url);
		let tab = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('chrome-' + details.tabId);
		}

		let domain = null;
		let level  = 'zero';

		if (tab !== null && tab.level !== null) {
			domain = tab.level.domain;
			level  = tab.level.level;
		}


		if (level === 'zero' || level === 'alpha') {

			filter(details.responseHeaders, [
				'location',
				'refresh'
			]);

		} else if (level === 'beta') {

			let redirect = null;
			let content  = toValue(details.responseHeaders, 'content-location');
			let location = toValue(details.responseHeaders, 'location');
			let refresh  = toValue(details.responseHeaders, 'refresh');

			if (location !== null) {
				redirect = URL.parse(location);
			} else if (refresh !== null) {
				redirect = URL.parse(refresh.split('; url=').pop());
			} else if (content !== null) {
				redirect = URL.parse(content);
			}

			if (URL.isDomain(domain, URL.toDomain(redirect)) === true) {
				// Do Nothing
			} else {

				filter(details.responseHeaders, [
					'content-location',
					'location',
					'refresh'
				]);

			}

		} else if (level === 'gamma') {
			// Do Nothing
		}


		// XXX: Remove this, it's here for debugging purposes
		toCookies(details.responseHeaders, 'set-cookie');


		if (level === 'zero' || level === 'alpha') {

			filter(details.responseHeaders, [
				'set-cookie'
			]);

		} else if (level === 'beta') {

			let cookies = toCookies(details.responseHeaders, 'set-cookie');
			if (cookies.length > 0) {
				// TODO: Enable Cookies from first-party or second-party domain
			}

		} else if (level === 'gamma') {
			// Do Nothing
		}


		if (level === 'zero' || level === 'alpha' || level === 'beta') {

			filter(details.responseHeaders, [
				'age',
				'cache-control',
				'etag',
				'expires',
				'last-modified',
				'pragma'
			]);

			details.responseHeaders.push({
				name:  'age',
				value: '0'
			});

			details.responseHeaders.push({
				name:  'cache-control',
				value: 'public, max-age=311040000, immutable'
			});

			details.responseHeaders.push({
				name:  'expires',
				value: 'Tue, 31 Dec 2999 23:00:00 GMT'
			});

		} else if (level === 'gamma') {
			// Do Nothing
		}


		if (
			level === 'zero'
			|| level === 'alpha'
			|| level === 'beta'
		) {

			filter(details.responseHeaders, [
				'allow',
				'alt-svc',
				'delta-base',
				'im',
				'link',
				'p3p',
				'proxy-authenticate',
				'public-key-pins',
				'retry-after',
				// 'server',
				'strict-transport-security',
				'upgrade',
				'vary',
				'via',
				'warning',
				'www-authenticate',
				'x-frame-options',
				'content-security-policy',
				'timing-allow-origin',
				'x-cache',
				'x-cache-status',
				'x-content-security-policy',
				'x-content-duration',
				'x-content-type-options',
				'x-correlation-id',
				'x-powered-by',
				'x-request-id',
				'x-ua-compatible',
				'x-webkit-csp',
				'x-xss-protection'
			]);

		} else if (level === 'gamma') {

			// TODO: Integrate API vs static request
			// TODO: Enforce cache via cache-control, pragma, expires headers
			// TODO: Set headers manually if none given

			// Do Nothing

		}


		// TODO: content-security-policy based on trust level
		// if (level === 'zero') {
		// } else if (level === 'alpha') {
		// } else if (level === 'beta') {
		// } else if (level === 'gamma') {
		// }

		details.responseHeaders.push({
			name:  'content-security-policy',
			value: [
				'child-src \'none\'',
				'frame-src \'none\'',
				'object-src \'none\'',
				'script-src \'none\'',
				'script-src-attr \'none\''
			].join(';')
		});

		details.responseHeaders.push({
			name:  'x-xss-protection',
			value: '1; mode=block'
		});


		return {
			responseHeaders: details.responseHeaders
		};

	};


	Emitter.call(this);

};


Interceptor.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Interceptor' ? json.type : null;
		let data = isObject(json.data)         ? json.data : null;

		if (type !== null && data !== null) {
			return new Interceptor(data);
		}

	}


	return null;

};


Interceptor.prototype = Object.assign({}, Emitter.prototype, {

	[Symbol.toStringTag]: 'Interceptor',

	toJSON: function() {

		return {
			'type': 'Interceptor',
			'data': this.settings
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			if (this.chrome !== null) {

				this.chrome.webRequest.onBeforeRequest.addListener(
					this.__state.listeners['request'],
					{ urls: [ 'https://*/*', 'http://*/*' ] },
					[ 'blocking', 'requestBody', 'extraHeaders' ]
				);

				this.chrome.webRequest.onBeforeSendHeaders.addListener(
					this.__state.listeners['filter-request-headers'],
					{ urls: [ 'https://*/*', 'http://*/*' ] },
					[ 'blocking', 'requestHeaders', 'extraHeaders' ]
				);

				this.chrome.webRequest.onHeadersReceived.addListener(
					this.__state.listeners['filter-response-headers'],
					{ urls: [ 'https://*/*', 'http://*/*' ] },
					[ 'blocking', 'responseHeaders', 'extraHeaders' ]
				);

				this.__state.connected = true;

				return true;

			}

		}


		return false;

	},

	disconnect: function() {

		if (this.__state.connected === true) {

			this.chrome.webRequest.onBeforeRequest.removeListener(this.__state.listeners['request']);
			this.chrome.webRequest.onBeforeSendHeaders.removeListener(this.__state.listeners['filter-request-headers']);
			this.chrome.webRequest.onHeadersReceived.removeListener(this.__state.listeners['filter-response-headers']);

			this.__state.connected = false;

			return true;

		}


		return false;

	},

	report: function(data) {

		let domain = data.domain || null;
		let link   = data.link   || null;
		let level  = data.level  || 'zero';
		let type   = data.type   || null;

		if (
			isString(domain) === true
			&& isString(link) === true
			&& isString(level) === true
			&& isString(type) ===  true
		) {

			this.settings.statistics.push({
				domain: domain,
				level:  level,
				link:   link,
				type:   type
			});

		}

	}

});


export { Interceptor };

