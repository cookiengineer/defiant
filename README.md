
# Defiant Chrome/Chromium Browser Extension

The Defiant Chromium Browser Extension tries to put the control over
website behaviours back into the hands of users, and not developers.

Its underlying concepts works with Trust Levels, whereas the defaulted
Trust Level is `Zero` and doesn't allow anything malicious to happen.
Incrementing the Trust Level to a higher one will incrementally enable
more features to make the website work.


## Trust Level: Zero

- Disable HTTP Location/Refresh redirects.
- Disable Link Prefetching from all domains.
- Disable Frames from all domains.
- Disable Cookies from all domains.
- Disable JS from all domains.
- Enable Images from first-party or second-party domains.
- Enable Audios from first-party or second-party domains.
- Enable Videos from first-party or second-party domains.
- Enable CSS from first-party or second-party domains or known CDNs.

## Trust Level: Alpha

- Enable Images from first-party or second-party domains or known CDNs.
- Enable Audios from first-party or second-party domains or known CDNs.
- Enable Videos from first-party or second-party domains or known CDNs.
- Enable JS from first-party or second-party domains or known CDNs.
- Enable Cookies from first-party or second-party domains for the current session.

## Trust Level: Beta

- Enable HTTP Location/Refresh redirects to first-party or second-party domains.
- Enable Link Prefetching to first-party or second-party domains or known CDNs.
- Enable Frames from first-party or second-party domains.
- Enable Cookies from first-party or second-party domains or known CDNs.

## Trust Level: Gamma

- Enable HTTP Location/Refresh redirects to all domains.
- Enable Link Prefetching from all domains.
- Enable Images from all domains.
- Enable Videos from all domains.
- Enable Frames from all domains.
- Enable Cookies from all domains.
- Enable JS from all domains.
- Enable CSS from all domains.


## Development Help

```bash

mkdir /tmp/defiant;
chromium --user-data-dir=/tmp/defiant chrome://extensions;

# Add Defiant Extension in chrome://extensions
# inspect background.html page to debug the DEFIANT constant

```


## Acknowledgements

This Chrome Extension's [Icon](./defiant/design/icon.svg) is licensed
under the CC-BY-SA 3.0 license; it is itself a modified variant of the
icon that was originally created by [Alpar-Etele Meder](https://dribbble.com/Pocike)
and is available via [his Iconfinder Page](https://www.iconfinder.com/pocike).

