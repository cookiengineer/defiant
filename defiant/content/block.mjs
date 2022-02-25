
// XXX: Bundled via esbuild //
import { isArray, isFunction, isObject, isString } from '../extern/base.mjs';
import { API                                     } from '../extern/extension.mjs';
import { URL                                     } from '../source/parser/URL.mjs';



const UUID = (() => ([
	((Math.random() * 0xff) | 0).toString(16),
	((Math.random() * 0xff) | 0).toString(16),
	((Math.random() * 0xff) | 0).toString(16),
	((Math.random() * 0xff) | 0).toString(16),
	((Math.random() * 0xff) | 0).toString(16)
].join('').toLowerCase()))();

const ORIGIN = {
	url:    URL.parse(window.location.href),
	domain: URL.toDomain(URL.parse(window.location.href)),
	level:  null
};



const NX74205 = window.NX74205 = (function() {

	const Defiant = function() {

		this.settings = {
			blockers:     [],
			distributors: [],
			filters:      [],
			identities:   [],
			levels:       []
		};

	};


	Defiant.prototype = {

		initialize: function(domains, callback) {

			domains  = isArray(domains)     ? domains  : [];
			callback = isFunction(callback) ? callback : null;


			if (domains.includes(ORIGIN.domain) === false) {
				domains.push(ORIGIN.domain);
			}


			API['runtime'].sendMessage({
				type: 'initialize',
				data: {
					domains: domains
				}
			}, (response) => {

				if (
					isObject(response) === true
					&& isObject(response.settings) === true
				) {

					this.settings.blockers     = response.settings.blockers;
					this.settings.distributors = response.settings.distributors;
					this.settings.levels       = response.settings.levels;

				}

				ORIGIN.level = this.toLevel(ORIGIN.domain);

				if (callback !== null) {
					callback(this);
				}

			});

		},

		report: function(data) {

			API['runtime'].sendMessage({
				type: 'report',
				data: data
			});

		},

		toLevel: function(domain) {

			domain = isString(domain) ? domain : null;


			if (domain !== null) {

				let levels = this.settings.levels.filter((l) => URL.isDomain(l.domain, domain));
				if (levels.length > 1) {

					return levels.sort((a, b) => {
						if (a.domain.length > b.domain.length) return -1;
						if (b.domain.length > a.domain.length) return  1;
						return 0;
					})[0];

				} else if (levels.length === 1) {

					return levels[0];

				} else {

					return {
						domain: domain,
						level:  'zero'
					};

				}

			}


			return null;

		},

		isBlocked: function(domain) {

			domain = isString(domain) ? domain : null;


			if (domain !== null) {

				let blocker = this.settings.blockers.find((b) => this.isDomain(b.domain, domain)) || null;
				if (blocker !== null) {
					return true;
				}

			}


			return false;

		},

		isDomain: function(domain, other) {

			domain = isString(domain) ? domain : null;
			other  = isString(other)  ? other  : null;

			if (domain !== null && other !== null) {

				if (
					other === domain
					|| other.endsWith('.' + domain) === true
				) {
					return true;
				}

			}


			return false;

		},

		isCDN: function(domain) {

			domain = isString(domain) ? domain : null;


			if (domain !== null) {

				let distributor = this.settings.distributors.find((d) => d.domain === domain) || null;
				if (distributor !== null) {
					return true;
				}

			}


			return false;

		}

	};


	return new Defiant();

})();



