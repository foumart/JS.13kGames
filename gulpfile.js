const { src, dest, series } = require('gulp');
const gulp = require('gulp');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-string-replace');
const htmlreplace = require('gulp-html-replace');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const closureCompiler = require('google-closure-compiler').gulp();
const del = require('del');
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const svgmin = require('gulp-svgo');
const zip = require('gulp-zip');
const advzip = require('gulp-advzip');
const roadroller = require('roadroller');
const package = require('./package.json');

const replaceOptions = { logs: { enabled: false } };
const timestamp = getDateString();

// Data taken directly from package.json
const name = package.name;
const title = package.title;
const id_name = `${name.replace(/\s/g, '')}`;//_${getDateString(true)}
const version = package.version;
const iconExtension = package.iconExtension;
const iconType = package.iconType;
const iconSize = package.iconSize;

let js, css;

// Script Arguments:
// --dir: set the output directory
const dir = argv.dir || 'public';

// --test: don't use versioned zip file - useful for fast testing.
const test = argv.test != undefined ? true : false;

// --pwa: enable progressive web app - use a service worker, webmanifest and pwa initialization scripts. Adds 842 bytes.
const pwa = argv.pwa != undefined ? true : false;

// --debug: display service worker logs
const debug = argv.debug != undefined ? true : false;

// --roadroll: use a JS packer for up to 15% compression
const roadroll = argv.roadroll != undefined ? true : false;

// --mobile: should html tags for mobile be included. Adds 42 bytes.
const mobile = argv.mobile != undefined || argv.all != undefined ? `
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" sizes="${iconSize}x${iconSize}" href="ico.${iconExtension}"/>` : false;

// --social: should html tags for social media be included. Adds around 100 bytes, depending on description length.
const social = argv.social != undefined || argv.all != undefined ? `
<meta name="application-name" content="${title}"/>
<meta name="description" content="${package.description}"/>
<meta name="keywords" content="${package.keywords}"/>
<meta name="author" content="${package.author.name}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${package.description}"/>
<meta name="twitter:image" content="ico.${iconExtension}"/>` : false;

// Prepare a web icon to be used by html and pwa
function ico(callback) {
	if (iconExtension == "svg") {
		src(['src/ico.svg'], { allowEmpty: true })
			//.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(svgmin())
			.pipe(dest(dir + '/'))
			.on('end', callback)
	} else {
		src(['src/ico.png'], { allowEmpty: true })
			.pipe(imagemin([imagemin.optipng({optimizationLevel: 7})]))
			.pipe(dest(dir + '/'))
			.on('end', callback)
	}
}

// Prepare service worker script
function sw(callback) {
	if (pwa) {
		src(['resources/service_worker.js'], { allowEmpty: true })
			.pipe(replace('var debug;', `var debug = ${debug ? 'true' : 'false'};`, replaceOptions))
			.pipe(replace('{ID_NAME}', id_name, replaceOptions))
			.pipe(replace('{VERSION}', version, replaceOptions))
			.pipe(replace('{ICON_EXTENSION}', iconExtension, replaceOptions))
			.pipe(gulpif(!debug, replace('caches', 'window.caches', replaceOptions)))
			.pipe(gulpif(!debug,
				closureCompiler({
					compilation_level: 'ADVANCED_OPTIMIZATIONS',
					warning_level: 'QUIET',
					language_in: 'ECMASCRIPT6',
					language_out: 'ECMASCRIPT6'
				})
			))
			.pipe(gulpif(!debug, replace('window.caches', 'caches', replaceOptions)))
			.pipe(gulpif(!debug, minify({ noSource: true })))
			.pipe(gulpif(!debug, replace('"use strict";', '', replaceOptions)))
			.pipe(concat('sw.js'))
			.pipe(dest(dir + '/'))
			.on('end', callback)
	} else {
		callback();
	}
}

