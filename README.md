# JS13kGames Progressive Web App starter pack

JS13K Games Competition: https://js13kgames.com/

This template targets the compo's **Mobile** category.

## Installation
Run **`npm install`** to install build dependencies.

## Tasks
**`npm build`** builds the game, reports archive size and serves locally with browser sync live reload enabled.

**`npm debug`** builds the game without any minifying for easier debugging. Includes detailed console logs.

## Build task parameters
*`--pwa`* instructs to build a Progressive Web App - will add 842 bytes when zipped.

*`--roadroll`* instructs to use a JS packer to achieve up to 15% compression.

*`--mobile`* adds some html tags regarding mobile and iOS icons - increases the zip filesize with 42 bytes.

*`--social`* adds some html tags for SEO and social media (twitter) - will add around 100 bytes, depending on description length.

## Setup
Setup is done in the **`package.json`**. Variables you have to modify:

- name - *used for generating the cache name in the service_worker.js file*
- version - *used for generating the cache name in the service_worker.js file*
- title - *populated in the title tag of the HTML, in the webmanifest file and in the social meta tags*
- description - *used only if social option is turned on*
- keywords - *used only if social option is turned on*
- icon extension - *needed for the HTML's icon link tag, used in the webmanifest file and in the service_worker.js file*
- icon type - *needed for the HTML's icon link tag, in the webmanifest file and in the service_worker.js file*
- icon size - *used in the webmanifest file*

---

#

#

#

#

#
---

The following are very old libraries written as IFEEs in 2016.

#

**SoundFX.js** - sound controller with 9 predefined sound effects in 750 bytes

**TweenFX.js** - basic tweener for styles and transforms in 900 bytes

**TypeFX.js** - pixel font with a full glyph set (10x5px size) in 1250 bytes

### Demos:
https://www.foumartgames.com/dev/js13kGames/js_libraries/

### SoundFX Generator:
https://www.foumartgames.com/dev/js13kGames/js_libraries/SoundFXGenerator/


---

# SoundFX
Basic sound effect controller utilizing the Web Audio API (AudioContext's Oscillator and Gain)

Check SoundFX in action: https://www.foumartgames.com/dev/js13kGames/js_libraries/SoundFX/

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

# TweenFX
Basic DOM element style tweener.

Check TweenFX in action: https://www.foumartgames.com/dev/js13kGames/js_libraries/TweenFX/

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

#
