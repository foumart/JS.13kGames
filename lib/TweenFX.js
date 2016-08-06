var TweenFX = (function() {
	var paused;
	var regex = /[+-]?\d+(\.\d+)?/g;
	var props = ["alpha","opacity", "left","top","right","bottom","width","height","x","y"];
	var mods = ["rotate", "scale","scaleX","scaleY","translateX","translateY"];
	var tweenedElements = [];
	var tweenedIntervals = [];
	
	function tweenTo(_element, _duration, _object, _callback, _arguments){// duration currently means number of frames
		var i;
		var count = 0;
		var obj;
		var mod;
		var tweenObj = [];
		var interval;
		var trans;
		
		for(obj in _object){
			if(obj == "delay"){
				count = - _object[obj];
			} else {
				if(props.indexOf(obj)>-1){
					if(obj == "x"){
						mod = props[2];
					} else if(obj == "y"){
						mod = props[3];
					} else if(obj == props[0]){
						mod = props[1];
					} else mod = obj;
					tweenObj.push({property:mod, start:getValue(_element, mod), end:_object[obj]});
				} else if(mods.indexOf(obj)>-1){
					if(!trans) trans = getTransform(_element);
				} else {
					console.log("?:"+obj+"("+_object[obj]+")");//warning: unrecognized object passed for tween
				}
			}
		}
		
		if(trans){//we have transform properties to tween - builing an object with all properties nomatter if we have to tween them or not, because we have to rebuild the transform string with all properties included regardless
			//console.log(trans);
			for(i = 0; i < mods.length; i++){
				obj = mods[i];
				mod = _object.hasOwnProperty(obj);
				if(obj == mods[1]){// distribute scale to scaleX and scaleY
					if(mod){
						tweenObj.push({property:mods[2], start:trans[mods[2]], end:_object[obj]});
						tweenObj.push({property:mods[3], start:trans[mods[3]], end:_object[obj]});
						i+=2;
					}
				} else {
					tweenObj.push({property:obj, start:trans[obj], end:(mod)?_object[obj]:trans[obj]});
				}
			}
		}
		//console.log(tweenObj);
		if(stopTween(_element) > -1) console.log("x:"+_element+"("+_element.id+")");//warning: tween has been overrided by another tween of the same element
		
		if(tweenObj.length) {
			interval = requestAnimationFrame(tween);
			tweenedIntervals.push(interval);
			tweenedElements.push(_element);
		}
		function tween(){
			if(!paused){
				count += 1;
				trans = "";
				for(i = 0; i < tweenObj.length; i++){
					if(tweenObj[i].start == tweenObj[i].end){
						mod = tweenObj[i].end;
					} else {
						if(tweenObj[i].start > tweenObj[i].end){
							obj = tweenObj[i].end + (tweenObj[i].start - tweenObj[i].end) / _duration * (_duration-count);
						} else {
							obj = tweenObj[i].start - (tweenObj[i].start - tweenObj[i].end) / _duration * count;
						}
						mod = ((count >= _duration) ? tweenObj[i].end : obj);
					}
					mod += ((props.indexOf(tweenObj[i].property) > 1 || mods.indexOf(tweenObj[i].property)>3)?"px":((!mods.indexOf(tweenObj[i].property))?"deg":""));
					if(props.indexOf(tweenObj[i].property)>-1){
						_element.style[tweenObj[i].property] = mod;//modify any tweened style values
					} else {
						trans += tweenObj[i].property+"("+mod+") ";//build the whole transform string
					}
				}
				if(trans.length) _element.style.transform = trans;
				if(count >= _duration){
					stopTween(_element);//console.log(getTransform(_element));
					if(_callback != null) {
						_arguments.unshift(_element);// adding the tweened element in the beginning of the arguments list (still wondering if it's reasonable)
						_callback.apply(this, _arguments);
					}
					return;
				}
			}
			i = tweenedElements.indexOf(_element);
			if(i > -1) tweenedIntervals[i] = requestAnimationFrame(tween);
		}
		function getTween(_el){
			if(!_el) return tweenedElements.length;
			return tweenedElements.indexOf(_el);
		}
		function stopTween(_el, _id){
			if(_el) _id = getTween(_el);
			if(_id > -1){
				cancelAnimationFrame(tweenedIntervals[_id]);
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
	
	// extracts the element's computed style transformation property value, or a whole object of properies (angle, scale, skew and translate)
	function getTransform(_element, _property){
		var transform = window.getComputedStyle(_element, null).getPropertyValue("transform").replace("matrix(", "").replace("matrix3d(", "").replace(")", "").split(", ");
		//console.log(transform);
		if(transform.length==16){//matrix3d
			transform = [transform[0],transform[1],transform[4],transform[5],transform[12],transform[13]];
		} else if(transform.length<6){//none
			transform = [1,0,0,1,0,0];
		}
		if(_property) return getTransformObject(transform)[_property];
		return getTransformObject(transform);
	}
	function getTransformObject(a) {
		return {
			scaleX: Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2)),
			scaleY: Math.sqrt(Math.pow(a[2], 2) + Math.pow(a[3], 2)),
			rotate: (180/Math.PI) * Math.atan2(a[3], a[2]) - 90,
			translateX: parseFloat(a[4]),
			translateY: parseFloat(a[5])
		};
	}
	
	return{
		// TweenFX global methods:
		// =======================
		
		// TweenFX.to(element, 10, {x:100, y:100}, TweenFX.to, element, 10, {x:0, y:0}); - example of performing two consecutive tweens with a callback
		
		// tweenable styles:
		// -----------------
		// {left:100}		tweens style.left, also recognized as {x:100}
		// {top:100}		tweens style.top, also recognized as {y:100}
		// {right:100}		tweens style.right
		// {bottom:100}		tweens style.bottom
		// {width:100}		tweens style.width
		// {height:100}		tweens style.height
		
		// tweenable transform properties:
		// -------------------------------
		// {scale:1}		tweens style.transform(scaleX) and scaleY
		// {scaleX:1}		tweens style.transform(scaleX)
		// {scaleY:1}		tweens style.transform(scaleY)
		// {rotate:90}		tweens style.transform(rotate), also recognized as {rotation:90}
		// {translateX:10}	tweens style.transform(translateX)
		// {translateY:10}	tweens style.transform(translateY)
		
		// TweenFX.pause()			toggles pause ON/OFF
		// TweenFX.pause(true)		set pause to ON
		// TweenFX.pause(false)		set pause to OFF (unpause)
		// TweenFX.pause(null)		just gets the pause value
		
		// TweenFX.stop(element);	stop the tweens of an element
		// TweenFX.stop();			stop all tweens currently in progress
		
		// TweenFX.getValue(element, "left");			extracts the "left" property floating number from an element's style
		// TweenFX.getTransform(element, "rotate");		extracts the "rotate" property angle degrees from an element's transform
		// ============
		
		to:function(_element, _duration, _object, _callback){
			tweenTo(_element, _duration, _object, _callback, Array.apply(null, arguments).slice(4));
		},
		
		pause:function(){
			if(arguments.length) {
				if(arguments[0] || arguments[0] === false) paused = arguments[0];
			} else paused = !paused;
			return paused;
		},
		
		stop:function(_element){
			if(stopTween(_element) > -1) return;
			removeAllTweens();
		},
		
		getValue:function(_element, _property){
			return getValue(_element, _property);
		},
		
		getTransform:function(_element, _property){
			return getTransform(_element, _property);
		}
	}
})();