// Compile the pwa initialization script (if needed) as well as game logic scripts
function app(callback) {
	const scripts = [
		'src/scripts/*.js'
	];
	if (pwa) {
		scripts.unshift('resources/sw_init.js');
	}

	src(scripts, { allowEmpty: true })
		.pipe(gulpif(pwa, replace('let _debug;', `let _debug = ${debug ? 'true' : 'false'};`, replaceOptions)))
		.pipe(gulpif(pwa, replace('service_worker', 'sw', replaceOptions)))
		.pipe(gulpif(!pwa, replace('function init', 'window.addEventListener("load",init);function init', replaceOptions)))
		.pipe(gulpif(!debug,
			closureCompiler({
				compilation_level: 'ADVANCED_OPTIMIZATIONS',
				warning_level: 'QUIET',
				language_in: 'ECMASCRIPT6',
				language_out: 'ECMASCRIPT6',
				externs: 'resources/externs.js'
			})
		))
		//.pipe(gulpif(!debug, minify({ noSource: true })))
		.pipe(concat('app.js'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', callback);
}

// Minify CSS
function cs(callback) {
	src('src/styles/*.css', { allowEmpty: true })
		.pipe(cleanCSS())
		.pipe(concat('temp.css'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', callback)
}

// Prepare web manifest file
function mf(callback) {
	if (pwa) {
		src('resources/mf.webmanifest', { allowEmpty: true })
			.pipe(replace('service_worker', 'sw', replaceOptions))
			.pipe(replace('{TITLE}', title, replaceOptions))
			.pipe(replace('{ICON_EXTENSION}', iconExtension, replaceOptions))
			.pipe(replace('{ICON_TYPE}', iconType, replaceOptions))
			.pipe(replace('{ICON_SIZE}', iconSize, replaceOptions))
			.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(dest(dir + '/'))
			.on('end', callback);
	} else {
		callback();
	}
}

// Compress other graphical assets (if any)
function assets(callback) {
	src(['src/assets/*'], { allowEmpty: true })
		// optimize PNGs
		.pipe(imagemin([imagemin.optipng({optimizationLevel: 7})]))
		// optimize GIFs
		//.pipe(imagemin([imagemin.gifsicle({interlaced: true})]))
		// optimize JPGs
		//.pipe(imagemin([imagemin.mozjpeg({quality: 75, progressive: true})]))
		// optimize SVGs
		//.pipe(imagemin([imagemin.svgo({plugins: [{removeViewBox: false}, {cleanupIDs: true}]})
		.pipe(dest(dir + '/assets/'))
		.on('end', callback)
}

// Read the temporary JS and CSS files and compress the javascript with Roadroller
async function mangle() {
	const fs = require('fs');
	css = fs.readFileSync(dir + '/tmp/temp.css', 'utf8');
	js = fs.readFileSync(dir + '/tmp/app.js', 'utf8');

	if (!debug) {
		if (roadroll) {
			const packer = new roadroller.Packer(
				[{
					data: js,
					type: 'js',
					action: 'eval'
				}],
				{
					selectors: 32,
					maxMemoryMB: 640,
					precision: 16,
					recipLearningRate: 1500,
					modelMaxCount: 3,
					modelRecipBaseCount: 30,
					numAbbreviations: 64,
					allowFreeVars: 0
				}
			);
			await packer.optimize();
			const { firstLine, secondLine } = packer.makeDecoder();
			js = firstLine + secondLine;
		}
	} else {
		let dummyPromise = new Promise(function(resolve) {
			setTimeout(resolve, 1);
		})
		await dummyPromise;
	}
}

// Inline JS and CSS into index.html
function pack(callback) {
	let stream = src('src/index.html', { allowEmpty: true });

	stream
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(replace('{ICON_EXTENSION}', iconExtension, replaceOptions))
		.pipe(replace('{ICON_TYPE}', iconType, replaceOptions))
		.pipe(gulpif(social != false && mobile != false, htmlreplace({'mobile': mobile, 'social': social})))
		.pipe(gulpif(social === false && mobile != false, htmlreplace({'mobile': mobile, 'social': ''})))
		.pipe(gulpif(social != false && mobile === false, htmlreplace({'mobile': '', 'social': social})))
		.pipe(gulpif(social === false && mobile === false, htmlreplace({'mobile': '', 'social': ''})))
		.pipe(gulpif(!pwa, replace('<link rel="manifest" href="mf.webmanifest">', '', replaceOptions)))
		.pipe(htmlmin({ collapseWhitespace: true, removeComments: true, removeAttributeQuotes: true }))
		//.pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
		.pipe(replace('"', '', replaceOptions))
		.pipe(replace('rep_css', '<style>' + css + '</style>', replaceOptions))
		.pipe(replace('rep_js', '<script>' + js + '</script>', replaceOptions))
		.pipe(concat('index.html'))
		.pipe(dest(dir + '/'))
		.on('end', callback);
}

// Delete the temporary folder generated during packaging
function clean() {
	return del(dir + '/tmp/');
}

// Package zip (exclude any fonts that are used locally, like Twemoji.ttf)
function archive(callback) {
	if (debug) callback();
	else src([dir + '/*', dir + '/*/*', '!'+ dir + '/*.ttf'], { allowEmpty: true })
		.pipe(zip(test ? 'game.zip' : 'game_' + timestamp + '.zip'))
		.pipe(advzip({ optimizationLevel: 4, iterations: 10 }))
		.pipe(dest('zip/'))
		.on('end', callback);
}

// Output the zip filesize
function check(callback) {
	if (debug) callback();
	else {
		var fs = require('fs');
		const size = fs.statSync(test ? 'zip/game.zip' : 'zip/game_' + timestamp + '.zip').size;
		const limit = 1024 * 13;
		const left = limit - size;
		const percent = Math.abs(Math.round((left / limit) * 10000) / 100);
		console.log(`        ${size}        ${left} bytes ${left < 0 ? 'overhead' : 'remaining'} (${percent}%)`);
		callback();
	}
}

// Watch for changes in the source folder
function watch(callback) {
	browserSync.init({
		server: './public',
		ui: false,
		port: 8080
	});
	
	gulp.watch('./src').on('change', () => {
		exports.sync();
	});

	callback();
};

// Reload the browser sync instance, or run a new server with live reload
function reload(callback) {
	if (!browserSync.active) {
		watch(callback);
	} else {
		browserSync.reload();
		callback();
	}
}

// Helper function for timestamp and naming
function getDateString(shorter) {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day =`${date.getDate()}`.padStart(2, '0');
	if (shorter) return `${year}${month}${day}`;
	const signiture =`${date.getHours()}`.padStart(2, '0')+`${date.getMinutes()}`.padStart(2, '0')+`${date.getSeconds()}`.padStart(2, '0');
	return `${year}${month}${day}_${signiture}`;
}

// Exports
exports.default = series(ico, sw, app, cs, mf, mangle, assets, pack, clean, archive, check, watch);
exports.sync = series(app, cs, mangle, assets, pack, clean, reload);
exports.zip = series(archive, check);

/*
   JS13K Template Gulpfile by Noncho Savov
   https://www.FoumartGames.com
*/
