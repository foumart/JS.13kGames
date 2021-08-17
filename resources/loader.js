// web monetization functionality
let _monetization;

function checkMonetization() {
	if (document.monetization) {
		if (document.monetization.state == "started") {
			updateMonetization();
		} else {
			document.monetization.addEventListener("monetizationstart", () => {
				if (!_monetization) {
					updateMonetization();
				}
			});
		}
	}
}

function updateMonetization() {
	_monetization = true;
	// update ui
}


// fullscreen functionality
let _fullscreen;

document.addEventListener("fullscreenchange", updateFullscreen);

function updateFullscreen() {
	_fullscreen = document.fullscreenElement;
	// update ui
}

// trigger fullscreen
function toggleFullscreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}


// loader
function init() {
	checkMonetization();
	updateFullscreen();
	runGame();
}