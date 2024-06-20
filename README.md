# JS13kGames Progressive Web App starter pack

JS13K Games Competition: https://js13kgames.com/

This template targets the compo's **Mobile** category.

## Installation
Run **`npm install`** to install build dependencies.

## Tasks
**`npm build`** builds the game, reports archive size and serves locally with browser sync live reload enabled.

**`npm debug`** builds the game without any minifying for easier debugging. Includes detailed console logs.

## Build task parameters
*`--pwa`* instructs to build a Progressive Web App - will add 842 bytes when zipped.

*`--roadroll`* instructs to use a JS packer to achieve up to 15% compression on top of the ZIP/gzip.

*`--mobile`* adds some html tags regarding mobile and iOS icons - increases the zip filesize with 42 bytes.

*`--social`* adds some html tags for SEO and social media (twitter) - will add around 100 bytes, depending on description length.

## Setup
Setup is done in the **`package.json`**. Variables you have to modify:

- name - *used for generating the cache name in the service_worker.js file*
- version - *used for generating the cache name in the service_worker.js file*
- title - *populated in the title tag of the HTML, in the webmanifest file and in the social meta tags*
- description - *used only if social option is turned on*
- keywords - *used only if social option is turned on*
- icon extension - *needed for the HTML's icon link tag, used in the webmanifest file and in the service_worker.js file*
- icon type - *needed for the HTML's icon link tag, in the webmanifest file and in the service_worker.js file*
- icon size - *used in the webmanifest file*
