
import { isArray, isNumber, isObject, isString } from '../extern/base.mjs';
import { isDefiant                             } from '../source/Defiant.mjs';
import { COOKIE                                } from '../source/parser/COOKIE.mjs';
import { URL                                   } from '../source/parser/URL.mjs';


import { redirect as redirect_imgur  } from '../source/site/imgur.mjs';
import { redirect as redirect_reddit } from '../source/site/reddit.mjs';



export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};

const filter = function(headers, names) {

	for (let h = 0; h < headers.length; h++) {

		let name = headers[h].name.toLowerCase();
		if (names.includes(name) === true) {
			headers.splice(h, 1);
			h--;
		}

	}

};

const toCookies = function(headers, name) {

	let cookies = [];

	for (let h = 0; h < headers.length; h++) {

		if (headers[h].name.toLowerCase() === name) {

			let cookie = COOKIE.parse(headers[h].value);
			if (COOKIE.isCOOKIE(cookie) === true) {
				cookies.push(cookie);
			}

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



const Interceptor = function(settings, defiant, api) {

	settings = isObject(settings) ? settings : {};
	defiant  = isDefiant(defiant) ? defiant  : null;
	api      = api !== undefined  ? api      : null;


	this.settings = settings;
	this.defiant  = defiant;
	this.api      = api;

	this.__state = {
		connected: false,
		listeners: {}
	};

	this.__state.listeners['request'] = (details) => {

		let url        = URL.parse(details.url);
		let url_domain = URL.toDomain(url);
		let tab        = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('tab-' + details.tabId);
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
			tab !== null
			&& tab.url.link === 'chrome://new-tab-page/'
		) {

			if (this.defiant.isBlocked(url_domain) === true) {
				blocked = true;
			}

		} else {

			if (
				url.mime.format === 'text/css'
			) {

				type = 'style';

				if (level === 'zero' || level === 'alpha' || level === 'beta') {

					if (this.defiant.isDomain(domain, url_domain) === true) {
						blocked = false;
					} else if (this.defiant.isCDN(url_domain) === true) {
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

					if (this.defiant.isDomain(domain, url_domain) === true) {
						blocked = false;
					} else if (this.defiant.isCDN(url_domain) === true) {
						blocked = false;
					} else {
						report  = true;
						blocked = true;
					}

				} else if (level === 'gamma') {
					blocked = false;
				}

			} else if (
				url.mime.format.startsWith('image/') === true
				|| url.mime.format.startsWith('audio/') === true
				|| url.mime.format.startsWith('video/') === true
			) {

				type = 'media';

				if (level === 'zero') {

					if (this.defiant.isDomain(domain, url_domain) === true) {
						blocked = false;
					} else {
						report  = true;
						blocked = true;
					}

				} else if (level === 'alpha' || level === 'beta') {

					if (this.defiant.isDomain(domain, url_domain) === true) {
						blocked = false;
					} else if (this.defiant.isCDN(url_domain) === true) {
						blocked = false;
					} else {
						report  = true;
						blocked = true;
					}

				} else if (level === 'gamma') {
					blocked = false;
				}

			} else if (
				url.mime.format.startsWith('font/') === true
			) {

				type    = 'asset';
				blocked = true;

			}


			if (blocked === false) {

				if (this.defiant.isBlocked(url_domain) === true) {
					report  = true;
					blocked = true;
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

		}


		if (blocked === false) {

			let redirects = [
				redirect_imgur(URL.render(url)),
				redirect_reddit(URL.render(url))
			].filter((redirect) => redirect !== null);

			if (redirects.length > 0) {

				return {
					redirectUrl: redirects[0]
				};

			}

		}

		return {
			cancel: blocked
		};

	};

	this.__state.listeners['filter-request-headers'] = (details) => {

		let url        = URL.parse(details.url);
		let url_domain = URL.toDomain(url);
		let tab        = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('tab-' + details.tabId);
		}

		let domain = null;
		let level  = 'zero';

		if (tab !== null && tab.level !== null) {
			// domain = tab.level.domain;
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


		let cookies = toCookies(details.requestHeaders, 'cookie');
		if (cookies.length > 0) {

			filter(details.requestHeaders, [
				'cookie'
			]);

			cookies.filter(() => {

				let blocked = false;

				if (level === 'zero') {
					blocked = true;
				} else if (level === 'alpha') {
					blocked = false;
				} else if (level === 'beta') {
					blocked = false;
				} else if (level === 'gamma') {
					blocked = false;
				}

				return blocked === false;

			}).forEach((cookie) => {

				cookie.attributes = {};


				let value = COOKIE.render(cookie);
				if (value !== null) {

					details.requestHeaders.push({
						name:  'cookie',
						value: value
					});

				}

			});

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
			'via',
			'warning'
		]);


		let identity = this.defiant.toIdentity(url_domain);
		if (identity !== null) {

			filter(details.requestHeaders, [
				'user-agent'
			]);

			if (isString(identity['user-agent']) === true) {

				details.requestHeaders.push({
					name:  'user-agent',
					value: identity['user-agent']
				});

			}

			if (isArray(identity['cookies']) === true) {

				identity['cookies'].forEach((cookie) => {

					if (isString(cookie) === true) {

						details.requestHeaders.push({
							name:  'cookie',
							value: cookie
						});

					}

				});

			}

		}


		return {
			requestHeaders: details.requestHeaders
		};

	};

	this.__state.listeners['filter-response-headers'] = (details) => {

		let url = URL.parse(details.url);
		let tab = null;

		if (isNumber(details.tabId) === true) {
			tab = this.defiant.toTab('tab-' + details.tabId);
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

			let redirect        = null;
			let redirect_domain = null;
			let content         = toValue(details.responseHeaders, 'content-location');
			let location        = toValue(details.responseHeaders, 'location');
			let refresh         = toValue(details.responseHeaders, 'refresh');

			if (location !== null) {
				redirect        = URL.parse(location);
				redirect_domain = URL.toDomain(redirect);
			} else if (refresh !== null) {
				redirect        = URL.parse(refresh.split('; url=').pop());
				redirect_domain = URL.toDomain(redirect);
			} else if (content !== null) {
				redirect        = URL.parse(content);
				redirect_domain = URL.toDomain(redirect);
			}


			if (this.defiant.isDomain(domain, redirect_domain) === true) {
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


		let cookies = toCookies(details.responseHeaders, 'set-cookie');
		if (cookies.length > 0) {

			filter(details.responseHeaders, [
				'set-cookie'
			]);

			cookies.filter((cookie) => {

				let blocked = false;

				if (level === 'zero') {
					blocked = true;
				} else if (level === 'alpha') {

					if (isString(cookie.attributes['domain']) === true) {

						if (this.defiant.isDomain(domain, cookie.attributes['domain']) === true) {
							blocked = false;
						} else {
							blocked = true;
						}

					} else if (cookie.attributes['domain'] === null) {
						blocked = false;
					}

				} else if (level === 'beta') {

					if (isString(cookie.attributes['domain']) === true) {

						if (this.defiant.isDomain(domain, cookie.attributes['domain']) === true) {
							blocked = false;
						} else if (this.defiant.isCDN(cookie.attributes['domain']) === true) {
							blocked = false;
						} else {
							blocked = true;
						}

					} else if (cookie.attributes['domain'] === null) {
						blocked = false;
					}

				} else if (level === 'gamma') {
					blocked = false;
				}

				return blocked === false;

			}).forEach((cookie) => {

				// Only Alpha Level overrides Cookie lifetime
				if (level === 'alpha') {
					cookie.attributes['expires'] = null;
					cookie.attributes['max-age'] = null;
				}


				let value = COOKIE.render(cookie);
				if (value !== null) {

					details.responseHeaders.push({
						name:  'set-cookie',
						value: COOKIE.render(cookie)
					});

				}

			});

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

		filter(details.responseHeaders, [
			'access-control-allow-methods',
			'access-control-allow-origin',
			'content-security-policy',
			'x-xss-protection'
		]);


		// TODO: content-security-policy based on trust level
		// if (level === 'zero') {
		// } else if (level === 'alpha') {
		// } else if (level === 'beta') {
		// } else if (level === 'gamma') {
		// }

		// details.responseHeaders.push({
		// 	name:  'content-security-policy',
		// 	value: [
		// 		'child-src \'none\'',
		// 		'frame-src \'none\'',
		// 		'object-src \'none\'',
		// 		'script-src \'none\'',
		// 		'script-src-attr \'none\''
		// 	].join(';')
		// });

		// details.responseHeaders.push({
		// 	name:  'x-xss-protection',
		// 	value: '1; mode=block'
		// });


		return {
			responseHeaders: details.responseHeaders
		};

	};

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


Interceptor.prototype = {

	[Symbol.toStringTag]: 'Interceptor',

	toJSON: function() {

		return {
			'type': 'Interceptor',
			'data': this.settings
		};

	},

	connect: function() {

		if (this.__state.connected === false) {

			if (this.api !== null) {

				this.api.webRequest.onBeforeRequest.addListener(
					this.__state.listeners['request'],
					{ urls: [ 'https://*/*', 'http://*/*' ] },
					[ 'blocking', 'requestBody', 'extraHeaders' ]
				);

				this.api.webRequest.onBeforeSendHeaders.addListener(
					this.__state.listeners['filter-request-headers'],
					{ urls: [ 'https://*/*', 'http://*/*' ] },
					[ 'blocking', 'requestHeaders', 'extraHeaders' ]
				);

				this.api.webRequest.onHeadersReceived.addListener(
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

			if (this.api !== null) {

				this.api.webRequest.onBeforeRequest.removeListener(this.__state.listeners['request']);
				this.api.webRequest.onBeforeSendHeaders.removeListener(this.__state.listeners['filter-request-headers']);
				this.api.webRequest.onHeadersReceived.removeListener(this.__state.listeners['filter-response-headers']);

			}

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

};


export { Interceptor };

