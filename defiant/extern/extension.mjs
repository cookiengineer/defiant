
export const API = (() => {

	if (typeof browser !== 'undefined') {

		return Object.assign({}, browser, {
			[Symbol.for('BROWSER')]: 'Firefox'
		});

	} else if (typeof chrome !== 'undefined') {

		return Object.assign({}, chrome, {
			[Symbol.for('BROWSER')]: 'Chrome'
		});

	}

	return null;

})();

