
import esbuild from 'esbuild';
import path    from 'path';
import process from 'process';
import url     from 'url';



import { _, console, copy, exec, exec_then_kill, mktemp, read, remove, write } from './extern/make.mjs';

const isBoolean = (obj) => Object.prototype.toString.call(obj) === '[object Boolean]';
const isObject  = (obj) => Object.prototype.toString.call(obj) === '[object Object]';
const isString  = (obj) => Object.prototype.toString.call(obj) === '[object String]';

const CACHE  = {};
const FILE   = url.fileURLToPath(import.meta.url);
const ROOT   = path.dirname(path.resolve(FILE, '../'));
const TARGET = ROOT;

const SIGNING_KEY = (() => {

	let signing_key = null;

	if (
		isObject(process.env) === true
		&& isString(process.env.SIGNING_KEY) === true
		&& process.env.SIGNING_KEY.endsWith('/.pem') === true
	) {
		signing_key = process.env.SIGNING_KEY;
	}

	return signing_key;

})();

const STEALTH = (() => {

	let stealth = null;

	if (
		isObject(process.env) === true
		&& isString(process.env.STEALTH) === true
	) {

		stealth = process.env.STEALTH;

	} else {

		if (ROOT.endsWith('/Software/cookiengineer/defiant') === true) {
			stealth = ROOT.substr(0, ROOT.length - 31) + '/Software/tholian-network/stealth';
		}

	}

	if (stealth !== null) {

		let pkg_json = null;

		try {
			pkg_json = JSON.parse(read(stealth + '/package.json').buffer.toString('utf8'));
		} catch (err) {
			pkg_json = null;
		}

		if (
			isObject(pkg_json) === true
			&& isString(pkg_json['name']) === true
			&& pkg_json['name'] === 'stealth'
		) {
			return stealth;
		}

	}


	return null;

})();



export const clean = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] !== false) {

		CACHE[target] = false;


		console.info('defiant: clean("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			[
				remove(target + '/defiant/content/block.bundle.js'),
				remove(target + '/defiant/content/clean.bundle.js')
			].forEach((result) => results.push(result));

		} else {

			[
				remove(target + '/defiant/content/block.bundle.js'),
				remove(target + '/defiant/content/clean.bundle.js'),
				remove(target + '/defiant/chrome'),
				remove(target + '/defiant/content'),
				remove(target + '/defiant/design'),
				remove(target + '/defiant/extern'),
				remove(target + '/defiant/manifest.json'),
				remove(target + '/defiant/source')
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			return true;

		} else {

			console.error('defiant: clean("' + _(target) + '"): fail');

			return false;

		}

	}


	return true;

};

const bundle = (origin, target) => {

	let result = esbuild.buildSync({
		entryPoints: [ origin ],
		bundle:      true,
		outfile:     target
	});

	if (result.errors.length === 0) {
		return true;
	}


	return false;

};

const build = async (target) => {

	target = isString(target) ? target : TARGET;


	if (CACHE[target] === true) {

		console.warn('defiant: build("' + _(target) + '"): skip');

		return true;

	} else if (CACHE[target] !== true) {

		console.info('defiant: build("' + _(target) + '")');

		let results = [];

		if (target === TARGET) {

			if (STEALTH !== null) {

				[
					copy(STEALTH + '/stealth/source/parser/DATETIME.mjs', target + '/defiant/source/parser/DATETIME.mjs'),
					copy(STEALTH + '/stealth/source/parser/IP.mjs',       target + '/defiant/source/parser/IP.mjs'),
					copy(STEALTH + '/stealth/source/parser/UA.mjs',       target + '/defiant/source/parser/UA.mjs'),
					copy(STEALTH + '/stealth/source/parser/URL.mjs',      target + '/defiant/source/parser/URL.mjs'),
				].forEach((result) => results.push(result));

			} else {

				console.error('defiant: build("' + _(target) + '")');
				console.error('Cannot find Stealth codebase. Use export STEALTH="/path/to/stealth".');

			}

			[
				bundle(ROOT + '/defiant/content/block.mjs', target + '/defiant/content/block.bundle.js'),
				bundle(ROOT + '/defiant/content/clean.mjs', target + '/defiant/content/clean.bundle.js'),
			].forEach((result) => results.push(result));

		} else {

			if (STEALTH !== null) {

				[
					copy(STEALTH + '/stealth/source/parser/DATETIME.mjs', target + '/defiant/source/parser/DATETIME.mjs'),
					copy(STEALTH + '/stealth/source/parser/IP.mjs',       target + '/defiant/source/parser/IP.mjs'),
					copy(STEALTH + '/stealth/source/parser/UA.mjs',       target + '/defiant/source/parser/UA.mjs'),
					copy(STEALTH + '/stealth/source/parser/URL.mjs',      target + '/defiant/source/parser/URL.mjs'),
				].forEach((result) => results.push(result));

			} else {

				console.error('defiant: build("' + _(target) + '")');
				console.error('Cannot find Stealth codebase. Use export STEALTH="/path/to/stealth".');

			}

			[
				copy(ROOT + '/defiant/chrome',              target + '/defiant/chrome'),
				copy(ROOT + '/defiant/content',             target + '/defiant/content'),
				copy(ROOT + '/defiant/design',              target + '/defiant/design'),
				copy(ROOT + '/defiant/extern',              target + '/defiant/extern'),
				copy(ROOT + '/defiant/manifest.json',       target + '/defiant/manifest.json'),
				copy(ROOT + '/defiant/source',              target + '/defiant/source'),
				bundle(ROOT + '/defiant/content/block.mjs', target + '/defiant/content/block.bundle.js'),
				bundle(ROOT + '/defiant/content/clean.mjs', target + '/defiant/content/clean.bundle.js'),
			].forEach((result) => results.push(result));

		}


		if (results.includes(false) === false) {

			CACHE[target] = true;

			return true;

		} else {

			console.error('stealth: build("' + _(target) + '"): fail');

			return false;

		}

	}


	return false;

};

