
const BANNERS = [
	'#cookie-banner',
	'.cookie-banner',
	'#cookiebanner',
	'.cookiebanner',
	'#cookie-consent',
	'.cookie-consent',
	'#cookieconsent',
	'.cookieconsent',
	'#gdpr-consent',
	'.gdpr-consent',
	'#gdprconsent',
	'.gdprconsent',
	'#consent',
	'.consent',
	'*[aria-label="cookie-banner"]',
	'*[aria-label="cookiebanner"]',
	'*[aria-label="cookie-consent"]',
	'*[aria-label="cookieconsent"]',
	'*[aria-label="gdpr-consent"]',
	'*[aria-label="gdprconsent"]',
	'*[aria-label="consent"]'
];

const EVENTS = [
	'abort',
	'blur',
	'cancel',
	'canplay',
	'canplaythrough',
	'change',
	'click',
	'close',
	'contextmenu',
	'cuechange',
	'dblclick',
	'durationchange',
	'ended',
	'error',
	'focus',
	'gotpointercapture',
	'input',
	'invalid',
	'keydown',
	'keypress',
	'keyup',
	'load',
	'loadedmetadata',
	'loadend',
	'loadstart',
	'lostpointercapture',
	'mousedown',
	'mouseenter',
	'mouseleave',
	'mousemove',
	'mouseout',
	'mouseover',
	'mouseup',
	'pause',
	'play',
	'playing',
	'pointercancel',
	'pointerdown',
	'pointerenter',
	'pointerleave',
	'pointermove',
	'pointerout',
	'pointerover',
	'pointerup',
	'reset',
	'resize',
	'scroll',
	'select',
	'selectionchange',
	'selectstart',
	'submit',
	'touchcancel',
	'touchstart',
	'transitioncancel',
	'transitionend',
	'wheel'
];



EVENTS.forEach((event) => {

	let nodes = Array.from(document.querySelectorAll('*[on' + event + ']'));
	if (nodes.length > 0) {

		nodes.forEach((node) => {

			node.setAttribute('on' + event, null);
			node.removeAttribute('on' + event);

			node['on' + event] = null;

			setTimeout(() => {
				node.replaceWith(node.cloneNode(true));
			}, 0);

		});

	}

});



(() => {

	let interval_id = setInterval(() => {

		if (window.RUNTIME.init === true) {

			clearInterval(interval_id);
			interval_id = null;

			Array.from(document.querySelectorAll('meta, link, frame, iframe, script, a, img, video')).forEach((node) => {
				window.process(node);
			});

			BANNERS.forEach((query) => {

				let elements = Array.from(document.querySelectorAll(query));
				if (elements.length === 1) {
					elements[0].parentNode.removeChild(elements[0]);
				}

			});

		}

	}, 16);

})();

