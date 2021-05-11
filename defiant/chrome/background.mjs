
import { console, isString } from '../extern/base.mjs';
import { Defiant           } from '../source/Defiant.mjs';
import { URL               } from '../source/parser/URL.mjs';



const DEFIANT = new Defiant(null, chrome);



chrome.runtime.onMessage.addListener((request, sender, callback) => {

	if (request.type === 'content-init') {

		let settings = {
			distributors: DEFIANT.settings.distributors,
			levels:       []
		};

		let level = null;

		if (isString(request.data.link) === true) {
			level = DEFIANT.toLevel(URL.parse(request.data.link));
		}

		if (level !== null) {
			settings.levels.push(level);
		}

		callback({
			settings: settings
		});

	} else if (request.type === 'content-report') {

		let domain = request.data.domain || null;
		let link   = request.data.link   || null;
		let level  = request.data.level  || 'zero';
		let type   = request.data.type   || null;

		if (
			isString(domain) === true
			&& isString(link) === true
			&& isString(level) === true
			&& isString(type) ===  true
		) {

			console.log('report', request.data);

			DEFIANT.settings.statistics.push({
				domain: domain,
				level:  level,
				link:   link,
				type:   type
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

	chrome.tabs.onActivated.addListener((info) => {

		chrome.tabs.get(info.tabId, (chrome_tab) => {

			if (chrome_tab !== undefined) {

				let tab = DEFIANT.toTab('chrome-' + chrome_tab.id);
				if (tab !== null) {
					DEFIANT.tab = tab;
				}

			}

		});

	});

	chrome.tabs.onUpdated.addListener((tab_id, changes) => {

		if (typeof changes.url === 'string') {

			let url = URL.parse(changes.url);
			if (URL.isURL(url) === true) {

				let tab = DEFIANT.toTab('chrome-' + tab_id);
				if (tab !== null) {
					tab.level = DEFIANT.toLevel(url);
					tab.url   = url;
				}

			}

		}

	});

	chrome.tabs.onRemoved.addListener((tab_id) => {

		for (let t = 0, tl = DEFIANT.tabs.length; t < tl; t++) {

			let tab = DEFIANT.tabs[t];
			if (tab.id === 'chrome-' + tab_id) {
				DEFIANT.tabs.splice(t, 1);
				tl--;
				t--;
			}

		}

	});

}, 100);



// Debuggable constants
window.console = console;
window.DEFIANT = DEFIANT;

