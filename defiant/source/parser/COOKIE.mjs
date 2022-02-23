
import { isArray, isBoolean, isBuffer, isNumber, isObject, isString } from '../../extern/base.mjs';
import { DATETIME                                                   } from '../../source/parser/DATETIME.mjs';



const COOKIE = {

	compare: function(a, b) {

		// TODO: Implement cookie comparison algorithm
		return 0;

	},

	isCOOKIE: function(payload) {

		if (
			isObject(payload) === true
			&& isString(payload.name) === true
			&& isString(payload.value) === true
			&& isObject(payload.attributes) === true
		) {

			if (
				(isString(payload.attributes['domain']) === true || payload.attributes['domain'] === null)
				&& (DATETIME.isDATETIME(payload.attributes['expires']) === true || payload.attributes['expires'] === null)
				&& (isNumber(payload.attributes['max-age']) === true || payload.attributes['max-age'] === null)
				&& (isString(payload.attributes['path']) === true || payload.attributes['path'] === null)
				&& isBoolean(payload.attributes['secure']) === true
				&& isBoolean(payload.attributes['httponly']) === true
				&& (
					payload.attributes['samesite'] === 'lax'
					|| payload.attributes['samesite'] === 'strict'
					|| payload.attributes['samesite'] === 'none'
				)
			) {
				return true;
			}

		}


		return false;

	},

	parse: function(buf_or_str) {

		let raw = null;

		if (isBuffer(buf_or_str) === true) {
			raw = buf_or_str.toString('utf8');
		} else if (isString(buf_or_str) === true) {
			raw = buf_or_str;
		}

		let name       = null;
		let value      = null;
		let attributes = {
			'domain':   null,
			'expires':  null,
			'max-age':  null,
			'path':     null,
			'secure':   false,
			'httponly': false,
			'samesite': null
		};

		if (raw.includes(';') === true) {

			let tmp1 = raw.split(';')[0].trim();
			let tmp2 = raw.split(';').slice(1).map((v) => v.trim());

			if (tmp1.includes('=') === true) {

				let tmp_name  = tmp1.split('=')[0].trim();
				let tmp_value = tmp1.split('=').slice(1).join('=').trim();

				if (tmp_name !== '') {
					name  = tmp_name;
					value = tmp_value;
				}

			}

			if (tmp2.length > 0) {

				for (let t = 0, tl = tmp2.length; t < tl; t++) {

					let key = tmp2[t].split('=')[0].trim().toLowerCase();
					let val = tmp2[t].split('=').slice(1).join('=').trim();

					if (key === 'expires') {

						let now = DATETIME.parse(new Date());
						let tmp = DATETIME.parse(new Date(val));

						if (DATETIME.compare(tmp, now) === 1) {

							attributes['expires'] = tmp;

						} else {

							name       = null;
							value      = null;
							attributes = null;

							break;

						}

					} else if (key === 'max-age') {

						let tmp = parseInt(val, 10);
						if (
							Number.isNaN(tmp) === false
							&& tmp > 0
						) {

							attributes['max-age'] = val;

						} else {

							name       = null;
							value      = null;
							attributes = null;

							break;

						}

					} else if (key === 'domain') {

						if (val.startsWith('.') === true) {
							attributes['domain'] = val.substr(1).toLowerCase();
						} else {
							attributes['domain'] = val.toLowerCase();
						}

					} else if (key === 'path') {

						if (val.startsWith('/') === true) {
							attributes['path'] = val;
						} else {
							attributes['path'] = null;
						}

					} else if (key === 'secure') {

						attributes['secure'] = true;

					} else if (key === 'httponly') {

						attributes['httponly'] = true;

					} else if (key === 'samesite') {

						if (val.toLowerCase() === 'lax') {
							attributes['samesite'] = 'lax';
						} else if (val.toLowerCase() === 'strict') {
							attributes['samesite'] = 'strict';
						} else if (val.toLowerCase() === 'none') {
							attributes['samesite'] = 'none';
						}

					}

				}

			}

		} else {

			if (raw.includes('=') === true) {

				let tmp_name  = raw.split('=')[0].trim();
				let tmp_value = raw.split('=').slice(1).join('=').trim();

				if (tmp_name !== '') {
					name  = tmp_name;
					value = tmp_value;
				}

			}

		}


		if (isObject(attributes) === true) {

			if (attributes['samesite'] === null) {
				attributes['samesite'] = 'lax';
			} else if (
				attributes['samesite'] === 'none'
				&& attributes['secure'] !== true
			) {

				name       = null;
				value      = null;
				attributes = null;

			}

		}

		if (isObject(attributes) === true) {

			if (
				isString(name) === true
				&& name.startsWith('__Secure-') === true
				&& attributes['secure'] !== true
			) {

				name       = null;
				value      = null;
				attributes = null;

			}

		}

		if (isObject(attributes) === true) {

			if (
				isString(name) === true
				&& name.startsWith('__Host-') === true
				&& (
					attributes['secure'] !== true
					|| attributes['domain'] !== null
					|| attributes['path'] !== '/'
				)
			) {

				name       = null;
				value      = null;
				attributes = null;

			}

		}


		return {
			name:       name,
			value:      value,
			attributes: attributes
		};

	},

	render: function(cookie) {

		cookie = COOKIE.isCOOKIE(cookie) ? cookie : null;


		if (cookie !== null) {

			let chunks = [
				cookie.name + '=' + cookie.value
			];

			if (DATETIME.isDATETIME(cookie.attributes['expires']) === true) {
				chunks.push('Expires=' + DATETIME.toIMF(cookie.attributes['expires']));
			}

			if (isNumber(cookie.attributes['max-age']) === true) {
				chunks.push('Max-Age=' + cookie.attributes['max-age']);
			}

			if (cookie.attributes['domain'] !== null) {
				chunks.push('Domain=' + cookie.attributes['domain']);
			}

			if (cookie.attributes['path'] !== null) {
				chunks.push('Path=' + cookie.attributes['path']);
			}

			if (cookie.attributes['secure'] === true) {
				chunks.push('Secure');
			}

			if (cookie.attributes['httponly'] === true) {
				chunks.push('HttpOnly');
			}

			if (cookie.attributes['samesite'] !== null) {
				chunks.push('SameSite=' + cookie.attributes['samesite']);
			}

			return chunks.join('; ');

		}


		return null;

	},

	sort: function(array) {

		array = isArray(array) ? array : null;


		if (array !== null) {

			return array.filter((cookie) => {
				return COOKIE.isCOOKIE(cookie) === true;
			}).sort((a, b) => {
				return COOKIE.compare(a, b);
			});

		}


		return [];

	}

};


export { COOKIE };

