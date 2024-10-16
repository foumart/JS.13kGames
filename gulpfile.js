const { src, dest, series } = require('gulp');
const gulp = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-string-replace');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const closureCompiler = require('google-closure-compiler').gulp();
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const advzip = require('gulp-advzip');
const roadroller = require('roadroller');
const glob = require('glob');
const packageJson = require('./package.json');

// import ES modules
let imagemin, optipng, svgo, gifsicle, mozjpeg;
let del, zip, js, css, scripts;

const replaceOptions = { logs: { enabled: false } };
const timestamp = getDateString();

// Data taken directly from package.json
const name = packageJson.name;
const title = packageJson.title;
const id_name = `${name.replace(/\s/g, '')}`;//_${getDateString(true)}
const version = packageJson.version;
const iconExtension = packageJson.iconExtension;
const iconType = packageJson.iconType;
const iconSize = packageJson.iconSize;
const orientation = packageJson.orientation;

// Script Arguments:
// --dir: set the output directory
const dir = argv.dir || 'public';

// --test: don't use versioned zip file - useful for fast testing.
const test = argv.test != undefined ? true : false;

// --pwa: enable progressive web app - use a service worker, webmanifest and pwa initialization scripts. Adds ~850 bytes.
const pwa = argv.pwa != undefined ? true : false;

// --raw: don't pack the js files at all
const raw = argv.raw != undefined ? true : false;

// --debug: pack but don't compress js files, display service worker logs as well
const debug = argv.debug != undefined ? true : false;

// --roadroll: use a JS packer for up to 15% compression
const roadroll = argv.roadroll != undefined ? true : false;

// --mobile: should html` tags for mobile be included. Adds 42 bytes.
const mobile = argv.mobile != undefined || argv.all != undefined ? `
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" sizes="${iconSize}x${iconSize}" href="ico.${iconExtension}"/>` : false;

// --social: should html tags for social media be included. Adds around 100 bytes, depending on description length.
// TODO: quotes should not be removed for content that has space characters
const social = argv.social != undefined || argv.all != undefined ? `
<meta name="application-name" content="${title}"/>
<meta name="description" content="${packageJson.description}"/>
<meta name="keywords" content="${packageJson.keywords}"/>
<meta name="author" content="${packageJson.author.name}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${packageJson.description}"/>
<meta name="twitter:image" content="ico.${iconExtension}"/>` : false;

// Prepare a web icon to be used by html and pwa
function ico(callback) {
	(async () => {
		// Keep the imports, even if not copying an icon, the gulp image modules are needed for the assets.
		const gulpImageminModule = await import('gulp-imagemin');
		imagemin = gulpImageminModule.default;
		gifsicle = gulpImageminModule.gifsicle;
		mozjpeg = gulpImageminModule.mozjpeg;
		optipng = gulpImageminModule.optipng;
		svgo = gulpImageminModule.svgo;

		if (!mobile) {
			return callback();
		}

		if (iconExtension == "svg") {
			src(['src/ico.svg'], { allowEmpty: true })
				.pipe(imagemin({silent: true, verbose: false}, [svgo()]))
				.pipe(dest(dir + '/'))
				.on('end', callback)
		} else {
			src(['src/ico.png'], { allowEmpty: true, encoding: false })
				.pipe(imagemin({silent: true, verbose: false}, [optipng()]))
				.pipe(dest(dir + '/'))
				.on('end', callback)
		}
	})();
}

// Compress other graphical assets (if any)
function assets(callback) {
	src(['src/assets/*'], { allowEmpty: true, encoding: false })
		.pipe(imagemin({silent: true, verbose: false}, [optipng(), gifsicle(), mozjpeg(), svgo()]))
		.pipe(dest(dir + '/assets/'))
		.on('end', callback);
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
			.pipe(gulpif(!debug, replace('"use strict";', '', replaceOptions)))
			.pipe(concat('sw.js'))
			.pipe(dest(dir + '/'))
			.on('end', callback)
	} else {
		callback();
	}
}

// Compile (or copy if raw) the pwa initialization script as well as game logic scripts
function app(callback) {
	const scripts = [
		'src/scripts/*.js'
	];
	if (pwa) {
		scripts.unshift('resources/sw_init.js');
	}
	scripts.unshift('resources/app_init.js');

	if (raw) {
		// If raw is true, just copy the source files
		src(scripts, { allowEmpty: true })
			//.pipe(replace('_debug', 'debug', replaceOptions))
			.pipe(replace('let _debug;', `let _debug = ${debug || raw ? 'true' : 'false'};`, replaceOptions))
			.pipe(gulpif(pwa, replace('service_worker', 'sw', replaceOptions)))
			.pipe(replace('{VERSION}', version, replaceOptions))
			.pipe(gulpif(!pwa, replace('function init', 'window.addEventListener("load",init);function init', replaceOptions)))
			.pipe(dest(dir + '/src/scripts/'))
			.on('end', callback);
	} else {
		// Otherwise compile
		src(scripts, { allowEmpty: true })
			.pipe(replace('let _debug;', `let _debug = ${debug || raw ? 'true' : 'false'};`, replaceOptions))
			.pipe(gulpif(pwa, replace('service_worker', 'sw', replaceOptions)))
			.pipe(replace('{VERSION}', version, replaceOptions))
			.pipe(gulpif(!pwa, replace('function init', 'window.addEventListener("load",init);function init', replaceOptions)))
			.pipe(gulpif(!debug,
				closureCompiler({
					compilation_level: 'ADVANCED_OPTIMIZATIONS',
					warning_level: 'QUIET',
					language_in: 'ECMASCRIPT_2017',
					language_out: 'ECMASCRIPT6',
					externs: 'resources/externs.js'
				})
			))
			.pipe(concat('app.js'))
			.pipe(dest(dir + '/tmp/'))
			.on('end', callback);
	}
}

