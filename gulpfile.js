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
const zip = require('gulp-zip');
const advzip = require('gulp-advzip');
const package = require('./package.json');

const replaceOptions = { logs: { enabled: false } };
const timestamp = getDateString();

// data taken directly from package.json
const title = package.name;
const id_name = `${title.replace(/\s/g, '')}_${getDateString(true)}`;
const version = package.version;

// monetization pointer - needs to be set in package.json
const monetization = package.monetization;

// set the output directory
const dir = argv.dir || 'public';

// don't use versioned zip file - useful for fast testing.
const test = argv.test != undefined ? true : false;

// enable progressive web app - use a service worker, webmanifest and pwa initialization scripts. Adds 864 bytes.
const pwa = argv.pwa != undefined ? true : false;

// display service worker logs
const debug = argv.debug != undefined ? true : false;

// should html tags for mobile be included. Adds 45 bytes.
const mobile = argv.mobile != undefined || argv.all != undefined ? `
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" sizes="144x144" href="ico.png"/>` : false;

// should html tags for social media be included. Adds around 100 bytes, depending on description length.
const social = argv.social != undefined || argv.all != undefined ? `
<meta name="application-name" content="${title}"/>
<meta name="description" content="${package.description}"/>
<meta name="keywords" content="${package.keywords}"/>
<meta name="author" content="${package.author.name}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${package.description}"/>
<meta name="twitter:image" content="ico.png"/>` : false;


// prepare a web icon to be used by html and pwa
// unfortunatelly we cannot use a svg icon: https://bugs.chromium.org/p/chromium/issues/detail?id=578122
function ico(callback) {
	src(['src/ico.png'], { allowEmpty: true })
		.pipe(imagemin([imagemin.optipng({optimizationLevel: 7})]))
		.pipe(dest(dir + '/'))
		.on('end', callback)
}

// compress other graphical assets
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

// prepare service worker script
function sw(callback) {
	if (pwa) {
		src(['resources/service_worker.js'], { allowEmpty: true })
			.pipe(replace('var debug;', `var debug = ${debug ? 'true' : 'false'};`, replaceOptions))
			.pipe(replace('{ID_NAME}', id_name, replaceOptions))
			.pipe(replace('{VERSION}', version, replaceOptions))
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
			.pipe(gulpif(!debug, replace('"use strict";', '', replaceOptions)))
			.pipe(gulpif(!debug, minify({ noSource: true })))
			.pipe(concat('sw.js'))
			.pipe(dest(dir + '/'))
			.on('end', callback)
	} else {
		callback();
	}
}

// compile the pwa initialization script (if needed), as well as loader and game logic scripts
function app(callback) {
	const scripts = [
		'resources/loader.js',
		'src/scripts/*'
	];
	if (pwa) {
		scripts.unshift('resources/sw_init.js');
	}

	src(scripts, { allowEmpty: true })
		.pipe(replace('let _debug;', `let _debug = ${debug ? 'true' : 'false'};`, replaceOptions))
		.pipe(replace('service_worker', 'sw', replaceOptions))
		.pipe(concat('tmp.js'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', () => {
			src([dir + '/tmp/tmp.js'], { allowEmpty: true })
				.pipe(gulpif(!pwa, replace('// loader', 'window.addEventListener("load", init);', replaceOptions)))
				.pipe(gulpif(!debug,
					closureCompiler({
						compilation_level: 'ADVANCED_OPTIMIZATIONS',
						warning_level: 'QUIET',
						language_in: 'ECMASCRIPT6',
						language_out: 'ECMASCRIPT6'
					})
				))
				.pipe(gulpif(!debug, minify({ noSource: true })))
				.pipe(concat('temp.js'))
				.pipe(dest(dir + '/tmp/'))
				.on('end', callback)
		});
}

