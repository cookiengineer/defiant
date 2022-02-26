
# Development Guide

This Development Guide contains development notes that help to ease up getting
familiar with the codebase, its tools and the process of how the Defiant Browser
Extension can be debugged, and developed on.


## Development Requirements

- Install [node.js](https://nodejs.org/en/download) latest (minimum version `12`).
- Install [Ungoogled Chromium](https://github.com/Eloston/ungoogled-chromium/releases) latest (minimum version `70`).
- Install [Firefox](https://www.mozilla.org/en-US/firefox) latest (minimum version `90`).

The Browser Extension requires `esbuild` in order to generate the `Content Scripts`
that clean up the `DOM` via `MutationObserver`. As the Content Scripts currently
are the only part that's not `EcmaScript Module (ESM)` syntax compatible, they need
to be bundled as standalone `ES5` files without any `import` statement in them.

```bash
cd /path/to/defiant;

# Install all dependencies
npm install;
```

## Build Instructions

```bash
# Build the Extension
node ./defiant/make.mjs;

# Spawn a pre-patched-Preferences Chromium Sandbox in Developer Mode
# (will spawn Chromium two times due to lack of --developer-mode CLI flags)
node ./defiant/make.mjs test;
```

Notes: The `test` Step will do the following, as there's a lack of CLI flags to ease
up Chromium usage. It requires a graphical environment (`Xorg` or `Wayland`) to work:

1. Re-Build the Content Scripts.
2. Create a temporary Profile Folder in `/tmp/defiant-chromium-profile-*` (via `mktemp()`).
3. Spawn Chromium with `--user-data-dir` set to `/tmp/defiant-chromium-profile-*`.
4. Kill Chromium.
5. Patch the `/tmp/defiant-chromium-profile-*/Default/Preferences` file to set `extensions.ui.developer_mode` to `true`.
6. Spawn Chromium again with `--user-data-dir` set to `/tmp/defiant-chromium-profile-*` and `--load-extension` set to the `/defiant/manifest.json` containing folder in order to load Defiant as an `Unpacked Extension`.
7. The User can now use the Browser Extension in an isolated manner.


**Debugging Hints**:

- The `background.html` Page runs the global `DEFIANT` instance, which contains the
  [Interceptor](./defiant/source/Interceptor.mjs) that filters Network Requests.

- The `Boolean` `DEFIANT.settings.debug` property can be changed to show debug messages.

- The `background.html` Page exposes a global `console` variable that can be used from
  anywhere else using the `API['extension'].getBackgroundPage().console` reference.

- (Chromium) Syntax Errors are available in the `chrome.runtime.lastError` reference or
  in the `chrome://extensions` Page via a click on the `Errors` button.


## Build Instructions

This Browser Extension can be built for both `Chromium` (`Chrome`) based Browsers
and `Firefox` based Browsers, and is only verified to be working on an up-to-date
ArchLinux host build system.

- The `SIGNING_KEY` environment variable can be used to use a custom `/path/to/certificate.pem`
  that is used to sign the generated Chromium Extension (`.crx` file).

- The `STEALTH` environment variable can be used to update/import shared implementations
  and Settings (such as the `blockers.json`, `filters.json` and `identities.json`) from
  the Vendor Profile folder from [Tholian Stealth](https://github.com/tholian-network/stealth).

```bash
cd /path/to/defiant;

# Build and Pack the Extension
node ./defiant/make.mjs pack /tmp/sandbox;

# Chromium Extension
ls /tmp/sandbox/defiant-*.crx;

# Firefox Extension
ls /tmp/sandbox/defiant-*.xpi;
```

## Release Instructions

TODO: Release Instructions (to push Release to GitHub and Website)

