
import { console, isArray, isObject, isString } from '../extern/base.mjs';
import { API                                  } from '../extern/extension.mjs';
import { Defiant                              } from '../source/Defiant.mjs';
import { URL                                  } from '../source/parser/URL.mjs';



const DEFIANT = new Defiant(null, API);



API['runtime'].onMessage.addListener((request, sender, callback) => {

	if (request.type === 'initialize') {

		let settings = {
			blockers:     DEFIANT.settings.blockers,
			distributors: DEFIANT.settings.distributors,
			levels:       []
		};


		if (
			isObject(request.data) === true
			&& isArray(request.data.domains) === true
		) {

			request.data.domains.forEach((domain) => {

				let level = DEFIANT.toLevel(domain);
				console.log(level);
				if (level !== null) {
					settings.levels.push(level);
				}

			});

		}

		callback({
			settings: settings
		});

	} else if (request.type === 'report') {

		// TODO: Integrate Content Blocker Reporting
		// console.log('REPORT', request);

		// let domain = request.data.domain || null;
		// let link   = request.data.link   || null;
		// let level  = request.data.level  || 'zero';
		// let type   = request.data.type   || null;

		// if (
		// 	isString(domain) === true
		// 	&& isString(link) === true
		// 	&& isString(level) === true
		// 	&& isString(type) ===  true
		// ) {

		// 	console.log('report', request.data);

		// 	DEFIANT.settings.statistics.push({
		// 		domain: domain,
		// 		level:  level,
		// 		link:   link,
		// 		type:   type
		// 	});

		// 	DEFIANT.storage.save();

		// }

	}

});

setTimeout(() => {

	API['tabs'].query({
		active: null
	}, (chrome_tabs) => {

		chrome_tabs.forEach((chrome_tab) => {

			let url = URL.parse(chrome_tab.url);
			if (URL.isURL(url) === true) {

				let tab = DEFIANT.toTab('tab-' + chrome_tab.id);
				if (tab !== null) {
					tab.level = DEFIANT.toLevel(URL.toDomain(url));
					tab.url   = url;
				}

			}

		});

	});

	API['tabs'].onActivated.addListener((info) => {

		API['tabs'].get(info.tabId, (chrome_tab) => {

			if (chrome_tab !== undefined) {

				let tab = DEFIANT.toTab('tab-' + chrome_tab.id);
				if (tab !== null) {
					DEFIANT.tab = tab;
				}

			}

		});

	});

	API['tabs'].onUpdated.addListener((tab_id, changes) => {

		if (typeof changes.url === 'string') {

			let url = URL.parse(changes.url);
			if (URL.isURL(url) === true) {

				let tab = DEFIANT.toTab('tab-' + tab_id);
				if (tab !== null) {
					tab.level = DEFIANT.toLevel(URL.toDomain(url));
					tab.url   = url;
				}

			}

		}

	});

	API['tabs'].onRemoved.addListener((tab_id) => {

		for (let t = 0, tl = DEFIANT.tabs.length; t < tl; t++) {

			let tab = DEFIANT.tabs[t];
			if (tab.id === 'tab-' + tab_id) {
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

