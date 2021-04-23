
import { Emitter, isNumber, isObject } from '../extern/base.mjs';
import { isDefiant                   } from '../source/Defiant.mjs';
import { URL                         } from '../source/parser/URL.mjs';



const BYPASS = {
	'mannheimer-morgen.de': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
};

const FILTER = {
	urls: [ 'https://*/*', 'http://*/*' ]
};

export const isInterceptor = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Interceptor]';
};

const filter = function(name) {

	for (let i = 0; i < this.length; i++) {

		if (this[i].name.toLowerCase() === name) {
			this.splice(i, 1);
		}

	}

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
		let notify  = false;
		let domain  = null;
		let level   = 'zero';

		if (tab !== null && tab.level !== null) {
			domain = tab.level.domain;
			level  = tab.level.level;
		}


		if (
			url.mime.format === 'text/css'
		) {

			if (level === 'zero' || level === 'alpha' || level === 'beta') {

				if (URL.isDomain(URL.toDomain(url), domain) === true) {
					blocked = false;
				} else if (URL.isCDN(URL.toDomain(url)) === true) {
					blocked = false;
				} else {
					notify  = true;
					blocked = true;
				}

			} else if (level === 'gamma') {
				blocked = false;
			}

		} else if (
			url.mime.format === 'application/javascript'
			|| url.mime.format === 'application/typescript'
		) {

			if (level === 'zero') {
				blocked = true;
			} else if (level === 'alpha' || level === 'beta') {

				if (URL.isDomain(url, URL.toDomain(tab.url)) === true) {
					blocked = false;
				} else if (URL.isCDN(URL.toDomain(url)) === true) {
					blocked = false;
				} else {
					notify  = true;
					blocked = true;
				}

			} else if (level === 'gamma') {
				blocked = false;
			}

		} else if (
			url.mime.format.startsWith('font/')
		) {
			blocked = true;
		}


		if (blocked === true && notify === true) {

			this.defiant.settings.notifications.push({
				link:  URL.render(url),
				level: level,
				type:  'block'
			});

			this.defiant.storage.save();

		}


		if (blocked === false) {

			let blockers = this.defiant.settings.blockers;

			for (let b = 0, bl = blockers.length; b < bl; b++) {

				let blocker = blockers[b];

				if (URL.isDomain(blocker.domain, url) === true) {
					blocked = true;
					break;
				}

			}

		}


		return {
			cancel: blocked
		};

	};

	this.__state.listeners['filter-request-headers'] = (details) => {

		filter.call(details.requestHeaders, 'a-im');
		filter.call(details.requestHeaders, 'accept-charset');
		filter.call(details.requestHeaders, 'accept-datetime');
		filter.call(details.requestHeaders, 'cache-control');
		filter.call(details.requestHeaders, 'cookie');
		filter.call(details.requestHeaders, 'from');
		filter.call(details.requestHeaders, 'http2-settings');
		filter.call(details.requestHeaders, 'host');
		filter.call(details.requestHeaders, 'if-match');
		filter.call(details.requestHeaders, 'if-modified-since');
		filter.call(details.requestHeaders, 'if-none-match');
		filter.call(details.requestHeaders, 'if-range');
		filter.call(details.requestHeaders, 'if-unmodified-since');
		filter.call(details.requestHeaders, 'max-forwards');
		filter.call(details.requestHeaders, 'origin');
		filter.call(details.requestHeaders, 'pragma');
		filter.call(details.requestHeaders, 'proxy-authorization');
		filter.call(details.requestHeaders, 'referer');
		filter.call(details.requestHeaders, 'upgrade');
		filter.call(details.requestHeaders, 'user-agent');
		filter.call(details.requestHeaders, 'via');
		filter.call(details.requestHeaders, 'warning');


		let url    = URL.parse(details.url);
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

		filter.call(details.responseHeaders, 'age');
		filter.call(details.responseHeaders, 'allow');
		filter.call(details.responseHeaders, 'alt-svc');
		filter.call(details.responseHeaders, 'cache-control');
		filter.call(details.responseHeaders, 'content-location');
		filter.call(details.responseHeaders, 'delta-base');
		filter.call(details.responseHeaders, 'etag');
		filter.call(details.responseHeaders, 'expires');
		filter.call(details.responseHeaders, 'im');
		filter.call(details.responseHeaders, 'last-modified');
		filter.call(details.responseHeaders, 'link');
		filter.call(details.responseHeaders, 'p3p');
		filter.call(details.responseHeaders, 'pragma');
		filter.call(details.responseHeaders, 'proxy-authenticate');
		filter.call(details.responseHeaders, 'public-key-pins');
		filter.call(details.responseHeaders, 'retry-after');
		filter.call(details.responseHeaders, 'server');
		filter.call(details.responseHeaders, 'set-cookie');
		filter.call(details.responseHeaders, 'strict-transport-security');
		filter.call(details.responseHeaders, 'upgrade');
		filter.call(details.responseHeaders, 'vary');
		filter.call(details.responseHeaders, 'via');
		filter.call(details.responseHeaders, 'warning');
		filter.call(details.responseHeaders, 'www-authenticate');
		filter.call(details.responseHeaders, 'x-frame-options');
		filter.call(details.responseHeaders, 'refresh');
		filter.call(details.responseHeaders, 'content-security-policy');
		filter.call(details.responseHeaders, 'timing-allow-origin');
		filter.call(details.responseHeaders, 'x-content-security-policy');
		filter.call(details.responseHeaders, 'x-content-duration');
		filter.call(details.responseHeaders, 'x-content-type-options');
		filter.call(details.responseHeaders, 'x-correlation-id');
		filter.call(details.responseHeaders, 'x-powered-by');
		filter.call(details.responseHeaders, 'x-request-id');
		filter.call(details.responseHeaders, 'x-ua-compatible');
		filter.call(details.responseHeaders, 'x-webkit-csp');
		filter.call(details.responseHeaders, 'x-xss-protection');


		// TODO: content-security-policy based on trust level
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

				this.chrome.webRequest.onBeforeRequest.addListener(this.__state.listeners['request'], FILTER, [ 'blocking', 'requestBody', 'extraHeaders' ]);
				this.chrome.webRequest.onBeforeSendHeaders.addListener(this.__state.listeners['filter-request-headers'], FILTER, [ 'blocking', 'requestHeaders', 'extraHeaders' ]);
				this.chrome.webRequest.onHeadersReceived.addListener(this.__state.listeners['filter-response-headers'], FILTER, [ 'blocking', 'responseHeaders', 'extraHeaders' ]);

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

	}

});


export { Interceptor };

