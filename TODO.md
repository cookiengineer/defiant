
# TODO

- [ ] Add logic for `Content-Security-Policy` to `Interceptor.mjs` based on Trust Level.
- [ ] Add logic for `Set-Cookie` to `Interceptor.mjs` based on Trust Level.

- [ ] Evaluate usefulness of `chrome.privacy.websites.hyperlinkAuditingEnabled.set({ value: false })`
- [ ] Evaluate usefulness of `chrome.privacy.websites.referrersEnabled.set({ value: false })`
- [ ] Evaluate usefulness of `chrome.privacy.websites.thirdPartyCookiesAllowed.set({ value: false })`

# TODO: Options Page

Implement `options.html` Page that shows `Notifications` that can be filtered by `type`,
and are automatically filtered by `link`. Sort them by a `count` value so that it's easier
to discover CDNs. Might be useful to track the `Referer` HTTP header here so that cross-site
tracking can be discovered.

