// Progressive Web App service worker initialization script - feel free to remove if you are not going to build a PWA.

// Set debug to true if you want to see logs about caching / fetching of resources and other output.
let _debug;

// If the game is being run as a PWA in its own window, separate from the browser.
let _standalone;

// Track the install banner shown on mobile.
window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

function beforeInstallPrompt(event) {
	event.userChoice.then(choiceResult => {
		if (_debug) console.log("PWA install prompt user choise:" + choiceResult);
		//...
	});
	// Prevent it from triggering again on 'Add' or 'Cancel' click.
	window.removeEventListener("beforeinstallprompt", beforeInstallPrompt);
}

// Listen for the event on successfull install.
window.addEventListener("appinstalled", event => {
	if (_debug) console.log("PWA installed successfully!");
	//...
});

// Progressive web apps can work only on secure connections.
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

function pwaInit() {
	_standalone = window.matchMedia('(display-mode: standalone)').matches;
	// init is located in loader.js - feel free to overwrite.
	init();
}
