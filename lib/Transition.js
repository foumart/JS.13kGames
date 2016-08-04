var Transition = (function() {
			
	var paused;
	var rate = 17;
	var regex = /[+-]?\d+(\.\d+)?/g;
	var props = ["top","left","right","bottom"];
	
	function tweenTo(_element, _duration, _object, _callback, _arguments){// duration currently means number of iterations. Timely management system? (_duration*rate)
		var i;
		var count = 0;
		var obj;
		var mod;
		var tweenObj = [];
		var interval;
		var element = window.getComputedStyle(_element, null);
		var style = _element.style;
		
		for(obj in _object){
			if(obj == "delay"){
				count = - _object[obj];
			} else {
				if(obj == "x"){//modifications so we can use x, y and alpha... will have to figure out transforms..
					mod = "left";
				} else if(obj == "y"){
					mod = "top";
				} else if(obj == "alpha"){
					mod = "opacity";
				} else mod = obj;
				tweenObj.push({property:mod, start:getValue(mod, element.getPropertyValue(mod)), end:_object[obj]});
			}
		}
		
		if(tweenObj.length) {// not implemented as tweenObj is a local variable atm
			if(interval){log("WARNING:"+_element.id+" is already being tweened !");
				clearInterval(interval);
			}
			interval = setInterval(tween, rate);
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
						style[tweenObj[i].property] = (props.indexOf(tweenObj[i].property)>-1) ? obj+"px" : obj;
					}
					if(count > _duration){// >= ?
						clearInterval(interval);
						if(_callback != null) {
							_arguments.unshift(_element);// adding the tweened element in the beginning of the arguments list (still wondering if it's reasonable)
							_callback.apply(this, _arguments);
						}
					}
				}
			}
		}
	}
	
	// extracts the floating number from computed property value
	function getValue(_val, _data){
		return _data.match(regex).map(mapValue);
	}
	function mapValue(v){
		return parseFloat(v);
	}
	
	return{
		to:function(_element, _duration, _object, _callback){
			tweenTo(_element, _duration, _object, _callback, Array.apply(null, arguments).slice(4));//passing the rest of the arguments
		}
	}
})();
