
import { isArray } from '../extern/base.mjs';
import { Element } from '../design/Element.mjs';
import { URL     } from '../source/parser/URL.mjs';



const console    = window.console;
// const console    = chrome.extension.getBackgroundPage().console || window.console;
const DEFIANT    = chrome.extension.getBackgroundPage().DEFIANT || null;
const STATISTICS = {};
const TABLES     = {
	'statistics': Element.query('section#statistics table tbody'),
	'levels':     Element.query('section#levels table tbody')
};



if (DEFIANT !== null) {

	if (isArray(DEFIANT.settings.statistics) === true) {

		if (DEFIANT.settings.statistics.length > 0) {

			TABLES['statistics'].query('*', true).forEach((element) => element.erase());

			DEFIANT.settings.statistics.forEach((report) => {

				let stats = STATISTICS[report.domain] || null;
				if (stats === null) {
					stats = STATISTICS[report.domain] = {
						domain:  report.domain,
						level:   report.level,
						blocked: 1
					};
				} else {
					stats.blocked++;
				}

			});

			Object.values(STATISTICS).sort((a, b) => {
				if (a.blocked > b.blocked) return -1;
				if (b.blocked > a.blocked) return  1;
				return 0;
			}).map((report) => {

				return new Element('tr', [
					'<td data-key="domain">' + report.domain + '</td>',
					'<td data-key="level">' + report.level + '</td>',
					'<td data-key="blocked">' + report.blocked + ' requests</td>'
				]);

			}).forEach((element) => {
				element.render(TABLES['statistics']);
			});

		} else {

			let placeholder = TABLES['statistics'].query('td');

			placeholder.value('No blocked Network Traffic yet.');
			placeholder.state('');

		}

	}

	if (isArray(DEFIANT.settings.levels) === true) {

		if (DEFIANT.settings.levels.length > 0) {

			TABLES['levels'].query('*', true).forEach((element) => element.erase());

			DEFIANT.settings.levels.sort((a, b) => {

				let a_url = URL.parse('https://' + a.domain);
				let b_url = URL.parse('https://' + b.domain);

				return URL.compare(a_url, b_url);

			}).map((level) => {

				return new Element('tr', [
					'<td data-key="domain">' + level.domain + '</td>',
					'<td data-key="level">' + level.level + '</td>',
					'<td>',
					'\t<button data-action="remove"></button>',
					'</td>'
				]);

			}).forEach((element) => {

				let button = element.query('[data-action="remove"]');
				let domain = element.query('[data-key="domain"]');

				if (button !== null && domain !== null) {

					button.on('click', () => {

						let found = DEFIANT.settings.levels.find((l) => l.domain === domain.value());
						if (found !== null) {
							DEFIANT.settings.levels.remove(found);
							DEFIANT.storage.save();
						}

						element.erase();

					});

				}

				element.render(TABLES['levels']);

			});

		} else {

			let placeholder = TABLES['levels'].query('td');

			placeholder.value('No configured Trusted Domains yet.');
			placeholder.state('');

		}

	}



	// TODO: Render Options Page and integrate change events
	console.log(DEFIANT.settings);

}

