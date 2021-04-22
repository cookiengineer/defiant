
# Defiant Chrome/Chromium Browser Extension

The Defiant Chromium Browser Extension tries to put the control over
website behaviours back into the hands of users, and not developers.

Its underlying concepts works with Trust Levels, whereas the defaulted
Trust Level is `Zero` and doesn't allow anything malicious to happen.
Incrementing the Trust Level to a higher one will incrementally enable
more features to make the website work.


## Trust Level: Zero

- Disable Requests to known Advertisement Networks.
- Disable `<frame>`, and `<iframe>`.
- Disable `<script>` and `<meta http-equiv="refresh">`.
- Disable Cookies from first-party and second-party domains.
- Disable Cookies from known CDNs.
- Disable JavaScript from first-party and second-party domains.
- Disable JavaScript from known CDNs.
- Enable CSS from first-party and second-party domains.
- Enable CSS from known CDNs.
- Override Cache-related response headers (to force-cache everything).

## Trust Level: Alpha

- Disable Requests to known Advertisement Networks.
- Disable `<frame>`, and `<iframe>`.
- Enable `<script>` and `<meta http-equiv="refresh">`.
- Enable Cookies from first-party and second-party domains.
- Disable Cookies from known CDNs.
- Enable JavaScript from first-party and second-party domains.
- Enable JavaScript from known CDNs.
- Enable CSS from first-party and second-party domains.
- Enable CSS from known CDNs.
- Override Cache-related response headers (to force-cache everything).

## Trust Level: Beta

- Disable Requests to known Advertisement Networks.
- Enable `<frame>`, and `<iframe>`.
- Enable `<script>` and `<meta http-equiv="refresh">`.
- Enable Cookies from first-party and second-party domains.
- Enable Cookies from known CDNs.
- Enable JavaScript from first-party and second-party domains.
- Enable JavaScript from known CDNs.
- Enable CSS from first-party and second-party domains.
- Enable CSS from known CDNs.
- Override Cache-related response headers (to force-cache everything).

## Trust Level: Gamma

- Enable Requests to known Advertisement Networks.
- Enable `<frame>`, and `<iframe>`.
- Enable `<script>` and `<meta http-equiv="refresh">`.
- Enable Cookies from first-party and second-party domains.
- Enable Cookies from known CDNs.
- Enable JavaScript from first-party and second-party domains.
- Enable JavaScript from known CDNs.
- Enable CSS from first-party and second-party domains.
- Enable CSS from known CDNs.
- Don't Override Cache-related response headers.



## TODO: Settings API

- chrome.privacy.websites.hyperlinkAuditingEnabled.set({ value: false })
- chrome.privacy.websites.referrersEnabled.set({ value: false })
- chrome.privacy.websites.thirdPartyCookiesAllowed.set({ value: false })


## TODO: Prevent and Cleanup

- `<a ping>` attribute
- `<meta http-equiv="refresh">` attribute


## TODO: Other

- Integrate Host Blockers (port from Stealth)
- Port Interceptor / background code
- Port content / cleanup and prevent code
- Port Storage code

