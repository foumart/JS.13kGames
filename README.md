# JS.13kGames
Lightweight libraries prepared for js13kGames game jam. Theme to be announced in 13 AUG 2016

Visit the game jam web page: http://js13kgames.com/

For updates follow me on Twitter: <a href="https://twitter.com/FoumartGames" target="_blank">@FoumartGames</a>

### Libraries under 1kb
All libraries are available here for review: http://www.foumartgames.com/dev/js13kGames/js_libraries/

-
-

# TweenFX
Basic DOM element style tweener.

Check TweenFX in action: http://www.foumartgames.com/dev/js13kGames/js_libraries/TweenFX/

## Global Methods:
### TweenFX.to(element, duration, object, callback, arguments)
Example:
```javascript
TweenFX.to(element, 10, {x:100, y:100});
```
Callback Example:
```javascript
TweenFX.to(element, 10, {x:100, y:100}, onComplete, element);
```
Example of performing two consecutive tweens with a callback:
```javascript
TweenFX.to(element, 10, {x:100, y:100}, TweenFX.to, element, 10, {x:0, y:0});
```
-

### TweenFX.pause
Toggle pause ON / OFF:
```javascript
TweenFX.pause();
```
Set pause to ON:
```javascript
TweenFX.pause(true);
```
Set pause to OFF (unpause):
```javascript
TweenFX.pause(false);
```
Simply gets the pause value
```javascript
TweenFX.pause(null);
```

-
### TweenFX.stop
Stop the tweens of an element:
```javascript
TweenFX.stop(element);
```
Stop all tweens currently in progress:
```javascript
TweenFX.stop();
```

-
### TweenFX.getValue
Extracts the "left" property floating number from an element's style:
```javascript
TweenFX.getValue(element, "left");	
```

-
### TweenFX.getTransform
Extracts the "rotate" property angle degrees from an element's transform:
```javascript
TweenFX.getTransform(element, "rotate");
```
Get an object populated with scaleX, scaleY and rotate
```javascript
TweenFX.getTransform(element);
```

-
### Tweenable styles:
* {opacity} - num - tweens style.opacity, also recognized as {alpha}
* {left} - px - tweens style.left, also recognized as {x}
* {top} - px - tweens style.top, also recognized as {y}
* {right} - px - tweens style.right
* {bottom} - px - tweens style.bottom
* {width} - px - tweens style.width
* {height} - px - tweens style.height

-
### Tweenable transform properties:
* {scale} - num - tweens style.transform(scaleX, scaleY);
* {scaleX} - num - tweens style.transform(scaleX);
* {scaleY} - num - tweens style.transform(scaleY);
* {rotate} - deg - tweens style.transform(rotate), also recognized as {rotation}

-

-

# SoundFX
Basic sound effect controller utilizing the Web Audio API (AudioContext's Oscillator and Gain)

Check SoundFX in action: http://www.foumartgames.com/dev/js13kGames/js_libraries/SoundFX/

## Global Methods:
### SoundFX.playSound(startFrequency, frequencyChange, delay, repeat, volume, type)
#### type:
* Square
* Sawtooth
* Triangle
* Sine

#### built in sounds:
* SoundFX.jump()
* SoundFX.pew()
* SoundFX.zap()
* SoundFX.bounce()
* SoundFX.stuck()
* SoundFX.explosion()
* SoundFX.blow()
* SoundFX.shot()
* SoundFX.coin()

#### SoundFX.getMasterVolume()

-

Web Audio API reference: https://www.w3.org/TR/webaudio/



# TypeFX
Lightweight Font < 1.5kb - uses canvas to draw glyphs

## Global Methods:
### TypeFX.drawText(element, text, size, leading, color)
Example:
```javascript
var text = "This is a test string\rWith line break.";
var element = document.createElement("div");
document.body.appendChild(element);
TypeFX.drawText(element, text, 5);
```
-
### TypeFX.drawDiggit(element, charCode or a glyph sring, size, color)