// Minify CSS
function cs(callback) {
	if (raw) {
		src('src/styles/*.css', { allowEmpty: true })
			.pipe(dest(dir + '/src/styles/'))
			.on('end', callback);
	} else {
		src('src/styles/*.css', { allowEmpty: true })
			.pipe(cleanCSS())
			.pipe(concat('temp.css'))
			.pipe(dest(dir + '/tmp/'))
			.on('end', callback)
	}
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
			.pipe(replace('{ORIENTATION}', orientation, replaceOptions))
			.pipe(htmlmin({ collapseWhitespace: true }))
			.pipe(dest(dir + '/'))
			.on('end', callback);
	} else {
		callback();
	}
}

// Read the temporary JS and CSS files and compress the javascript with Roadroller
async function mangle() {
	if (!raw) {
		const fs = require('fs');
		css = fs.readFileSync(dir + '/tmp/temp.css', 'utf8');
		js = fs.readFileSync(dir + '/tmp/app.js', 'utf8');
	}

	if (roadroll && !debug) {
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

// Inline JS and CSS into index.html or just include them if raw is specified
function pack(callback) {
	let stream = src('src/index.html', { allowEmpty: true });
	let scriptTags, cssTags;

	if (raw) {
		// Use glob to get all JavaScript files
		const scriptFiles = glob.sync('src/scripts/*.js').reverse();
		// Add initialization scripts as well
		if (pwa) {
			scriptFiles.unshift('src/scripts/sw_init.js');
		}
		scriptFiles.unshift('src/scripts/app_init.js');

		// Create script tags for each JavaScript file in the array
		scriptTags = scriptFiles.map(scriptFile => `<script src="${scriptFile.replace(/\\/g, '/')}"></script>`).join('\n\t');

		// Use glob to get all CSS files matching the pattern
		const cssFiles = glob.sync('src/styles/*.css');
		// Create link tags for each CSS file
		cssTags = cssFiles.map(cssFile => `<link rel="stylesheet" href="${cssFile.replace(/\\/g, '/')}">`).join('\n\t');
	}

	stream
		.pipe(gulpif(!pwa, replace('<link rel="icon" type="{ICON_TYPE}" sizes="any" href="ico.{ICON_EXTENSION}">', '', replaceOptions)))
		.pipe(gulpif(!pwa, replace('<link rel="manifest" href="mf.webmanifest">', '', replaceOptions)))
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(replace('{ICON_EXTENSION}', iconExtension, replaceOptions))
		.pipe(replace('{ICON_TYPE}', iconType, replaceOptions))
		.pipe(replace('rep_social', social != false ? social : '', replaceOptions))
		.pipe(replace('rep_mobile', mobile != false ? mobile : '', replaceOptions))
		.pipe(htmlmin({ collapseWhitespace: true, removeComments: true, removeAttributeQuotes: true }))
		.pipe(replace('rep_css', raw ? cssTags : '<style>' + css + '</style>', replaceOptions))
		.pipe(replace('rep_js', raw ? scriptTags : '<script>' + js + '</script>', replaceOptions))
		.pipe(concat('index.html'))
		.pipe(dest(dir + '/'))
		.on('end', callback);
}

// Delete the public folder at the beginning
function prep(callback) {
	(async () => {
		del = (await import('del')).deleteAsync;
		del(dir);
		callback();
	})();
}

// Delete the temporary folder generated during packaging
function clean(callback) {
	(async () => {
		del = (await import('del')).deleteAsync;
		del(dir + '/tmp/');
		callback();
	})();
	callback();
}

// Package zip (exclude any fonts that are used locally, like Twemoji.ttf)
function archive(callback) {
	if (debug) callback();
	else {
		(async () => {
			zip = (await import('gulp-zip')).default;
			src([dir + '/*', dir + '/*/*', '!'+ dir + '/*.ttf'], { allowEmpty: true })
				.pipe(zip(test ? 'game.zip' : 'game_' + timestamp + '.zip'))
				.pipe(advzip({ optimizationLevel: 4, iterations: 10 }))
				.pipe(dest('zip/'))
				.on('end', callback);
		})();
	}
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
exports.default = series(prep, ico, sw, app, cs, mf, mangle, assets, pack, clean, archive, check, watch);
exports.prod = series(prep, ico, sw, app, cs, mf, mangle, assets, pack, clean, watch);
exports.sync = series(ico, app, cs, mangle, assets, pack, clean, reload);
exports.zip = series(archive, check);

/*
   JS13K Template Gulpfile by Noncho Savov
   https://www.FoumartGames.com
*/
