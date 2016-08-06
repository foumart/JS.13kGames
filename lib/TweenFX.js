var TweenFX = (function() {
	var paused,
		regex = /[+-]?\d+(\.\d+)?/g,
		props = ["alpha","opacity", "left","top","right","bottom","width","height","x","y"],
		mods = ["rotate", "scale","scaleX","scaleY"],
		tweenedElements = [],
		tweenedIntervals = [];
	
	function tweenTo(_element, _duration, _object, _callback, _arguments){// duration represents the number of animation frames needed to reach target
		var i,
			count = 0,
			obj,
			mod,
			tweenObj = [],
			trans;
		
		for(obj in _object){
			if(props.indexOf(obj)>-1){
				if(obj == "x"){// use x, y, alpha as left, top and opacity
					mod = props[2];
				} else if(obj == "y"){
					mod = props[3];
				} else if(obj == props[0]){
					mod = props[1];
				} else mod = obj;
				tweenObj.push({p:mod, s:v(_element, mod), e:_object[obj]});
			} else if(mods.indexOf(obj)>-1){
				if(!trans) trans = t(_element);
			}
		}
		
		if(trans){//we have to tween style.transforms. Must include all transform properties nomatter if we have to tween them or not, because we have to rebuild the transform string
			for(i = 0; i < mods.length; i++){
				obj = mods[i];
				mod = _object.hasOwnProperty(obj);
				if(obj == mods[1]){// use scale as scaleX and scaleY
					if(mod){
						tweenObj.push({p:mods[2], s:trans[mods[2]], e:_object[obj]});
						tweenObj.push({p:mods[3], s:trans[mods[3]], e:_object[obj]});
						i+=2;
					}
				} else {
					tweenObj.push({p:obj, s:trans[obj], e:(mod)?_object[obj]:trans[obj]});
				}
			}
		}
		
		s(_element);
		
		if(tweenObj.length) {
			tweenedIntervals.push(requestAnimationFrame(tween));
			tweenedElements.push(_element);
		}
		function tween(){
			if(!paused){
				count += 1;
				trans = "";
				for(i = 0; i < tweenObj.length; i++){
					if(tweenObj[i].s == tweenObj[i].e){
						mod = tweenObj[i].e;
					} else {
						if(tweenObj[i].s > tweenObj[i].e){
							obj = tweenObj[i].e + (tweenObj[i].s - tweenObj[i].e) / _duration * (_duration-count);
						} else {
							obj = tweenObj[i].s - (tweenObj[i].s - tweenObj[i].e) / _duration * count;
						}
						mod = ((count >= _duration) ? tweenObj[i].e : obj);
					}
					mod += ((props.indexOf(tweenObj[i].p) > 1) ? "px" : ((!mods.indexOf(tweenObj[i].p))?"deg":"") );
					if(props.indexOf(tweenObj[i].p) > -1){
						_element.style[tweenObj[i].p] = mod;//modify any tweened styles
					} else {
						trans += tweenObj[i].p+"("+mod+") ";//rebuilding the whole transform string
					}
				}
				if(trans.length) _element.style.transform = trans;
				if(count >= _duration){
					s(_element);
					if(_callback) _callback.apply(this, _arguments);
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
		function s(_el, _id){//stopTween
			if(_el) _id = getTween(_el);
			if(_id > -1){
				cancelAnimationFrame(tweenedIntervals[_id]);
				tweenedIntervals.splice(_id, 1);
				tweenedElements.splice(_id, 1);
			}
			return _id;
		}
		function r(){//removeAllTweens
			for(var _id = tweenedElements.length-1; _id > 0; _id--){
				stopTween(null, _id);
			}
		}
	}
	
	// extracts the floating number from an element's computed style property value
	function v(_element, _property){//getValue
		return 1*(window.getComputedStyle(_element, null).getPropertyValue(_property).match(regex).map(function (v){return 1*v;}));
	}
	
	// extracts the element's computed style transformation property value, or a whole object of properies (rotate and scale)
	function t(_element, _property){//getTransform
		var transform = window.getComputedStyle(_element, null).getPropertyValue("transform").replace("matrix(", "").replace("matrix3d(", "").replace(")", "").split(", ");
		if(transform.length == 16){
			transform = [transform[0],transform[1],transform[4],transform[5]];
		} else if(transform.length < 6){
			transform = [1,0,0,1];
		}
		if(_property) return getTransformObject(transform)[_property];
		return getTransformObject(transform);
	}
	function getTransformObject(a) {
		return {
			scaleX: Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2)),
			scaleY: Math.sqrt(Math.pow(a[2], 2) + Math.pow(a[3], 2)),
			rotate: (180/Math.PI) * Math.atan2(a[3], a[2]) - 90
		};
	}
	
	return{
		// TweenFX global methods:
		// =======================
		
		// TweenFX.to(element, 10, {x:100, y:100}, TweenFX.to, element, 10, {x:0, y:0}); - example of performing two consecutive tweens with a callback
		
		// tweenable styles:
		// -----------------
		// {opacity:1}		tweens style.opacity,	also recognized as {alpha:1}
		// {left:100}		tweens style.left,	also recognized as {x:100}
		// {top:100}		tweens style.top,	also recognized as {y:100}
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
		
		// TweenFX.pause()		toggles pause ON/OFF
		// TweenFX.pause(true)		set pause to ON
		// TweenFX.pause(false)		set pause to OFF (unpause)
		// TweenFX.pause(null)		just gets the pause value
		
		// TweenFX.stop(element);	stop the tweens of an element
		// TweenFX.stop();		stop all tweens currently in progress
		
		// TweenFX.getValue(element, "left");		extracts the "left" property floating number from an element's style
		// TweenFX.getTransform(element, "rotate");	extracts the "rotate" property angle degrees from an element's transform
		// ============
		
		to:function(_element, _duration, _object, _callback){
			tweenTo(_element, _duration, _object, _callback, Array.apply(null, arguments).slice(4));
		},
		
		pause:function(_p){
			if(arguments.length) {
				if(_p || _p === false) paused = _p;
			} else paused = !paused;
			return paused;
		},
		
		stop:function(_element){
			if(s(_element) > -1) return;
			r();
		},
		
		getValue:function(_element, _property){
			return v(_element, _property);
		},
		
		getTransform:function(_element, _property){
			return t(_element, _property);
		}
	}
})();
