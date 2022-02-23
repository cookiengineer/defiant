
# Build Script

- [ ] Build the extension for Chromium
- [ ] Build the extension for Firefox
- [ ] Rewrite `make.mjs` to integrate `build.mjs` API calls for `esbuild`.

# TODO

- [ ] Add support for generation of `Content-Security-Policy` to `Interceptor.mjs` based on Trust Level.

- [ ] Evaluate usefulness of `chrome.privacy.websites.hyperlinkAuditingEnabled.set({ value: false })`
- [ ] Evaluate usefulness of `chrome.privacy.websites.referrersEnabled.set({ value: false })`
- [ ] Evaluate usefulness of `chrome.privacy.websites.thirdPartyCookiesAllowed.set({ value: false })`

## CSS Filters

- [ ] Filter `color: transparent`
- [ ] Filter colors where `color` == `background-color` and offset is too low.

