
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
- Enable `<meta http-equiv="refresh">` to first-party or second-party domains.
- Enable `<frame>`, and `<iframe>` to first-party or second-party domains.
- Enable `<script>`
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


## Development Help

```bash

mkdir /tmp/defiant;
chromium --user-data-dir=/tmp/defiant chrome://extensions;

# Add Defiant Extension in chrome://extensions
# inspect background.html page to debug the DEFIANT constant

```


## Acknowledgements

The Chrome Extension Icon is licensed under the CC-BY-SA 3.0
license; it is itself a modified version that was originally
created by [Alpar-Etele Meder](https://dribbble.com/Pocike)
and available via [his Iconfinder Page](https://www.iconfinder.com/pocike).