// minify css
function css(callback) {
	src('src/styles/*.css', { allowEmpty: true })
		.pipe(cleanCSS())
		.pipe(concat('temp.css'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', callback)
}

// prepare index.html
function html(callback) {
	src('src/index.html', { allowEmpty: true })
		.pipe(replace('{MONETIZATION}', monetization, replaceOptions))
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(gulpif(social != false && mobile != false, htmlreplace({'mobile': mobile, 'social': social, 'css': 'rep_css', 'js': 'rep_js'})))
		.pipe(gulpif(social === false && mobile != false, htmlreplace({'mobile': mobile, 'social': '', 'css': 'rep_css', 'js': 'rep_js'})))
		.pipe(gulpif(social != false && mobile === false, htmlreplace({'mobile': '', 'social': social, 'css': 'rep_css', 'js': 'rep_js'})))
		.pipe(gulpif(social === false && mobile === false, htmlreplace({'mobile': '', 'social': '', 'css': 'rep_css', 'js': 'rep_js'})))
		.pipe(concat('temp.html'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', callback)
}

// prepare web manifest file
function mf(callback) {
	if (pwa) {
		src('resources/mf.webmanifest', { allowEmpty: true })
			.pipe(replace('service_worker', 'sw', replaceOptions))
			.pipe(replace('{TITLE}', title, replaceOptions))
			.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(dest(dir + '/'))
			.on('end', callback);
	} else {
		callback();
	}
}

// inline js and css into html and remove unnecessary stuff
function pack(callback) {
	var fs = require('fs');
	src(dir + '/tmp/temp.html', { allowEmpty: true })
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(replace('minimum-scale=1,maximum-scale=1,', '', replaceOptions))
		.pipe(gulpif(!pwa, replace('<link rel="manifest" href="mf.webmanifest">', '', replaceOptions)))
		.pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
		.pipe(replace('"', '', replaceOptions))
		.pipe(replace('rep_css', '<style>' + fs.readFileSync(dir + '/tmp/temp.css', 'utf8') + '</style>', replaceOptions))
		.pipe(replace('rep_js', '<script>' + fs.readFileSync(dir + '/tmp/temp.js', 'utf8') + '</script>', replaceOptions))
		.pipe(gulpif(!debug, replace('"use strict";', '', replaceOptions)))
		.pipe(concat('index.html'))
		.pipe(dest(dir + '/'))
		.on('end', callback);
}

// delete the temporary folder generated during packaging
function clean(callback) {
	del(dir + '/tmp/');
	callback();
}

// package zip
function archive(callback) {
	src([dir + '/*'], { allowEmpty: true })
		.pipe(zip(test ? 'game.zip' : 'game_' + timestamp + '.zip'))
		.pipe(advzip({ optimizationLevel: 4, iterations: 100 }))
		.pipe(dest('zip/'))
		.on('end', callback);
}

// output the zip filesize
function check(callback) {
	var fs = require('fs');
	const size = fs.statSync(test ? 'zip/game.zip' : 'zip/game_' + timestamp + '.zip').size;
	const limit = 1024 * 13;
	const left = limit - size;
	const percent = Math.abs(Math.round((left / limit) * 10000) / 100);
	console.log(`        ${size}        ${left} bytes ${left < 0 ? 'overhead' : 'remaining'} (${percent}%)`);
	callback();
}

// watch for changes in the source folder
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

// reload the browser sync instance, or run a new server with live reload
function reload(callback) {
	if (!browserSync.active) {
		watch(callback);
	} else {
		browserSync.reload();
		callback();
	}
}

// helper function for timestamp and naming
function getDateString(shorter) {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day =`${date.getDate()}`.padStart(2, '0');
	if (shorter) return `${year}${month}${day}`;
	const signiture =`${date.getHours()}`.padStart(2, '0')+`${date.getMinutes()}`.padStart(2, '0')+`${date.getSeconds()}`.padStart(2, '0');
	return `${year}${month}${day}_${signiture}`;
}

// exports
exports.default = series(assets, ico, sw, app, css, html, mf, pack, clean, archive, check, watch);
exports.pack = series(assets, ico, sw, app, css, html, mf, pack, clean);
exports.sync = series(app, css, html, pack, clean, reload);
exports.zip = series(archive, check);

/*
   Gulpfile by Noncho Savov
   https://www.FoumartGames.com
*/
