var SoundFX = (function() {
	// Note: The Web Audio API will be included in the Chrome autoplay policy with M71 (December 2018).
	// Audio Context needs to be initialized after some sort of user interaction has been occured first, otherwise
	// it will be created in the "suspended" state and you will need to call resume() after a user gesture is received.
	// To prevent that and to avoid seeing warnings in the console, use the method SoundFX.start()
	
	var audioContext;
	var oscTypes = ["square", "sawtooth", "triangle", "sine"];
	var initialized;
	var volume = 1;
	
	// initialize the SoundFX library
	function start(_volume){
		try {
			audioContext = new (
				window.AudioContext ||
				window.webkitAudioContext ||
				window.mozAudioContext ||
				window.msAudioContext ||
				window.oAudioContext
			)();
			if(_volume) setVolume(_volume);
			initialized = true;
			console.log("[Event] AudioContext initialized");
		} catch(e){
			console.log("[Warning] AudioContext not found",e);
		}
	}
	
	
	// start frequency HZ
	// frequency change in time + / -
	// length (number of frames taking to play the sound)
	// volume of the current sound: 0.0 - 1.0 (multiplied by SoundFX.volume)
	// oscillator type (0:square, 1:sawtooth 2:triangle, 3:sine)
	// starting delay (frames of silence before the sound starts)
	// starting pitch (0:normal, 1:full pitch, 2 - _duration/4: number of frames added to lower the sound at the beginning)
	
	function playSound(_frequency, _change, _duration, _volume, _type, _delay, _pitch){
		
		// validation
		if(!audioContext || !_duration || !_volume) return;
		if(_pitch > _duration/4|0) _pitch = _duration/4|0;
		
		// instantiate oscillator
		var oscillator = audioContext.createOscillator();
		oscillator.frequency.value = _frequency;
		oscillator.type = oscTypes[_type%4|0];
		
		// instantiate modulation for sound volume control
		var modulationGain = audioContext.createGain();
		
		// set the volume to 0 at the beginning to prevent sound glitches
		modulationGain.gain.value = 0;
		
		// frame counter, using requestAnimationFrame - all measures are in frames
		var i = 0;
		
		playTune();
		
		function playTune(){
			if(!_volume) return;
			if(!_delay) {
				if(!i){
					oscillator.connect(modulationGain).connect(audioContext.destination);
					oscillator.start();

					// Note: ideally we should use modulationGain.gain.linearRampToValueAtTime at the beginning and the end
					// of the sound to gradually ramp the volume, but this method does not work well with mozilla firefox.

					// Make sure to stop the sound from playing in the background (when the tab is inactive)
					// since the requesAnimationFrame is suspended when in the background if we don't stop the sound
					// it will play a single note continously
					oscillator.stop(audioContext.currentTime+(_duration-i)/60);
				} else {
					// ramp the volume up at start by [_pitch] frames, then gradually ramp it down until the sound ends
					modulationGain.gain.value = (i<=_pitch ? (1/_pitch)*i : 1-i/_duration) * _volume * volume;
					oscillator.frequency.value = _frequency + _change * i;
				}
			}
			if(_delay&&_delay-- || i++ < _duration) requestAnimationFrame(playTune);
		}
	}
	return{
		start:start,
		playSound:playSound,
		getVolume:function(){
			return volume;
		},
		setVolume:function(_volume){
			volume = _volume>1 ? 1 : _volume<0 ? 0 : _volume;
		},
		jump:function(){
			playSound(150, 30, 20, .5);
		},
		pew:function(){
			playSound(920, -80, 15, .5);
		},
		zap:function(){
			playSound(500, -200, 20, .5, 1);
		},
		bounce:function(){
			playSound(260, -60, 15, .5, 2);
		},
		stuck:function(){
			playSound(100, -10, 15, 1, 2);
		},
		explosion:function(){
			playSound(100, -10, 20, .5);
			playSound(125, -5, 45, 0.1, 1);
			playSound(40, 2, 20, 1, 2);
			playSound(200, -4, 50, 0.25, 2);
		},
		blow:function(){
			playSound(120, -6, 15, 0.1, 1);
			playSound(40, -2, 25, 1, 2);
			playSound(60, 10, 15, 0.1, 1);
			playSound(160, -5, 30, 0.1, 3);
		},
		shot:function(){
			playSound(160, 10, 10, 0.1);
			playSound(250, -20, 15, 0.1, 1);
			playSound(1500, -150, 15, 0.1, 1);
		},
		coin:function(){
			playSound(510, 0, 20, 0.1);
			playSound(2600, 1, 50, 0.2, 0, 20);
		}
	}
})();
