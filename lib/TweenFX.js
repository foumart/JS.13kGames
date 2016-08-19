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
                tweenObj.push({property:mod, start:getStyle(_element, mod), end:_object[obj]});
            } else if(mods.indexOf(obj)>-1){
                if(!trans) trans = getTransform(_element);
            }
        }
        
        if(trans){//we have to tween style.transforms. Must include all transform properties nomatter if we have to tween them or not, because we have to rebuild the transform string
            for(i = 0; i < mods.length; i++){
                obj = mods[i];
                mod = _object.hasOwnProperty(obj);
                if(obj == mods[1]){// use scale as scaleX and scaleY
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
        
        stopTween(_element);
        
        if(tweenObj.length) {
            tweenedIntervals.push(requestAnimationFrame(tween));
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
                    mod += ((props.indexOf(tweenObj[i].property) > 1) ? "px" : ((!mods.indexOf(tweenObj[i].property))?"deg":"") );
                    if(props.indexOf(tweenObj[i].property) > -1){
                        _element.style[tweenObj[i].property] = mod;//modify any tweened styles
                    } else {
                        trans += tweenObj[i].property+"("+mod+") ";//rebuilding the whole transform string
                    }
                }
                if(trans.length) _element.style.transform = trans;
                if(count >= _duration){
                    stopTween(_element);
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
        function stopTween(_el, _id){
            if(_el) _id = getTween(_el);
            if(_id > -1){
                cancelAnimationFrame(tweenedIntervals.splice(_id, 1));
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
    function getStyle(_element, _property){
        return 1*((window.getComputedStyle(_element, null).getPropertyValue(_property).match(regex)||[0]).map(function (v){return 1*v;}));
    }
    
    // extracts the element's computed style transformation property value, or a whole object of properies (rotate and scale)
    function getTransform(_element, _property){
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
            if(stopTween(_element) > -1) return;
            removeAllTweens();
        },
        
        getStyle:getStyle,
        
        getTransform:getTransform
        
    };
})();
