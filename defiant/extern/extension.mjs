
export const API = (() => {

	if (typeof browser !== 'undefined') {
		return browser;
	} else if (typeof chrome !== 'undefined') {
		return chrome;
	}

	return null;

})();

