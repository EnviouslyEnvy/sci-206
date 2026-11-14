/* ==========================================================================
   sim.js — generator physics. No DOM, no game rules. Runs in browser and Node.
   --------------------------------------------------------------------------
   Lumped, cycle-averaged model of a small permanent-magnet alternator:

     induced voltage (rms)   E   = k · ω            (k grows with magnet strength,
                                                     turns, and iron-core coupling)
     load current            I   = E / (r + R_ext)  (zero when the circuit is open)
     opposing (Lenz) torque  τem = k · I            (so τem·ω = E·I: every electrical
                                                     watt is paid for mechanically)
     friction torque         τf  = c + b·ω
     drive torque            τin = effort · τmax · (1 − ω/ω_free)   (a tiring arm:
                                                     strong when slow, weak when fast)
     rotor                   J · dω/dt = τin − τem − τf

   Rooms are identical lamps wired in parallel: R_ext = R_room / n.
   Units are SI and the values are plausible for a hand-cranked bench
   generator, but this is a teaching model, not a design tool.
   ========================================================================== */
(function (root) {
  'use strict';

  var BASE = {
    J: 0.06,          // rotor inertia, kg·m²
    fricC: 0.28,      // constant bearing friction, N·m
    fricB: 0.004,     // speed-dependent friction, N·m·s
    tauMax: 4.55,     // stall torque of the hand drive at full effort, N·m (at the rotor)
    omegaFree: 50,    // speed where the arm can no longer add torque, rad/s
    k: 0.42,          // volts per rad/s with base magnet, base turns, iron cores in
    r: 3.0,           // winding resistance, ohms
    Rroom: 14.4,      // one room's lamp: 10 W at 12 V
    Prated: 10,       // watts for a fully lit room
    Vrated: 12,
    noCore: 0.45      // coupling factor if the iron cores were left out
  };

  // Upgrade effects. Every one has a physical reason and none is free energy.
  var UPG = {
    turns:  { k: 1.35, r: 1.35 },          // more turns: more volts per speed, but more wire to heat
    magnet: { k: 1.24 },                   // stronger field change at the same speed
    loss:   { r: 0.78, fric: 0.5 }         // thicker wire + better bearings: less wasted as heat
  };

  function machine(upg, hasCore) {
    upg = upg || {};
    var m = { k: BASE.k, r: BASE.r, c: BASE.fricC, b: BASE.fricB };
    if (hasCore === false) m.k *= BASE.noCore;
    if (upg.turns)  { m.k *= UPG.turns.k;  m.r *= UPG.turns.r; }
    if (upg.magnet) { m.k *= UPG.magnet.k; }
    if (upg.loss)   { m.r *= UPG.loss.r;   m.c *= UPG.loss.fric; m.b *= UPG.loss.fric; }
    return m;
  }

  // Electrical state at a given speed. nRooms = number of closed room switches;
  // connected = both lead wires attached.
  function electrical(m, omega, nRooms, connected) {
    var E = m.k * omega, I = 0, V = E;
    if (connected && nRooms > 0) {
      var Rext = BASE.Rroom / nRooms;
      I = E / (m.r + Rext);
      V = I * Rext;
    }
    var perRoom = (connected && nRooms > 0) ? (V * V) / BASE.Rroom : 0;
    return {
      E: E, V: V, I: I,
      tauEm: m.k * I,
      pLoad: V * I,              // watts reaching the lamps
      pWire: I * I * m.r,        // watts heating the windings
      perRoom: perRoom,
      brightness: perRoom / BASE.Prated
    };
  }

  function driveTorque(effort, omega) {
    return effort * BASE.tauMax * Math.max(0, 1 - omega / BASE.omegaFree);
  }

  // Advance the rotor by dt seconds. s = {omega, theta}. Returns a readout.
  function step(s, m, effort, nRooms, connected, dt) {
    var el = electrical(m, s.omega, nRooms, connected);
    var tauIn = driveTorque(effort, s.omega);
    var fric = s.omega > 0 ? m.c + m.b * s.omega : Math.min(m.c, tauIn);
    var net = tauIn - el.tauEm - fric;
    s.omega += (net / BASE.J) * dt;
    if (s.omega < 0.02 && net <= 0) s.omega = 0;
    if (s.omega < 0) s.omega = 0;
    s.theta += s.omega * dt;
    el.tauIn = tauIn; el.tauFric = fric;
    el.pIn = tauIn * s.omega; el.pFric = fric * s.omega;
    return el;
  }

  // Where the rotor settles for a constant effort (used for tuning and tests).
  function steady(m, effort, nRooms, connected) {
    var s = { omega: 0, theta: 0 }, out;
    for (var i = 0; i < 6000; i++) out = step(s, m, effort, nRooms, connected, 1 / 200);
    out.omega = s.omega;
    return out;
  }

  var api = { BASE: BASE, UPG: UPG, machine: machine, electrical: electrical,
              driveTorque: driveTorque, step: step, steady: steady,
              rpm: function (w) { return w * 60 / (2 * Math.PI); } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Sim = api;
})(typeof window !== 'undefined' ? window : this);
