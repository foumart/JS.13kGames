var debug;

// Register ServiceWorker
if ("serviceWorker" in navigator && location.protocol.substring(0, 5) === "https") {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		let isRegistered;
		for (let i = 0; i < registrations.length; i++) {
			if (window.location.href.indexOf(registrations[i].scope) > -1) isRegistered = true;
		}
		if (isRegistered) {
			if (debug) console.log("ServiceWorker already registered");
		} else {
			navigator.serviceWorker.register("service_worker.js").then(() => {
				if (debug) console.log("ServiceWorker registered successfully");
			}).catch(() => {
				if (debug) console.log("ServiceWorker registration failed");
				init();
			});
		}
	}).catch(() => {
		if (debug) console.log("ServiceWorker bypassed locally");
		init();
	});
	navigator.serviceWorker.ready.then(() => {
		if (debug) console.log('ServiceWorker is now active');
		init();
	});
} else {
	if (debug) {
		if (location.protocol.substring(0, 5) != "https") {
			console.log("ServiceWorker is disabled on localhost");
		} else {
			console.log("ServiceWorker not found in navigator");
		}
	}

	window.addEventListener("load", init);
}

function init() {
	// Init game example:
	document.body.innerHTML = "<div style='color:aqua;text-align:center'>JS13k PWA ready to launch!</div>";
	const css = window.document.styleSheets[0];
	css.insertRule(`@keyframes fly {0% {margin-top: -77px;} 50% { margin-top: -92px; } 100% { margin-top: -77px; }}`, css.cssRules.length);
	const img = document.createElement('img');
	img.src = 'assets/ship.png';
	img.style = 'position:absolute;left:50%;top:50%;margin:-77px 0 0 -77px;animation:fly 2s ease infinite';
	document.body.appendChild(img);
}