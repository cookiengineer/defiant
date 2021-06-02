
setTimeout(() => {

	let EVENTS = [
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

	let level = 'zero';

	if (window.ORIGIN !== undefined && window.ORIGIN.level !== null) {
		level = window.ORIGIN.level.level;
	}

	if (level === 'zero') {

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

	}

}, 100);



setTimeout(() => {

	let BANNERS = [

		'#cookie-banner',
		'.cookie-banner',
		'*[aria-label="cookie-banner"]',

		'#cookiebanner',
		'.cookiebanner',
		'*[aria-label="cookiebanner"]',

		'#cookie-consent',
		'.cookie-consent',
		'*[aria-label="cookie-consent"]',

		'#cookieconsent',
		'.cookieconsent',
		'*[aria-label="cookieconsent"]',

		'#consent',
		'.consent',
		'*[aria-label="consent"]',

		'#gdpr-consent',
		'.gdpr-consent',
		'*[aria-label="gdpr-consent"]',

		'#gdprconsent',
		'.gdprconsent',
		'*[aria-label="gdprconsent"]',

		'#sticky-banner',
		'.sticky-banner',
		'*[aria-label="sticky-banner"]',

		'#stickybanner',
		'.stickybanner',
		'*[aria-label="stickybanner"]'

	];

	BANNERS.forEach((query) => {

		let elements = Array.from(document.querySelectorAll(query));
		if (elements.length === 1) {
			elements[0].parentNode.removeChild(elements[0]);
		}

	});

}, 200);

