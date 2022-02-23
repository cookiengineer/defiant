
import { isArray } from '../extern/base.mjs';
import { API     } from '../extern/extension.mjs';
import { Element } from '../design/Element.mjs';
import { URL     } from '../source/parser/URL.mjs';



const console    = window.console;
// const console    = API['extension'].getBackgroundPage().console || window.console;
const DEFIANT    = API['extension'].getBackgroundPage().DEFIANT || null;
const STATISTICS = {};
const TABLES     = {
	'distributors': Element.query('section#distributors table tbody'),
	'levels':       Element.query('section#levels table tbody'),
	'statistics':   Element.query('section#statistics table tbody')
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
						blocked: [{
							link: report.link,
							type: report.type
						}]
					};
				} else {

					let check = stats.blocked.find((o) => o.link === report.link) || null;
					if (check === null) {

						stats.blocked.push({
							link: report.link,
							type: report.type
						});

					}

				}

			});

			Object.values(STATISTICS).sort((a, b) => {
				if (a.blocked.length > b.blocked.length) return -1;
				if (b.blocked.length > a.blocked.length) return  1;
				return 0;
			}).map((report) => {

				let element = new Element('tr', [
					'<td data-key="domain">' + report.domain + '</td>',
					'<td data-key="level">' + report.level + '</td>',
					'<td data-key="blocked">' + report.blocked.length + ' items</td>'
				]);

				let details = new Element('tr', [
					'<td colspan="3">',
					'\t<table>',
					'\t\t<thead>',
					'\t\t\t<tr>',
					'\t\t\t\t<th>Type</th>',
					'\t\t\t\t<th>Data</th>',
					'\t\t\t</tr>',
					'\t\t</thead>',
					'\t\t<tbody>',
					'\t\t</tbody>',
					'\t</table>',
					'</td>'
				]);

				let table = details.query('tbody');
				if (table !== null) {

					report.blocked.map((data) => {

						return new Element('tr', [
							'<td>' + data.type + '</td>',
							'<td title="' + data.link + '">' + data.link + '</td>'
						]);

					}).forEach((element) => {
						element.render(table);
					});

				}

				details.attr('data-visible', 'false');

				element.on('click', () => {

					let visible = details.attr('data-visible');
					if (visible === true) {
						details.attr('data-visible', false);
					} else {
						details.attr('data-visible', true);
					}

				});

				return [ element, details ];

			}).forEach((elements) => {

				elements.forEach((element) => {
					element.render(TABLES['statistics']);
				});

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
					'<td><button data-action="remove"></button></td>'
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

	if (isArray(DEFIANT.settings.distributors) === true) {

		if (DEFIANT.settings.distributors.length > 0) {

			TABLES['distributors'].query('*', true).forEach((element) => element.erase());

			DEFIANT.settings.distributors.sort((a, b) => {

				let a_url = URL.parse('https://' + a.domain);
				let b_url = URL.parse('https://' + b.domain);

				return URL.compare(a_url, b_url);

			}).map((level) => {

				return new Element('tr', [
					'<td data-key="domain">' + level.domain + '</td>',
					'<td><button data-action="remove"></button></td>'
				]);

			}).forEach((element) => {

				let button = element.query('[data-action="remove"]');
				let domain = element.query('[data-key="domain"]');

				if (button !== null && domain !== null) {

					button.on('click', () => {

						let found = DEFIANT.settings.distributors.find((d) => d.domain === domain.value());
						if (found !== null) {
							DEFIANT.settings.distributors.remove(found);
							DEFIANT.storage.save();
						}

						element.erase();

					});

				}

				element.render(TABLES['distributors']);

			});

		}

	}

}

