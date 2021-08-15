const { src, dest, series } = require('gulp');
const minify = require("gulp-minify");
const concat = require("gulp-concat");
const htmlmin = require("gulp-htmlmin");
const replace = require("gulp-string-replace");
const htmlreplace = require("gulp-html-replace");
const cleanCSS = require("gulp-clean-css");
const closureCompiler = require('google-closure-compiler').gulp();
const del = require("del");
const argv = require("yargs").argv;
const gulpif = require("gulp-if");
const imagemin = require('gulp-imagemin');
const zip = require('gulp-zip');
const advzip = require('gulp-advzip');
const package = require("./package.json");

const replaceOptions = { logs: { enabled: false } };
const timestamp = getDateString();

// options taken from package.json
const title = package.name;
const id_name = `${title.replace(/\s/g, "")}_${getDateString(true)}`;
const version = package.version;

// display console logs
const debug = argv.debug === undefined ? false : true;

// don't use versioned zip file
const test = argv.test === undefined ? false : true;

// output directory
const dir = argv.dir || "public";

// monetization pointer - needs to be set in package.json
const monetization = package.monetization;

// include html tags for mobile
const mobile = argv.mobile != undefined || argv.all != undefined ? `
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" sizes="144x144" href="ico.svg"/>` : false;

// include html tags for social media
const social = argv.social != undefined || argv.all != undefined ? `
<meta name="application-name" content="${title}"/>
<meta name="description" content="${package.description}"/>
<meta name="keywords" content="${package.keywords}"/>
<meta name="author" content="${package.author.name}"/>
<meta name="twitter:card" content="summary"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${package.description}"/>
<meta name="twitter:image" content="ico.svg"/>` : false;


// prepare an icon used by html and pwa
function ico(callback) {
	src('src/ico.svg')
		.pipe(imagemin([imagemin.svgo({
			plugins: [
				{removeViewBox: false},
				{cleanupIDs: true}
			]
		})]))
		.pipe(dest(dir + '/'))
		.on("end", callback)
}

// compress assets
function assets(callback) {
	src('src/assets/*')
		.pipe(imagemin([imagemin.optipng({optimizationLevel: 7})]))
		.pipe(dest(dir + '/assets/'))
		.on("end", callback)
}

// prepare service worker script
function sw(callback) {
	src(['src/service_worker.js'], { allowEmpty: true })
		.pipe(replace("var debug;", `var debug = ${debug ? "true" : "false"};`, replaceOptions))
		.pipe(replace("{ID_NAME}", id_name, replaceOptions))
		.pipe(replace("{VERSION}", version, replaceOptions))
		.pipe(gulpif(!debug, replace("caches", "window.caches", replaceOptions)))
		.pipe(
			gulpif(
				!debug,
				closureCompiler({
					compilation_level: "ADVANCED_OPTIMIZATIONS",
					warning_level: "QUIET",
					language_in: "ECMASCRIPT6",
					language_out: "ECMASCRIPT6"
				})
			)
		)
		.pipe(gulpif(!debug, replace("window.caches", "caches", replaceOptions)))
		.pipe(gulpif(!debug, replace('"use strict";', "", replaceOptions)))
		.pipe(gulpif(!debug, minify({ noSource: true })))
		.pipe(concat('sw.js'))
		.pipe(dest(dir + '/'))
		.on("end", callback)
}

// prepare pwa initialization and game scripts
function app(callback) {
	src(["src/scripts/*"], { allowEmpty: true })
		.pipe(replace("var debug;", `var debug = ${debug ? "true" : "false"};`, replaceOptions))
		.pipe(
			gulpif(
				!debug,
				closureCompiler({
					compilation_level: "SIMPLE_OPTIMIZATIONS",
					warning_level: "QUIET",
					language_in: "ECMASCRIPT6",
					language_out: "ECMASCRIPT6"
				})
			)
		)
		.pipe(replace('service_worker', 'sw', replaceOptions))
		.pipe(gulpif(!debug, replace('"use strict";', "", replaceOptions)))
		.pipe(gulpif(!debug, minify({ noSource: true })))
		.pipe(concat('temp.js'))
		.pipe(dest(dir + '/tmp/'))
		.on('end', callback)
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
		.on("end", callback)
}

// prepare web manifest file
function pwa(callback) {
	src('src/mf.webmanifest', { allowEmpty: true })
		.pipe(replace('service_worker', 'sw', replaceOptions))
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest(dir + '/'))
		.on("end", callback);
}

// inline js and css into html and remove unnecessary stuff
function pack(callback) {
	var fs = require('fs');
	src(dir + '/tmp/temp.html', { allowEmpty: true })
		.pipe(replace('{TITLE}', title, replaceOptions))
		.pipe(replace('minimum-scale=1,maximum-scale=1,', '', replaceOptions))
		.pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
		.pipe(replace('"', '', replaceOptions))
		.pipe(replace('rep_cs', '<style>' + fs.readFileSync(dir + '/tmp/temp.css', 'utf8') + '</style>', replaceOptions))
		.pipe(replace('rep_js', '<script>' + fs.readFileSync(dir + '/tmp/temp.js', 'utf8') + '</script>', replaceOptions))
		// Closure Compiler sometimes breaks the document.monetization. Use the following to fix it:
		//.pipe(replace('document.s', 'document.monetization', replaceOptions))
		.pipe(concat('index.html'))
		.pipe(dest(dir + '/'))
		.on("end", callback);
}

// delete the temporary folder generated during packaging
function clean(callback) {
	del(dir + "/tmp/");
	callback();
}

// package zip
function archive(callback) {
	src(dir + '/*')
		.pipe(zip(test ? 'game.zip' : 'game_' + timestamp + '.zip'))
		.pipe(advzip({ optimizationLevel: 4, iterations: 1000 }))
		.pipe(dest('zip/'))
		.on("end", callback);
}

// output filesize
function check(callback) {
	var fs = require('fs');
	const size = fs.statSync(test ? 'zip/game.zip' : 'zip/game_' + timestamp + '.zip').size;
	const limit = 1024 * 13;
	const left = limit - size;
	const percent = Math.abs(Math.round((left / limit) * 10000) / 100);
	console.log(`        ${size}        ${left} bytes ${left < 0 ? 'overhead' : 'remaining'} (${percent}%)`);
	callback();
}

// helper function
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
exports.pack = series(assets, ico, sw, app, css, html, pwa, pack, clean);
exports.zip = series(archive, check);
exports.default = series(assets, ico, sw, app, css, html, pwa, pack, clean, archive, check);
