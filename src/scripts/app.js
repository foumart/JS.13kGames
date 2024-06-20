// Example game initialization script:
function init() {
	const div = document.createElement('div');
	div.innerHTML = '<div style=color:aqua;text-align:center;margin:10px>JS13k game ready to launch!</div>';
	document.body.appendChild(div);

	const img = document.createElement('img');
	img.src = 'assets/ship.png';
	img.style = 'position:absolute;left:50%;top:50%;margin:-90px 0 0 -90px;animation:fly 2s ease infinite';
	document.body.appendChild(img);

	const _btn = document.createElement('button');
	_btn.innerHTML = 'Toggle Fullscreen';
	_btn.style = 'position:absolute;left:50%;width:150px;height:30px;margin:0 0 0 -75px;top:100px';
	document.body.appendChild(_btn);
	
	_btn.addEventListener('click', (e) => {
		toggleFullscreen();
	});

	const _play = document.createElement('button');
	_play.innerHTML = 'PLAY!';
	_play.style = 'position:absolute;left:50%;width:100px;height:50px;margin:0 0 0 -50px;bottom:100px';
	document.body.appendChild(_play);

	_play.addEventListener('click', (e) => {
		playButtonClick();
	});
}

function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}

function playButtonClick() {
	console.log("Play!");
	const css = window.document.styleSheets[0];
	css.insertRule(
		`@keyframes fly {0% {margin-top: -90px;} 50% { margin-top: -110px; } 100% { margin-top: -90px; }}`,
		css.cssRules.length
	);
}
