
import { Element } from '../design/Element.mjs';
import { URL     } from '../source/parser/URL.mjs';



const console = chrome.extension.getBackgroundPage().console || window.console;
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

const getURL = (callback) => {

	chrome.tabs.query({
		active:        true,
		currentWindow: true
	}, (tabs) => {

		let tab = tabs[0] || null;
		if (tab !== null) {

			let url = URL.parse(tab.url);
			if (URL.isURL(url) === true) {
				callback(url);
			} else {
				callback(null);
			}

		} else {
			callback(null);
		}

	});

};

const update = function(tab) {

	console.log('update', tab);

	if (ELEMENTS.domain !== null) {
		ELEMENTS.domain.value(tab.url.domain);
	}

	if (ELEMENTS.level !== null) {

		let number = [ 'zero', 'alpha', 'beta', 'gamma' ].indexOf(tab.level);
		if (number !== -1) {
			ELEMENTS.level.value(number);
		} else {
			ELEMENTS.level.value(0);
		}

		if (ELEMENTS.info !== null) {
			ELEMENTS.info.value('Trust Level ' + tab.level);
		}

	}

};



if (DEFIANT !== null) {

	if (BUTTONS.incognito !== null) {

		BUTTONS.incognito.on('click', () => {

			getURL((url) => {

				if (url !== null) {

					chrome.windows.create({
						incognito: true,
						url:       URL.render(url)
					});

				}

			});

		});

		getURL((url) => {

			if (url === null) {
				BUTTONS.incognito.attr('disabled', true);
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

					DEFIANT.setLevel({
						domain: tab.url.domain,
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

					if (DEFIANT.tab !== tab) {
						DEFIANT.tab = tab;
					}

					update.call(DEFIANT, tab);

				}

			}

		});

	});

}

