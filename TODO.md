
# Tracking Links

- [ ] Clean URLs from social media tracking parameters (e.g. `?utm=...`)

- [ ] Redirects for URLs that are inefficient (e.g. gfycat, imgur, redgifs, youtube etc)

- [ ] Google Search uses `https://www.google.com/url?q=...` scheme to generate redirects
- [ ] `https://l.instagram.com/?u=https%3A%2F%2Fwww.instagram.com%2Fmandityizabellu%2F&e=ATMafu57CaEpt4DOFKE3alfayiOLPdKwKobzR4xv49O1dVjmVDvUPdnC4uMgb539wIlY9BZ0GH3M2kK21uBt_slWgZ58SqSFhmb8yA&s=1`
- [ ] `https://imgur.com/...` to `https://i.imgur.com/....{png,jpg}` if contains only one image.
- [ ] `https://i.imgur.com/....gifv` to `https://i.imgur.com/....mp4`
- [ ] `https://youtube.com/watch?v=...` to `https://youtube.com/embed/...?html5=1`

# Build Script

- [ ] Import `blockers.json` from Stealth's Vendor Profile.
- [ ] Build the Extension in `xpi` format for Firefox.

# Test Script

- [ ] Run Chromium in /tmp/defiant in sandboxed mode
- [ ] Change `extensions.ui.developer_mode` in the `./Default/Preferences` JSON file.

# TODO

- [ ] Add support for generation of `Content-Security-Policy` to `Interceptor.mjs` based on Trust Level.

## CSS Filters

- [ ] Filter `color: transparent`
- [ ] Filter colors where `color` == `background-color` and offset is too low.

