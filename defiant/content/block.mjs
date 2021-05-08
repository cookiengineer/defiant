
const RUNTIME = window.RUNTIME = {

	init: false,

	data: {
		domain: window.location.hostname,
		level:  'zero'
	},

	// No ESM Imports in content script allowed
	BASE: null,
	URL:  null

};



const report = (data) => {

	chrome.runtime.sendMessage({
		type: 'statistics',
		data: data
	});

};

const resolve = (href) => {

	href = (href || '').trim();


	const BASE = RUNTIME.BASE;
	const URL  = RUNTIME.URL;
	let   url  = null;

	if (
		href === ''
		|| href === '#'
		|| href.startsWith('data:')
		|| href.startsWith('javascript:')
	) {
		url = null;
	} else if (
		href.startsWith('https://')
		|| href.startsWith('http://')
	) {
		url = URL.parse(href);
	} else if (
		href.startsWith('//')
	) {
		url = URL.parse(BASE.protocol + ':' + href);
	} else if (
		href.startsWith('/')
		|| href.startsWith('./')
	) {
		url = URL.resolve(BASE, href);
	} else {
		url = URL.resolve(BASE, './' + href);
	}

	return url;

};

const match = (node) => {

	if (
		node.tagName === 'META'
		|| node.tagName === 'LINK'
		|| node.tagName === 'FRAME'
		|| node.tagName === 'IFRAME'
		|| node.tagName === 'SCRIPT'
		|| node.tagName === 'A'
		|| node.tagName === 'IMG'
		|| node.tagName === 'VIDEO'
		|| node.textContent.startsWith('<!--[')
	) {
		return true;
	}

	return false;

};

