# JS13kGames Progressive Web App starter pack

JS13K Games Competition website: https://js13kgames.com/

This template targets the compo's **Mobile** category by providing a convenient way to build Progressive Web Apps.

PWAs at minimum need a service worker script, web manifest and icon files, which increases the final archive size by around a kilobyte.

The template also uses a sophisticated Gulp process to parse and compile JS code with Google Closure Compiler and to pack it along with any CSS into a single minified HTML file. Additional compression is achieved utilizing Roadroller JS packer. Once successfully built the game will be opened in the default browser with BrowserSync live-reload enabled. Any modification in src/ folder will invoke a game reload on the localhost.

## Installation
Run **`npm install`** to install build dependencies.

## Tasks
**`npm build`** builds a mobile PWA with minified and inlined JS and CSS into a single HTML (except for the PWA assets), reports archive size and serves the game locally with browser sync live reload enabled.

**`npm prod`** same as `npm build`, but additionally compresses JS with Roadroller. Builds for production.

**`npm debug`** builds the game into a single HTML with inlined JS but without minifying. Sets a global `_debug` variable to provide detailed console logs of the Service Worker processes.

**`npm raw`** builds the game with copied JS and CSS files directly into `src/scripts` and `src/styles` for easier debugging.

**`npm test`** repacks the contents of the public folder to report the archive filesize.

**`npm sync`** quickly repacks the game and refreshes the browser, automated via BrowserSync.

## Build task parameters
*`--pwa`* instructs to build a Progressive Web App - will add 842 bytes when zipped.

*`--roadroll`* instructs to use a JS packer to achieve up to 15% compression on top of the ZIP/gzip.

*`--mobile`* adds some HTML tags regarding mobile and iOS icons - increases the ZIP filesize with 42 bytes.

*`--social`* adds some HTML tags for SEO and social media (Twitter) - will add around 100 bytes, depending on description length.

## Template Structure
```
root/
├── resources/
│   ├── externs.js         - externs for Closure Compiler
│   ├── mf.webmanifest     - needed for the PWA functionality
│   ├── service_worker.js  - PWA
│   └── sw_init.js         - PWA
├── src/
│   ├── index.html         - template ("rep_css" and "rep_js" should be kept intact)
│   ├── ico.svg            - PWA
│   ├── scripts/           - should contain all JS scripts
│   ├── styles/            - should contain all CSS styles
│   └── assets/            - should contain any images the game needs
├── public                 - output folder
├── zip                    - output ZIP archives
└── package.json           - check Setup
```

## Setup
Setup is done in the **`package.json`**. Variables you have to modify:

- name - *used for generating the cache name in the service_worker.js file*
- version - *used for generating the cache name in the service_worker.js file*
- title - *populated in the title tag of the HTML, in the webmanifest file and in the social meta tags*
- description - *used only if social option is turned on*
- keywords - *used only if social option is turned on*
- orientation - *populated only in the webmanifest file*
- icon extension - *needed for the HTML's icon link tag, used in the webmanifest file and in the service_worker.js file*
- icon type - *needed for the HTML's icon link tag, in the webmanifest file and in the service_worker.js file*
- icon size - *used in the webmanifest file*

## Filesize overview:
Currently the ZIP output of the default *`npm:build`* is around 3KB, of which:
 - 1,312 bytes are occupied by the interactive demo (ship.png 612 bytes + scripts)
 - 842 bytes for PWA functionality (serviceworker + webmanifest + initialization scripts)
 - 256 bytes for ico.svg (an icon is needed for PWA functionality)

## Note:
 - *`npm:prod`* will be beneficial only if there is enough JS source supplied for compression.
 - PWA functionallity can be tested only with a secure (https) connection.
 - the icon needs to be at least 144x144 pixels in size. Using the PNG format will provide no less than 500 bytes image, so the SVG format remains best in terms of compression.
