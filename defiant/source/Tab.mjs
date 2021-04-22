
import { isObject, isString } from '../extern/base.mjs';
import { URL                } from '../source/parser/URL.mjs';
import { isLevel            } from '../source/Defiant.mjs';



export const isTab = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Tab]';
};



let CURRENT_ID = 0;

const Tab = function(settings) {

	settings = isObject(settings) ? settings : {};


	settings = Object.freeze({
		id:    isString(settings.id)   ? settings.id    : ('' + CURRENT_ID++),
		level: isLevel(settings.level) ? settings.level : null,
		url:   URL.isURL(settings.url) ? settings.url   : null,
	});


	this.id    = settings.id;
	this.level = null;
	this.url   = URL.parse('chrome://new-tab-page');


	if (isLevel(settings.level) === true) {
		this.level = settings.level;
	}

	if (URL.isURL(settings.url) === true) {
		this.url = settings.url;
	}

};


Tab.from = function(json) {

	json = isObject(json) ? json : null;


	if (json !== null) {

		let type = json.type === 'Tab' ? json.type : null;
		let data = isObject(json.data) ? json.data : null;

		if (type !== null && data !== null) {

			let tab = new Tab();

			if (isString(data.id) === true) {
				tab.id = data.id;
			}

			if (isLevel(data.level) === true) {
				tab.level = data.level;
			}

			if (isString(data.url) === true) {
				tab.url = URL.parse(data.url);
			} else if (URL.isURL(data.url) === true) {
				tab.url = data.url;
			}

			return tab;

		}

	}


	return null;

};


Tab.isTab = isTab;


Tab.prototype = {

	[Symbol.toStringTag]: 'Tab',

	toJSON: function() {

		let data = {
			id:    this.id,
			level: null,
			url:   URL.render(this.url)
		};


		if (this.level !== null) {
			data.level = this.level;
		}


		return {
			'type': 'Tab',
			'data': data
		};

	}

};


export { Tab };

