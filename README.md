# JS.13kGames

### Progressive Web App starter pack

#### Setup
1. Run `npm install` to install build dependencies.

2. Run `npm start` to build the game, report archive size and serve the game locally into a new browser tab at http://localhost:8080/

---

#### Note

This is work in progress for JS13k 2021. All the old `Less than 1kb libraries` will be revised at later stage.

I will use this as template for my new 2021 compo entry and will make revision during development of the game.

There is no Live reload implemented in the template yet.

---

### Less than 1kb libraries old Readme

---

Lightweight libraries prepared for js13kGames JavaScript coding competition.


#### TweenFX.js - basic tweener for styles and transforms in 900 bytes
#### SoundFX.js - sound controller with 9 predefined sound effects in 750 bytes
#### TypeFX.js - pixel font with a full glyph set (10x5px size) in 1250 bytes

#

Visit the compo web page: http://js13kgames.com/ or follow these twitter tags: [#js13k](https://twitter.com/search?src=typd&q=%23js13k) ; [#js13kgames](https://twitter.com/search?src=typd&q=%23js13kgames)

#

For updates follow me on Twitter: <a href="https://twitter.com/FoumartGames" target="_blank">@FoumartGames</a>

### Demos:
http://www.foumartgames.com/dev/js13kGames/js_libraries/

### SoundFX Generator:
http://www.foumartgames.com/dev/js13kGames/js_libraries/SoundFXGenerator/


---

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

#

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

#

### TweenFX.stop
Stop the tweens of an element:
```javascript
TweenFX.stop(element);
```
Stop all tweens currently in progress:
```javascript
TweenFX.stop();
```

#

### TweenFX.getValue
Extracts the "left" property floating number from an element's style:
```javascript
TweenFX.getValue(element, "left");	
```

#

### TweenFX.getTransform
Extracts the "rotate" property angle degrees from an element's transform:
```javascript
TweenFX.getTransform(element, "rotate");
```
Get an object populated with scaleX, scaleY and rotate
```javascript
TweenFX.getTransform(element);
```

#

### Tweenable styles:
* {opacity} - num - tweens style.opacity, also recognized as {alpha}
* {left} - px - tweens style.left, also recognized as {x}
* {top} - px - tweens style.top, also recognized as {y}
* {right} - px - tweens style.right
* {bottom} - px - tweens style.bottom
* {width} - px - tweens style.width
* {height} - px - tweens style.height

#

### Tweenable transform properties:
* {scale} - num - tweens style.transform(scaleX, scaleY);
* {scaleX} - num - tweens style.transform(scaleX);
* {scaleY} - num - tweens style.transform(scaleY);
* {rotate} - deg - tweens style.transform(rotate), also recognized as {rotation}

---

# SoundFX
Basic sound effect controller utilizing the Web Audio API (AudioContext's Oscillator and Gain)

Check SoundFX in action: http://www.foumartgames.com/dev/js13kGames/js_libraries/SoundFX/

JSFiddle: https://jsfiddle.net/Foumart/1bdk8ks2/

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

### SoundFX.setVolume(_volume:Number)
Set the master volume to the number provided (float:0-1)

### SoundFX.getVolume()
Get the master volume

#

Web Audio API reference: https://www.w3.org/TR/webaudio/

---

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

#

### TypeFX.drawDiggit(element, charCode or a glyph string, size, color)
