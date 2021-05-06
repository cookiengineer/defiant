
const RUNTIME = window.RUNTIME = {

	init: false,

	data: {
		domain: window.location.hostname,
		level:  'zero'
	},

	URL: null // No ESM Imports in content script allowed

};

const notify = (data) => {

	chrome.runtime.sendMessage({
		type: 'notification',
		data: data
	});

};

const process = window.process = (node) => {

	let URL    = RUNTIME.URL;
	let domain = RUNTIME.data.domain;
	let level  = RUNTIME.data.level;

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
					node.parentNode.removeChild(node);
				} else if (level === 'beta') {

					if (URL.isDomain(URL.toDomain(redirect), domain) === true) {
						// Do nothing
					} else {
						node.parentNode.removeChild(node);
					}

				} else if (level === 'gamma') {
					// Do nothing
				}

			} else if (key === 'content-type') {
				// Do nothing
			} else if (key === 'x-ua-compatible') {
				// Do nothing
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

			if (level === 'zero' || level === 'alpha' || level === 'beta') {
				node.parentNode.removeChild(node);
			} else if (level === 'gamma') {
				// Do nothing
			}

		} else if (rel === 'stylesheet') {

			if (level === 'zero' || level === 'alpha' || level === 'beta') {

				let src = URL.parse(node.getAttribute('href'));
				if (URL.isDomain(URL.toDomain(src), domain) === true) {
					// Do nothing
				} else if (URL.isCDN(URL.toDomain(src)) === true) {
					// Do nothing
				} else {

					notify({
						level: level,
						link:  URL.render(src),
						type:  'block'
					});

					node.parentNode.removeChild(node);

				}

			} else if (level === 'gamma') {
				// Do nothing
			}

		}

	} else if (node.tagName === 'FRAME' || node.tagName === 'IFRAME') {

		if (level === 'zero' || level === 'alpha') {
			node.parentNode.removeChild(node);
		} else if (level === 'beta') {

			let src = URL.parse(node.getAttribute('src'));
			if (URL.isDomain(URL.toDomain(src), domain) === true) {
				// Do nothing
			} else {
				node.parentNode.removeChild(node);
			}

		} else if (level === 'gamma') {
			// Do nothing
		}

	} else if (node.tagName === 'SCRIPT') {

		if (level === 'zero') {
			node.parentNode.removeChild(node);
		} else if (level === 'alpha' || level === 'beta') {

			let src = URL.parse(node.getAttribute('src'));
			if (URL.isDomain(URL.toDomain(src), domain) === true) {
				// Do nothing
			} else if (URL.isCDN(URL.toDomain(src)) === true) {
				// Do nothing
			} else {

				notify({
					level: level,
					link:  URL.render(src),
					type:  'block'
				});

				node.parentNode.removeChild(node);

			}

		} else if (level === 'gamma') {
			// Do nothing
		}

	} else if (node.tagName === 'A') {

		if (node.getAttribute('ping') !== null) {
			node.setAttribute('ping', null);
			node.removeAttribute('ping');
		}

		let href = (node.getAttribute('href') || '').trim();

		if (
			href === ''
			|| href === '#'
			|| href.startsWith('javascript:')
		) {
			node.parentNode.removeChild(node);
		}

	} else if (node.tagName === 'IMG') {

		let src         = (node.getAttribute('src') || '').trim();
		let srcset      = (node.getAttribute('srcset') || '').trim();
		let data_src    = (node.getAttribute('data-src') || '').trim();
		let data_srcset = (node.getAttribute('data-srcset') || '').trim();

		if (
			src.startsWith('data:')
			|| src.startsWith('javascript:')
			|| src.startsWith('#')
			|| src === ''
		) {

			if (
				data_src.endsWith('.gif')
				|| data_src.endsWith('.jpg')
				|| data_src.endsWith('.png')
			) {
				node.setAttribute('src', data_src);
			}

		}

		if (srcset === '') {

			if (
				data_srcset.includes('.gif')
				|| data_srcset.includes('.jpg')
				|| data_srcset.includes('.png')
			) {
				node.setAttribute('srcset', data_srcset);
			}

		}

	} else if (node.textContent.startsWith('<!--[')) {
		node.parentNode.removeChild(node);
	}

};



(async () => {

	await import(chrome.runtime.getURL('source/parser/URL.mjs')).then((mod) => {
		RUNTIME.URL = mod['URL'];
	});

	new MutationObserver((mutations) => {

		if (RUNTIME.init === false) {

			chrome.runtime.sendMessage({
				type: 'init',
				data: {
					link: window.location.href
				}
			}, (response) => {

				RUNTIME.data = response.data;
				RUNTIME.init = true;

				mutations.forEach((mutation) => {

					if (mutation.type === 'childList') {

						Array.from(mutation.addedNodes).forEach((node) => {
							process(node);
						});

					}

				});

			});

		} else {

			mutations.forEach((mutation) => {

				if (mutation.type === 'childList') {

					Array.from(mutation.addedNodes).forEach((node) => {
						process(node);
					});

				}

			});

		}

	}).observe(document.documentElement, {
		childList: true,
		subtree:   true
	});

})();

