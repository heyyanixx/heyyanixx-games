/* Ek Aur Aayega! (Overload Auto) - original game by HEYYANIXX Studio.
   Physics: matter.js (MIT). Sound: ZzFXMicro (MIT). All art drawn in code. */
(function () {
  'use strict';
  var M = Matter, Engine = M.Engine, Bodies = M.Bodies, Body = M.Body, Composite = M.Composite, Events = M.Events;
  var W = 540, H = 960, ROOF_Y = 700, GROUND = 860, AUTO_X = 270, ROOF_W = 236;
  function layout() { var vw = window.innerWidth, vh = window.innerHeight; H = Math.round(Math.max(960, Math.min(1170, W * vh / Math.max(1, vw)))); GROUND = H - 100; ROOF_Y = GROUND - 160; }
  layout();
  var GOLD = '#e3b65a';

  // ---------- DOM ----------
  var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var stage = document.getElementById('stage');
  var $ = function (id) { return document.getElementById(id); };
  var elTitle = $('title'), elOver = $('over'), elPause = $('paused'), elHud = $('hud');
  var elScore = $('score'), elBest = $('best'), elLives = $('lives');
  var btnMute = $('mute'), btnPause = $('pausebtn');

  var scale = 1, dpr = 1;
  function resize() {
    var vw = window.innerWidth, vh = window.innerHeight;
    if (state !== 'play' && state !== 'dying') layout();
    var w = Math.min(vw, vh * W / H), h = w * H / W;
    if (h > vh) { h = vh; w = h * W / H; }
    stage.style.width = w + 'px'; stage.style.height = h + 'px';
    stage.style.fontSize = (w / 540 * 16) + 'px';
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    scale = cv.width / W;
  }
  window.addEventListener('resize', resize); resize();

  // ---------- sound ----------
  var userMuted = false, ytAudio = true;
  function soundOn() { return !userMuted && ytAudio; }
  function unlockAudio() {
    try {
      if (!zzfxX) zzfxX = new (window.AudioContext || window.webkitAudioContext)();
      if (zzfxX.state === 'suspended') zzfxX.resume();
    } catch (e) {}
  }
  var SFX = {
    drop: [.5, .05, 520, .01, .02, .12, 0, 1, -18],
    land: [1.2, .1, 90, .005, .03, .12, 0, 1, -2, 0, 0, 0, 0, .6],
    perfect: [.6, 0, 660, .01, .06, .25, 0, 1, 0, 0, 440, .06],
    scream: [.45, .05, 760, .02, .35, .35, 2, 1, -5, 0, 0, 0, 0, 0, 9],
    honk: [.5, 0, 300, .01, .07, .06, 2, .6, 0, 0, 0, 0, .1],
    whistle: [.7, 0, 2000, .01, .45, .15, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, .6],
    bump: [1, .2, 60, .01, .05, .2, 3, 1, -1, 0, 0, 0, 0, 1],
    bleat: [.5, .05, 420, .02, .25, .2, 2, 1, 0, 0, 0, 0, .05, 0, 22]
  };
  function sfx(n) { if (!soundOn()) return; try { zzfx.apply(null, SFX[n]); } catch (e) {} }
  function setMuteUI() { btnMute.classList.toggle('off', userMuted); btnMute.setAttribute('aria-label', userMuted ? 'Unmute' : 'Mute'); }

  // ---------- characters ----------
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function eyes(c, x, y, gap, r, panic, look) {
    for (var i = -1; i <= 1; i += 2) {
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x + i * gap, y, panic ? r * 1.35 : r, 0, 7); c.fill();
      c.strokeStyle = '#1a1a1a'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#111'; c.beginPath(); c.arc(x + i * gap + (look || 0), y + (panic ? -r * .3 : 1), panic ? r * .38 : r * .55, 0, 7); c.fill();
    }
  }
  function mouth(c, x, y, s, panic) {
    c.strokeStyle = '#3a1410'; c.fillStyle = '#5a1a14'; c.lineWidth = 2.2;
    if (panic) { c.beginPath(); c.ellipse(x, y + 2, s * .45, s * .6, 0, 0, 7); c.fill(); }
    else { c.beginPath(); c.arc(x, y - s * .2, s * .6, .2, Math.PI - .2); c.stroke(); }
  }
  var SKIN = '#c98b5a';
  var TYPES = {
    uncle: { w: 92, h: 70, d: 1.2, easy: 1, lines: ['Adjust karo bhai!', 'Hum daily aise jaate hai', 'Peeche jagah hai!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 12); c.fillStyle = '#f3e7cc'; c.fill();
        rr(c, -w / 2 + 6, -h / 2, w - 12, h * .58, 14); c.fillStyle = SKIN; c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-w * .18, -h / 2 + 7, 10, 4, -.3, 0, 7); c.fill();
        eyes(c, 0, -h * .2, 13, 6, p); c.fillStyle = '#111';
        c.beginPath(); c.ellipse(-9, -h * .02, 12, 4.5, .2, 0, 7); c.ellipse(9, -h * .02, 12, 4.5, -.2, 0, 7); c.fill();
        mouth(c, 0, h * .1, 8, p);
        c.fillStyle = '#d9c9a3'; for (var i = 0; i < 3; i++) { c.beginPath(); c.arc(0, h * .22 + i * 6, 1.8, 0, 7); c.fill(); }
      } },
    aunty: { w: 86, h: 72, d: 1, easy: 1, lines: ['Bhaiya, sabzi sambhalna!', 'Ek seat aur nikalo', 'Dheere chalao!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 12); c.fillStyle = '#d6336c'; c.fill();
        c.fillStyle = GOLD; c.fillRect(-w / 2, h * .32, w, 5);
        rr(c, -w / 2 + 8, -h / 2 + 4, w - 16, h * .52, 14); c.fillStyle = SKIN; c.fill();
        c.fillStyle = '#141414'; c.beginPath(); c.arc(0, -h / 2 + 4, 14, Math.PI, 0); c.fill(); c.beginPath(); c.arc(w * .3, -h / 2 + 2, 9, 0, 7); c.fill();
        c.fillStyle = '#c1121f'; c.beginPath(); c.arc(0, -h * .3, 3, 0, 7); c.fill();
        eyes(c, 0, -h * .16, 12, 5.5, p); mouth(c, 0, h * .06, 7, p);
        c.fillStyle = '#2f9e44'; rr(c, w / 2 - 14, h * .02, 16, 22, 4); c.fill();
        c.fillStyle = '#69db7c'; c.beginPath(); c.ellipse(w / 2 - 8, h * .02, 4, 9, .4, 0, 7); c.ellipse(w / 2 - 2, h * .0, 3, 8, -.3, 0, 7); c.fill();
      } },
    student: { w: 70, h: 76, d: 1, lines: ['Exam hai, jaldi!', 'College gate pe utaar dena', 'Notes gir gaye!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 10); c.fillStyle = '#4c6ef5'; c.fill();
        rr(c, -w / 2 + 6, -h / 2 + 4, w - 12, h * .5, 12); c.fillStyle = SKIN; c.fill();
        c.fillStyle = '#111'; for (var i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 7 - 4, -h / 2 + 8); c.lineTo(i * 7, -h / 2 - 5); c.lineTo(i * 7 + 4, -h / 2 + 8); c.fill(); }
        eyes(c, 0, -h * .17, 11, 5, p); c.strokeStyle = '#111'; c.lineWidth = 2;
        c.beginPath(); c.arc(-11, -h * .17, 8.5, 0, 7); c.moveTo(19.5, -h * .17); c.arc(11, -h * .17, 8.5, 0, 7); c.moveTo(-2.5, -h * .17); c.lineTo(2.5, -h * .17); c.stroke();
        mouth(c, 0, h * .05, 6, p);
        c.fillStyle = '#f08c00'; c.fillRect(-w / 2 + 8, h * .12, 6, h * .38); c.fillRect(w / 2 - 14, h * .12, 6, h * .38);
      } },
    goat: { w: 96, h: 56, d: .9, lines: ['Meh-eh-eh!', 'Mehhh!', 'Meh? MEHHH!'], sound: 'bleat',
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 20); c.fillStyle = '#e9ecef'; c.fill();
        c.fillStyle = '#ced4da'; c.beginPath(); c.arc(-w * .2, -h * .05, 9, 0, 7); c.arc(w * .1, h * .1, 7, 0, 7); c.fill();
        c.fillStyle = '#f1f3f5'; rr(c, w * .12, -h / 2 - 10, w * .4, h * .7, 12); c.fill(); c.strokeStyle = '#adb5bd'; c.lineWidth = 1.5; c.stroke();
        c.strokeStyle = '#8d6e63'; c.lineWidth = 4; c.beginPath(); c.moveTo(w * .2, -h / 2 - 8); c.quadraticCurveTo(w * .1, -h / 2 - 22, w * .02, -h / 2 - 14); c.moveTo(w * .42, -h / 2 - 8); c.quadraticCurveTo(w * .5, -h / 2 - 22, w * .58, -h / 2 - 14); c.stroke();
        eyes(c, w * .32, -h * .32, 8, 4.5, p, 2);
        c.fillStyle = '#adb5bd'; c.beginPath(); c.moveTo(w * .26, h * .1); c.lineTo(w * .38, h * .1); c.lineTo(w * .32, h * .32); c.fill();
        mouth(c, w * .32, -h * .02, 5, p);
        c.fillStyle = '#495057'; for (var i = 0; i < 4; i++) c.fillRect(-w * .38 + i * 14, h / 2 - 4, 6, 8);
      } },
    cylinder: { w: 50, h: 74, d: 1.6, lines: ['Hiss... darr gaya', 'Main bhi chalunga!', 'Dhyan se, full hu!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2 + 10, w, h - 10, 14); c.fillStyle = '#e03131'; c.fill();
        c.fillStyle = '#868e96'; c.fillRect(-9, -h / 2, 18, 12); c.fillRect(-16, -h / 2 + 2, 32, 4);
        c.fillStyle = '#fff'; c.fillRect(-w / 2, h * .14, w, 9);
        c.fillStyle = '#c92a2a'; c.font = 'bold 8px sans-serif'; c.textAlign = 'center'; c.fillText('GAS', 0, h * .14 + 7.5);
        eyes(c, 0, -h * .1, 9, 5, p); mouth(c, 0, h * .32, 5, p);
      } },
    gadda: { w: 156, h: 34, d: .7, easy: 1, lines: ['Zzz... aaram se', 'Soft landing!', 'Mujh pe baitho'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = '#e7f5ff'; c.fill();
        c.save(); c.clip(); c.fillStyle = '#4dabf7'; for (var i = -w / 2; i < w / 2; i += 16) c.fillRect(i, -h / 2, 7, h); c.restore();
        c.strokeStyle = '#1c7ed6'; c.lineWidth = 2; rr(c, -w / 2, -h / 2, w, h, 16); c.stroke();
        c.fillStyle = '#fff'; rr(c, -26, -11, 52, 22, 10); c.fill();
        if (p) eyes(c, 0, -2, 10, 5, true); else { c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.moveTo(-16, -2); c.lineTo(-6, -2); c.moveTo(6, -2); c.lineTo(16, -2); c.stroke(); }
        mouth(c, 0, 7, 4, p);
      } },
    dulha: { w: 72, h: 82, d: 1, lines: ['Baraat late ho rahi!', 'Shaadi hai meri!', 'Sehra mat bigaadna!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2 + 14, w, h - 14, 10); c.fillStyle = '#fff3bf'; c.fill();
        c.fillStyle = GOLD; for (var i = 0; i < 4; i++) { c.beginPath(); c.arc(0, h * .08 + i * 9, 2.2, 0, 7); c.fill(); }
        rr(c, -w / 2 + 6, -h / 2 + 12, w - 12, h * .42, 12); c.fillStyle = SKIN; c.fill();
        c.fillStyle = '#c92a2a'; c.beginPath(); c.ellipse(0, -h / 2 + 12, w / 2 - 2, 15, 0, Math.PI, 0); c.fill();
        c.fillStyle = GOLD; c.beginPath(); c.arc(0, -h / 2 + 2, 5, 0, 7); c.fill(); c.fillRect(-w / 2 + 4, -h / 2 + 10, w - 8, 4);
        eyes(c, 0, -h * .12, 11, 5, p); mouth(c, 0, h * .05, 6, p);
        c.strokeStyle = 'rgba(227,182,90,.9)'; c.lineWidth = 1.6; for (var j = -w / 2 + 10; j <= w / 2 - 10; j += 7) { c.beginPath(); c.moveTo(j, -h / 2 + 14); c.lineTo(j, -h * .02 + Math.abs(j) * .2); c.stroke(); }
      } },
    dhol: { w: 92, h: 72, d: 1.1, easy: 1, lines: ['Dhin-tak dhin!', 'Bajao re!', 'Naacho sab!'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h * .5, 12); c.fillStyle = '#f76707'; c.fill();
        rr(c, -w / 2 + 14, -h / 2 + 2, w - 28, h * .44, 12); c.fillStyle = SKIN; c.fill();
        eyes(c, 0, -h * .3, 11, 5, p); mouth(c, 0, -h * .1, 6, p);
        rr(c, -w / 2, h * .02, w, h * .48, 14); c.fillStyle = '#8d5524'; c.fill();
        c.fillStyle = '#f1e3c6'; c.beginPath(); c.ellipse(-w / 2 + 4, h * .26, 7, h * .23, 0, 0, 7); c.ellipse(w / 2 - 4, h * .26, 7, h * .23, 0, 0, 7); c.fill();
        c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); for (var i = 0; i < 8; i++) { var x = -w / 2 + 10 + i * 10; c.lineTo(x, i % 2 ? h * .48 : h * .05); } c.stroke();
      } },
    matka: { w: 64, h: 64, circle: 1, d: 1.1, lines: ['Main gol hu, sambhal!', 'Paani girega!', 'Ludhak raha hu!'],
      draw: function (c, w, h, p) {
        var r = w / 2; c.fillStyle = '#c0692f'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
        c.strokeStyle = '#7a3b12'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r - 6, .3, 1.2); c.stroke();
        c.strokeStyle = '#f1e3c6'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, r * .62, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
        eyes(c, 0, -4, 10, 5.5, p); mouth(c, 0, 13, 6, p);
      } },
    sofa: { w: 160, h: 50, d: .8, easy: 1, lines: ['Kisne mangwaya ye?', 'Ghar shift ho raha', 'Baitho na, aaram se'],
      draw: function (c, w, h, p) {
        rr(c, -w / 2, -h / 2, w, h, 10); c.fillStyle = '#862e9c'; c.fill();
        c.fillStyle = '#ae3ec9'; rr(c, -w / 2 + 16, -h / 2 + 6, w / 2 - 20, h - 18, 8); c.fill(); rr(c, 4, -h / 2 + 6, w / 2 - 20, h - 18, 8); c.fill();
        eyes(c, 0, -2, 14, 5.5, p); mouth(c, 0, 10, 5, p);
        c.fillStyle = '#4a1d55'; c.fillRect(-w / 2 + 8, h / 2 - 4, 8, 6); c.fillRect(w / 2 - 16, h / 2 - 4, 8, 6);
      } }
  };
  var FALL_LINES = ['Aaaaa!', 'Mera stop nahi tha!', 'Bhaiyaaa!', 'Gir gaya!', 'Utaar do!', 'Mummyyy!'];
  var PERFECT_LINES = ['EKDUM PERFECT!', 'JUGAAD LEVEL MAX!', 'SETTING!', 'WAAH!'];

  function pickType() {
    var easy = score < 4, r = Math.random();
    if (!easy && r < .07) return 'matka';
    var keys = Object.keys(TYPES).filter(function (k) { return k !== 'matka' && (!easy || TYPES[k].easy); });
    var k = keys[Math.floor(Math.random() * keys.length)];
    if (k === lastType) k = keys[Math.floor(Math.random() * keys.length)];
    return k;
  }

  // ---------- state ----------
  var engine, roof, bodies = [], texts = [], parts = [];
  var state = 'title', score = 0, best = 0, lives = 3, plays = 0;
  var t = 0, roadX = 0, camY = 0, shake = 0, flash = 0, slowmo = 0, nextBump = 0, bumpWarn = 0, autoBounce = 0;
  var hanging = null, spawnIn = 0, lastType = '', overTimer = 0, perfectStreak = 0;

  function newWorld() {
    engine = Engine.create({ positionIterations: 10, velocityIterations: 8 });
    engine.gravity.y = 1;
    roof = Bodies.rectangle(AUTO_X, ROOF_Y + 10, ROOF_W, 20, { isStatic: true, friction: 1, frictionStatic: 2, label: 'roof' });
    Composite.add(engine.world, roof);
    Events.on(engine, 'collisionStart', onCollide);
    bodies = []; texts = []; parts = [];
  }

  function onCollide(ev) {
    ev.pairs.forEach(function (pr) {
      [[pr.bodyA, pr.bodyB], [pr.bodyB, pr.bodyA]].forEach(function (ab) {
        var a = ab[0], b = ab[1];
        if (!a.pax || a.pax.landed || a.pax.fallen) return;
        if (b === roof || (b.pax && b.pax.landed && !b.pax.fallen)) land(a);
      });
    });
  }

  function towerTop() {
    var top = ROOF_Y, topB = null;
    bodies.forEach(function (b) { if (b.pax.landed && !b.pax.fallen && b.bounds.min.y < top + 1) { top = b.bounds.min.y; topB = b; } });
    return { y: top, b: topB };
  }

  function land(b) {
    if (state !== 'play') { b.pax.landed = true; return; }
    var prevTop = b.pax.below && !b.pax.below.pax.fallen ? b.pax.below.position : null;
    b.pax.landed = true; score++;
    var dx = prevTop ? Math.abs(b.position.x - prevTop.x) : Math.abs(b.position.x - AUTO_X);
    var ty = TYPES[b.pax.type];
    Body.setVelocity(b, { x: b.velocity.x * .3, y: b.velocity.y * .5 }); Body.setAngularVelocity(b, b.angularVelocity * .3);
    if (dx < 15) {
      Body.setPosition(b, { x: prevTop ? prevTop.x : AUTO_X, y: b.position.y }); Body.setAngle(b, prevTop ? b.pax.below.angle : 0); Body.setAngularVelocity(b, 0); Body.setVelocity(b, { x: 0, y: b.velocity.y * .3 });
      perfectStreak++; score++;
      addText(PERFECT_LINES[Math.min(perfectStreak - 1, PERFECT_LINES.length - 1)], b.position.x, b.bounds.min.y - 30, GOLD, 30, 1.1, true);
      sfx('perfect'); burst(b.position.x, b.bounds.max.y, GOLD, 14);
    } else { perfectStreak = 0; sfx('land'); }
    if (ty.sound) sfx(ty.sound);
    b.pax.say = ty.lines[Math.floor(Math.random() * ty.lines.length)]; b.pax.sayT = 1.5;
    burst(b.position.x, b.bounds.max.y, '#d8c8a8', 6);
    updateHud();
  }

  function addText(s, x, y, col, size, life, world) { texts.push({ s: s, x: x, y: y, col: col, size: size, life: life, max: life, world: world }); }
  function burst(x, y, col, n) { for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: (Math.random() - .5) * 7, vy: -Math.random() * 5, life: .6 + Math.random() * .4, col: col }); }

  function spawnHanging() { var k = pickType(); lastType = k; hanging = { type: k, swing: Math.random() * 6 }; }

  function drop() {
    if (state !== 'play' || !hanging || spawnIn > 0) return;
    var ty = TYPES[hanging.type], x = dropX(), y = dropY();
    var opts = { friction: 1, frictionStatic: 2, frictionAir: .015, restitution: 0, density: .0016 * ty.d, chamfer: ty.circle ? undefined : { radius: 5 } };
    var b = ty.circle ? Bodies.circle(x, y, ty.w / 2, opts) : Bodies.rectangle(x, y, ty.w, ty.h, opts);
    var tt = towerTop();
    b.pax = { type: hanging.type, landed: false, fallen: false, below: tt.b || null, say: '', sayT: 0, born: t };
    Body.setVelocity(b, { x: dropVX(), y: 0 });
    Composite.add(engine.world, b); bodies.push(b);
    hanging = null; spawnIn = .45; sfx('drop');
  }
  function swingAmp() { return 150; }
  function swingSpeed() { return Math.min(1.7 + score * .045, 3.4); }
  function dropX() { return AUTO_X + swingAmp() * Math.sin(hanging ? hanging.swing : 0); }
  function dropVX() { return swingAmp() * Math.cos(hanging.swing) * swingSpeed() / 60 * .12; }
  function dropY() { return towerTop().y - 250; }

  function bump() {
    var lvl = Math.min(score, 40);
    autoBounce = .45; shake = Math.max(shake, 6); sfx('bump');
    bodies.forEach(function (b) {
      if (!b.pax.landed || b.pax.fallen) return;
      var hf = 1 + Math.max(0, ROOF_Y - b.position.y) / 320;
      Body.setVelocity(b, { x: b.velocity.x + (Math.random() - .5) * (.3 + lvl * .025) * hf, y: b.velocity.y - (1.6 + lvl * .035) });
    });
    addText('DHAD!', AUTO_X - 120 + Math.random() * 40, ROOF_Y + 90, '#fff', 26, .7, true);
  }

  function fall(b) {
    b.pax.fallen = true; lives--; perfectStreak = 0;
    Body.setAngularVelocity(b, (Math.random() - .5) * .4);
    addText(FALL_LINES[Math.floor(Math.random() * FALL_LINES.length)], Math.max(90, Math.min(450, b.position.x)), b.position.y - 40, '#ff6b6b', 30, 1.2, true);
    sfx('scream'); shake = 14; slowmo = .7; updateHud();
    if (lives <= 0) gameOver();
  }

  function gameOver() {
    state = 'dying'; overTimer = 1.6; sfx('whistle'); flash = 1; shake = 22; slowmo = 1.2;
    addText('OVERLOAD!', W / 2, 330, '#ff3b3b', 64, 1.6, false);
    bodies.forEach(function (b) {
      if (b.pax.fallen) return;
      Body.setVelocity(b, { x: (Math.random() - .5) * 14, y: -6 - Math.random() * 8 });
      Body.setAngularVelocity(b, (Math.random() - .5) * .5);
    });
    Composite.remove(engine.world, roof);
    if (score > best) best = score;
    plays++;
    PG.saveData(JSON.stringify({ best: best, plays: plays }));
    PG.sendScore(score);
  }

  function verdict(s) {
    if (s < 5) return 'Bhaiya, pehle auto chalana seekho';
    if (s < 10) return 'Thoda aur jugaad chahiye';
    if (s < 20) return 'Asli jugaadu driver!';
    if (s < 35) return 'Overload King! Traffic police bhi shocked';
    return 'LEGEND. Poora mohalla ek auto me!';
  }

  function showOver() {
    state = 'over';
    $('ovScore').textContent = score; $('ovBest').textContent = best;
    $('ovVerdict').textContent = verdict(score);
    $('ovNew').style.display = (score >= best && score > 0) ? 'block' : 'none';
    elOver.classList.add('show'); elHud.classList.remove('show');
  }

  function start() {
    unlockAudio(); newWorld();
    score = 0; lives = 3; t = 0; camY = 0; perfectStreak = 0; slowmo = 0; flash = 0;
    nextBump = 7; bumpWarn = 0; spawnIn = .3; hanging = null;
    state = 'play'; elTitle.classList.remove('show'); elOver.classList.remove('show'); elHud.classList.add('show');
    updateHud(); sfx('honk'); setTimeout(function () { sfx('honk'); }, 160);
  }

  function updateHud() {
    elScore.textContent = score; elBest.textContent = 'BEST ' + Math.max(best, score);
    var h = ''; for (var i = 0; i < 3; i++) h += '<i class="ch' + (i < lives ? '' : ' gone') + '"></i>';
    elLives.innerHTML = h;
  }

  // ---------- pause ----------
  var paused = false;
  function pause() {
    if (paused || state === 'title' || state === 'over') return;
    paused = true; elPause.classList.add('show');
    try { if (zzfxX) zzfxX.suspend(); } catch (e) {}
  }
  function resume() {
    if (!paused) return; paused = false; elPause.classList.remove('show'); last = performance.now();
    try { if (zzfxX) zzfxX.resume(); } catch (e) {}
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  PG.onPause(function () { pause(); PG.saveData(JSON.stringify({ best: Math.max(best, score), plays: plays })); });
  PG.onResume(function () { /* stay paused until the player taps */ });
  PG.onAudioEnabledChange(function (on) { ytAudio = !!on; });

  // ---------- input ----------
  function onTap(e) {
    if (e) e.preventDefault();
    unlockAudio();
    if (paused) { resume(); return; }
    if (state === 'play') drop();
  }
  cv.addEventListener('pointerdown', onTap);
  elPause.addEventListener('pointerdown', function (e) { e.preventDefault(); resume(); });
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (state === 'title' || state === 'over') start(); else onTap(); }
    if (e.code === 'KeyP' || e.code === 'Escape') { paused ? resume() : pause(); }
  });
  $('play').addEventListener('click', start);
  $('again').addEventListener('click', start);
  btnMute.addEventListener('click', function (e) { e.stopPropagation(); unlockAudio(); userMuted = !userMuted; setMuteUI(); try { localStorage.setItem('ekAurAayega.muted', userMuted ? '1' : '0'); } catch (x) {} });
  btnPause.addEventListener('click', function (e) { e.stopPropagation(); paused ? resume() : pause(); });

  // ---------- update ----------
  var acc = 0, last = performance.now();
  function update(dt) {
    t += dt;
    var speed = state === 'play' || state === 'dying' ? 1 : .6;
    roadX += dt * 260 * speed;
    if (slowmo > 0) slowmo -= dt;
    var ts = slowmo > 0 ? .35 : 1;
    engine.timing.timeScale = ts;
    if (state === 'play') {
      engine.gravity.x = Math.sin(t * .8) * Math.min(.05, Math.max(0, score - 6) * .003);
      if (hanging) hanging.swing += dt * swingSpeed();
      if (spawnIn > 0) { spawnIn -= dt; if (spawnIn <= 0) spawnHanging(); }
      nextBump -= dt;
      bumpWarn = nextBump < 1.1 ? 1 : 0;
      if (nextBump <= 0) { bump(); nextBump = Math.max(2.8, 6.5 - score * .1) + Math.random() * 1.5; }
    }
    acc += dt * 1000;
    var step = 1000 / 60, n = 0;
    while (acc >= step && n < 5) { Engine.update(engine, step); acc -= step; n++; }
    if (n === 5) acc = 0;
    for (var i = bodies.length - 1; i >= 0; i--) {
      var b = bodies[i];
      if (b.pax.sayT > 0) b.pax.sayT -= dt;
      if (!b.pax.fallen && state === 'play' && (b.position.y > ROOF_Y + 80 || b.position.x < -60 || b.position.x > W + 60)) fall(b);
      if (b.position.y > camY + H + 300 || b.position.y > GROUND + 900) { Composite.remove(engine.world, b); bodies.splice(i, 1); }
    }
    if (state === 'play') {
      var target = Math.min(0, towerTop().y - H * .55);
      camY += (target - camY) * Math.min(1, dt * 3);
    }
    if (state === 'dying') { overTimer -= dt; if (overTimer <= 0) showOver(); }
    if (autoBounce > 0) autoBounce -= dt;
    if (shake > 0) shake = Math.max(0, shake - dt * 30);
    if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
    texts.forEach(function (x) { x.life -= dt; x.y -= dt * 30; }); texts = texts.filter(function (x) { return x.life > 0; });
    parts.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .3; p.life -= dt; }); parts = parts.filter(function (p) { return p.life > 0; });
  }

  // ---------- draw ----------
  var SIGNS = ['CHAI 10/-', 'JUGAAD GARAGE', 'SHARMA TENT HOUSE', 'COACHING CLASSES', 'PAAN CORNER', 'MOBILE REPAIR', 'SWEETS'];
  function drawBg() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1b1036'); g.addColorStop(.45, '#7b2f59'); g.addColorStop(.8, '#f08c3a'); g.addColorStop(1, '#f6c065');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var sy = 520 - camY * .15;
    ctx.fillStyle = 'rgba(255,214,140,.9)'; ctx.beginPath(); ctx.arc(390, sy, 60, 0, 7); ctx.fill();
    // far skyline
    ctx.fillStyle = '#3b1d45';
    var off = (roadX * .15) % 120;
    for (var i = -1; i < 7; i++) { var x = i * 120 - off, hh = 120 + ((i * 53 + Math.floor(roadX * .15 / 120) * 31) % 5 + 5) % 5 * 28; ctx.fillRect(x, GROUND - camY - 90 - hh, 90, hh + 90); }
    // near shops
    var off2 = (roadX * .5) % 200, base = Math.floor(roadX * .5 / 200);
    for (var j = -1; j < 4; j++) {
      var idx = base + j + 1, sx = j * 200 - off2 + 200, bh = 150 + (idx * 37 % 3) * 30, by = GROUND - camY - 40 - bh;
      ctx.fillStyle = ['#2b2033', '#33263d', '#251b2e'][((idx % 3) + 3) % 3]; ctx.fillRect(sx, by, 180, bh + 40);
      ctx.fillStyle = 'rgba(255,200,120,.55)';
      for (var wy = by + 50; wy < GROUND - camY - 60; wy += 38) for (var wx = sx + 18; wx < sx + 170; wx += 42) if ((wx * 7 + wy * 3 + idx) % 5 > 1) ctx.fillRect(wx, wy, 20, 18);
      ctx.fillStyle = '#060608'; ctx.fillRect(sx + 10, by + 10, 160, 28);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.strokeRect(sx + 10, by + 10, 160, 28);
      ctx.fillStyle = GOLD; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(SIGNS[((idx % SIGNS.length) + SIGNS.length) % SIGNS.length], sx + 90, by + 30);
    }
    // road
    var ry = GROUND - camY;
    ctx.fillStyle = '#3a3a40'; ctx.fillRect(0, ry, W, H - ry + 400);
    ctx.fillStyle = '#5c5c63'; ctx.fillRect(0, ry, W, 8);
    ctx.fillStyle = '#e9e9e9'; var d = roadX % 90; for (var k = -1; k < 8; k++) ctx.fillRect(k * 90 - d, ry + 58, 46, 7);
    // pothole warning
    if (bumpWarn && state === 'play') {
      var px = W - (1.1 - nextBump) / 1.1 * (W - AUTO_X + 60) + 20;
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.ellipse(px, ry + 30, 34, 9, 0, 0, 7); ctx.fill();
      ctx.save(); ctx.translate(Math.min(W - 70, px + 10), ry - 64);
      ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(34, 28); ctx.lineTo(-34, 28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#111'; ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('KHADDA', 0, 20);
      ctx.fillRect(-2, 28, 4, 30); ctx.restore();
    }
  }

  function drawAuto() {
    var by = autoBounce > 0 ? -Math.sin((.45 - autoBounce) / .45 * Math.PI) * 12 : Math.sin(t * 18) * 1.2;
    var x = AUTO_X, ry = ROOF_Y - camY + by, g = GROUND - camY, bot = g - 22;
    ctx.save();
    // lower body: rear box + curved nose (three-wheeler silhouette)
    ctx.fillStyle = '#2f9e44';
    ctx.beginPath(); ctx.moveTo(x - 112, ry + 40); ctx.lineTo(x + 40, ry + 40); ctx.quadraticCurveTo(x + 150, ry + 52, x + 140, bot - 6);
    ctx.lineTo(x - 112, bot - 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd43b'; ctx.fillRect(x - 112, bot - 36, 252, 14);
    // canopy (the roof everyone stands on)
    ctx.fillStyle = '#ffd43b'; rr(ctx, x - ROOF_W / 2, ry, ROOF_W, 22, 11); ctx.fill();
    ctx.fillStyle = '#e0a800'; ctx.fillRect(x - ROOF_W / 2 + 10, ry + 16, ROOF_W - 20, 6);
    ctx.fillStyle = '#ffd43b'; ctx.fillRect(x - 112, ry + 20, 10, 30); ctx.fillRect(x + 30, ry + 20, 10, 30);
    // open side door with rear seat
    ctx.fillStyle = '#1b1b1f'; rr(ctx, x - 96, ry + 52, 112, bot - ry - 98, 10); ctx.fill();
    ctx.fillStyle = '#7a3b12'; rr(ctx, x - 92, bot - 78, 104, 18, 6); ctx.fill();
    // driver
    ctx.fillStyle = '#c98b5a'; ctx.beginPath(); ctx.arc(x + 70, ry + 74, 15, 0, 7); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 70, ry + 67, 15, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 72, ry + 72, 6, 6); ctx.fillStyle = '#111'; ctx.fillRect(x + 75, ry + 74, 3, 3);
    ctx.fillStyle = '#f1e3c6'; ctx.fillRect(x + 58, ry + 90, 26, 26);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 84, ry + 98); ctx.lineTo(x + 104, ry + 94); ctx.stroke();
    // windshield edge + headlight
    ctx.strokeStyle = 'rgba(160,220,255,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 44, ry + 44); ctx.quadraticCurveTo(x + 112, ry + 54, x + 120, ry + 104); ctx.stroke();
    ctx.fillStyle = '#fff3bf'; ctx.beginPath(); ctx.arc(x + 132, bot - 50, 9, 0, 7); ctx.fill();
    // plate + text
    ctx.fillStyle = '#fff'; rr(ctx, x - 104, bot - 32, 76, 20, 4); ctx.fill();
    ctx.fillStyle = '#111'; ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('JH 04 OVR', x - 66, bot - 17);
    ctx.fillStyle = '#060608'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.fillText('HORN PLEASE', x + 40, bot - 25);
    // wheels: two at the back, one at the nose
    [x - 70, x + 104].forEach(function (wx) {
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(wx, g - 20, 22, 0, 7); ctx.fill();
      ctx.fillStyle = '#adb5bd'; ctx.beginPath(); ctx.arc(wx, g - 20, 9, 0, 7); ctx.fill();
      ctx.strokeStyle = '#495057'; ctx.lineWidth = 3; ctx.beginPath(); var a = -roadX / 22; ctx.moveTo(wx + Math.cos(a) * 9, g - 20 + Math.sin(a) * 9); ctx.lineTo(wx - Math.cos(a) * 9, g - 20 - Math.sin(a) * 9); ctx.stroke();
    });
    ctx.restore();
  }

  function drawPax(type, x, y, ang, panic) {
    var ty = TYPES[type];
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, -ty.w / 2 + 3, -ty.h / 2 + 4, ty.w, ty.h, 12); ctx.fill();
    ty.draw(ctx, ty.w, ty.h, panic);
    ctx.restore();
  }

  function bubble(s, x, y) {
    ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center';
    var w = ctx.measureText(s).width + 18; x = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, x));
    ctx.fillStyle = '#fff'; rr(ctx, x - w / 2, y - 30, w, 26, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 6, y - 5); ctx.lineTo(x + 2, y + 4); ctx.lineTo(x + 6, y - 5); ctx.fill();
    ctx.fillStyle = '#111'; ctx.fillText(s, x, y - 12);
  }

  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    var sx = shake ? (Math.random() - .5) * shake : 0, sy = shake ? (Math.random() - .5) * shake : 0;
    ctx.translate(sx, sy);
    drawBg(); drawAuto();
    bodies.forEach(function (b) {
      var p = b.pax, spd = Math.hypot(b.velocity.x, b.velocity.y);
      var panic = !p.landed || p.fallen || Math.abs(b.angularVelocity) > .05 || spd > 5 || state === 'dying' || state === 'over';
      drawPax(p.type, b.position.x, b.position.y - camY, b.angle, panic);
    });
    bodies.forEach(function (b) { if (b.pax.sayT > 0 && !b.pax.fallen) bubble(b.pax.say, b.position.x, b.bounds.min.y - camY - 4); });
    // dropper
    if (state === 'play' && hanging) {
      var hx = dropX(), hy = dropY() - camY, ty = TYPES[hanging.type];
      ctx.strokeStyle = '#e9ecef'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(AUTO_X, 118); ctx.lineTo(hx, hy - ty.h / 2); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(AUTO_X, 118, 7, 0, 7); ctx.fill();
      drawPax(hanging.type, hx, hy, Math.cos(hanging.swing) * -.12, false);
      ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy + ty.h / 2 + 6); ctx.lineTo(hx, towerTop().y - camY - 6); ctx.stroke(); ctx.setLineDash([]);
    }
    parts.forEach(function (p) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.col; ctx.fillRect(p.x - 3, p.y - camY - 3, 6, 6); }); ctx.globalAlpha = 1;
    texts.forEach(function (x) {
      var a = Math.min(1, x.life / x.max * 2), yy = x.world ? x.y - camY : x.y, sc = x.world ? 1 : 1 + (1 - x.life / x.max) * .2;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x.x, yy); ctx.scale(sc, sc); if (!x.world) ctx.rotate(-.08);
      ctx.font = '900 ' + x.size + 'px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = x.size / 6; ctx.strokeStyle = '#060608'; ctx.strokeText(x.s, 0, 0); ctx.fillStyle = x.col; ctx.fillText(x.s, 0, 0); ctx.restore();
    });
    if (flash > 0) { ctx.fillStyle = 'rgba(255,60,60,' + flash * .35 + ')'; ctx.fillRect(-20, -20, W + 40, H + 40); }
  }

  var firstFrame = false;
  function loop(now) {
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!paused) update(dt);
    draw();
    if (!firstFrame) { firstFrame = true; PG.firstFrameReady(); }
    requestAnimationFrame(loop);
  }

  // ---------- boot ----------
  try { userMuted = localStorage.getItem('ekAurAayega.muted') === '1'; } catch (e) {}
  ytAudio = PG.isAudioEnabled(); setMuteUI();
  newWorld();
  // title-screen demo: a small stack already on the auto
  ['gadda', 'uncle', 'goat'].forEach(function (k, i) {
    var ty = TYPES[k], b = Bodies.rectangle(AUTO_X + (i - 1) * 6, ROOF_Y - 20 - i * 70, ty.w, ty.h, { friction: .9, frictionStatic: 1.3, density: .0016 * ty.d, chamfer: { radius: 5 } });
    b.pax = { type: k, landed: true, fallen: false, say: '', sayT: 0 }; Composite.add(engine.world, b); bodies.push(b);
  });
  requestAnimationFrame(loop);
  PG.loadData().then(function (s) {
    try { var d = JSON.parse(s || '{}'); best = d.best | 0; plays = d.plays | 0; } catch (e) {}
    $('tBest').textContent = best; updateHud();
    PG.gameReady();
  });
  window.__game = { get state() { return state; }, get score() { return score; }, get lives() { return lives; }, start: start, drop: drop, get paused() { return paused; },
    aim: function () { var tt = towerTop(); return { hx: hanging ? dropX() : null, tx: tt.b ? tt.b.position.x : AUTO_X, ready: !!hanging && spawnIn <= 0 }; } };
})();
