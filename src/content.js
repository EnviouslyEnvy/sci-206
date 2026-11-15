/* ==========================================================================
   content.js — ALL player-facing educational and story text lives here.
   Edit wording in this file; no game logic depends on the sentences themselves.

   BUBBLES: each entry is one explanation bubble.
     id        unique key used by the progression rules in game.js
     title     bubble heading
     body      bubble text (no equations — course rule)
     trigger   plain-language note of what makes it appear
     anchor    id of the on-screen component the bubble points to
     topic     group heading used by the explanation log
     figure    optional small illustration drawn inside the bubble
     source    'rewritten' = group's bubble copy, rewritten 15 Nov in plainer,
                             shorter wording at the group's request
               'supplied'  = group's original copy, unchanged (unused entry)
     log       false hides it from the explanation log (unused content)
   "Seen" state is tracked at runtime in game state (g.seen), not here.
   ========================================================================== */
window.CONTENT = {

  title: 'Lights Back On',
  subtitle: 'A blackout, a box of parts, and one generator',
  // Shown in the credits line of the ending card. Add group member names here.
  team: '',

  intro: [
    '9:42 pm. A storm knocks out the whole street.',
    'In the garage: a magnet, copper wire, iron, a crank.',
    'The power is out. We have the parts. Let’s get the lights back on.'
  ],

  crewDialogue: false, // Re-enable the team dialogue and its box by setting this to true.
  crewNames: ['Imani', 'Tobias', 'Wren'],

  bubbles: [
    { id: 'magnet', topic: 'Building the generator', anchor: 'a-rotor', source: 'rewritten',
      trigger: 'Place the magnet',
      title: 'No battery needed',
      body: 'A permanent magnet keeps its magnetic field without any power source. But a magnet sitting still won’t light anything.' },
    { id: 'poles', topic: 'Building the generator', anchor: 'a-rotor', source: 'rewritten',
      trigger: 'Tap the i next to the magnet',
      title: 'North and south',
      body: 'Every magnet has a north pole and a south pole. This one is mounted so both poles sweep past the coils as it spins.' },
    { id: 'winding', topic: 'Building the generator', anchor: 'a-coilL', position: 'top', source: 'rewritten',
      trigger: 'Finish winding the wire',
      title: 'Turns make a coil',
      body: 'Each loop of wire is one turn. Many turns side by side make a coil, also called a solenoid.' },
    { id: 'coating', topic: 'Building the generator', anchor: 'a-coilR', source: 'rewritten', figure: 'coating',
      trigger: 'Tap the i next to the right coil',
      title: 'Insulated wire',
      body: 'The wire has a thin insulating coating. It stops current from jumping between turns that touch, so the current has to travel around every loop.' },
    { id: 'core', topic: 'Building the generator', anchor: 'a-coreL', source: 'rewritten', figure: 'bench',
      trigger: 'Insert the iron cores',
      title: 'Iron guides the field',
      body: 'Soft iron inside a coil channels more of the magnet’s field through the turns. More field through the coil means more voltage when that field changes.' },
    { id: 'crank', topic: 'Building the generator', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Attach the crank',
      title: 'You supply the energy',
      body: 'Turning the crank is mechanical work. The generator converts that work into electrical energy. It doesn’t create energy.' },

    { id: 'induction', topic: 'Making voltage', anchor: 'a-coilL', source: 'rewritten',
      trigger: 'Spin the magnet',
      title: 'A changing field makes voltage',
      body: 'As the magnet spins, the magnetic field through the coils keeps changing. A changing field through a coil produces a voltage. This is electromagnetic induction.' },
    { id: 'faster', topic: 'Making voltage', anchor: 'a-meter', source: 'rewritten',
      trigger: 'Spin the rotor faster',
      title: 'Faster spin, more voltage',
      body: 'Spinning faster makes the field through the coils change faster. Same magnet, same coils, higher voltage.' },
    { id: 'stopped', topic: 'Making voltage', anchor: 'a-meter', source: 'rewritten',
      trigger: 'Let the rotor stop',
      title: 'No motion, no voltage',
      body: 'The magnet is as strong as before, but the field through the coils has stopped changing. No change means no voltage.' },
    { id: 'waveform', topic: 'Making voltage', anchor: 'a-scope', source: 'rewritten',
      trigger: 'Tap the i on the small screen',
      title: 'This is AC',
      body: 'Every half turn the poles swap sides, so the voltage reverses direction. The current reverses with it. That is alternating current (AC).' },

    { id: 'circuit', topic: 'Circuits and loads', anchor: 'a-terminals', source: 'rewritten',
      trigger: 'Connect both lead wires',
      title: 'Current needs a loop',
      body: 'Voltage alone doesn’t light a bulb. Current flows only around a complete loop: out along one wire, through the bulb, and back along the other. Closing the switch completes the loop.' },
    { id: 'load', topic: 'Circuits and loads', anchor: 'room-0', source: 'rewritten',
      trigger: 'Light the first room',
      title: 'The bulb is a load',
      body: 'The bulb turns electrical energy into light and heat. It needs a steady supply, so the room stays lit only while you keep cranking.' },

    { id: 'heavier', topic: 'Load and Lenz’s law', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Switch on a second room',
      title: 'More rooms, harder to turn',
      body: 'With two rooms connected, the same push no longer keeps the rotor up to speed. Supplying more electrical power takes more mechanical effort.' },
    { id: 'lenz', topic: 'Load and Lenz’s law', anchor: 'a-coilR', source: 'rewritten',
      trigger: 'Keep two rooms running',
      title: 'Lenz’s law',
      body: 'Current in the coils makes a magnetic field of its own. That field pushes back against the spinning magnet. The more current the rooms draw, the harder it pushes back.' },
    { id: 'balance', topic: 'Load and Lenz’s law', anchor: 'effort-box', source: 'rewritten',
      trigger: 'Shown after Lenz’s law',
      title: 'Match supply to demand',
      body: 'You have two options: push harder, or switch a room off. If the rooms demand more than you supply, the rotor slows and the lights dim.' },

    { id: 'turns', topic: 'Upgrades', anchor: 'a-coilL', source: 'rewritten', figure: 'bench',
      trigger: 'Buy More turns',
      title: 'More turns',
      body: 'More turns give more voltage at the same speed. The longer wire also has more resistance, and the extra output still has to come from the crank.' },
    { id: 'strongmagnet', topic: 'Upgrades', anchor: 'a-rotor', source: 'rewritten', figure: 'bench',
      trigger: 'Buy Stronger magnet',
      title: 'Stronger magnet',
      body: 'A stronger magnet gives more voltage at the same speed. It doesn’t add energy. The crank still does all the work.' },
    { id: 'efficiency', topic: 'Upgrades', anchor: 'power-box', source: 'rewritten', figure: 'bench',
      trigger: 'Buy Low-loss kit',
      title: 'Where the rest goes',
      body: 'Not all of your work reaches the lamps. Some heats the wire (resistance) and some heats the bearings (friction). Thicker wire and better bearings waste less.' },
    { id: 'wind', topic: 'Upgrades', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Mount the wind turbine (after the ending)',
      title: 'Wind does the work',
      body: 'The wind now turns the rotor instead of your arm. The generator still needs mechanical energy. It just comes from a different source.' },

    // Group's original copy for a feature that is not in this build (no gearbox).
    { id: 'gear', topic: 'Upgrades', anchor: 'a-crank', source: 'supplied', log: false,
      trigger: 'Select a gear ratio (not implemented)',
      title: 'Fewer crank turns—with a catch',
      body: 'This gear setting spins the rotor farther with each crank revolution. Under load, the crank also becomes harder to turn. You’re trading turning force for speed.' }
  ],

  // Objective line shown at the top, by stage.
  objectives: {
    assemble: 'Build the generator. Drag each part onto the bench.',
    winding:  'Wind the wire onto the coils.',
    spin:     'Crank it. Watch the voltmeter.',
    faster:   'Crank harder. Watch the voltage.',
    stop:     'Let go. Let the rotor stop.',
    wire:     'Run both lead wires to the house.',
    light:    'Switch on the living room, then crank.',
    second:   'Switch on the kitchen. Keep cranking.',
    balance:  'Hold both rooms above 80%.',
    final:    'Final job: all three rooms above 80%.',
    done:     'Lights restored. Keep experimenting.'
  },

  // Short team reactions. Not physics explanations; those are the bubbles above.
  crew: {
    start:        ['Imani', 'Parts are in the tray. Drag one over, or tap it and tap its spot.'],
    magnetIn:     ['Wren', 'Magnet’s on. Its ends swing right past the coils.'],
    wireStart:    ['Imani', 'Hold the Wind button. I’ve got the other coil.'],
    wound:        ['Imani', 'Both coils wound and joined.'],
    coreIn:       ['Tobias', 'Iron’s in. Only the magnet moves.'],
    crankIn:      ['Tobias', 'Belt’s on. One crank turn spins the magnet several times.'],
    built:        ['Wren', 'It’s built. Hit the crank!'],
    firstVolts:   ['Wren', 'Voltage! And nothing’s plugged in yet.'],
    coast:        ['Tobias', 'Hands off. Watch the needle drop.'],
    oneWire:      ['Imani', 'One wire isn’t a loop. Add the other.'],
    wired:        ['Imani', 'Wired up. Living-room switch is live.'],
    openSpin:     ['Wren', 'Volts, but the switch is open. No current yet.'],
    firstLight:   ['Wren', 'Living room’s lit!'],
    predictRight: ['Tobias', 'Called it first try.'],
    predictRetry: ['Tobias', 'Now you’ve felt it: more rooms, more push.'],
    shed:         ['Imani', 'One room off and the crank eased up. Nice.'],
    twoSteady:    ['Wren', 'Two rooms steady. Spend your supplies!'],
    thirdOpen:    ['Tobias', 'Bedroom’s wired. Switch it on when ready.'],
    challenge:    ['Tobias', 'Three rooms and the rotor’s slowing. What can you change?'],
    close:        ['Imani', 'So close. Too much is leaving as heat. Any supplies left?'],
    overbright:   ['Wren', 'Easy! That’s more than the lamps need.'],
    upgraded:     ['Imani', 'Fitted. Try it.'],
    noSupplies:   ['Imani', 'Not enough supplies. Discoveries earn more.'],
    windOn:       ['Wren', 'Turbine’s up. The lights follow the gusts.'],
    windOff:      ['Wren', 'Back to arm power.'],
    done:         ['Wren', 'Every room lit. Nice work!']
  },

  // Friendly corrections for a part dropped in the wrong place.
  misplace: {
    magnet: 'The magnet goes on the shaft between the two coils.',
    wire:   'The wire wraps around the two coil forms.',
    core:   'The iron cores slide inside the coil forms.',
    crank:  'The crank mounts on the drive wheel below the rotor.',
    lead:   'Each lead runs from an output terminal to the house.',
    taken:  'That spot is already filled.'
  },

  parts: {
    magnet: { name: 'Bar magnet',   hint: 'N and S poles' },
    wire:   { name: 'Copper wire',  hint: 'insulated' },
    core:   { name: 'Iron cores',   hint: 'soft iron, a pair' },
    crank:  { name: 'Crank & belt', hint: 'your input' },
    lead:   { name: 'Lead wire',    hint: 'to the house' }
  },

  rooms: ['Living room', 'Kitchen', 'Bedroom'],

  // The kitchen switch stays off until the right answer is chosen.
  prediction: {
    title: 'Quick prediction',
    question: 'The kitchen is about to switch on. To keep the rotor at the same speed, you’ll have to push…',
    options: [
      { id: 'less', label: 'Less', feedback: 'Not quite. Sharing isn’t free: two lamps need twice the energy. Try again.' },
      { id: 'same', label: 'The same', feedback: 'Not quite. The second lamp needs energy too, and it all comes from the crank. Try again.' },
      { id: 'more', label: 'Harder', right: true }
    ],
    after: 'Correct. Kitchen is on — feel the difference.'
  },

  upgrades: {
    turns:  { name: 'More turns', cost: 3, blurb: 'More voltage per spin. More wire to heat up.' },
    magnet: { name: 'Stronger magnet', cost: 3, blurb: 'More voltage per spin.' },
    loss:   { name: 'Low-loss kit', cost: 3, blurb: 'Thicker wire, better bearings. Less heat wasted.' },
    wind:   { name: 'Wind turbine', cost: 0, blurb: 'Let the storm do the cranking.' }
  },

  status: {
    unbuilt:  'Not built yet',
    stopped:  'Rotor stopped — no voltage',
    open:     'Circuit open — voltage, no current',
    noRooms:  'All switches off — spinning freely',
    more:     'Lights dim — more input needed',
    stable:   'Lighting stable',
    bright:   'Brighter than needed',
    paused:   'Paused while you read'
  },

  ending: {
    title: 'Lights back on.',
    lead: 'Three rooms lit, and every watt came through the crank.',
    recap: {
      built:   'You built a generator from a magnet, two coils, iron cores and a crank.',
      open:    'Spinning it gave {v} volts with nothing connected. No current flowed until the circuit was a complete loop.',
      stopped: 'When the rotor stopped, the voltage dropped to zero. The magnet was still magnetic; the field just wasn’t changing.',
      load:    'Every room you switched on made the rotor harder to turn. That push-back from the coils is Lenz’s law.',
      predictRight: 'You predicted first try that a second room would take more effort.',
      predictRetry: 'Your first guess about the second room was off, and then the crank showed you why.',
      upgrades: 'Your upgrades ({list}) helped the machine use your effort better. None of them made energy.',
      budget:  'At the end you put in about {pin} W. {pload} W reached the lamps and the rest left as heat.'
    },
    credits: 'All artwork and sound are made in code for this project. No external images, music or sound files.'
  }
};
