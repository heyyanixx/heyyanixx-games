# Credits & licenses

**Ek Aur Aayega! (Overload Auto)** is an original game by **HEYYANIXX Studio** (contact@heyyanixx.de5.net).
Game design, code (`game.js`, `yt.js`, `style.css`, `index.html`) and all art are original. Every character,
the auto rickshaw, the city and the UI are drawn in code with canvas shapes; there are no image, font or audio
files from anyone else. Sound effects are synthesised at runtime (no recorded audio).

Inspiration only (no names, art, code, sounds or characters copied): general mechanics seen across popular
casual games — stacking/placement, bumpy-vehicle physics, growing-tower runners, ragdoll fails.

## Open-source libraries (from GitHub)

| Library | Version | Used for | License | Source |
|---|---|---|---|---|
| matter.js | 0.20.0 (`lib/matter.min.js`, unmodified build) | 2D rigid-body physics | MIT, Copyright (c) Liam Brummitt and contributors | https://github.com/liabru/matter-js |
| ZzFX (ZzFXMicro) | 1.4.0 (`lib/zzfx-micro.js`) | tiny sound-effect synth | MIT, Copyright (c) 2019 Frank Force | https://github.com/KilledByAPixel/ZzFX |

ZzFXMicro was edited in two lines: the AudioContext is created on the first tap (browser autoplay rules)
and the play function returns early before that.

## YouTube Playables SDK
`yt/index.html` (the Playables build) loads the official SDK from https://www.youtube.com/game_api/v1 as
YouTube's docs require. It is Google's, used under YouTube's developer terms; it is not bundled here.
The public web build (`index.html`) does not load it. `yt.js` is a thin adapter that no-ops outside YouTube.

## MIT license text (applies to matter.js and ZzFX)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
