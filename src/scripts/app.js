// Example game initialization script:
function init() {
	const _div = document.createElement('div');
	_div.innerHTML = '<div style=color:aqua;text-align:center;margin:20px>JS13k game ready to launch!</div>';
	document.body.appendChild(_div);

	const _img = document.createElement('img');
	_img.src = 'assets/ship.png';
	_img.style = 'position:absolute;left:50%;top:50%;margin:-90px 0 0 -90px;animation:fly 2s ease infinite';
	document.body.appendChild(_img);

	const _btn = document.createElement('button');
	_btn.innerHTML = 'Toggle Fullscreen';
	_btn.style = 'position:absolute;left:50%;width:150px;height:30px;margin:0 0 0 -75px;';
	document.body.appendChild(_btn);
	
	_btn.addEventListener('click', (e) => {
		toggleFullscreen();
	});

	const _play = document.createElement('button');
	_play.innerHTML = 'PLAY!';
	_play.style = 'position:absolute;left:50%;width:100px;height:50px;margin:0 0 0 -50px;bottom:100px';
	document.body.appendChild(_play);

	_play.addEventListener('click', (e) => {
		_play.style.display = 'none';
		_div.style.display = 'none';
		_btn.style.display = 'none';
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
	
	// Generate the sky starfield
	const cssSky = window.document.styleSheets[0];
	cssSky.insertRule(
		`@keyframes scroll {0% { top: -100%; } 25% { top: -50%; } 50% { top: 0; } 75% { top: 50%; } 100% { top: 100%; }}`,
		cssSky.cssRules.length
	);
	createStarField();
	
	// Start spaceship animation
	const cssShip = window.document.styleSheets[0];
	cssShip.insertRule(
		`@keyframes fly {0% {margin-top: -90px;} 50% { margin-top: -110px; } 100% { margin-top: -90px; }}`,
		cssShip.cssRules.length
	);
}

function createStarField() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	let x, y;

	const stars1 = document.createElement('div');
	stars1.style = `position:absolute;width:${width}px;height:${height}px;top:-${height}px;overflow:unset;animation:scroll 4s linear infinite`;
	document.body.insertBefore(stars1, document.body.firstChild);

	const stars2 = document.createElement('div');
	stars2.style = `position:absolute;width:${width}px;height:${height}px;top:-${height}px;overflow:unset;animation:scroll 4s linear 2s infinite`;
	document.body.insertBefore(stars2, document.body.firstChild);

	setTimeout(i => {
		stars1.innerHTML = `<svg fill="#5ae" viewBox="0 0 ${width} ${height}"></svg>`;
		stars2.innerHTML = `<svg fill="#5ae" viewBox="0 0 ${width} ${height}"></svg>`;
		for (i = 99; i--;) {
			x = Math.random()*width;
			y = Math.random()*height;
			stars1.children[0].innerHTML += `<text x=${x} y=${y}>■</text>`;
			stars2.children[0].innerHTML += `<text x=${x} y=${y}>■</text>`;
		}
	}, 1);
}