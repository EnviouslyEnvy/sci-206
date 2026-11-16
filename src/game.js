/* ==========================================================================
   game.js — state, progression rules, input, rendering.
   Physics lives in sim.js. All wording lives in content.js.
   Sections: state · helpers · audio · bubbles · progression · assembly ·
             controls · rooms & upgrades · render · intro/ending · boot
   ========================================================================== */
(function () {
  'use strict';
  var C = window.CONTENT, S = window.Sim;
  var $ = function (id) { return document.getElementById(id); };
  var NS = 'http://www.w3.org/2000/svg';
  var BUB = {}; C.bubbles.forEach(function (b) { BUB[b.id] = b; });
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var VIS = 0.25;                 // rotation is drawn at a quarter of real speed
  var H = 1 / 120;                // fixed simulation step, seconds
  var STAGES = ['intro', 'assemble', 'spin', 'faster', 'stop', 'wire', 'light', 'second', 'balance', 'final', 'done'];
  var LIT = 0.8;                  // a room counts as lit at 80 % of rated power
  var REF_W = 300 * 2 * Math.PI / 60; // bench-test speed for same-speed comparisons

  /* ------------------------------ state ------------------------------ */
  function freshState() {
    return {
      stage: 'intro',
      placed: { magnet: false, wire: false, core: false, crank: false },
      leads: 0, leadAt: {}, wind: 0, winding: false, windHold: false,
      seen: {}, order: [], supplies: 0, objectiveHistory: [],
      upg: { turns: false, magnet: false, loss: false }, windDrive: false,
      rooms: [false, false, false], roomOpen: [false, false, false], disp: [0, 0, 0],
      effort: 0, holding: false, latch: false, level: 0.5,
      rot: { omega: 0, theta: 0 }, vis: 0, out: null, t: 0,
      flags: {}, timers: {}, prediction: null, predTries: 0, peakOpenV: 0, selected: null,
      ended: false, bench: {}, endStats: null
    };
  }
  var g = freshState();
  var queue = [], cur = null, lastFocus = null;
  var modal = { intro: true, predict: false, ending: false, log: false };
  var mach = S.machine(g.upg, true);

  /* ----------------------------- helpers ----------------------------- */
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function hid(e, v) { e.toggleAttribute('hidden', !!v); }   // works for SVG as well as HTML
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rank(s) { return STAGES.indexOf(s); }
  function atLeast(s) { return rank(g.stage) >= rank(s); }
  function built() { return g.placed.magnet && g.placed.wire && g.placed.core && g.placed.crank && g.wind >= 12; }
  function roomsOn() { return g.rooms.filter(Boolean).length; }
  function paused() { return !!cur || modal.intro || modal.predict || modal.ending || modal.log; }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }

  var toastTimer = 0;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3600);
  }
  function crew(key) {
    if (!C.crewDialogue) return;
    var line = C.crew[key]; if (!line) return;
    var c = $('crew');
    var av = c.querySelector('.av');
    if (av) { av.textContent = line[0].charAt(0); av.dataset.w = line[0]; }
    c.querySelector('.who').textContent = line[0] + ':';
    c.querySelector('.say').textContent = line[1];
    c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  }
  function award(n) {
    g.supplies += n;
    var b = $('supplies-box'); b.hidden = false; $('supplies').textContent = g.supplies;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    renderShop();
  }

  /* ------------------------------ audio ------------------------------ */
  // Only the speed-dependent generator hum is synthesised; there are no audio files.
  var Audio = (function () {
    var ctx = null, master = null, hum = null, humGain = null, muted = false;
    function init() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      try {
        var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
        hum = ctx.createOscillator(); hum.type = 'triangle'; hum.frequency.value = 40;
        humGain = ctx.createGain(); humGain.gain.value = 0; hum.connect(humGain); humGain.connect(master); hum.start();
      } catch (e) { ctx = null; }
    }
    return {
      init: init,
      setHum: function (omega) {
        if (!ctx) return;
        hum.frequency.value = 36 + omega * 2.2;
        humGain.gain.value = paused() ? 0 : clamp(omega / 50, 0, 1) * 0.03;
      },
      toggle: function () { muted = !muted; if (master) master.gain.value = muted ? 0 : 1; return muted; }
    };
  })();

  /* ----------------------------- bubbles ----------------------------- */
  // show(id, after): queue an explanation. The simulation holds still while
  // any bubble is open. `after` runs once, when the bubble is dismissed.
  function show(id, after, part) { queue.push({ id: id, after: after, part: part }); if (!cur) nextBubble(); }
  function nextBubble() {
    var q = queue.shift(); if (!q) return;
    cur = q; g.holding = false; g.windHold = false;
    var b = BUB[q.id];
    if (!lastFocus) lastFocus = document.activeElement;
    $('bubble-topic').textContent = b.topic;
    $('bubble-title').textContent = b.title;
    $('bubble-body').textContent = b.body + (q.part ? '\n\n' + C.misplace[q.part] : '');
    $('bubble-fig').innerHTML = figure(b);
    $('bubble-pause').textContent = built() ? C.status.paused : '';
    $('bubble').hidden = false; $('ring').hidden = false;
    var a = $(b.anchor);
    if (a && a.scrollIntoView && window.innerHeight < 700) a.scrollIntoView({ block: 'center' });
    positionBubble();
    $('bubble-ok').focus({ preventScroll: true });
  }
  function closeBubble() {
    if (!cur) return;
    var q = cur; cur = null;
    if (!g.seen[q.id]) { g.seen[q.id] = true; g.order.push(q.id); }
    $('bubble').hidden = true; $('ring').hidden = true;
    if (q.after) q.after();
    if (!cur) {
      if (queue.length) nextBubble();
      else {
        if (lastFocus && document.contains(lastFocus) && !lastFocus.disabled) lastFocus.focus({ preventScroll: true });
        lastFocus = null;
        checkBuilt();
      }
    }
    syncUI();
    if (q.part && !cur && g.selected) {
      var target = document.querySelector('#gen .zone.hot');
      if (target) target.focus({ preventScroll: true });
    }
  }
  function positionBubble() {
    if (!cur) return;
    var b = BUB[cur.id], a = $(b.anchor), bub = $('bubble'), ring = $('ring'), arrow = $('b-arrow');
    var vw = window.innerWidth, vh = window.innerHeight, m = 12, gap = 20;
    var r = a ? a.getBoundingClientRect() : null;
    if (!r || (r.width === 0 && r.height === 0)) r = { left: vw / 2 - 1, right: vw / 2 + 1, top: vh / 2 - 1, bottom: vh / 2 + 1, width: 2, height: 2 };
    ring.style.left = (r.left - 7) + 'px'; ring.style.top = (r.top - 7) + 'px';
    ring.style.width = (r.width + 14) + 'px'; ring.style.height = (r.height + 14) + 'px';
    var bw = bub.offsetWidth, bh = bub.offsetHeight, cx = r.left + r.width / 2, cy = r.top + r.height / 2, x, y, side;
    if (b.position === 'top') { side = 'top'; x = cx - bw / 2; y = r.top - gap - bh; }
    else if (vw < 720) {            // small screens: sheet at whichever end is away from the component
      side = 'none'; x = (vw - bw) / 2; y = cy > vh / 2 ? m : vh - bh - m;
    } else if (r.right + gap + bw <= vw - m) { side = 'right'; x = r.right + gap; y = cy - bh / 2; }
    else if (r.left - gap - bw >= m) { side = 'left'; x = r.left - gap - bw; y = cy - bh / 2; }
    else if (r.top - gap - bh >= m) { side = 'top'; x = cx - bw / 2; y = r.top - gap - bh; }
    else { side = 'bottom'; x = cx - bw / 2; y = Math.min(r.bottom + gap, vh - bh - m); }
    x = clamp(x, m, vw - bw - m); y = clamp(y, m, vh - bh - m);
    bub.style.left = x + 'px'; bub.style.top = y + 'px';
    arrow.style.display = side === 'none' ? 'none' : 'block';
    if (side === 'right' || side === 'left') {
      arrow.style.top = clamp(cy - y - 8, 14, bh - 30) + 'px';
      arrow.style.left = side === 'right' ? '-7px' : (bw - 9) + 'px';
    } else {
      arrow.style.left = clamp(cx - x - 8, 14, bw - 30) + 'px';
      arrow.style.top = side === 'bottom' ? '-7px' : (bh - 9) + 'px';
    }
  }
  function figure(b) {
    if (b.figure === 'magnetic-field') {
      // Nested arches attach across the pole regions, rather than at two points.
      // More distant field lines extend beyond the edges of this schematic.
      var paths = [
        [90,90, 100,-10, 220,-10, 230,90],
        [112,90, 120,12, 200,12, 208,90],
        [136,90, 140,40, 180,40, 184,90],
        [90,120, 100,220, 220,220, 230,120],
        [112,120, 120,198, 200,198, 208,120],
        [136,120, 140,170, 180,170, 184,120],
        [80,94, 46,94, 24,63, 24,26],
        [80,100, 48,100, 30,87, 12,65],
        [80,116, 46,116, 24,147, 24,184],
        [80,110, 48,110, 30,123, 12,145],
        [296,26, 296,63, 274,94, 240,94],
        [308,65, 290,87, 272,100, 240,100],
        [296,184, 296,147, 274,116, 240,116],
        [308,145, 290,123, 272,110, 240,110],
        [80,105, 56,105, 32,105, 8,105],
        [312,105, 288,105, 264,105, 240,105]
      ];
      var lines = paths.map(function (p, i) {
        var path = 'M' + p[0] + ' ' + p[1] + ' C' + p.slice(2).join(' ');
        var x = (p[0] + 3*p[2] + 3*p[4] + p[6]) / 8;
        var y = (p[1] + 3*p[3] + 3*p[5] + p[7]) / 8;
        var angle = Math.atan2(-p[1]-p[3]+p[5]+p[7], -p[0]-p[2]+p[4]+p[6]) * 180 / Math.PI;
        var arrow = '<path class="field-direction" d="M-5 -4 L2 0 L-5 4"';
        if (REDUCED) arrow += ' transform="translate(' + x + ' ' + y + ') rotate(' + angle + ')"/>';
        else arrow += '><animateMotion path="' + path + '" dur="' + (i < 6 ? 5 : 3) +
          's" begin="-' + (i * 0.43) + 's" rotate="auto" calcMode="paced" repeatCount="indefinite"/></path>';
        return '<path class="field-line" d="' + path + '"/>' + arrow;
      }).join('');
      return '<div class="fig magnetic-field"><div class="cap">Magnetic field · top view</div>' +
        '<svg viewBox="0 0 320 210" role="img" aria-label="Top view of a bar magnet. Magnetic field lines curve out from the north pole and into the south pole.">' +
        lines + '<rect x="80" y="90" width="80" height="30" fill="#c6433c"/>' +
        '<rect x="160" y="90" width="80" height="30" fill="#2868b7"/>' +
        '<rect x="80" y="90" width="160" height="30" rx="4" fill="none" stroke="#263641" stroke-width="2"/>' +
        '<g fill="white" font-size="17" font-weight="800" text-anchor="middle"><text x="96" y="111">N</text><text x="224" y="111">S</text></g></svg>' +
        '<div>Outside the magnet, the field points from N to S. The field exists even when the magnet is still. Arrows show direction, not particles flowing or the field changing.</div></div>';
    }
    if (b.figure === 'coating') {
      return '<div class="fig"><div class="cap">Close-up of neighbouring turns</div>' +
          '<svg viewBox="0 0 270 70" aria-hidden="true"><g>' +
        [40, 96, 152].map(function (x) { return '<circle cx="' + x + '" cy="34" r="27" fill="#4d7a9c"/><circle cx="' + x + '" cy="34" r="21" fill="#d9824a"/>'; }).join('') +
        '</g><text x="206" y="24" font-size="11" font-weight="700" fill="#4d7a9c">coating</text>' +
        '<text x="206" y="46" font-size="11" font-weight="700" fill="#a85a24">copper</text></svg></div>';
    }
    if (b.figure === 'bench' && g.bench[b.id]) {
      var f = g.bench[b.id];
      return '<div class="fig"><div class="cap">' + f.cap + '</div>' + f.rows.map(function (r) {
        return '<div class="r ' + (r.after ? 'after' : '') + '"><span>' + r.label + '</span><div><i style="width:' +
          clamp(r.v / f.max * 100, 2, 100) + '%"></i></div><b>' + r.v.toFixed(1) + ' ' + f.unit + '</b></div>';
      }).join('') + (f.note ? '<div style="margin-top:5px">' + f.note + '</div>' : '') + '</div>';
    }
    return '';
  }
  function inspect(id) {
    if (cur) return;
    if (!g.seen[id]) award(1);
    show(id);
  }

  /* --------------------------- progression --------------------------- */
  // The whole tutorial order is here. Called once per simulation step.
  function setStage(s) { g.stage = s; g.timers = {}; syncUI(); }
  function toggleObjectives(open, restoreFocus) {
    $('objectives-panel').hidden = !open;
    document.body.classList.toggle('objectives-open', open);
    $('btn-objectives').setAttribute('aria-expanded', String(open));
    if (restoreFocus) $('btn-objectives').focus();
    if (open) centerObjective(false);
    positionWindControl();
    positionBubble();
  }
  function centerObjective(animate) {
    if ($('objectives-panel').hidden) return;
    var scroll = $('objective-scroll'), current = $('objective-current');
    if (!current || !scroll.clientHeight) return;
    var space = Math.max(0, (scroll.clientHeight - current.offsetHeight) / 2);
    scroll.style.paddingTop = scroll.style.paddingBottom = space + 'px';
    scroll.scrollTo({ top: Math.max(0, current.offsetTop - space), behavior: animate && !REDUCED ? 'smooth' : 'instant' });
  }
  function appendObjective(text) {
    var previous = $('objective-current');
    if (previous) {
      previous.classList.remove('current', 'objective-arrival');
      previous.removeAttribute('aria-current');
      previous.removeAttribute('id');
      $('objective').removeAttribute('id');
    }
    var entry = document.createElement('li'), label = document.createElement('span'), body = document.createElement('p');
    entry.id = 'objective-current'; entry.className = 'objective-entry current'; entry.setAttribute('aria-current', 'step');
    label.className = 'obj-tag'; label.textContent = 'Current objective';
    body.id = 'objective'; body.textContent = text;
    entry.appendChild(label); entry.appendChild(body);
    $('objectives-history').appendChild(entry);
    if (g.stage !== 'intro' && !REDUCED) {
      entry.classList.add('objective-arrival');
      setTimeout(function () { entry.classList.remove('objective-arrival'); }, 2000);
    }
    centerObjective(true);
  }
  function renderObjectives() {
    var key = g.stage === 'assemble' && g.winding ? 'winding' : g.stage;
    var history = g.objectiveHistory, previous = history[history.length - 1];
    if (key === 'intro') {
      $('objectives-history').innerHTML = '';
      appendObjective('Start building to receive your first objective.');
      return;
    }
    if (previous && previous.key === key) return;
    if (!previous) $('objectives-history').innerHTML = '';
    var text = C.objectives[key];
    history.push({ key: key, text: text });
    appendObjective(text);
  }
  function openRoom(i) { g.roomOpen[i] = true; syncUI(); }

  function progress(dt) {
    var o = g.out, T = g.timers, f = g.flags, n = roomsOn();
    if (g.leads < 2 && o.E > g.peakOpenV) g.peakOpenV = o.E;
    switch (g.stage) {
      case 'spin':        // first voltage with nothing connected
        if (o.E > 3) { T.a = (T.a || 0) + dt; if (T.a > 0.5) { award(1); crew('firstVolts'); show('induction', function () { setStage('faster'); }); } }
        break;
      case 'faster':      // same machine, faster motion
        if (o.E > 12) { T.a = (T.a || 0) + dt; if (T.a > 0.4) { award(1); show('faster', function () { g.latch = false; $('latch').checked = false; g.effort = 0; crew('coast'); setStage('stop'); }); } } else T.a = 0;
        break;
      case 'stop':        // stationary magnet: no output
        if (g.rot.omega < 0.05) { award(1); show('stopped', function () { setStage('wire'); }); }
        break;
      case 'light':       // complete circuit lights the first room
        if (g.rooms[0] && o.brightness > 0.5) { T.a = (T.a || 0) + dt; if (T.a > 0.6) { award(1); crew('firstLight'); show('load', function () { openRoom(1); setStage('second'); }); } }
        else if (!g.rooms[0] && o.E > 4 && !f.openSpin) { f.openSpin = true; crew('openSpin'); }
        break;
      case 'second':      // added load -> heavier crank -> Lenz -> choice
        if (n >= 2 && o.I > 0.05) {
          if (!g.seen.heavier) {
            T.a = (T.a || 0) + dt;
            if (T.a > 2.2) { award(1); show('heavier', function () { f.arrow = true; crew(g.predTries === 0 ? 'predictRight' : (C.crew.predictRetry ? 'predictRetry' : 'predictWrong')); }); }
          } else if (!g.seen.lenz) {
            T.b = (T.b || 0) + dt;
            if (T.b > 2.2) { award(1); show('lenz', function () { f.slider = true; syncUI(); show('balance', function () { f.shop = true; setStage('balance'); }); }); }
          }
        }
        break;
      case 'balance':     // two rooms held steady
        if (g.rooms[0] && g.rooms[1] && o.brightness >= LIT) { T.a = (T.a || 0) + dt; if (T.a > 2.5) { award(2); crew('twoSteady'); openRoom(2); setStage('final'); setTimeout(function () { if (g.stage === 'final' && !g.rooms[2]) crew('thirdOpen'); }, 3500); } } else T.a = 0;
        break;
      case 'final':       // final challenge: all three, steady
        if (n === 3) {
          if (o.brightness >= LIT) { T.a = (T.a || 0) + dt; if (T.a > 3.5) finish(); }
          else {
            T.a = 0; T.b = (T.b || 0) + dt;
            if (T.b > 3 && !f.challenge) { f.challenge = true; award(1); crew('challenge'); }
            if (T.b > 14 && o.brightness > 0.68 && !f.close) { f.close = true; crew('close'); }
          }
        }
        break;
    }
    if (n > 0 && o.brightness > 1.7 && atLeast('second')) { T.ob = (T.ob || 0) + dt; if (T.ob > 2 && !f.overbright) { f.overbright = true; crew('overbright'); } }
  }

  function finish() {
    var o = g.out;
    g.ended = true;
    g.endStats = { pin: Math.round(o.pIn), pload: Math.round(o.pLoad) };
    setStage('done'); crew('done');
    var R = C.ending.recap, items = [R.built];
    items.push(fmt(R.open, { v: g.peakOpenV.toFixed(0) }));
    items.push(R.stopped, R.load);
    items.push(g.predTries === 0 ? R.predictRight : (R.predictRetry || R.predictWrong));
    var ups = Object.keys(g.upg).filter(function (k) { return g.upg[k]; }).map(function (k) { return C.upgrades[k].name.toLowerCase(); });
    if (ups.length) items.push(fmt(R.upgrades, { list: ups.join(', ') }));
    items.push(fmt(R.budget, g.endStats));
    $('end-title').textContent = C.ending.title;
    $('end-lead').textContent = C.ending.lead;
    $('end-recap').innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    $('end-credits').textContent = (C.team ? 'Made by ' + C.team + '. ' : '') + C.ending.credits;
    modal.ending = true; $('ending').hidden = false; $('end-continue').focus();
  }

  /* ----------------------------- assembly ---------------------------- */
  var ICON = {
    magnet: '<svg viewBox="0 0 64 30"><rect x="6" y="8" width="26" height="14" fill="#e2574c"/><rect x="32" y="8" width="26" height="14" fill="#3f86e0"/><text x="19" y="19" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">N</text><text x="45" y="19" font-size="11" font-weight="800" fill="#fff" text-anchor="middle">S</text></svg>',
    wire: '<svg viewBox="0 0 64 30"><rect x="16" y="4" width="32" height="22" rx="4" fill="#d9824a"/><path d="M20 4v22M26 4v22M32 4v22M38 4v22M44 4v22" stroke="#8d4519" stroke-width="1.5"/><rect x="12" y="2" width="5" height="26" fill="#56628c"/><rect x="47" y="2" width="5" height="26" fill="#56628c"/></svg>',
    core: '<svg viewBox="0 0 64 30"><rect x="6" y="5" width="52" height="8" rx="2" fill="#aeb6c2"/><rect x="6" y="17" width="52" height="8" rx="2" fill="#8e97a6"/></svg>',
    crank: '<svg viewBox="0 0 64 30"><circle cx="32" cy="15" r="12" fill="#2c3657" stroke="#aeb8d4" stroke-width="3"/><circle cx="40" cy="15" r="4" fill="#ffbe55"/></svg>',
    lead: '<svg viewBox="0 0 64 30"><path d="M6 15h52" stroke="#d9824a" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="15" r="4" fill="#c9a24b"/><circle cx="58" cy="15" r="4" fill="#c9a24b"/></svg>'
  };
  function trayParts() {
    if (g.stage === 'assemble') return ['magnet', 'wire', 'core', 'crank'].filter(function (p) { return !g.placed[p]; });
    if (g.stage === 'wire') { var a = []; for (var i = g.leads; i < 2; i++) a.push('lead'); return a; }
    return [];
  }
  function renderTray() {
    var t = $('tray'), parts = trayParts(), html = '';
    parts.forEach(function (p, i) {
      html += '<button type="button" class="part' + (p === 'lead' ? ' new-wire' : '') + (g.selected === p ? ' sel' : '') + '" data-part="' + p + '" data-i="' + i + '" aria-pressed="' + (g.selected === p) + '">' +
        ICON[p] + '<b>' + C.parts[p].name + '</b><small>' + C.parts[p].hint + '</small></button>';
    });
    if (!html && g.stage === 'assemble') html = '<p class="hint">All parts are on the bench.</p>';
    t.innerHTML = html;
    t.classList.toggle('attention', (g.stage === 'assemble' && !g.flags.trayStarted) || g.stage === 'wire');
    $('wind-control').hidden = !g.winding;
    $('wind-control').parentElement.classList.toggle('winding', g.winding);
    positionWindControl();
  }
  var PART_EXPLANATIONS = { magnet: 'magnet', wire: 'winding', core: 'core', crank: 'crank', lead: 'circuit' };
  function positionWindControl() {
    if (!g.winding) return;
    var left = $('a-coilL').getBoundingClientRect(), right = $('a-coilR').getBoundingClientRect();
    var control = $('wind-control'), bench = control.parentElement.getBoundingClientRect();
    var half = control.offsetWidth / 2;
    control.style.left = clamp((left.left + right.right) / 2 - bench.left, half + 8, bench.width - half - 8) + 'px';
    control.style.top = Math.max(48, Math.min(left.top, right.top) - bench.top - control.offsetHeight - 12) + 'px';
  }
  function select(part) {
    if (cur) return;
    g.flags.trayStarted = true;
    g.selected = g.selected === part ? null : part;
    renderTray(); markZones(g.selected);
    if (g.selected) {
      var id = PART_EXPLANATIONS[part];
      if (id && !g.seen[id]) show(id, null, part);
      else toast(C.misplace[part]);
    }
  }
  function zoneFree(z, part) {
    var name = z.getAttribute('data-zone');
    if (z.getAttribute('data-accept').split(' ').indexOf(part) < 0) return false;
    if (part === 'lead') return !g.leadAt[name];
    return !g.placed[part];
  }
  function markZones(part) {
    var svg = $('gen'); svg.classList.toggle('placing', !!part);
    Array.prototype.forEach.call(svg.querySelectorAll('.zone'), function (z) {
      var hot = !!part && zoneFree(z, part);
      z.classList.toggle('hot', hot); z.classList.remove('over');
      if (hot) z.setAttribute('tabindex', '0'); else z.removeAttribute('tabindex');
    });
  }
  function place(part, zoneEl) {
    if (cur) return false;
    var zone = zoneEl.getAttribute('data-zone'), accept = zoneEl.getAttribute('data-accept').split(' ');
    if (accept.indexOf(part) < 0) { toast(C.misplace[part]); return false; }
    if (!zoneFree(zoneEl, part)) { toast(C.misplace.taken); return false; }
    g.selected = null; markZones(null);
    if (part === 'magnet') { g.placed.magnet = true; crew('magnetIn'); }
    else if (part === 'wire') { g.placed.wire = true; g.winding = true; crew('wireStart'); }
    else if (part === 'core') {
      g.placed.core = true; crew('coreIn');
      g.bench.core = { cap: 'Bench test · same speed, nothing connected', unit: 'V', max: S.BASE.k * REF_W,
        rows: [{ label: 'without iron', v: S.BASE.k * S.BASE.noCore * REF_W }, { label: 'with iron', v: S.BASE.k * REF_W, after: true }] };
    }
    else if (part === 'crank') { g.placed.crank = true; crew('crankIn'); }
    else if (part === 'lead') {
      g.leadAt[zone] = true; g.leads++;
      if (g.leads === 1) crew('oneWire');
      else { crew('wired'); openRoom(0); setStage('light'); }
    }
    syncUI();
    if (g.winding) { var w = $('windbtn'); if (w) w.focus(); }
    checkBuilt();
    return true;
  }
  function addWind(n) {
    if (!g.winding || paused()) return;
    g.wind = Math.min(12, g.wind + n); renderTurns();
    var bar = document.querySelector('#windbtn i'); if (bar) bar.style.width = (g.wind / 12 * 100) + '%';
    if (g.wind >= 12) { g.winding = false; g.windHold = false; crew('wound'); syncUI(); checkBuilt(); }
  }
  function checkBuilt() {
    if (g.stage === 'assemble' && built() && !cur) { setStage('spin'); crew('built'); $('crank-btn').focus({ preventScroll: true }); }
  }

  // drag-and-drop with a click/keyboard alternative
  var drag = null;
  function bindTray() {
    var tray = $('tray'), ghost = $('ghost'), suppress = false;
    tray.addEventListener('pointerdown', function (e) {
      if (cur) return;
      var b = e.target.closest('[data-part]'); if (!b) return;
      var part = b.getAttribute('data-part');
      if (!g.seen[PART_EXPLANATIONS[part]]) { select(part); return; }
      drag = { part: b.getAttribute('data-part'), x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 7) {
        drag.moved = true; ghost.textContent = C.parts[drag.part].name; ghost.hidden = false; markZones(drag.part);
      }
      if (drag.moved) {
        ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
        var under = document.elementFromPoint(e.clientX, e.clientY), z = under && under.closest('.zone');
        Array.prototype.forEach.call(document.querySelectorAll('.zone.over'), function (q) { q.classList.remove('over'); });
        if (z && z.classList.contains('hot')) z.classList.add('over');
        e.preventDefault();
      }
    }, { passive: false });
    function end(e) {
      g.windHold = false;
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null; ghost.hidden = true;
      if (!d.moved) return;                       // a plain click: handled by 'click'
      suppress = true; setTimeout(function () { suppress = false; }, 0);
      var under = document.elementFromPoint(e.clientX, e.clientY), z = under && under.closest('.zone');
      if (z) { if (!place(d.part, z)) markZones(g.selected); }
      else { markZones(g.selected); if (under && under.closest('#gen')) toast(C.misplace[d.part]); }
    }
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    tray.addEventListener('click', function (e) {
      if (suppress) return;
      var b = e.target.closest('[data-part]'); if (b) select(b.getAttribute('data-part'));
    });
    var zones = $('zones');
    zones.addEventListener('click', function (e) { var z = e.target.closest('.zone'); if (z && g.selected) place(g.selected, z); });
    zones.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && g.selected) { e.preventDefault(); place(g.selected, e.target); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && g.selected && !cur) select(g.selected); });
    var wind = $('windbtn');
    wind.addEventListener('pointerdown', function (e) { if (!e.button && !paused()) g.windHold = true; });
    wind.addEventListener('click', function () { addWind(2); });
    wind.addEventListener('keydown', function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && !paused()) { e.preventDefault(); g.windHold = true; }
    });
    wind.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); g.windHold = false; } });
    wind.addEventListener('blur', function () { g.windHold = false; });
    window.addEventListener('blur', function () { g.windHold = false; });
  }

  /* ----------------------------- controls ---------------------------- */
  function cap() { return g.flags.slider ? g.level : 0.5; }
  function pressStart() {
    if (!built() || g.windDrive || paused()) return;
    Audio.init();
    g.holding = true; g.effort = Math.min(cap(), g.effort + 0.15);
    $('crank-btn').classList.add('down');
  }
  function pressEnd() { g.holding = false; $('crank-btn').classList.remove('down'); }
  function windEffort(t) { return 0.84 + 0.11 * Math.sin(t * 0.55) + 0.05 * Math.sin(t * 1.9 + 1); }
  function bindControls() {
    var b = $('crank-btn'), wheel = $('a-crank');
    [b, wheel].forEach(function (x) {
      x.addEventListener('pointerdown', function (e) { if (e.button) return; pressStart(); });
    });
    ['pointerup', 'pointercancel', 'blur'].forEach(function (ev) { window.addEventListener(ev, pressEnd); });
    b.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) pressStart(); }
    });
    b.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pressEnd(); } });
    $('latch').addEventListener('change', function (e) { g.latch = e.target.checked; Audio.init(); });
    $('effort').addEventListener('input', function (e) { g.level = e.target.value / 100; $('effort-out').textContent = e.target.value + '%'; });

    $('bubble-ok').addEventListener('click', closeBubble);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (cur) closeBubble(); else if (modal.log) toggleLog(false); }
    });
    window.addEventListener('resize', function () { positionBubble(); centerObjective(false); positionWindControl(); });
    window.addEventListener('scroll', positionBubble, { passive: true });

    $('gen').addEventListener('click', function (e) {
      if ($('gen').classList.contains('placing') || cur) return;
      var i = e.target.closest('[data-inspect]'); if (i) { inspect(i.getAttribute('data-inspect')); return; }
      var x = e.target.closest('[data-explain]'); if (!x) return;
      var ids = x.getAttribute('data-explain').split(','), pick = null;
      g.order.forEach(function (id) { if (ids.indexOf(id) >= 0) pick = id; });
      if (pick) show(pick);
    });
    $('gen').addEventListener('keydown', function (e) {
      var i = e.target.closest && e.target.closest('[data-inspect]');
      if (i && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inspect(i.getAttribute('data-inspect')); }
    });

    $('btn-objectives').addEventListener('click', function () { toggleObjectives($('objectives-panel').hidden, false); });
    $('objectives-close').addEventListener('click', function () { toggleObjectives(false, true); });
    $('btn-log').addEventListener('click', function () { toggleLog(!modal.log); });
    $('log-close').addEventListener('click', function () { toggleLog(false); });
    $('btn-mute').addEventListener('click', function (e) {
      Audio.init(); var m = Audio.toggle();
      e.currentTarget.setAttribute('aria-pressed', m); e.currentTarget.textContent = 'Sound: ' + (m ? 'off' : 'on');
    });
    var rt = 0;
    $('btn-restart').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      if (btn.dataset.arm) { clearTimeout(rt); delete btn.dataset.arm; btn.textContent = 'Restart'; reset(); return; }
      btn.dataset.arm = '1'; btn.textContent = 'Really restart?';
      rt = setTimeout(function () { delete btn.dataset.arm; btn.textContent = 'Restart'; }, 3000);
    });
    $('end-continue').addEventListener('click', function () { modal.ending = false; $('ending').hidden = true; syncUI(); $('crank-btn').focus(); });
    $('end-restart').addEventListener('click', reset);
    $('intro-start').addEventListener('click', endIntro);
    $('intro-skip').addEventListener('click', endIntro);
    document.addEventListener('visibilitychange', function () { last = performance.now(); pressEnd(); });
  }

  /* ------------------------ rooms and upgrades ----------------------- */
  function toggleRoom(i) {
    if (paused()) return;
    if (!g.roomOpen[i]) { toast('That room isn’t wired in yet.'); return; }
    Audio.init();
    if (!g.rooms[i] && i === 1 && g.prediction === null) { askPrediction(); return; }
    g.rooms[i] = !g.rooms[i];
    if (!g.rooms[i] && g.seen.heavier && !g.flags.shed && g.out && g.out.I > 0.05) { g.flags.shed = true; award(1); crew('shed'); }
    syncUI();
  }
  function askPrediction() {
    var P = C.prediction;
    $('predict-title').textContent = P.title; $('predict-q').textContent = P.question;
    $('predict-opts').innerHTML = P.options.map(function (o) { return '<button type="button" data-p="' + o.id + '">' + o.label + '</button>'; }).join('');
    $('predict-fb').textContent = ''; modal.predict = true; g.holding = false; $('predict').hidden = false;
    $('predict-opts').querySelector('button').focus();
  }
  // Origin marks the right choice with option.right. The local copy does not, and "more" is the right answer there.
  function predictionRight(opt) {
    return !!opt && (opt.right === true || (opt.right == null && opt.id === 'more'));
  }
  function bindRooms() {
    $('switches').addEventListener('click', function (e) { var b = e.target.closest('[data-room]'); if (b) toggleRoom(+b.getAttribute('data-room')); });
    $('house').addEventListener('click', function (e) { var r = e.target.closest('.room'); if (r) toggleRoom(+r.getAttribute('data-room')); });
    $('predict-opts').addEventListener('click', function (e) {
      var b = e.target.closest('[data-p]'); if (!b || b.disabled) return;
      var opt = C.prediction.options.filter(function (o) { return o.id === b.getAttribute('data-p'); })[0];
      if (!opt) return;
      if (!predictionRight(opt)) {
        g.predTries++; b.disabled = true; b.classList.add('wrong');
        $('predict-fb').textContent = opt.feedback || 'Not quite. A second room needs more energy, and that energy comes from the crank. Try again.';
        var next = $('predict-opts').querySelector('button:not(:disabled)'); if (next) next.focus();
        return;
      }
      g.prediction = opt.id; modal.predict = false; $('predict').hidden = true;
      g.rooms[1] = true; toast(C.prediction.after); syncUI();
      var sw = document.querySelector('.sw[data-room="1"]'); if (sw) sw.focus();
    });
    $('shop').addEventListener('click', function (e) { var b = e.target.closest('[data-up]'); if (b) buy(b.getAttribute('data-up')); });
    $('notes').addEventListener('click', function (e) { var b = e.target.closest('[data-b]'); if (b) show(b.getAttribute('data-b')); });
    $('log-body').addEventListener('click', function (e) { var b = e.target.closest('[data-b]'); if (b) { toggleLog(false); show(b.getAttribute('data-b')); } });
  }
  function buy(id) {
    if (cur) return;
    if (id === 'wind') {
      g.windDrive = !g.windDrive; g.holding = false; g.latch = false; $('latch').checked = false;
      crew(g.windDrive ? 'windOn' : 'windOff'); syncUI();
      if (g.windDrive && !g.seen.wind) show('wind');
      return;
    }
    if (g.upg[id]) return;
    var U = C.upgrades[id];
    if (g.supplies < U.cost) { crew('noSupplies'); return; }
    var before = mach;
    g.supplies -= U.cost; g.upg[id] = true; mach = S.machine(g.upg, true);
    $('supplies').textContent = g.supplies;
    if (id === 'loss') {
      var n = 3, wB = REF_W, a = S.electrical(before, wB, n, true), b = S.electrical(mach, wB, n, true);
      var hb = a.pWire + (before.c + before.b * wB) * wB, ha = b.pWire + (mach.c + mach.b * wB) * wB;
      g.bench.efficiency = { cap: 'Bench test · same speed, three rooms connected', unit: 'W', max: Math.max(hb, ha),
        rows: [{ label: 'heat, before', v: hb }, { label: 'heat, after', v: ha, after: true }] };
      show('efficiency');
    } else {
      var key = id === 'turns' ? 'turns' : 'strongmagnet';
      g.bench[key] = { cap: 'Bench test · same speed, nothing connected', unit: 'V', max: mach.k * REF_W,
        rows: [{ label: 'before', v: before.k * REF_W }, { label: 'after', v: mach.k * REF_W, after: true }],
        note: id === 'turns' ? 'The longer wire also has about a third more resistance to warm up.' : '' };
      show(key);
    }
    crew('upgraded'); syncUI();
  }
  function renderShop() {
    var s = $('shop'); if (s.hidden) return;
    var ids = ['turns', 'magnet', 'loss']; if (g.ended) ids.push('wind');
    s.innerHTML = ids.map(function (id) {
      var U = C.upgrades[id], owned = id === 'wind' ? g.windDrive : g.upg[id], poor = !owned && g.supplies < U.cost;
      var cost = id === 'wind' ? (g.windDrive ? 'Running — tap to remove' : 'Free') : owned ? 'Fitted' : U.cost + ' supplies';
      return '<button type="button" class="up' + (owned && id !== 'wind' ? ' owned' : '') + (poor ? ' poor' : '') + '" data-up="' + id + '"' +
        (owned && id !== 'wind' ? ' aria-disabled="true"' : '') + '><b>' + U.name + '</b><small>' + U.blurb + '</small><span class="cost">' + cost + '</span></button>';
    }).join('');
  }
  function toggleLog(open) {
    modal.log = open; $('log').hidden = !open;
    if (!open) { $('btn-log').focus(); return; }
    var topics = [], html = '';
    C.bubbles.forEach(function (b) { if (b.log !== false && topics.indexOf(b.topic) < 0) topics.push(b.topic); });
    topics.forEach(function (t) {
      html += '<h3>' + t + '</h3>';
      C.bubbles.filter(function (b) { return b.topic === t && b.log !== false; }).forEach(function (b) {
        html += g.seen[b.id]
          ? '<button type="button" class="entry" data-b="' + b.id + '"><b>' + b.title + '</b><span>' + b.body + '</span></button>'
          : '<div class="locked">Not found yet — ' + b.trigger.charAt(0).toLowerCase() + b.trigger.slice(1) + '.</div>';
      });
    });
    $('log-body').innerHTML = html; $('log-close').focus();
  }

  /* ------------------------------ render ----------------------------- */
  function renderTurns() {
    ['L', 'R'].forEach(function (side) {
      var grp = $('turns' + side), x0 = side === 'L' ? 90 : 348, n = Math.floor(g.wind), w = g.upg.loss ? 7.6 : 6.2, i;
      grp.innerHTML = '';
      if (g.upg.turns) for (i = 0; i < 11; i++) el('rect', { x: x0 + 4.4 + i * 8.8, y: 145, width: w, height: 90, rx: 3, fill: 'url(#g-copper2)' }, grp);
      for (i = 0; i < n; i++) el('rect', { x: x0 + i * 8.8, y: 152, width: w, height: 76, rx: 3, fill: 'url(#g-copper)' }, grp);
    });
  }
  function arc(cx, cy, r, a0, a1, sweep) {
    var p = function (a) { a *= Math.PI / 180; return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); };
    return 'M' + p(a0) + 'A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + p(a1);
  }
  function buildStatic() {
    var t = $('ticks');
    for (var v = 0; v <= 40; v += 5) {
      var a = (-60 + 120 * v / 40) * Math.PI / 180, s = Math.sin(a), c = Math.cos(a), major = v % 10 === 0;
      el('line', { x1: 620 + 50 * s, y1: 170 - 50 * c, x2: 620 + (major ? 58 : 55) * s, y2: 170 - (major ? 58 : 55) * c }, t);
      if (major) el('text', { x: 620 + 67 * s, y: 170 - 67 * c }, t).textContent = v;
    }
    $('arc-drive').setAttribute('d', arc(270, 372, 52, 30, 150, 1));
    $('arc-drag').setAttribute('d', arc(270, 190, 78, 330, 210, 0));
    var rain = $('rain');
    for (var r = -1; r < 9; r++) for (var cI = 0; cI < 11; cI++) {
      var x = cI * 46 + ((cI * 37) % 23) - r * 14 + 60, y = r * 60 + ((cI * 53) % 60);
      el('line', { x1: x, y1: y, x2: x - 4, y2: y + 16 }, rain);
    }
    $('switches').innerHTML = C.rooms.map(function (n, i) {
      return '<button type="button" class="sw" role="switch" aria-checked="false" data-room="' + i + '"><span class="nm">' + n + '</span><span class="st"></span><span class="tx">not wired</span></button>';
    }).join('');
    $('intro-sub').textContent = C.subtitle;
  }

  // Everything that changes on events (not every frame).
  function syncUI() {
    var gen = $('gen'), b = built(), st = g.stage;
    $('crew').hidden = !C.crewDialogue;
    $('app').classList.toggle('has-crew', !!C.crewDialogue);
    $('app').dataset.stage = st;
    renderObjectives();
    ['magnet', 'wire', 'core', 'crank'].forEach(function (p) { gen.classList.toggle('has-' + p, g.placed[p]); });
    renderTurns(); renderTray();
    // visible effects of upgrades
    var big = g.upg.magnet, y = big ? 165 : 172, h = big ? 50 : 36;
    ['magN', 'magS', 'magO'].forEach(function (id) { $(id).setAttribute('y', y); $(id).setAttribute('height', h); });
    $('magN').setAttribute('fill', big ? '#ff5b4a' : '#e2574c'); $('magS').setAttribute('fill', big ? '#2f8cff' : '#3f86e0');
    Array.prototype.forEach.call(gen.querySelectorAll('.wire'), function (w) { w.classList.toggle('thick', g.upg.loss); });
    $('hub').classList.toggle('gold', g.upg.loss);
    hid($('crankwheel'), g.windDrive); hid($('turbine'), !g.windDrive);
    $('drive-tag').textContent = g.windDrive ? 'wind’s push' : 'your push';
    // leads
    hid($('lead0'), !g.leadAt.term0); hid($('lead1'), !g.leadAt.term1); hid($('tohouse'), g.leads === 0);
    Array.prototype.forEach.call(document.querySelectorAll('.hwire'), function (w) { w.classList.toggle('wired', g.leads >= 2); });
    // inspect badges
    var hp = $('h-poles'), hc = $('h-coating'), hs = $('h-scope');
    hid(hp, !g.placed.magnet); hp.classList.toggle('new', !g.seen.poles);
    hid(hc, g.wind < 12); hc.classList.toggle('new', !g.seen.coating);
    hid($('a-scope'), !g.seen.induction); hid(hs, !g.seen.induction); hs.classList.toggle('new', !g.seen.waveform);
    // controls
    $('crank-btn').disabled = !b || g.windDrive;
    $('a-crank').classList.toggle('ready', b && !g.windDrive);
    $('latch-box').hidden = !b || g.windDrive || st === 'stop';
    $('effort-box').hidden = !g.flags.slider || g.windDrive;
    $('crank-hint').textContent = !b ? 'Build the generator first.' : g.windDrive ? 'The wind is doing the turning.' :
      st === 'stop' ? 'Hands off…' : 'Click to push. Hold to keep turning.';
    $('row-rpm').hidden = !b; $('row-effort').hidden = !b;
    $('row-demand').hidden = g.leads < 2; $('power-box').hidden = !g.seen.load;
    $('meters-hint').hidden = b;
    // side panel: tray -> notes -> shop
    var showTray = st === 'assemble' || st === 'wire', showShop = !!g.flags.shop;
    $('tray').hidden = !showTray; $('shop').hidden = showTray || !showShop; $('notes').hidden = showTray || showShop;
    $('side-title').textContent = showTray ? 'Parts tray' : showShop ? 'Upgrades' : 'Field notes';
    if (!$('notes').hidden) {
      var last3 = g.order.slice(-3).reverse();
      $('notes').innerHTML = '<ul>' + last3.map(function (id) { return '<li><button type="button" data-b="' + id + '">' + BUB[id].title + '</button></li>'; }).join('') +
        '</ul><p class="hint">Tap a glowing <b>i</b> on the machine. Each discovery earns +1 supply.</p>';
    }
    renderShop();
    // switches
    Array.prototype.forEach.call(document.querySelectorAll('.sw'), function (sw, i) {
      sw.disabled = !g.roomOpen[i]; sw.setAttribute('aria-checked', g.rooms[i]);
    });
    for (var i = 0; i < 3; i++) {
      $('room-' + i).classList.toggle('open', g.roomOpen[i]);
      $('swg-' + i).classList.toggle('on', g.rooms[i]);
    }
    $('supplies').textContent = g.supplies;
    $('log-count').textContent = g.order.length;
    positionWindControl();
  }

  var textAcc = 0;
  function render(dt) {
    var o = g.out || { E: 0, V: 0, I: 0, tauEm: 0, tauIn: 0, pIn: 0, pLoad: 0, pWire: 0, pFric: 0, brightness: 0 };
    var deg = g.vis * 180 / Math.PI;
    $('rotor').setAttribute('transform', 'rotate(' + deg.toFixed(1) + ' 270 190)');
    $('lblN').setAttribute('transform', 'rotate(' + (-deg).toFixed(1) + ' 232 190)');
    $('lblS').setAttribute('transform', 'rotate(' + (-deg).toFixed(1) + ' 308 190)');
    var wdeg = (deg / 3).toFixed(1);
    $('crankwheel').setAttribute('transform', 'rotate(' + wdeg + ' 270 372)');
    $('turbine').setAttribute('transform', 'rotate(' + wdeg + ' 270 372)');
    // field through each coil: follows the magnet's orientation
    var c = -Math.cos(g.vis), len = 40 * c * (g.placed.core ? 1 : S.BASE.noCore) * (g.upg.magnet ? 1.15 : 1);
    $('fieldL').setAttribute('x1', 141 - len); $('fieldL').setAttribute('x2', 141 + len);
    $('fieldR').setAttribute('x1', 399 - len); $('fieldR').setAttribute('x2', 399 + len);
    // Reveal the field demonstration on first generation, then keep its labels
    // visible even when the directional component passes through zero.
    if (built() && o.E > 0.05) g.flags.fieldStarted = true;
    hid($('field'), !g.flags.fieldStarted);
    $('field-arrows').style.opacity = Math.abs(c) < 0.08 ? 0 : 1;
    // meter
    var V = g.placed.wire && g.wind >= 12 ? o.V : 0;
    $('needle').setAttribute('transform', 'rotate(' + (-60 + 120 * clamp(V, 0, 40) / 40).toFixed(1) + ' 620 170)');
    // arrows
    $('arrow-drive').setAttribute('opacity', clamp(o.tauIn / 2, 0, 1).toFixed(2));
    $('arrow-drag').setAttribute('opacity', g.flags.arrow ? clamp(o.tauEm / 1.2, 0, 1).toFixed(2) : 0);
    // wires
    var live = o.I > 0.05;
    Array.prototype.forEach.call(document.querySelectorAll('#gen .wire'), function (w) { w.classList.toggle('live', live); });
    $('bus-main').classList.toggle('live', live);
    // rooms (lamps brighten and fade with a little lag)
    var lit = 0;
    for (var i = 0; i < 3; i++) {
      var target = g.rooms[i] && g.leads >= 2 ? o.brightness : 0;
      g.disp[i] += (target - g.disp[i]) * Math.min(1, dt * 7);
      var d = g.disp[i], room = $('room-' + i);
      room.querySelector('.rglow').style.opacity = (Math.min(1, d) * 0.92).toFixed(3);
      room.querySelector('.bulb-on').style.opacity = Math.min(1, d * 1.3).toFixed(3);
      room.classList.toggle('lit', d > 0.5);
      $('br-' + i).classList.toggle('live', live && g.rooms[i]);
      if (d >= LIT) lit++;
    }
    // scope: one rotor turn = one cycle, drawn on the same slowed clock as the rotor
    if (g.seen.induction) {
      var A = clamp(V / 40, 0, 1) * 36, cyc = 1 + g.rot.omega / 9, p = '';
      for (var x = 0; x <= 124; x += 2) p += (x ? 'L' : 'M') + (558 + x) + ' ' + (372 - A * Math.sin(g.vis + x / 124 * 2 * Math.PI * cyc)).toFixed(1);
      $('scope-path').setAttribute('d', p);
    }
    Audio.setHum(g.rot.omega);

    textAcc += dt; if (textAcc < 0.12) return; textAcc = 0;
    $('volt-text').textContent = V.toFixed(1) + ' V';
    $('m-rpm').textContent = Math.round(S.rpm(g.rot.omega));
    $('m-effort').style.width = (g.effort * 100).toFixed(0) + '%';
    var n = roomsOn();
    $('m-demand').textContent = n ? n + (n > 1 ? ' rooms' : ' room') + ' · ' + n * S.BASE.Prated + ' W when fully lit' : 'none';
    var heat = o.pWire + o.pFric, tot = o.pLoad + heat;
    $('m-pin').textContent = Math.round(o.pIn); $('m-pload').textContent = Math.round(o.pLoad); $('m-pheat').textContent = Math.round(heat);
    $('m-split-load').style.width = (clamp(o.pLoad / 70, 0, 1) * 100).toFixed(1) + '%';
    $('m-split-heat').style.width = (clamp(heat / 70, 0, 1 - clamp(o.pLoad / 70, 0, 1)) * 100).toFixed(1) + '%';
    void tot;
    for (i = 0; i < 3; i++) {
      var pct = Math.round(Math.min(g.disp[i], 9.99) * 100), on = g.rooms[i];
      $('room-' + i).querySelector('.rpct').textContent = g.roomOpen[i] ? (on ? pct + '%' : 'off') : '';
      var tx = document.querySelector('.sw[data-room="' + i + '"] .tx');
      tx.textContent = !g.roomOpen[i] ? 'not wired' : on ? 'on · ' + pct + '% bright' : 'off';
    }
    var pips = $('pips').querySelectorAll('i');
    for (i = 0; i < 3; i++) pips[i].classList.toggle('on', i < lit);
    $('pips').setAttribute('aria-label', 'Rooms lit: ' + lit + ' of 3');
    // status chip
    var k;
    if (!built()) k = 'unbuilt';
    else if (cur) k = 'paused';
    else if (g.rot.omega < 0.3) k = 'stopped';
    else if (g.leads < 2) k = 'open';
    else if (n === 0) k = 'noRooms';
    else if (o.brightness < LIT) k = 'more';
    else if (o.brightness > 1.5) k = 'bright';
    else k = 'stable';
    var chip = $('status'); if (chip.dataset.k !== k) { chip.dataset.k = k; chip.textContent = C.status[k]; }
    $('app').classList.toggle('struggle', k === 'more');
  }

  /* --------------------------- main loop ----------------------------- */
  var last = performance.now(), acc = 0;
  function tick(h) {
    if (g.windDrive) g.effort = windEffort(g.t);
    else if (g.holding || g.latch) g.effort = Math.min(cap(), g.effort + 1.2 * h);
    else g.effort = Math.max(0, g.effort - 0.3 * h);
    if (g.effort > cap() && !g.windDrive) g.effort = Math.max(cap(), g.effort - 1.5 * h);
    g.out = S.step(g.rot, mach, g.effort, roomsOn(), g.leads >= 2, h);
    g.vis += g.rot.omega * VIS * h; g.t += h;
    progress(h);
  }
  function frame(now) {
    var dt = (now - last) / 1000; last = now;
    if (dt > 0.1) dt = 0.1;                       // never jump after time away from the tab
    if (dt < 0) dt = 0;
    if (g.winding && g.windHold && !paused()) addWind(9 * dt);
    if (built() && !paused()) { acc += dt; var guard = 0; while (acc >= H && guard++ < 24 && !paused()) { tick(H); acc -= H; } if (guard >= 24) acc = 0; }
    else acc = 0;
    render(dt);
    requestAnimationFrame(frame);
  }

  /* -------------------------- intro / reset -------------------------- */
  var introTimers = [];
  function startIntro() {
    modal.intro = true; $('intro').hidden = false;
    var box = $('intro-lines'); box.innerHTML = C.intro.map(function (l) { return '<p>' + l + '</p>'; }).join('');
    var ps = box.querySelectorAll('p'), start = $('intro-start');
    introTimers.forEach(clearTimeout); introTimers = [];
    if (REDUCED) { Array.prototype.forEach.call(ps, function (p) { p.classList.add('in'); }); start.hidden = false; start.focus(); return; }
    start.hidden = true;
    var fl = $('flash'); fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
    Array.prototype.forEach.call(ps, function (p, i) { introTimers.push(setTimeout(function () { p.classList.add('in'); }, 700 + i * 1700)); });
    introTimers.push(setTimeout(function () { start.hidden = false; }, 700 + ps.length * 1700 - 600));
    $('intro-skip').focus();
  }
  function endIntro() {
    introTimers.forEach(clearTimeout);
    Audio.init(); modal.intro = false; $('intro').hidden = true;
    setStage('assemble'); crew('start');
    var first = document.querySelector('#tray .part'); if (first) first.focus({ preventScroll: true });
  }
  function reset() {
    g = freshState(); queue = []; cur = null; lastFocus = null; mach = S.machine(g.upg, true); acc = 0;
    modal.predict = modal.ending = modal.log = false;
    ['bubble', 'ring', 'predict', 'ending', 'log', 'toast', 'supplies-box'].forEach(function (id) { $(id).hidden = true; });
    $('latch').checked = false; $('effort').value = 50; $('effort-out').textContent = '50%';
    $('crew').querySelector('.who').textContent = ''; $('crew').querySelector('.say').textContent = '';
    var av = $('crew').querySelector('.av'); if (av) { av.textContent = ''; delete av.dataset.w; }
    toggleObjectives(true, false); markZones(null); syncUI(); startIntro();
  }

  /* ------------------------------- boot ------------------------------ */
  buildStatic(); bindTray(); bindControls(); bindRooms(); syncUI(); startIntro();
  requestAnimationFrame(frame);
  window.__lbo = { state: function () { return g; }, machine: function () { return mach; } }; // for testing
})();
