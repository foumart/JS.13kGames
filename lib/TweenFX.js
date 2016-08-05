var TweenFX = (function() {
			
	var paused = false;
	var rate = 17;
	var regex = /[+-]?\d+(\.\d+)?/g;
	var props = ["top","left","right","bottom"];
	
	var tweenedElements = [];
	var tweenedIntervals = [];
	
	function tweenTo(_element, _duration, _object, _callback, _arguments){// duration currently means number of iterations. Timely management system? (_duration*rate)
		var i;
		var count = 0;
		var obj;
		var mod;
		var tweenObj = [];
		var interval;
		var style = _element.style;
		
		for(obj in _object){
			if(obj == "delay"){
				count = - _object[obj];
			} else {
				if(obj == "x"){// we can use x, y and alpha... will have to figure out scale and rotate transforms..
					mod = props[1];
				} else if(obj == "y"){
					mod = props[0];
				} else if(obj == "alpha"){
					mod = "opacity";
				} else mod = obj;
				tweenObj.push({property:mod, start:getValue(_element, mod), end:_object[obj]});
			}
		}
		
		if(stopTween(_element) > -1) console.log("x:"+_element+"("+_element.id+")");
		
		if(tweenObj.length) {
			interval = setInterval(tween, rate);
			tweenedIntervals.push(interval);
			tweenedElements.push(_element);
			tween();
		}
		function tween(){
			if(!paused){
				count += 1;
				if(count > 0){
					for(i = 0; i < tweenObj.length; i++){
						if(tweenObj[i].start > tweenObj[i].end){
							obj = tweenObj[i].end + (tweenObj[i].start - tweenObj[i].end) / _duration * (_duration-count);
						} else {
							obj = tweenObj[i].start - (tweenObj[i].start - tweenObj[i].end) / _duration * count;
						}
						style[tweenObj[i].property] = ((count >= _duration) ? tweenObj[i].end : obj) + ((props.indexOf(tweenObj[i].property)>-1)?"px":"");
					}
					if(count >= _duration){// >= or > ?
						stopTween(_element);
						if(_callback != null) {
							_arguments.unshift(_element);// adding the tweened element in the beginning of the arguments list (still wondering if it's reasonable)
							_callback.apply(this, _arguments);
						}
					}
				}
			}
		}
		function getTween(_el){
			return tweenedElements.indexOf(_el);
		}
		function stopTween(_el, _id){
			if(_el) _id = getTween(_el);
			if(_id > -1){
				clearInterval(tweenedIntervals[_id]);
				tweenedIntervals.splice(_id, 1);
				tweenedElements.splice(_id, 1);
			}
			return _id;
		}
		function removeAllTweens(){
			for(var _id = tweenedElements.length-1; _id > 0; _id--){
				stopTween(null, _id);
			}
		}
	}
	
	// extracts the floating number from an element's computed style property value
	function getValue(_element, _property){
		return parseFloat(window.getComputedStyle(_element, null).getPropertyValue(_property).match(regex).map(function (v){return parseFloat(v);}));
	}
	
	return{
		// TweenFX global methods:
		// =======================
		// TweenFX.to(element, 10, {left:100}, TweenFX.to, element, 10, {top:100}); - example of performing two consecutive tweens with a callback
		to:function(_element, _duration, _object, _callback){
			tweenTo(_element, _duration, _object, _callback, Array.apply(null, arguments).slice(4));
		},
		
		// TweenFX.getValue(element, "left") - extracts the "left" property floating number from an element's style
		getValue:function(_element, _property){
			return getValue(_element, _property);
		},
		
		// TweenFX.pause()			toggles pause
		// TweenFX.pause(true)		override pause
		// TweenFX.pause(false)		override unpause
		// TweenFX.pause(null)		just gets the pause value
		pause:function(){
			if(arguments.length) {
				if(arguments[0] || arguments[0] === false) paused = arguments[0];
			} else paused = !paused;
			return paused;
		},
		
		// TweenFX.stop(element);	stop the tweens of an element
		// TweenFX.stop();			stop all tweens currently in progress
		stop:function(_element){
			if(stopTween(_element) > -1) return;
			removeAllTweens();
		},
		
		// TweenFX.setRate(_rate);	sets the global rate in milliseconds
		setRate:function(_rate){
			rate = _rate;
		}
	}
})();