const pack = async (target) => {

	target = isString(target) ? target : TARGET;


	console.info('defiant: pack("' + _(target) + '")');

	let results = [];


	let sandbox_chromium = mktemp('defiant-chromium');
	if (sandbox_chromium !== null) {

		if (SIGNING_KEY !== null) {

			// Chromium Extension
			[
				build(sandbox_chromium),
				remove(sandbox_chromium + '/defiant/extern/make.mjs'),
				exec('chromium --pack-extension=./defiant --pack-extension-key="' + SIGNING_KEY + '" --no-message-box', {
					cwd: sandbox_chromium
				})
			].forEach((result) => {
				results.push(result);
			});

		} else {

			// Chromium Extension
			[
				build(sandbox_chromium),
				remove(sandbox_chromium + '/defiant/extern/make.mjs'),
				exec('chromium --pack-extension=./defiant --no-message-box', {
					cwd: sandbox_chromium
				})
			].forEach((result) => {
				results.push(result);
			});

		}

	}


	// let sandbox_firefox = mktemp('defiant-firefox');
	// TODO: Generate Firefox Extension file


	if (results.includes(false) === false) {

		return true;

	} else {

		console.error('defiant: pack("' + _(target) + '"): fail');

		return false;

	}

};

const patch_chromium_settings = (profile) => {

	let preferences = null;

	try {
		preferences = JSON.parse(read(profile + '/Default/Preferences').buffer.toString('utf8'));
	} catch (err) {
		preferences = null;
	}

	if (isObject(preferences) === true) {

		if (isObject(preferences['extensions']) === false) {
			preferences['extensions'] = {};
		}

		if (isObject(preferences['extensions']['ui']) === false) {
			preferences['extensions']['ui'] = {};
		}

		if (isBoolean(preferences['extensions']['ui']['developer_mode']) === false) {
			preferences['extensions']['ui']['developer_mode'] = true;
		}


		if (preferences['extensions']['ui']['developer_mode'] === false) {
			preferences['extensions']['ui']['developer_mode'] = true;
		}

	}

	let result = write(profile + '/Default/Preferences', Buffer.from(JSON.stringify(preferences), 'utf8'));
	if (result === true) {
		return true;
	}


	return false;

};

const test = async (target) => {

	target = isString(target) ? target : TARGET;


	console.info('defiant: test("' + _(target) + '")');

	let results = [
		await build(target)
	];

	let sandbox_chromium = mktemp('defiant-chromium-profile');
	if (sandbox_chromium !== null) {

		[
			await exec_then_kill('chromium --user-data-dir="' + sandbox_chromium + '"'),
			patch_chromium_settings(sandbox_chromium),
			exec([
				'chromium',
				'--user-data-dir="' + sandbox_chromium + '"',
				'--load-extension="' + target + '/defiant"',
				'--force-devtools-available'
			].join(' '), {
				cwd: sandbox_chromium
			})
		].forEach((result) => {
			results.push(result);
		});

	} else {
		results.push(false);
	}


	if (results.includes(false) === false) {

		return true;

	} else {

		console.error('defiant: test("' + _(target) + '"): fail');

		return false;

	}

};



(async (args) => {

	if (args.includes(FILE) === true) {

		let results = [];

		if (args.includes('clean')) {
			CACHE[target] = true;
			results.push(await clean());
		}

		if (args.includes('build')) {
			results.push(await build());
		}

		if (args.includes('test')) {
			results.push(await test());
		}

		if (args.includes('pack')) {

			let folder = args.find((v) => v.includes('/') && v !== FILE) || null;
			if (folder !== null) {

				let sandbox = null;

				try {
					sandbox = path.resolve(ROOT, folder);
				} catch (err) {
					sandbox = null;
				}

				if (sandbox !== null) {

					results.push(await pack(sandbox));

				} else {

					console.error('Invalid parameter "' + folder + '". Please use a correct path.');
					results.push(false);

				}

			} else {
				results.push(await pack());
			}

		}

		if (results.length === 0) {

			CACHE[target] = true;
			results.push(await clean());
			results.push(await build());

			// XXX: Don't pack by default
			// results.push(await pack());

		}


		if (results.includes(false) === false) {
			process.exit(0);
		} else {
			process.exit(1);
		}

	}

})(process.argv.slice(1));

