
# Defiant Browser Extension

## Stay protected from Ads, Cookies, JavaScript and other Tracking Techniques

The Defiant Browser Extension tries to put the control over website
behaviours back into the hands of users, and not developers.

Its concept works with Trust Levels, whereas the defaulted Trust Level
is `Zero` and doesn't allow anything malicious to happen. Incrementing
the Trust Level to a higher one will enable more risky features to make
the Website or Web App work.


## User Interface

![Popup UI](/defiant/chrome/user-guide.png)

The [User Guide](/defiant/chrome/user-guide.html) contains more instructions
on how to use the Defiant Browser Extension.


## Trust Levels

The Defiant Browser Extension operates on the concept of trust levels.
By default, no website is trusted (Level: Zero). You (as the user) are
in charge of which website is to be trusted.

- **Level: Zero** is for Static Websites
- **Level: Alpha** is for Interactive Websites
- **Level: Beta** is for Web Apps
- **Level: Gamma** is for Social Media Apps

**Level: Zero**

- Enable Media from first-party or second-party domains.
- Enable Stylesheets from first-party or second-party domains or known CDNs.
- Disable everything else.

**Level: Alpha**

- Enable Media from first-party and second-party domains or known CDNs.
- Enable Stylesheets from first-party and second-party domains or known CDNs.
- Enable JavaScript from first-party or second-party domains or known CDNs.
- Enable Cookies from first-party or second-party domains.
- Limit Cookies to the current browsing session.

**Level: Beta**

- Enable Media from first-party and second-party domains or known CDNs.
- Enable Stylesheets from first-party and second-party domains or known CDNs.
- Enable JavaScript from first-party or second-party domains or known CDNs.
- Enable Cookies from first-party or second-party domains or known CDNs.
- Enable Link Prefetching from first-party or second-party domains or known CDNs.
- Enable Location Redirects from first-party or second-party domains or known CDNs.
- Enable Frames from first-party or second-party domains.

**Level: Gamma**

- Enable Media from all domains.
- Enable Stylesheets from all domains.
- Enable JavaScript from all domains.
- Enable Cookies from all domains.
- Enable Link Prefetching from all domains.
- Enable Location Redirects from all domains.
- Enable Frames from all domains.


# Development Guide

The [Development Guide](./guide/DEVELOPMENT.md) eases up the Development Onboarding
process and contains hints on Debugging and Development of this Chromium Extension.


## Acknowledgements

This Browser Extension's [Icon](./defiant/design/icon.svg) is licensed under the
CC-BY-SA 3.0 license; it is itself a modified variant of the icon that was originally
created by [Alpar-Etele Meder](https://dribbble.com/Pocike) and is available via
[his Iconfinder Page](https://www.iconfinder.com/pocike).

