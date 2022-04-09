
import { isArray, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                              } from '../../source/parser/DATETIME.mjs';
import { URL                                   } from '../../source/parser/URL.mjs';



const KIND = {
	't1': 'Comment',
	't2': 'Account',
	't3': 'Link',
	't4': 'Message',
	't5': 'Subreddit',
	't6': 'Award'
};



const toItem = function(data) {

	let item = {
		author:   null,
		datetime: null,
		kind:     null,
		preview:  null,
		score:    0,
		title:    null,
		url:      null
	};

	if (isString(data['kind']) === true) {
		item['kind'] = KIND[data['kind']] || null;
	}

	if (isObject(data['data']) === true) {

		if (isString(data['data']['author']) === true) {
			item['author'] = data['data']['author'];
		}

		if (isNumber(data['data']['created_utc']) === true) {
			item['datetime'] = DATETIME.parse(new Date(data['data']['created_utc'] * 1000));
		}

		if (
			isString(data['data']['thumbnail']) === true
			&& data['data']['thumbnail'].startsWith('https://') === true
		) {
			item['preview'] = data['data']['thumbnail'];
		}

		if (isString(data['data']['title']) === true) {
			item['title'] = data['data']['title'];
		}

		if (isNumber(data['data']['upvote_ratio']) === true) {
			item['score'] = data['data']['upvote_ratio'];
		}

		if (isString(data['data']['url']) === true) {
			item['url'] = data['data']['url'];
		}

	}

	return item;

};

const transform = function(data, kinds) {

	let filtered = [];

	if (
		isObject(data) === true
		&& isString(data['kind']) === true
		&& data['kind'] === 'Listing'
		&& isObject(data['data'])
	) {

		if (isArray(data['data']['children']) === true) {

			data['data']['children'].map((item) => toItem(item)).forEach((item) => {

				if (kinds.includes(item.kind) === true) {
					filtered.push(item);
				}

			});

		}

	}

	return filtered;

};

export const redirect = function(url) {

	return null;

};

export const search = function(search) {

	return new Promise((resolve) => {

		if (search.type === 'persona') {

			fetch('https://www.reddit.com/user/' + search.query + '/submitted.json?sort=top&t=all&limit=100').then((response) => {
				return response.json();
			}).then((data) => {
				return transform(data, [ 'Comment', 'Link' ]);
			}).then((data) => {
				return data.filter((item) => item['author'] === search.query);
			}).then((data) => {
				return resolve(data.map((item) => {
					delete item.kind;
					return item;
				}));
			});

		} else if (search.type === 'forum') {

			fetch('https://www.reddit.com/r/' + search.query + '/top.json?t=week&limit=100').then((response) => {
				return response.json();
			}).then((data) => {
				return transform(data, [ 'Link' ]);
			}).then((data) => {
				return resolve(data.map((item) => {
					delete item.kind;
					return item;
				}));
			});

		} else if (search.type === 'article') {

			resolve([]);

		} else if (search.type === 'topic') {

			fetch('https://www.reddit.com/search.json?q=' + search.query + '&include_over_18=on&t=week&limit=100').then((response) => {
				return response.json();
			}).then((data) => {
				return transform(data, [ 'Link' ]);
			}).then((data) => {
				return resolve(data.map((item) => {
					delete item.kind;
					return item;
				}));
			});

		} else if (search.type === 'unknown') {

			fetch('https://www.reddit.com/search.json?q=' + search.query + '&include_over_18=on&t=week&limit=100').then((response) => {
				return response.json();
			}).then((data) => {
				return transform(data, [ 'Link' ]);
			}).then((data) => {
				return resolve(data.map((item) => {
					delete item.kind;
					return item;
				}));
			});

		}

	});

};

