
import { Element  } from '../design/Element.mjs';
import { DATETIME } from '../source/parser/DATETIME.mjs';
import { URL      } from '../source/parser/URL.mjs';

import { search as search_github } from '../source/site/github.mjs';
import { search as search_reddit } from '../source/site/reddit.mjs';



document.addEventListener('DOMContentLoaded', () => {

	(() => {

		let header = document.querySelector('header');
		if (header !== null) {
			Array.from(header.childNodes).forEach((node) => {
				if (node.nodeName === '#text') {
					node.parentNode.removeChild(node);
				}
			});
		}

	})();

	const CACHE   = [];
	const RESULTS = Element.query('section[id="results"] ul');
	const SEARCH  = {
		query:  Element.query('*[name="query"]'),
		type:   Element.query('*[name="type"]'),
		button: Element.query('*[name="search"]')
	};



	const search = function(data) {

		if (data.query.length > 3) {

			Promise.all([
				search_github(data),
				search_reddit(data)
			]).then((results) => {

				results.flat().forEach((result) => {
					CACHE.push(result);
				});

			}).then(() => {
				update();
			});

		}

	};

	const update = function() {

		RESULTS.query('li', true).forEach((element) => {
			element.destroy();
		});


		let unique = {};

		CACHE.forEach((item) => {

			if (item['url'] !== null) {

				if (unique[item['url']] === undefined) {

					unique[item['url']] = item;

				} else {

					if (unique[item['url']]['score'] < item['score']) {
						unique[item['url']] = item;
					}

				}

			}

		});

		Object.values(unique).sort((a, b) => {

			if (a['datetime'] !== null && b['datetime'] !== null) {
				return DATETIME.compare(b['datetime'], a['datetime']);
			} else if (a['url'] !== null && b['url'] !== null) {
				return URL.compare(a['url'], b['url']);
			}

			return 0;

		}).map((item) => {

			let content = [];

			content.push('<p>');

			if (item['preview'] !== null) {
				content.push('<img src="' + item['preview'] + '"/>');
			}

			if (item['title'] !== null) {
				content.push(item['title']);
			} else if (item['url'] !== null) {
				content.push(item['url']);
			}

			if (item['datetime'] !== null && item['author'] !== null) {
				content.push('<small>at ' + DATETIME.render(item['datetime']) + ' by ' + item['author'] + '</small>');
			} else if (item['datetime'] !== null) {
				content.push('<small>at ' + DATETIME.render(item['datetime']) + '</small>');
			}

			content.push('</p>');
			content.push('<div>');


			if (item['url'] !== null) {
				content.push('<a class="button" href="' + item['url'] + '" target="_blank">Open</a>');
			}

			content.push('</div>');

			return new Element('li', content);

		}).forEach((element) => {
			element.render(RESULTS);
		});

	};



	SEARCH.query.emit('focus');

	SEARCH.query.on('keyup', (e) => {

		let key = e.key.toLowerCase();
		if (key === 'enter') {
			SEARCH.query.emit('blur');
		}

	});

	SEARCH.query.on('blur', () => {

		let value = SEARCH.query.value();
		if (value.startsWith('?') === true) {
			SEARCH.type.value('unknown');
		} else if (value.startsWith('@') === true) {
			SEARCH.type.value('persona');
		} else if (value.startsWith('!') === true) {
			SEARCH.type.value('article');
		} else if (value.startsWith('/') === true) {
			SEARCH.type.value('forum');
		} else if (value.startsWith('#') === true) {
			SEARCH.type.value('topic');
		}

	});

	SEARCH.button.on('click', () => {

		let query = SEARCH.query.value();
		let type  = SEARCH.type.value();

		if (
			query.startsWith('?')
			|| query.startsWith('@')
			|| query.startsWith('!')
			|| query.startsWith('/')
			|| query.startsWith('#')
		) {
			query = query.substr(1);
		}

		search({
			query: query,
			type:  type
		});

	});


	let query = document.location.search || '';
	if (query.length > 1 && query.startsWith('?query=') === true) {

		let value = decodeURIComponent(query.substr(7).split('&').shift());
		if (value.length > 0) {

			SEARCH.query.value(value);
			SEARCH.query.emit('blur');

			setTimeout(() => {
				SEARCH.button.emit('click');
			}, 1000);

		}

	}

}, true);

