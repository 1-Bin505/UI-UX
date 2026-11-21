/* Tihar & Chhath – A Mithila Scroll  ·  script.js */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function restartClass(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
    el.addEventListener('animationend', function () { el.classList.remove(cls); }, { once: true });
  }
  var popTimers = new WeakMap();
  function showPop(pop, ms) {
    if (!pop) return;
    pop.classList.add('show');
    clearTimeout(popTimers.get(pop));
    popTimers.set(pop, setTimeout(function () { pop.classList.remove('show'); }, ms || 5000));
  }

  /* ---------- falling petals ---------- */
  var drift = document.createElement('div');
  drift.id = 'drift';
  drift.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(drift, document.body.firstChild);

  var PETALS = {
    tihar: ['#E1AD01', '#e8590c', '#c8102e'],
    deusi: ['#E1AD01', '#e8590c', '#c8102e'],
    chhath: ['#ffd27a', '#ffb347', '#fff0a0']
  };
  var mode = 'tihar';

  function makePetal(x, y, dur, colors) {
    var p = document.createElement('div');
    p.className = 'petal';
    p.style.left = x + 'px';
    if (y != null) p.style.top = y + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = dur + 's';
    var s = rand(.7, 1.3);
    p.style.width = 12 * s + 'px';
    p.style.height = 16 * s + 'px';
    p.addEventListener('animationend', function () { p.remove(); });
    drift.appendChild(p);
    return p;
  }
  function burst(el, n) {
    if (reduce || !el) return;
    var r = el.getBoundingClientRect();
    var colors = PETALS[mode] || PETALS.tihar;
    for (var i = 0; i < (n || 16); i++) {
      makePetal(r.left + r.width * rand(.15, .85), r.top + r.height * rand(0, .25), rand(2.4, 4.6), colors);
    }
  }
  if (!reduce) {
    setInterval(function () {
      if (document.hidden || drift.children.length > 14) return;
      var p = makePetal(rand(0, window.innerWidth), null, rand(9, 15), PETALS[mode] || PETALS.tihar);
      p.style.opacity = '.75';
    }, 1500);
  }

  /* ---------- hero rays ---------- */
  (function () {
    var g = $('#rays');
    if (!g) return;
    var n = 24, cx = 100, cy = 100;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, hw = Math.PI / n * .55;
      var pt = function (r, ang) { return (cx + r * Math.cos(ang)).toFixed(1) + ',' + (cy + r * Math.sin(ang)).toFixed(1); };
      svgEl('polygon', {
        points: pt(58, a - hw) + ' ' + pt(86, a) + ' ' + pt(58, a + hw),
        fill: i % 2 ? '#e8590c' : '#800020', stroke: '#1a1210', 'stroke-width': 2, 'stroke-linejoin': 'round'
      }, g);
    }
  })();

  /* ---------- string lights on festive pages ---------- */
  (function () {
    var cols = ['#ffb300', '#ff5a5f', '#ffd966', '#ff8a3c', '#fff0a0'];
    $$('.hero, .page').forEach(function (sec) {
      if (sec.dataset.mode === 'chhath') return;
      var box = document.createElement('div');
      box.className = 'bulbs';
      box.setAttribute('aria-hidden', 'true');
      var n = 18;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('i');
        b.style.left = ((i + .5) / n * 100) + '%';
        b.style.top = (5 + Math.sin(i / (n - 1) * Math.PI * 4) * 4 + 4) + 'px';
        b.style.setProperty('--c', cols[i % cols.length]);
        b.style.animationDelay = (-rand(0, 1.8)).toFixed(2) + 's';
        box.appendChild(b);
      }
      sec.insertBefore(box, sec.firstChild);
    });
  })();

  /* ---------- scroll reveal ---------- */
  (function () {
    var els = $$('.rise');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .2 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- progress bar ---------- */
  var bar = $('#bar'), ticking = false;
  function updateBar() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();

  /* ---------- audio (permanent, background, no UI) ---------- */
  /*
   * Three tracks, all looping:
   *   tihar  → audio/tihar.mp3   (Tihar sections)
   *   deusi  → audio/deusi.mp3   (Deusi-Bhailo section, short loop)
   *   chhath → audio/chhath.mp3  (Both Chhath sections)
   *
   * Deusi base volume = VOL_BASE; each dakshina adds VOL_STEP up to VOL_MAX (2×).
   * All switching is a smooth fade. No visible UI whatsoever.
   */
  var VOL_BASE  = 0.55;   /* normal playback volume                    */
  var VOL_MAX   = 1.0;    /* hard ceiling (≤ 1.0 for Web Audio)         */
  var VOL_STEP  = 0.09;   /* volume added per dakshina gift             */
  var FADE_TICK = 60;     /* ms between fade steps                      */
  var FADE_INC  = 0.04;   /* volume change per tick                     */

  var deusiVol  = VOL_BASE; /* current target volume for the deusi track */

  var TRACKS = {
    tihar:  { src: 'audio/tihar.mp3'  },
    deusi:  { src: 'audio/deusi.mp3'  },
    chhath: { src: 'audio/chhath.mp3' }
  };

  /* Build Audio elements */
  Object.keys(TRACKS).forEach(function (k) {
    var t = TRACKS[k];
    var a = new Audio();
    a.loop    = true;
    a.preload = 'auto';
    a.volume  = 0;
    t.el      = a;
    t.ready   = false;
    t.fade    = null;
    a.addEventListener('canplaythrough', function () { t.ready = true; syncAudio(); }, { once: true });
    a.src = t.src;
  });

  function targetVol(k) {
    /* Returns the desired volume for track k when it is the active track. */
    return k === 'deusi' ? deusiVol : VOL_BASE;
  }

  function fadeTo(t, target) {
    clearInterval(t.fade);
    t.fade = setInterval(function () {
      var cur = t.el.volume;
      var nxt = cur < target
        ? Math.min(target, cur + FADE_INC)
        : Math.max(target, cur - FADE_INC);
      t.el.volume = nxt;
      if (Math.abs(nxt - target) < 0.001) {
        t.el.volume = target;
        clearInterval(t.fade);
        if (target === 0) t.el.pause();
      }
    }, FADE_TICK);
  }

  function syncAudio() {
    if (document.hidden) return;           /* respect page-visibility API */
    Object.keys(TRACKS).forEach(function (k) {
      var t = TRACKS[k];
      if (!t.ready) return;
      var isActive = (k === mode ||
                      /* tihar covers deusi mode too if deusi track absent */
                      (mode === 'deusi' && k === 'deusi') ||
                      (mode === 'chhath' && k === 'chhath'));
      /* Recompute: active means the key matches current mode */
      isActive = (k === mode);

      if (isActive) {
        if (t.el.paused) {
          var p = t.el.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked; wait for gesture */ });
        }
        fadeTo(t, targetVol(k));
      } else {
        if (!t.el.paused) fadeTo(t, 0);
      }
    });
  }

  /* Restart deusi track from the top (called on dakshina) */
  function restartSong(k) {
    var t = TRACKS[k];
    if (!t || !t.ready) return;
    try { t.el.currentTime = 0; } catch (e) { /* ignore */ }
    if (mode === k) syncAudio();
  }

  /* Boost deusi volume on dakshina (capped at VOL_MAX, up to 2× base) */
  function boostDeusi() {
    deusiVol = Math.min(VOL_MAX, deusiVol + VOL_STEP);
    if (mode === 'deusi') fadeTo(TRACKS.deusi, deusiVol);
  }

  /* Autoplay gate: browsers block audio until a user gesture has occurred.
     We start playback on the very first interaction anywhere on the page. */
  var gestureUnlocked = false;
  function unlockAudio() {
    if (gestureUnlocked) return;
    gestureUnlocked = true;
    syncAudio();
    document.removeEventListener('click',      unlockAudio, true);
    document.removeEventListener('touchstart', unlockAudio, true);
    document.removeEventListener('keydown',    unlockAudio, true);
    document.removeEventListener('scroll',     unlockAudio, true);
  }
  document.addEventListener('click',      unlockAudio, { capture: true, passive: true });
  document.addEventListener('touchstart', unlockAudio, { capture: true, passive: true });
  document.addEventListener('keydown',    unlockAudio, { capture: true, passive: true });
  document.addEventListener('scroll',     unlockAudio, { capture: true, passive: true });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && gestureUnlocked) syncAudio();
    if ( document.hidden) {
      Object.keys(TRACKS).forEach(function (k) {
        var t = TRACKS[k];
        if (t.ready && !t.el.paused) fadeTo(t, 0);
      });
    }
  });

  /* ---------- theme per page ---------- */
  var THEMES = {
    tihar:  { bg2: '#FFD9B0', bg: '#FFF4DC', fg: '#1a1210' },
    deusi:  { bg2: '#FFB9A0', bg: '#FFEFD3', fg: '#1a1210' },
    eve:    { bg2: '#5b2a5c', bg: '#1c1a45', fg: '#fdebcd' },
    morn:   { bg2: '#FFB07C', bg: '#FFE6B9', fg: '#1a1210' }
  };
  var chh = $('#chhath');
  function applyTheme(sec) {
    var key = sec.id === 'eve' ? 'eve' : sec.id === 'morn' ? 'morn' : (sec.dataset.mode === 'deusi' ? 'deusi' : 'tihar');
    var th = THEMES[key], st = document.documentElement.style;
    st.setProperty('--bg2', th.bg2);
    st.setProperty('--bg', th.bg);
    st.setProperty('--fg', th.fg);
    if (chh) chh.classList.toggle('morning', sec.id === 'morn');
  }

  /* ---------- page dots + active page tracking ---------- */
  var sections = $$('[data-title]');
  var nav = document.createElement('nav');
  nav.id = 'dots';
  nav.setAttribute('aria-label', 'Pages');
  var dotBtns = sections.map(function (sec) {
    var b = document.createElement('button');
    b.type = 'button';
    b.title = sec.dataset.title;
    b.setAttribute('aria-label', sec.dataset.title);
    b.addEventListener('click', function () {
      sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    nav.appendChild(b);
    return b;
  });
  document.body.appendChild(nav);

  function setActive(sec) {
    var i = sections.indexOf(sec);
    dotBtns.forEach(function (b, j) {
      if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    applyTheme(sec);
    var m = sec.dataset.mode || 'tihar';
    if (m !== mode) { mode = m; syncAudio(); }
  }
  if ('IntersectionObserver' in window) {
    var ao = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target); });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { ao.observe(s); });
  }
  setActive(sections[0]);

  /* ---------- 1 & 2 · feed the crow / dog ---------- */
  function treatEl(kind) {
    var d = document.createElement('div');
    d.className = 'treat';
    d.style.marginLeft = '-24px';
    d.style.marginTop = '-24px';
    d.innerHTML = kind === 'crow'
      ? '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#E1AD01" stroke="#1a1210" stroke-width="3"/><circle cx="24" cy="24" r="17" fill="url(#lines)"/></svg>'
      : '<svg viewBox="0 0 48 48"><g transform="rotate(-35 24 24)" fill="#FDFBF7" stroke="#1a1210" stroke-width="3"><circle cx="9" cy="18" r="6"/><circle cx="9" cy="30" r="6"/><circle cx="39" cy="18" r="6"/><circle cx="39" cy="30" r="6"/><rect x="9" y="19" width="30" height="10" stroke="none"/></g></svg>';
    return d;
  }

  var garland = $('#garland');
  if (garland) {
    for (var gi = 0; gi < 10; gi++) {
      var ang = (12 + gi * 17) * Math.PI / 180;
      var u = svgEl('use', {
        href: '#flower', width: 15, height: 15,
        x: (80 + 27 * Math.cos(ang) - 7.5).toFixed(1),
        y: (106 + 18 * Math.sin(ang) - 7.5).toFixed(1)
      }, garland);
      u.setAttribute('style', gi % 2 ? '--f1:#E1AD01;--f2:#e8590c' : '--f1:#e8590c;--f2:#E1AD01');
    }
    garland.style.opacity = '0';
    garland.style.transition = 'opacity .6s';
  }

  function feed(kind, btn) {
    var stage = $(kind === 'crow' ? '#crowStage' : '#dogStage');
    if (!stage || btn.disabled) return;
    btn.disabled = true; btn.style.opacity = '.65';
    stage.classList.add('feeding');
    var cs = getComputedStyle(stage);
    var tx = parseFloat(cs.getPropertyValue('--tx')) / 100; if (isNaN(tx)) tx = .5;
    var ty = parseFloat(cs.getPropertyValue('--ty')) / 100; if (isNaN(ty)) ty = .4;
    var w = stage.clientWidth, h = stage.clientHeight;
    var jobs = [];
    for (var i = 0; i < 3; i++) {
      var t = treatEl(kind);
      t.style.left = (tx * 100) + '%';
      t.style.top = (ty * 100) + '%';
      stage.appendChild(t);
      var sx = (.5 - tx) * w + rand(-30, 30), sy = (1.1 - ty) * h;
      var anim = t.animate([
        { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(.5) rotate(0deg)', opacity: 0 },
        { opacity: 1, offset: .15 },
        { transform: 'translate(0,0) scale(1) rotate(360deg)', opacity: 1, offset: .8 },
        { transform: 'translate(0,-6px) scale(.5) rotate(360deg)', opacity: 0 }
      ], { duration: 1500, delay: i * 220, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'both' });
      jobs.push(anim.finished.then(function () { t.remove(); }, function () { t.remove(); }));
    }
    Promise.all(jobs).then(function () {
      stage.classList.remove('feeding');
      stage.classList.add('happy');
      restartClass(stage.querySelector('.body'), 'hop');
      if (kind === 'dog') {
        restartClass(stage.querySelector('.tail'), 'wag');
        if (garland) garland.style.opacity = '1';
      }
      burst(stage, 14);
      showPop($('.pop', stage), 6000);
      setTimeout(function () { stage.classList.remove('happy'); }, 6000);
      btn.disabled = false; btn.style.opacity = '';
    });
  }
  $$('[data-feed]').forEach(function (b) {
    b.addEventListener('click', function () { feed(b.dataset.feed, b); });
  });

  /* ---------- 3 · Gai Puja ---------- */
  (function () {
    var cow = $('#cowbtn'), cowStage = $('#cowStage'), btn = $('#tikaBtn'), tika = $('.tika', cow), pop = $('#cowpop');
    if (!cow || !tika) return;
    function toggle() {
      var on = !tika.classList.contains('on');
      tika.classList.toggle('on', on);
      if (cowStage) cowStage.classList.toggle('tika-on', on);
      cow.setAttribute('aria-label', on ? 'Remove the tika from the cow' : 'Apply a crimson tika to the cow');
      btn.textContent = on ? 'Tika applied. Tap to remove' : 'Tap the cow to apply tika';
      if (on) { showPop(pop, 5500); burst(cow, 14); } else { pop.classList.remove('show'); }
    }
    cow.addEventListener('click', toggle);
    btn.addEventListener('click', toggle);
  })();

  /* ---------- 4 · Laxmi Puja ---------- */
  (function () {
    var btn = $('#diyaBtn'), page = $('#laxmi');
    if (!btn || !page) return;
    btn.addEventListener('click', function () {
      var on = !page.classList.contains('lit');
      page.classList.toggle('lit', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Blow out the Diya' : 'Light the Diya';
      if (on) burst($('.stage', page), 12);
    });
  })();

  /* ---------- 5 · Mha Puja mandala ---------- */
  (function () {
    var m = $('#mandala');
    if (!m) return;
    var cols = ['#800020', '#E1AD01', '#e8590c', '#2B2A6B'];
    svgEl('circle', { cx: 100, cy: 100, r: 97, fill: 'none', stroke: '#800020', 'stroke-width': 3 }, m);
    svgEl('circle', { cx: 100, cy: 100, r: 78, fill: 'none', stroke: '#1a1210', 'stroke-width': 2, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round' }, m);
    for (var i = 0; i < 16; i++) {
      svgEl('ellipse', {
        cx: 100, cy: 42, rx: 6.5, ry: 14, transform: 'rotate(' + (i * 22.5) + ' 100 100)',
        fill: cols[i % 4], stroke: '#1a1210', 'stroke-width': 1.6
      }, m);
    }
    for (var j = 0; j < 8; j++) {
      svgEl('ellipse', {
        cx: 100, cy: 66, rx: 8, ry: 12, transform: 'rotate(' + (j * 45 + 22.5) + ' 100 100)',
        fill: j % 2 ? '#FDFBF7' : '#e8590c', stroke: '#1a1210', 'stroke-width': 1.6
      }, m);
    }
    svgEl('circle', { cx: 100, cy: 100, r: 20, fill: '#E1AD01', stroke: '#1a1210', 'stroke-width': 3 }, m);
    svgEl('use', { href: '#eye', x: 82, y: 91, width: 36, height: 18 }, m);

    var flames = [];
    for (var l = 0; l < 8; l++) {
      var g = svgEl('g', { transform: 'rotate(' + (l * 45) + ' 100 100)' }, m);
      svgEl('ellipse', { cx: 100, cy: 20, rx: 6.5, ry: 3.8, fill: '#E1AD01', stroke: '#1a1210', 'stroke-width': 2 }, g);
      var f = svgEl('path', { d: 'M100 17Q95 11 100 4Q105 11 100 17Z', fill: '#ffb300', stroke: '#800020', 'stroke-width': 1.5 }, g);
      f.style.cssText = 'transform-box:fill-box;transform-origin:50% 100%;transform:scale(0);transition:transform .5s cubic-bezier(.3,1.6,.5,1)';
      flames.push(f);
    }

    var caption = $('.interact p', m.closest('.interact'));
    var base = caption ? caption.textContent : '';
    if (caption) caption.textContent = base + ' Tap the mandala to light its lamps.';
    m.setAttribute('role', 'button');
    m.setAttribute('tabindex', '0');
    m.setAttribute('aria-pressed', 'false');
    m.style.cursor = 'pointer';
    var lit = false, busy = false;
    function toggle() {
      if (busy) return;
      busy = true; lit = !lit;
      m.setAttribute('aria-pressed', String(lit));
      flames.forEach(function (f, i) {
        setTimeout(function () { f.style.transform = lit ? 'scale(1)' : 'scale(0)'; }, i * 130);
      });
      setTimeout(function () {
        busy = false;
        if (lit) burst(m, 10);
        if (caption) caption.textContent = lit
          ? 'Every lamp is lit: the body is worshipped as a lamp. Tap to rest them.'
          : base + ' Tap the mandala to light its lamps.';
      }, 8 * 130 + 300);
    }
    m.addEventListener('click', toggle);
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  })();

  /* ---------- 6 · Bhai Tika ---------- */
  (function () {
    var walnuts = $('#walnuts'), stripes = $('#stripes'), btn = $('#tikaStep'), msg = $('#tikaMsg');
    if (!walnuts || !stripes || !btn) return;
    var n = 30;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var x = 150 + 138 * Math.cos(a), y = 116 + 98 * Math.sin(a);
      var g = svgEl('g', { transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (a * 57.3).toFixed(0) + ')' }, walnuts);
      svgEl('ellipse', { rx: 6, ry: 5 }, g);
      svgEl('path', { d: 'M0 -5V5', stroke: '#1a1210', 'stroke-width': 1, fill: 'none' }, g);
    }
    var C = [['red', '#c8102e'], ['yellow', '#E1AD01'], ['green', '#3f8f3a'], ['blue', '#2B6cb0'],
             ['orange', '#e8590c'], ['purple', '#7a3d91'], ['white', '#FDFBF7']];
    var step = 0;
    function label() { btn.textContent = 'Place colour ' + (step + 1) + ': ' + C[step][0]; }
    btn.addEventListener('click', function () {
      if (step >= C.length) {
        while (stripes.firstChild) stripes.removeChild(stripes.firstChild);
        step = 0; label();
        msg.textContent = 'Seven colours, one for each blessing.';
        return;
      }
      var r = svgEl('rect', {
        x: (89.5 + step * 3.2).toFixed(1), y: 70, width: 3, height: 9, rx: 1.2,
        fill: C[step][1], stroke: '#1a1210', 'stroke-width': .6
      }, stripes);
      r.style.cssText = 'transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);transition:transform .4s';
      requestAnimationFrame(function () { requestAnimationFrame(function () { r.style.transform = 'scaleY(1)'; }); });
      step++;
      if (step >= C.length) {
        btn.textContent = 'Begin again';
        msg.textContent = 'All seven colours are placed. May he live long and well.';
        burst($('#bhai .stage'), 22);
      } else {
        label();
        msg.textContent = step + ' of 7 blessings given.';
      }
    });
    label();
  })();

  /* ---------- 7 · Deusi-Bhailo ---------- */
  (function () {
    var amt = $('#amt'), out = $('#amtOut'), give = $('#giveBtn'), stage = $('#bhStage');
    var info = $('#bhInfo'), text = $('#bhText');
    if (!amt || !give) return;
    var total = 0, phrases = ['Aahaa Bhailo!', 'Deusi re!', 'Jhilimili Bhailo!', 'Bhailo re, Bhailo!'], pi = 0;
    amt.addEventListener('input', function () { out.textContent = amt.value; });
    out.textContent = amt.value;

    give.addEventListener('click', function () {
      var v = parseInt(amt.value, 10) || 0;
      total += v;
      info.textContent = 'Collected: Rs ' + total + '. Thank you! The song begins again from the beginning.';

      var coins = Math.min(6, Math.max(2, Math.round(v / 20)));
      var h = stage.clientHeight;
      for (var i = 0; i < coins; i++) {
        var c = document.createElement('div');
        c.className = 'coin';
        c.style.left = (86 + rand(-3, 3)) + '%';
        c.style.top = (82 + rand(-3, 3)) + '%';
        stage.appendChild(c);
        (function (c, d) {
          var an = c.animate([
            { transform: 'translateY(' + (-h) + 'px) rotate(0deg)', opacity: 0 },
            { opacity: 1, offset: .2 },
            { transform: 'translateY(0) rotate(540deg)', opacity: 1, offset: .75 },
            { transform: 'translateY(-8px) rotate(540deg)', opacity: 1, offset: .88 },
            { transform: 'translateY(0) rotate(540deg)', opacity: 0 }
          ], { duration: 1300, delay: d, easing: 'ease-in' });
          an.onfinish = function () { c.remove(); };
        })(c, i * 120);
      }

      text.textContent = phrases[pi++ % phrases.length];
      restartClass(text, 'show');
      restartClass($('svg', stage), 'shake');
      burst(stage, 8);
      boostDeusi();
      restartSong('deusi');
    });
  })();

  /* ---------- 8 · Chhath: Sandhya Arghya ---------- */
  (function () {
    var btn = $('#arghyaBtn'), stage = $('#evStage'), msg = $('#arghyaMsg');
    if (!btn || !stage) return;
    var busy = false;
    btn.addEventListener('click', function () {
      if (busy) return;
      busy = true; btn.disabled = true; btn.style.opacity = '.65';
      stage.classList.add('pour');
      msg.textContent = 'The devotee pours water toward Surya, the setting sun.';
      setTimeout(function () {
        stage.classList.remove('pour');
        msg.textContent = 'The offering is complete. Give arghya again?';
        btn.textContent = 'Give Arghya again';
        btn.disabled = false; btn.style.opacity = '';
        busy = false;
      }, 6500);
    });
  })();

  /* ---------- 9 · Chhath: Usha Arghya ---------- */
  (function () {
    var btn = $('#soopBtn'), stage = $('#moStage');
    if (!btn || !stage) return;
    btn.addEventListener('click', function () {
      var on = !stage.classList.contains('lifted');
      stage.classList.toggle('lifted', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Lower the soop' : 'Lift the soop';
      if (on) setTimeout(function () { burst(stage, 12); }, 900);
    });
  })();
})();
