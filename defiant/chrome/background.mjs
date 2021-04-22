
import { console } from '../extern/base.mjs';
import { Defiant } from '../source/Defiant.mjs';
import { URL     } from '../source/parser/URL.mjs';



const DEFIANT = new Defiant(null, chrome);

setTimeout(() => {

	chrome.tabs.query({
		active: null
	}, (chrome_tabs) => {

		chrome_tabs.forEach((chrome_tab) => {

			let url = URL.parse(chrome_tab.url);
			if (URL.isURL(url) === true) {

				let tab = DEFIANT.toTab('chrome-' + chrome_tab.id);
				if (tab !== null) {
					tab.level = DEFIANT.toLevel(url);
					tab.url   = url;
				}

			}

		});

	});

}, 100);



// Debuggable constants
window.console = console;
window.DEFIANT = DEFIANT;

