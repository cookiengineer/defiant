
import { API     } from '../extern/extension.mjs';
import { Element } from '../design/Element.mjs';
import { URL     } from '../source/parser/URL.mjs';



const console = API['extension'].getBackgroundPage().console || null;
const DEFIANT = API['extension'].getBackgroundPage().DEFIANT || null;



const BUTTONS = {
	'confirm':   Element.query('*[data-action="confirm"]'),
	'incognito': Element.query('*[data-action="incognito"]'),
	'options':   Element.query('*[data-action="options"]')
};

const ELEMENTS = {
	'domain':  Element.query('*[data-key="domain"]'),
	'info':    Element.query('*[data-key="info"]'),
	'level':   Element.query('*[data-key="level"]')
};

const update = function(tab) {

	if (ELEMENTS['domain'] !== null) {
		ELEMENTS['domain'].value(URL.toDomain(tab.url));
	}

	if (tab.level !== null) {

		ELEMENTS['level'].value([ 'zero', 'alpha', 'beta', 'gamma' ].indexOf(tab.level.level));

		if (tab.level.level === 'zero') {
			ELEMENTS['info'].value('Zero: Static Website');
		} else if (tab.level.level === 'alpha') {
			ELEMENTS['info'].value('Alpha: Interactive Website');
		} else if (tab.level.level === 'beta') {
			ELEMENTS['info'].value('Beta: Social Web App');
		} else if (tab.level.level === 'gamma') {
			ELEMENTS['info'].value('Gamma: Social Media App');
		}

	} else {

		ELEMENTS['level'].value(0);
		ELEMENTS['info'].value('Zero: Static Website');

	}

	if (
		tab.url.protocol === 'https'
		|| tab.url.protocol === 'http'
	) {
		BUTTONS['incognito'].state('enabled');
	} else {
		BUTTONS['incognito'].state('disabled');
	}

	BUTTONS['confirm'].state('disabled');

};



if (DEFIANT !== null) {

	BUTTONS['incognito'].on('click', () => {

		let tab = DEFIANT.tab || null;
		if (tab !== null) {

			API['windows'].create({
				incognito: true,
				url:       URL.render(tab.url)
			});

		}

	});

	BUTTONS['options'].on('click', () => {

		API['tabs'].query({
			url: API['runtime'].getURL('chrome/options.html')
		}, (tabs) => {

			if (tabs.length > 0) {

				API['tabs'].highlight({
					tabs: [ tabs[0].index ]
				});

			} else {

				API['tabs'].create({
					url: API['runtime'].getURL('chrome/options.html')
				});

			}

		});

	});

	ELEMENTS['level'].on('input', () => {

		let value = ELEMENTS['level'].value();
		let level = [ 'zero', 'alpha', 'beta', 'gamma' ][value] || null;

		if (level !== null) {

			if (level === 'zero') {
				ELEMENTS['level'].state('zero');
				ELEMENTS['info'].value('Zero: Static Website');
			} else if (level === 'alpha') {
				ELEMENTS['level'].state('alpha');
				ELEMENTS['info'].value('Alpha: Interactive Website');
			} else if (level === 'beta') {
				ELEMENTS['level'].state('beta');
				ELEMENTS['info'].value('Beta: Social Web App');
			} else if (level === 'gamma') {
				ELEMENTS['level'].state('gamma');
				ELEMENTS['info'].value('Gamma: Social Media App');
			}
		}

	});

	ELEMENTS['level'].on('input', () => {

		let value = ELEMENTS['level'].value();
		let level = [ 'zero', 'alpha', 'beta', 'gamma' ][value] || null;
		let tab   = DEFIANT.tab || null;

		if (tab !== null && level !== null) {

			if (
				tab.url.protocol === 'https'
				|| tab.url.protocol === 'http'
			) {

				if (tab.level !== null && tab.level.level !== level) {
					BUTTONS['confirm'].state('enabled');
				} else if (tab.level === null) {
					BUTTONS['confirm'].state('enabled');
				} else {
					BUTTONS['confirm'].state('disabled');
				}

			} else {
				BUTTONS['confirm'].state('disabled');
			}

		} else {
			BUTTONS['confirm'].state('disabled');
		}

	});

	BUTTONS['confirm'].on('click', () => {

		let tab   = DEFIANT.tab || null;
		let value = ELEMENTS['level'].value();
		let level = [ 'zero', 'alpha', 'beta', 'gamma' ][value] || null;

		if (tab !== null && level !== null) {

			DEFIANT.setLevel({
				domain: URL.toDomain(tab.url),
				level:  level
			});


			API['tabs'].query({
				active:        true,
				currentWindow: true
			}, (chrome_tabs) => {

				let chrome_tab = chrome_tabs[0] || null;
				if (chrome_tab !== null) {

					API['tabs'].reload(chrome_tab.id, () => {
						BUTTONS['confirm'].state('disabled');
					});

				}

			});

		}

	});

	DEFIANT.on('change', (tab) => {
		update.call(DEFIANT, tab);
	});


	window.addEventListener('load', () => {

		API['tabs'].query({
			active:        true,
			currentWindow: true
		}, (chrome_tabs) => {

			let chrome_tab = chrome_tabs[0] || null;
			if (chrome_tab !== null) {

				let tab = DEFIANT.toTab('tab-' + chrome_tab.id) || null;
				if (tab !== null) {
					update.call(DEFIANT, tab);
				}

			}

		});

	});

}

