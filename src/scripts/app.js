// Example game initialization script:
function runGame() {
	document.body.innerHTML = "<div style='color:aqua;text-align:center'>JS13k game ready to launch!</div>";
	const css = window.document.styleSheets[0];
	css.insertRule(`@keyframes fly {0% {margin-top: -77px;} 50% { margin-top: -92px; } 100% { margin-top: -77px; }}`, css.cssRules.length);
	const img = document.createElement('img');
	img.src = 'assets/ship.png';
	img.style = 'position:absolute;left:50%;top:50%;margin:-77px 0 0 -77px;animation:fly 2s ease infinite';
	document.body.appendChild(img);
}