const process = window.process = (node) => {

	const URL    = RUNTIME.URL;
	const domain = RUNTIME.data.domain;
	const level  = RUNTIME.data.level;


	if (node.tagName === 'META') {

		if (node.getAttribute('http-equiv') !== null) {

			let key      = node.getAttribute('http-equiv').toLowerCase();
			let val      = node.getAttribute('content').toLowerCase();
			let redirect = null;

			if (key === 'location') {
				redirect = URL.parse(val);
			} else if (key === 'refresh') {
				redirect = URL.parse(val.split('; url=').pop());
			}

			if (key === 'location' || key === 'refresh') {

				if (level === 'zero' || level === 'alpha') {

					report({
						domain: domain,
						level:  level,
						link:   URL.render(redirect),
						type:   'redirect'
					});

					node.parentNode.removeChild(node);

				} else if (level === 'beta') {

					if (URL.isDomain(domain, URL.toDomain(redirect)) === true) {
						// Do Nothing
					} else {

						report({
							domain: domain,
							level:  level,
							link:   URL.render(redirect),
							type:   'redirect'
						});

						node.parentNode.removeChild(node);

					}

				} else if (level === 'gamma') {
					// Do Nothing
				}

			} else if (key === 'content-type') {
				// Do Nothing
			} else if (key === 'x-ua-compatible') {
				// Do Nothing
			} else {
				node.parentNode.removeChild(node);
			}

		}

	} else if (node.tagName === 'LINK') {

		let rel = node.getAttribute('rel');

		if (
			rel === 'dns-prefetch'
			|| rel === 'modulepreload'
			|| rel === 'preconnect'
			|| rel === 'prefetch'
			|| rel === 'preload'
			|| rel === 'prerender'
		) {

			if (level === 'zero' || level === 'alpha') {

				let src = resolve(node.getAttribute('href'));

				report({
					domain: domain,
					level:  level,
					link:   URL.render(src),
					type:   'prefetch'
				});

				node.parentNode.removeChild(node);

			} else if (level === 'beta') {

				let src = resolve(node.getAttribute('href'));
				if (src !== null) {

					if (URL.isDomain(domain, URL.toDomain(src)) === true) {
						// Do Nothing
					} else if (URL.isCDN(URL.toDomain(src)) === true) {
						// Do Nothing
					} else {

						report({
							domain: domain,
							level:  level,
							link:   URL.render(src),
							type:   'prefetch'
						});

						node.parentNode.removeChild(node);

					}

				} else {
					node.parentNode.removeChild(node);
				}

			} else if (level === 'gamma') {
				// Do Nothing
			}

		} else if (rel === 'stylesheet') {

			if (level === 'zero' || level === 'alpha' || level === 'beta') {

				let src = resolve(node.getAttribute('href'));
				if (src !== null) {

					if (URL.isDomain(domain, URL.toDomain(src)) === true) {
						// Do Nothing
					} else if (URL.isCDN(URL.toDomain(src)) === true) {
						// Do Nothing
					} else {

						report({
							domain: domain,
							level:  level,
							link:   URL.render(src),
							type:   'style'
						});

						node.parentNode.removeChild(node);

					}

				} else {
					node.parentNode.removeChild(node);
				}

			} else if (level === 'gamma') {
				// Do Nothing
			}

		}

	} else if (node.tagName === 'FRAME' || node.tagName === 'IFRAME') {

		if (level === 'zero' || level === 'alpha') {
			node.parentNode.removeChild(node);
		} else if (level === 'beta') {

			let src = resolve(node.getAttribute('src'));
			if (src !== null) {

				if (URL.isDomain(domain, URL.toDomain(src)) === true) {
					// Do Nothing
				} else {

					report({
						domain: domain,
						level:  level,
						link:   URL.render(src),
						type:   'frame'
					});

					node.parentNode.removeChild(node);

				}

			} else {
				node.parentNode.removeChild(node);
			}

		} else if (level === 'gamma') {
			// Do Nothing
		}

	} else if (node.tagName === 'SCRIPT') {

		if (level === 'zero') {
			node.parentNode.removeChild(node);
		} else if (level === 'alpha' || level === 'beta') {

			let src = resolve(node.getAttribute('src'));
			if (src !== null) {

				if (URL.isDomain(domain, URL.toDomain(src)) === true) {
					// Do Nothing
				} else if (URL.isCDN(URL.toDomain(src)) === true) {
					// Do Nothing
				} else {

					report({
						domain: domain,
						level:  level,
						link:   URL.render(src),
						type:   'script'
					});

					node.parentNode.removeChild(node);

				}

			} else {
				node.parentNode.removeChild(node);
			}

		} else if (level === 'gamma') {
			// Do Nothing
		}

	} else if (node.tagName === 'A') {

		if (node.getAttribute('ping') !== null) {
			node.setAttribute('ping', null);
			node.removeAttribute('ping');
		}

		let href = resolve(node.getAttribute('href'));
		if (href !== null) {

			// TODO: This is incorrect: Include Hash!
			if (node.getAttribute('href') !== href.link) {
				node.setAttribute('href', href.link);
			}

		} else {
			node.parentNode.removeChild(node);
		}

	} else if (node.tagName === 'IMG') {

		let src         = resolve(node.getAttribute('src'));
		let data_src    = resolve(node.getAttribute('data-src'));
		let srcset      = (node.getAttribute('srcset') || '').trim();
		let data_srcset = (node.getAttribute('data-srcset') || '').trim();

		if (src !== null) {

			if (node.getAttribute('src') !== src.link) {
				node.setAttribute('src', src.link);
			}

		} else if (data_src !== null) {

			if (data_src.mime.format.startsWith('image/')) {

				node.setAttribute('src', data_src.link);
				node.removeAttribute('data-src');

			}

		}

		if (srcset === '') {

			if (
				data_srcset.includes('.gif')
				|| data_srcset.includes('.jpg')
				|| data_srcset.includes('.png')
			) {
				// TODO: Parse srcset and filter by domains
				node.setAttribute('srcset', data_srcset);
				node.removeAttribute('data-srcset');
			}

		}

	} else if (node.tagName === 'VIDEO') {

		let src      = resolve(node.getAttribute('src'));
		let data_src = resolve(node.getAttribute('data-src'));

		if (src !== null) {

			if (node.getAttribute('src') !== src.link) {
				node.setAttribute('src', src.link);
			}

		} else if (data_src !== null) {

			if (data_src.mime.format.startsWith('image/')) {

				node.setAttribute('src', data_src.link);
				node.removeAttribute('data-src');

			}

		}

		node.removeAttribute('autoplay');

	} else if (node.textContent.startsWith('<!--[')) {
		node.parentNode.removeChild(node);
	}

};



(async () => {

	const NODES = [];

	await import(chrome.runtime.getURL('source/parser/URL.mjs')).then((mod) => {

		RUNTIME.URL = mod['URL'];


		chrome.runtime.sendMessage({
			type: 'init',
			data: {
				link: window.location.href
			}
		}, (response) => {

			RUNTIME.BASE = RUNTIME.URL.parse(window.location.href);
			RUNTIME.data = response.data;
			RUNTIME.init = true;

			for (let n = 0, nl = NODES.length; n < nl; n++) {

				process(node);

				NODES.splice(n, 1);
				nl--;
				n--;

			}

		});

	});

	new MutationObserver((mutations) => {

		if (RUNTIME.init === true) {

			mutations.forEach((mutation) => {

				if (mutation.type === 'childList') {

					Array.from(mutation.addedNodes).filter((node) => {
						return match(node);
					}).forEach((node) => {
						process(node);
					});

				}

			});

		} else {

			mutations.forEach((mutation) => {

				if (mutation.type === 'childList') {

					Array.from(mutation.addedNodes).filter((node) => {
						return match(node);
					}).forEach((node) => {

						if (NODES.includes(node) === false) {
							NODES.push(node);
						}

					});

				}

			});

		}

	}).observe(document.documentElement, {
		childList: true,
		subtree:   true
	});

})();

