
import { Element } from '../design/Element.mjs';
import { URL     } from '../source/parser/URL.mjs';



// const console = chrome.extension.getBackgroundPage().console || window.console;
const DEFIANT = chrome.extension.getBackgroundPage().DEFIANT || null;

const BUTTONS = {
	incognito: Element.query('*[data-action="incognito"]'),
	options:   Element.query('*[data-action="options"]')
};

const ELEMENTS = {
	domain: Element.query('*[data-key="domain"]'),
	info:   Element.query('*[data-key="info"]'),
	level:  Element.query('*[data-key="level"]')
};

const update = function(tab) {

	if (ELEMENTS.domain !== null) {
		ELEMENTS.domain.value(URL.toDomain(tab.url));
	}

	if (ELEMENTS.level !== null) {

		if (tab.level !== null) {
			ELEMENTS.level.value([ 'zero', 'alpha', 'beta', 'gamma' ].indexOf(tab.level.level));
		} else {
			ELEMENTS.level.value(0);
		}

	}

	if (ELEMENTS.info !== null) {

		if (tab.level !== null) {

			if (tab.level.level === 'zero') {
				ELEMENTS.info.value('Zero: Maximum Security');
			} else if (tab.level.level === 'alpha') {
				ELEMENTS.info.value('Alpha: Interactive Website');
			} else if (tab.level.level === 'beta') {
				ELEMENTS.info.value('Beta: Media + Frames + Cookies');
			} else if (tab.level.level === 'gamma') {
				ELEMENTS.info.value('Gamma: Web App');
			}

		} else {
			ELEMENTS.info.value('Zero: Maximum Security');
		}

	}

	if (
		tab.url.protocol === 'https'
		|| tab.url.protocol === 'http'
	) {
		BUTTONS.incognito.attr('disabled', false);
	} else {
		BUTTONS.incognito.attr('disabled', true);
	}

};



if (DEFIANT !== null) {

	if (BUTTONS.incognito !== null) {

		BUTTONS.incognito.on('click', () => {

			let tab = DEFIANT.tab || null;
			if (tab !== null) {

				chrome.windows.create({
					incognito: true,
					url:       URL.render(tab.url)
				});

			}

		});

	}

	if (BUTTONS.options !== null) {

		BUTTONS.options.on('click', () => {

			chrome.tabs.query({
				url: chrome.runtime.getURL('chrome/options.html')
			}, (tabs) => {

				if (tabs.length > 0) {

					chrome.tabs.highlight({
						tabs: [ tabs[0].index ]
					});

				} else {

					chrome.tabs.create({
						url: chrome.runtime.getURL('chrome/options.html')
					});

				}

			});

		});

	}

	if (ELEMENTS.level !== null) {

		ELEMENTS.level.on('change', () => {

			let tab = DEFIANT.tab || null;
			if (tab !== null) {

				let value = ELEMENTS.level.value();
				let level = [ 'zero', 'alpha', 'beta', 'gamma' ][value] || null;
				if (level !== null) {

					if (ELEMENTS.info !== null) {

						if (level === 'zero') {
							ELEMENTS.info.value('Zero: Maximum Security');
						} else if (level === 'alpha') {
							ELEMENTS.info.value('Alpha: Interactive Website');
						} else if (level === 'beta') {
							ELEMENTS.info.value('Beta: Media + Frames + Cookies');
						} else if (level === 'gamma') {
							ELEMENTS.info.value('Gamma: Web App');
						}

					}

					DEFIANT.setLevel({
						domain: URL.toDomain(tab.url),
						level:  level
					});

				}

			}

		});

	}


	DEFIANT.on('change', (tab) => {
		update.call(DEFIANT, tab);
	});


	window.addEventListener('load', () => {

		chrome.tabs.query({
			active:        true,
			currentWindow: true
		}, (chrome_tabs) => {

			let chrome_tab = chrome_tabs[0] || null;
			if (chrome_tab !== null) {

				let tab = DEFIANT.toTab('chrome-' + chrome_tab.id) || null;
				if (tab !== null) {
					update.call(DEFIANT, tab);
				}

			}

		});

	});

}

