// Progressive Web App service worker initialization script - feel free to remove if you are not going to build a PWA.

// Set debug to true if you want to see logs about caching / fetching of resources and other output.
let _debug;

// Progressive web apps can work only with secure connections.
const _online = location.protocol.substring(0, 5) === "https";

// Service worker detection and installation script:
if ("serviceWorker" in navigator && _online) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		let isRegistered;
		for (let i = 0; i < registrations.length; i++) {
			if (window.location.href.indexOf(registrations[i].scope) > -1) isRegistered = true;
		}
		if (isRegistered) {
			if (_debug) console.log("ServiceWorker already registered");
		} else {
			navigator.serviceWorker.register("service_worker.js").then(() => {
				if (_debug) console.log("ServiceWorker registered successfully");
			}).catch(() => {
				if (_debug) console.log("ServiceWorker registration failed");
				pwaInit();
			});
		}
	}).catch(() => {
		if (_debug) console.log("ServiceWorker bypassed locally");
		pwaInit();
	});
	navigator.serviceWorker.ready.then(() => {
		if (_debug) console.log('ServiceWorker is now active');
		pwaInit();
	});
} else {
	if (_debug) {
		if (location.protocol.substring(0, 5) != "https") {
			console.log("ServiceWorker is disabled on localhost");
		} else {
			console.log("ServiceWorker not found in navigator");
		}
	}

	window.addEventListener("load", pwaInit);
}

// Record if the game is being run as a PWA in its own window, separate from the browser.
//let _standalone;

function pwaInit() {
	//_standalone = window.matchMedia('(display-mode: standalone)').matches;
	
	// init is located in loader.js - feel free to overwrite.
	init();
}

/*
// Provide your own in-app install experience: https://web.dev/customize-install/
// Here we are capturing the install prompt and invoking it later on user input:
let _deferredPrompt;

window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

// Generate the user input button which will trigger the install prompt
const _btn = document.createElement('button');
_btn.innerHTML = "Install PWA";
_btn.style = "display: none; position: relative; left: 50%; width: 100px; margin: 5px 0 5px -50px";
document.body.appendChild(_btn);

function beforeInstallPrompt(event) {
	event.preventDefault();
	_deferredPrompt = event;
	_btn.style.display = 'block';

	_btn.addEventListener('click', (e) => {
		_btn.style.display = 'none';
		// Show the prompt
		_deferredPrompt.prompt();
		// Wait for the user to respond to the prompt
		_deferredPrompt.userChoice.then((choiceResult) => {
			if (_debug) {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted to install the app to his device home screen');
				} else {
					console.log('User dismissed install prompt');
				}
			}
			// Prevent triggering again the prompt on 'Add' or 'Cancel' click.
			window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
			_deferredPrompt = null;
		});
	});
}

// Listen for the event on successfull install.
window.addEventListener("appinstalled", event => {
	if (_debug) console.log("PWA installed successfully!");
	//...
});
*/
