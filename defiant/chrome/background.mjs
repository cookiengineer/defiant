
import { console, isString } from '../extern/base.mjs';
import { Defiant           } from '../source/Defiant.mjs';
import { URL               } from '../source/parser/URL.mjs';



const DEFIANT = new Defiant(null, chrome);

chrome.runtime.onMessage.addListener((request, sender, callback) => {

	let data = null;

	if (request.type === 'init') {

		let link = request.data.link || null;

		if (isString(link) === true) {
			data = DEFIANT.toLevel(URL.parse(link));
		}

		callback({
			data: data
		});

	} else if (request.type === 'notification') {

		let link  = request.data.link  || null;
		let level = request.data.level || null;
		let type  = request.data.type  || null;

		if (isString(link) === true) {

			DEFIANT.settings.notifications.push({
				level: level,
				link:  link,
				type:  type
			});

			DEFIANT.storage.save();

		}

	}

});

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

