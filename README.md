# JS13kGames Progressive Web App starter pack

JS13K Games Competition: https://js13kgames.com/

This template targets the compo's **Mobile** and **Web Monetization** categories.

## Installation
Run **`npm install`** to install build dependencies.

## Tasks
**`npm build`** builds the game, reports archive size and serves locally with browser sync live reload enabled.

**`npm start`** quickly syncs changes and reloads the game, or starts the server if not currently running.

**`npm debug`** builds the game without any minifying for easier debugging. Includes detailed console logs.

## Build task parameters
*`--pwa`* instructs to build a Progressive Web App - will add 864 bytes when zipped.

*`--mobile`* adds some html tags regarding mobile and iOS icons - increases the zip filesize with 45 bytes.

*`--social`* adds some html tags for SEO and social media (twitter) - will add around 100 bytes, depending on description length.

## Setup
Setup is done in the **`package.json`**. Variables you have to modify:

- name
- version
- description
- keywords
- **monetization** - be sure to provide your own monetization wallet pointer. More info: https://js13kgames.com/webmonetization

## Notes

Be aware that SVG icons are not supported well with PWA currently, because of an install prompt bug on Android: https://bugs.chromium.org/p/chromium/issues/detail?id=578122

---
#

#

#

#

#

---

The following are very old libraries written in <ES5 IFEEs in 2016 - only **SoundFX** has been revised relatively recently.

# Less than 1kb libraries (old Readme)
Lightweight libraries prepared for js13kGames JavaScript coding competition.

#### SoundFX.js - sound controller with 9 predefined sound effects in 750 bytes
#### TweenFX.js - basic tweener for styles and transforms in 900 bytes
#### TypeFX.js - pixel font with a full glyph set (10x5px size) in 1250 bytes

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

Follow this Twitter tags to get news about the Compo: [#js13k](https://twitter.com/search?src=typd&q=%23js13k) ; [#js13kgames](https://twitter.com/search?src=typd&q=%23js13kgames)

For updates follow me on Twitter: <a href="https://twitter.com/FoumartGames" target="_blank">@FoumartGames</a>
