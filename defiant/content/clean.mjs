
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



setTimeout(() => {

	let PROPERTIES = [
		'animation',
		'animation-delay',
		'animation-direction',
		'animation-duration',
		'animation-fill-mode',
		'animation-iteration-count',
		'animation-name',
		'animation-play-state',
		'animation-timing-function',
		'box-shadow',
		'filter',
		'mask',
		'mask-border',
		'mask-border-mode',
		'mask-border-outset',
		'mask-border-repeat',
		'mask-border-slice',
		'mask-border-source',
		'mask-border-width',
		'mask-clip',
		'mask-composite',
		'mask-image',
		'mask-mode',
		'mask-origin',
		'mask-position',
		'mask-repeat',
		'mask-size',
		'mask-type',
		'opacity',
		'overflow',
		'overflow-anchor',
		'overflow-block',
		'overflow-clip-margin',
		'overflow-inline',
		'overflow-wrap',
		'overflow-x',
		'overflow-y',
		'overscroll-behavior',
		'overscroll-behavior-block',
		'overscroll-behavior-inline',
		'overscroll-behavior-x',
		'overscroll-behavior-y',
		'scroll-behavior',
		'scroll-margin',
		'scroll-margin-block',
		'scroll-margin-block-end',
		'scroll-margin-block-start',
		'scroll-margin-bottom',
		'scroll-margin-inline',
		'scroll-margin-inline-end',
		'scroll-margin-inline-start',
		'scroll-margin-left',
		'scroll-margin-right',
		'scroll-margin-top',
		'scroll-padding',
		'scroll-padding-block',
		'scroll-padding-block-end',
		'scroll-padding-block-start',
		'scroll-padding-bottom',
		'scroll-padding-inline',
		'scroll-padding-inline-end',
		'scroll-padding-inline-start',
		'scroll-padding-left',
		'scroll-padding-right',
		'scroll-padding-top',
		'scroll-snap-align',
		'scroll-snap-stop',
		'scroll-snap-type',
		'text-shadow',
		'transition',
		'transition-duration',
		'transition-property',
		'transition-timing-function',
		'user-zoom',
		'user-select',
		'visibility',
		'min-zoom',
		'max-zoom',
		'zoom'
	];


	let level = 'zero';

	if (window.ORIGIN !== undefined && window.ORIGIN.level !== null) {
		level = window.ORIGIN.level.level;
	}

	if (level === 'zero') {

		Array.from(window.document.styleSheets).forEach((stylesheet) => {

			let rules = null;

			try {
				rules = stylesheet.rules;
			} catch (err) {
				rules = null;
			}

			if (rules !== null) {

				Array.from(rules).forEach((rule) => {

					if (typeof rule.style === 'object') {

						PROPERTIES.forEach((property) => {

							let check = rule.style.getPropertyValue(property);
							if (check !== '') {
								rule.style.setProperty(property, 'unset');
							}

						});

					}

				});

			}

		});

		let node = window.document.createElement('style');
		let text = [];

		text.push('body > * * {');
		PROPERTIES.forEach((property) => {
			text.push('\t' + property + ': unset !important;');
		});
		text.push('}');

		node.innerHTML = text.join('\n');

		window.document.head.appendChild(node);

	}

}, 300);

