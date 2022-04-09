
import { isArray, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                              } from '../../source/parser/DATETIME.mjs';
import { URL                                   } from '../../source/parser/URL.mjs';
import EMOJIS                                    from '../../source/site/_emojis.mjs';



const toItem = function(data) {

	let item = {
		author:   null,
		datetime: null,
		preview:  null,
		score:    0,
		title:    null,
		url:      null
	};

	if (isString(data['html_url']) === true) {
		item['url'] = data['html_url'];
	}

	if (isString(data['description']) === true) {

		let description = data['description'];

		if (description.includes(':') === true) {
			EMOJIS.forEach((emoji) => {

				if (description.includes(':' + emoji.code + ':') === true) {
					description = description.split(':' + emoji.code + ':').join(emoji.emoji);
				}

			});
		}

		item['title'] = description;

	}

	if (
		isObject(data['owner']) === true
		&& isString(data['owner']['login']) === true
		&& isString(data['owner']['avatar_url']) === true
	) {
		item['author']  = data['owner']['login'];
		item['preview'] = data['owner']['avatar_url'];
	}

	if (isString(data['pushed_at']) === true) {
		item['datetime'] = DATETIME.parse(new Date(data['pushed_at']));
	} else if (isString(data['updated_at']) === true) {
		item['datetime'] = DATETIME.parse(new Date(data['updated_at']));
	}

	if (
		isNumber(data['stargazers_count']) === true
		&& isNumber(data['watchers_count']) === true
	) {
		item['score'] = data['stargazers_count'] + data['watchers_count'];
	}

	return item;

};


const transform = function(data) {

	let filtered = [];


	if (isArray(data) === true) {

		data.map((item) => toItem(item)).forEach((item) => {
			filtered.push(item);
		});

	}

	return filtered;

};


export const redirect = function(url) {

	return null;

};

export const search = function(search) {

	return new Promise((resolve) => {

		if (search.type === 'persona') {

			fetch('https://api.github.com/users/' + search.query).then((response) => {
				return response.json();
			}).then((data) => {

				if (isString(data['message']) === false) {

					fetch('https://api.github.com/users/' + search.query + '/repos?per_page=100').then((response) => {
						return response.json();
					}).then((data) => {
						return transform(data);
					}).then((data) => {
						return data.filter((item) => item['author'] === search.query);
					}).then((data) => {
						return resolve(data);
					});

				} else {

					resolve([]);

				}

			});

		} else if (search.type === 'forum') {

			// Use search api for discussions specifically

		} else if (search.type === 'article') {

			// Use search api for wikis specifically

		} else if (search.type === 'topic') {

			// Use search api for topics specifically

		} else if (search.type === 'unknown') {

			// TODO: Check github API for users

		}

	});

};

