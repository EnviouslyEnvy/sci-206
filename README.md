# Lights Back On — SCI 206 generator game

A short browser game: a storm knocks out the power, you assemble a permanent-magnet
generator, discover induction, light three rooms, and feel Lenz's law at the crank.
First playthrough is about 4–5 minutes. No equations are shown to the player.

## Run it

Open `dist/index.html` in any modern browser. It is one self-contained file:
no server, no install, no network access, no external assets.

## Build it

    node build.js        # inlines src/* into dist/index.html

Needs only Node (no packages). Source layout:

| File | What it holds |
|---|---|
| `src/content.js` | **All wording**: bubble copy, crew lines, objectives, recap, credits |
| `src/sim.js` | Physics only (no DOM). Also runs in Node for testing |
| `src/game.js` | State, tutorial progression rules, input, rendering |
| `src/styles.css`, `src/index.template.html` | Look and SVG artwork |

Stack note: the brief suggested React/TypeScript/Vite for a from-scratch project.
This uses plain JavaScript with the same separation instead, so the result is a
single HTML file that can go straight into the LEARN dropbox and be opened by anyone.

## Where to edit educational text

Everything is in `src/content.js`, then run `node build.js`.

- `bubbles` — the explanation bubbles (id, title, body, trigger, anchor, topic).
- `team` — set this to your group members' names; it appears on the ending card.
- `crew`, `objectives`, `prediction`, `ending.recap` — story lines and the recap.

### Changes made to the supplied bubble copy

- **"Finish the connection"** — added "and the room's switch closed". In the game the
  room switch is a separate step from attaching the two leads, so the original
  sentence would have claimed current can flow while the switch is still open.
- **"Fewer crank turns—with a catch"** (gear ratio) — kept in the file but unused;
  there is no gearbox in this build.
- All other supplied bubbles are used word for word.
- Added (not from the supplied file): crew one-liners, objectives, the prediction
  question, the ending recap, and the small bench-test figures inside some bubbles.

## Simulation assumptions and simplifications

- Cycle-averaged model: the meter and lamps use steady (average) values rather than
  the instantaneous alternating voltage. The small trace shows the alternation;
  one rotor turn is one cycle.
- Induced voltage is proportional to rotor speed, and to a machine constant that
  grows with magnet strength, number of turns, and the iron cores.
- Current flows only when both leads are attached and at least one room switch is
  closed. Rooms are identical lamps in parallel.
- The opposing (Lenz) torque is proportional to the current, chosen so that
  mechanical power taken from the rotor exactly equals electrical power produced.
  Every watt at the lamps or lost in the wire is paid for at the crank.
- Losses: winding resistance (heat in the wire) plus bearing friction.
- The hand drive is a bounded effort: strong when the rotor is slow, weaker as it
  speeds up. It never forces a fixed speed.
- More turns raises voltage per speed and winding resistance together. The stronger
  magnet raises voltage per speed. The low-loss kit lowers winding resistance and
  friction. None adds energy.
- Lamps are treated as fixed resistances and do not burn out when over-driven.
- Rotation and the voltage trace are drawn at a quarter of real speed for visibility.
- Numbers are plausible for a bench generator (10 W lamps, roughly 25–55 W of arm
  power) but this is a teaching model, not an electrical design tool.

## Assets and attribution

All artwork is original SVG/CSS written for this project. All sound is synthesised
in the browser with the Web Audio API. No external images, fonts, music, sound
files or libraries are used, so there is nothing third-party to credit.
Course context came from the group's own lecture summaries and originality review.

## Validation summary

Played end to end in headless Chrome (Playwright) at 1280×800, plus resize checks:

- All parts assemble; verified by click-to-place, by real drag, and by keyboard only.
- Wrong placement shows a helpful message and does not penalise.
- Stopped rotor reads 0.0 V. Open circuit read about 13 V while the lamp stayed off.
- Closing the circuit lit the first room (94 % at half effort).
- Adding a second room at the same effort: rotor 319 → 285 rpm, rooms 94 % → 55 %.
- Switching that room off again restored 91 %; full effort held two rooms at 88 %.
- Three rooms on the base machine at full effort: 61 % (not enough).
  With more turns: 69 %. With more turns + low-loss kit: 89 % → ending reached.
- Bubbles fired in the intended order, stayed clear of their components
  (also after a window resize), and replayed from the log.
- Space on the crank did not scroll the page. Restart returned to a clean state.
- Simulation result is the same at 30, 60, 120 and 240 steps per second.
- No console errors. Build completes.

Not covered by automated checks: real touch devices, screen readers, and audio
(sound cannot be heard in a headless run).

## Audio

Only the generator rotation hum plays, with pitch and volume following rotor speed.
It is silent when the rotor stops or the game is paused. The Sound button mutes it.
