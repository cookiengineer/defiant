
import { URL } from '../../source/parser/URL.mjs';



export const redirect = function(link) {

	let url = URL.parse(link);

	if (
		url.domain === 'imgur.com'
		&& url.subdomain === 'i'
		&& url.path.endsWith('.gifv') === true
	) {

		url.path = url.path.replace('.gifv', '.mp4');

		return URL.render(url);

	}

	return null;

};

export const search = function(search) {

	return new Promise((resolve) => {

		// TODO: Search
		resolve([]);

	});

};