const DOMINION = (function() {

	const resolve_url = (urls) => {

		urls = isArray(urls) ? urls : [];


		if (urls.length > 0) {

			let filtered = urls.map((href) => {

				if (isString(href) === true) {

					href = href.trim();

					if (
						href.startsWith('https://')
						|| href.startsWith('http://')
					) {
						return URL.parse(href);
					} else if (
						href.startsWith('//')
					) {
						return URL.resolve(ORIGIN.url.protocol + ':' + href);
					} else if (
						href.startsWith('/')
						|| href.startsWith('./')
					) {
						return URL.resolve(ORIGIN.url, href);
					} else {
						return URL.resolve(ORIGIN.url, './' + href);
					}

				}


				return null;

			}).filter((url) => {
				return url !== null;
			});

			if (filtered.length > 0) {
				return filtered[0];
			}

		}


		return null;

	};



	const DOMINION = {

		destroy: function(node, DEFIANT) {

			let level = 'zero';

			if (ORIGIN.level !== null) {
				level = ORIGIN.level.level;
			}


			if (node.tagName === 'META') {

				if (node.getAttribute('http-equiv') !== null) {

					let redirect = null;
					let domain   = null;
					let header   = node.getAttribute('http-equiv').toLowerCase();
					let content  = node.getAttribute('data-' + UUID + '-content');

					if (header === 'location' && content !== null) {
						redirect = URL.parse(content);
						domain   = URL.toDomain(redirect);
					} else if (header === 'refresh') {
						redirect = URL.parse(content.split('; url=').pop());
						domain   = URL.toDomain(redirect);
					}

					if (
						(
							header === 'location'
							|| header === 'refresh'
						) && domain !== null
					) {

						if (level === 'zero' || level === 'alpha') {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   redirect.link,
								type:   'redirect'
							});

							node.parentNode.removeChild(node);

							return false;

						} else if (level === 'beta') {

							if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

								node.setAttribute('content', content);

								return true;

							} else {

								DEFIANT.report({
									domain: domain,
									level:  level,
									link:   redirect.link,
									type:   'redirect'
								});

								node.parentNode.removeChild(node);

								return false;

							}

						} else if (level === 'gamma') {

							node.setAttribute('content', content);

							return true;

						}

					}

				}

				return true;

			} else if (node.tagName === 'LINK') {

				if (node.getAttribute('rel') !== null) {

					let rel    = node.getAttribute('rel').toLowerCase();
					let href   = node.getAttribute('data-' + UUID + '-href');
					let source = URL.parse(href);
					let domain = URL.toDomain(source);

					if (
						(
							rel === 'dns-prefetch'
							|| rel === 'modulepreload'
							|| rel === 'preconnect'
							|| rel === 'prefetch'
							|| rel === 'preload'
							|| rel === 'prerender'
						)
						&& domain !== null
					) {

						if (level === 'zero' || level === 'alpha') {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   source.link,
								type:   'prefetch'
							});

							node.parentNode.removeChild(node);

							return false;

						} else if (level === 'beta') {

							if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

								node.setAttribute('href', href);

								return true;

							} else if (DEFIANT.isCDN(domain) === true) {

								node.setAttribute('href', href);

								return true;

							} else {

								DEFIANT.report({
									domain: domain,
									level:  level,
									link:   source.link,
									type:   'prefetch'
								});

								node.parentNode.removeChild(node);

								return false;

							}

						} else if (level === 'gamma') {

							node.setAttribute('href', href);

							return true;

						}

					} else if (rel === 'stylesheet' && domain !== null) {

						if (level === 'zero' || level === 'alpha' || level === 'beta') {

							if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

								node.setAttribute('href', href);

								return true;

							} else if (DEFIANT.isCDN(domain) === true) {

								node.setAttribute('href', href);

								return true;

							} else {

								DEFIANT.report({
									domain: domain,
									level:  level,
									link:   source.link,
									type:   'style'
								});

								node.parentNode.removeChild(node);

								return false;

							}

						} else if (level === 'gamma') {

							node.setAttribute('href', href);

							return true;

						}

					}

				}

				return true;

			} else if (node.tagName === 'FRAME' || node.tagName === 'IFRAME') {

				let src    = node.getAttribute('data-' + UUID + '-src');
				let source = URL.parse(src);
				let domain = URL.toDomain(source);

				if (domain !== null) {

					if (level === 'zero' || level === 'alpha') {

						DEFIANT.report({
							domain: domain,
							level:  level,
							link:   source.link,
							type:   'frame'
						});

						node.parentNode.removeChild(node);

						return false;

					} else if (level === 'beta') {

						if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

							node.setAttribute('src', src);

							return true;

						} else {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   source.link,
								type:   'prefetch'
							});

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (level === 'gamma') {

						node.setAttribute('src', src);

						return true;

					}

				}

			} else if (node.tagName === 'SCRIPT') {

				let src     = node.getAttribute('data-' + UUID + '-src');
				let content = node.getAttribute('data-' + UUID + '-content');
				let source  = null;
				let domain  = null;

				if (src !== null) {
					source = URL.parse(src);
					domain = URL.toDomain(source);
				} else if (content !== null) {
					source = ORIGIN.url;
					domain = ORIGIN.domain;
				}

				if (domain !== null) {

					if (level === 'zero') {

						DEFIANT.report({
							domain: domain,
							level:  level,
							link:   source.link,
							type:   'script'
						});

						node.parentNode.removeChild(node);

						return false;

					} else if (level === 'alpha' || level === 'beta') {

						if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

							if (src !== null) {
								node.setAttribute('src', src);
							} else if (content !== null) {
								node.textContent = content;
							}

							return true;

						} else if (DEFIANT.isCDN(domain) === true) {

							if (src !== null) {
								node.setAttribute('src', src);
							} else if (content !== null) {
								node.textContent = content;
							}

							return true;

						} else {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   source.link,
								type:   'script'
							});

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (level === 'gamma') {

						if (src !== null) {
							node.setAttribute('src', src);
						} else if (content !== null) {
							node.textContent = content;
						}

						return true;

					}

				}

			} else if (node.tagName === 'IMG' || node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {

				let src    = node.getAttribute('data-' + UUID + '-src');
				let source = URL.parse(src);
				let domain = URL.toDomain(source);

				if (domain !== null) {

					if (level === 'zero') {

						if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

							node.setAttribute('src', src);

							return true;

						} else {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   source.link,
								type:   'media'
							});

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (level === 'alpha' || level === 'beta') {

						if (DEFIANT.isDomain(ORIGIN.domain, domain) === true) {

							node.setAttribute('src', src);

							return true;

						} else if (DEFIANT.isCDN(domain) === true) {

							node.setAttribute('src', src);

							return true;

						} else {

							DEFIANT.report({
								domain: domain,
								level:  level,
								link:   source.link,
								type:   'media'
							});

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (level === 'gamma') {

						node.setAttribute('src', src);

						return true;

					}

				}

			}

		},

		purify: function(node, domains) {

			if (node.tagName === 'META') {

				if (node.getAttribute('http-equiv') !== null) {

					let header   = node.getAttribute('http-equiv').toLowerCase();
					let content  = node.getAttribute('content');
					let redirect = null;

					if (header === 'location' && content !== null) {

						redirect = resolve_url([
							content
						]);

						if (redirect !== null) {

							node.setAttribute('data-' + UUID + '-content', URL.render(redirect));
							node.removeAttribute('content');

							let domain = URL.toDomain(redirect);
							if (domain !== null && domains.includes(domain) === false) {
								domains.push(domain);
							}

							return true;

						} else {

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (header === 'refresh' && content !== null) {

						redirect = resolve_url([
							content.split('; url=').pop()
						]);

						if (redirect !== null) {

							node.setAttribute('data-' + UUID + '-content', '5; url=' + URL.render(redirect));
							node.removeAttribute('content');

							let domain = URL.toDomain(redirect);
							if (domain !== null && domains.includes(domain) === false) {
								domains.push(domain);
							}

							return true;

						} else {

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (header === 'content-type' && content !== null) {

						// Do Nothing

						return true;

					} else if (header === 'x-ua-compatible' && content !== null) {

						// Do Nothing

						return true;

					} else {

						node.parentNode.removeChild(node);

						return false;

					}

				}

			} else if (node.tagName === 'LINK') {

				if (node.getAttribute('rel') !== null) {

					let rel  = node.getAttribute('rel').toLowerCase();
					let href = node.getAttribute('href');

					if (
						(
							rel === 'dns-prefetch'
							|| rel === 'modulepreload'
							|| rel === 'preconnect'
							|| rel === 'prefetch'
							|| rel === 'preload'
							|| rel === 'prerender'
							|| rel === 'stylesheet'
						)
						&& href !== null
					) {

						let source = resolve_url([
							href
						]);

						if (source !== null) {

							node.setAttribute('data-' + UUID + '-href', URL.render(source));
							node.removeAttribute('href');

							let domain = URL.toDomain(source);
							if (domain !== null && domains.includes(domain) === false) {
								domains.push(domain);
							}

							return true;

						} else {

							node.parentNode.removeChild(node);

							return false;

						}

					} else if (rel === 'alternate' && href !== null) {

						// Do Nothing

						return true;

					} else {

						node.parentNode.removeChild(node);

						return false;

					}

				}

			} else if (node.tagName === 'FRAME' || node.tagName === 'IFRAME') {

				let source = resolve_url([
					node.getAttribute('src')
				]);

				if (source !== null) {

					node.setAttribute('data-' + UUID + '-src', URL.render(source));
					node.removeAttribute('src');

					let domain = URL.toDomain(source);
					if (domain !== null && domains.includes(domain) === false) {
						domains.push(domain);
					}

					return true;

				} else {

					node.parentNode.removeChild(node);

					return false;

				}

			} else if (node.tagName === 'SCRIPT') {

				let source = resolve_url([
					node.getAttribute('src')
				]);

				if (source !== null) {

					node.setAttribute('data-' + UUID + '-src', URL.render(source));
					node.removeAttribute('src');

					let domain = URL.toDomain(source);
					if (domain !== null && domains.includes(domain) === false) {
						domains.push(domain);
					}

					return true;

				} else if (node.textContent !== '') {

					node.setAttribute('data-' + UUID + '-content', node.textContent);
					node.textContent = '';

					return true;

				} else {

					node.parentNode.removeChild(node);

					return false;

				}

			} else if (node.tagName === 'A') {

				if (node.getAttribute('ping') !== null) {
					node.removeAttribute('ping');
				}

				let href = resolve_url([
					node.getAttribute('href')
				]);

				if (href !== null) {

					let full_href = href.link;

					if (href.hash !== null) {
						full_href += '#' + href.hash;
					}

					if (node.getAttribute('href') !== full_href) {
						node.setAttribute('href', full_href);
					}

					return true;

				} else {

					node.parentNode.removeChild(node);

					return false;

				}

			} else if (node.tagName === 'IMG') {

				if (node.getAttribute('srcset') !== null) {
					node.removeAttribute('srcset');
				}


				let source = resolve_url([
					node.getAttribute('src'),
					node.getAttribute('data-src'),
					node.getAttribute('data-lazy'),
					node.getAttribute('data-lazyload'),
					node.getAttribute('data-load'),
					node.getAttribute('data-url')
				]);

				if (source !== null) {

					node.setAttribute('data-' + UUID + '-src', URL.render(source));
					node.removeAttribute('src');

					let domain = URL.toDomain(source);
					if (domain !== null && domains.includes(domain) === false) {
						domains.push(domain);
					}

					return true;

				} else {

					node.parentNode.removeChild(node);

					return false;

				}

			} else if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {

				if (node.getAttribute('autoplay') !== null) {
					node.removeAttribute('autoplay');
				}


				let source = resolve_url([
					node.getAttribute('src'),
					node.getAttribute('data-src'),
					node.getAttribute('data-lazy'),
					node.getAttribute('data-lazyload'),
					node.getAttribute('data-load'),
					node.getAttribute('data-url')
				]);

				if (source !== null) {

					node.setAttribute('data-' + UUID + '-src', URL.render(source));
					node.removeAttribute('src');

					let domain = URL.toDomain(source);
					if (domain !== null && domains.includes(domain) === false) {
						domains.push(domain);
					}

					return true;

				} else {

					node.parentNode.removeChild(node);

					return false;

				}

			} else if (node.tagName === 'APPLET' || node.tagName === 'EMBED' || node.tagName === 'OBJECT') {

				node.parentNode.removeChild(node);

				return false;

			} else if (node.textContent.startsWith('<!--[') === true) {

				node.parentNode.removeChild(node);

				return false;

			} else {

				return true;

			}

		}

	};


	return DOMINION;

})();



(async () => {

	const DOMAINS  = [];
	const UNIVERSE = [];

	new MutationObserver((mutations) => {

		mutations.forEach((mutation) => {

			if (mutation.type === 'childList') {

				Array.from(mutation.addedNodes).filter((node) => {

					if (
						node.tagName === 'META'
						|| node.tagName === 'LINK'
						|| node.tagName === 'FRAME'
						|| node.tagName === 'IFRAME'
						|| node.tagName === 'SCRIPT'
						|| node.tagName === 'A'
						|| node.tagName === 'IMG'
						|| node.tagName === 'AUDIO'
						|| node.tagName === 'VIDEO'
						|| node.tagName === 'APPLET'
						|| node.tagName === 'EMBED'
						|| node.tagName === 'OBJECT'
						|| node.textContent.startsWith('<!--[')
					) {
						return true;
					}

					return false;

				}).forEach((node) => {

					if (UNIVERSE.includes(node) === false) {

						let observe = DOMINION.purify(node, DOMAINS);
						if (observe === true) {
							UNIVERSE.push(node);
						}

					}

				});

			}

		});

	}).observe(document.documentElement, {
		childList: true,
		subtree:   true
	});


	// TODO: window.stop() integration


	window.addEventListener('DOMContentLoaded', () => {

		NX74205.initialize(DOMAINS, (DEFIANT) => {

			UNIVERSE.forEach((node) => {
				DOMINION.destroy(node, DEFIANT);
			});

		});

	});

})();

