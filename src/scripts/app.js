// Example game initialization script:
function runGame() {
	const div = document.createElement('div');
	div.innerHTML = '<div style=color:aqua;text-align:center;margin:10px>JS13k game ready to launch!</div>';
	document.body.appendChild(div);

	const img = document.createElement('img');
	img.src = 'assets/ship.png';
	img.style = 'position:absolute;left:50%;top:50%;margin:-90px 0 0 -90px;animation:fly 2s ease infinite';
	document.body.appendChild(img);

	const _btn = document.createElement('button');
	_btn.innerHTML = 'Toggle Fullscreen';
	_btn.style = 'position: relative; left: 50%; width: 140px; margin: 5px 0 5px -70px';
	document.body.appendChild(_btn);
	_btn.addEventListener('click', (e) => {
		toggleFullscreen();
	});

	const css = window.document.styleSheets[0];
	css.insertRule(`@keyframes fly {0% {margin-top: -90px;} 50% { margin-top: -110px; } 100% { margin-top: -90px; }}`, css.cssRules.length);
}
