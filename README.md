# JS13kGames Progressive Web App starter pack

JS13K Games Competition website: https://js13kgames.com/

This template targets the compo's **Mobile** category by providing a convenient way to build tiny Progressive Web Apps.

PWAs at minimum need a service worker script, web manifest and icon files, increasing the final archive size by around a kilobyte - something to keep in mind.

The template also uses Google Closure Compiler to parse JS code and a sophisticated Gulp process packs it along with any CSS into a single HTML file for best compression. Further, the outputted archive is squashed even more with the Roadroller JS packer.

## Installation
Run **`npm install`** to install build dependencies.

## Tasks
**`npm build`** builds the game, reports archive size and serves locally with browser sync live reload enabled.

**`npm debug`** builds the game without any minifying for easier debugging. Includes detailed console logs.

**`npm test`** repacks the contents of the public folder to report archive filesize.

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
Currently the ZIP output of the default *`npm:build`* is 3.34 KB (3,430 bytes), of which:
 - 1,312 bytes are occupied by the interactive demo (ship.png 612 bytes + scripts)
 - 900 bytes for PWA functionality (serviceworker + webmanifest + initialization scripts)
 - 256 bytes for ico.svg (an icon is needed for PWA functionality)
 - 900 bytes for an index.html with a default basic structure

Regarding the icon - it needs to be at least 144x144 pixels in size minimum. Using the PNG format will provide no less than 500 bytes image, so the SVG format remains best in terms of compression.
