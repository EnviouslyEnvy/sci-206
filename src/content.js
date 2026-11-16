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
      title: "A permanent magnetic field (no battery needed)",
      body: "A permanent magnet keeps its magnetic field without an electrical supply, like a fridge magnet you might have at home. It can’t produce energy from just sitting still magnetism alone, however." },
    { id: 'poles', topic: 'Building the generator', anchor: 'a-rotor', source: 'rewritten', figure: 'magnetic-field',
      trigger: 'Tap the i next to the magnet',
      title: "North and south",
      body: "The N and S labels identify the magnet’s north and south poles. This magnet is between the coils so that its poles sweep past them when it rotates." },
    { id: 'winding', topic: 'Building the generator', anchor: 'a-coilL', position: 'top', source: 'rewritten',
      trigger: 'Finish winding the wire',
      title: "Turns make a coil",
      body: "Wind the wire around the form as you would wind thread around a spool. Each loop is one turn, and together they make a coil. This is also called a solenoid." },
    { id: 'coating', topic: 'Building the generator', anchor: 'a-coilR', source: 'rewritten', figure: 'coating',
      trigger: 'Tap the i next to the right coil',
      title: "Insulated wire",
      body: "A thin insulating coating keeps neighbouring turns electrically separate. Without it, touching turns could give current a shortcut instead of making it travel around the winding." },
    { id: 'core', topic: 'Building the generator', anchor: 'a-coreL', source: 'rewritten', figure: 'bench',
      trigger: 'Insert the iron cores',
      title: "Iron guides the field",
      body: "The iron core guides more of the magnet’s field through the winding. The coil will induce a field (more on this later) going one direction through the core, which will align/orient its own internal magnetic domains in the same direction, further strengthening the field. \n\n\nAt the same rotation speed, this increases the changing field linked with the turns and can raise the induced voltage." },
    { id: 'crank', topic: 'Building the generator', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Attach the crank',
      title: "You supply the energy",
      body: "Turning the crank does mechanical work. The generator is supposed to convert some of that input into electrical energy that can be used for the house. Of course there will be some losses here due to friction, creating thermal energy instead." },

    { id: 'induction', topic: 'Making voltage', anchor: 'a-coilL', source: 'rewritten',
      trigger: 'Spin the magnet',
      title: "A changing field produces voltage",
      body: "As the magnet rotates, the field passing through the coil’s loops changes. This induces a voltage between the wire’s ends. The process is called electromagnetic induction." },
    { id: 'faster', topic: 'Making voltage', anchor: 'a-meter', source: 'rewritten',
      trigger: 'Spin the rotor faster',
      title: "Faster spin, more voltage",
      body: "Rotating the magnet faster makes the field through the coil change more quickly. As a result of the faster-changing field, the induced voltage rises, assuming the same coil winding (number of turns) and magnet strength." },
    { id: 'stopped', topic: 'Making voltage', anchor: 'a-meter', source: 'rewritten',
      trigger: 'Let the rotor stop',
      title: "No field change? No output.",
      body: "The field through the coil has stopped changing, so the induced voltage settles back to 0.\n\nThe permanent magnet has not lost its strength. The spinning has stopped, so it is no longer changing the magnetic field through the coils. No change means no voltage." },
    { id: 'waveform', topic: 'Making voltage', anchor: 'a-scope', source: 'rewritten',
      trigger: 'Tap the i on the small screen',
      title: "This is AC",
      body: "In this generator, the poles swap sides every half turn, reversing the voltage’s polarity. When a load circuit is connected, the current reverses too. This is alternating current, or AC." },

    { id: 'circuit', topic: 'Circuits and loads', anchor: 'a-terminals', source: 'rewritten',
      trigger: 'Connect both lead wires',
      title: "Connect the household!",
      body: "The household lighting is our electrical load: it receives energy from the generator.\nConnect both wires, then close a room’s switch. This completes a path allowing the current to flow through the light and back to the generator." },
    { id: 'load', topic: 'Circuits and loads', anchor: 'room-0', source: 'rewritten',
      trigger: 'Light the first room',
      title: "The bulb is a load",
      body: "The bulb converts electrical energy into light and heat. Keeping the room lit requires a continuing energy supply. For now, that energy comes from your work at the crank." },

    { id: 'heavier', topic: 'Load and Lenz’s law', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Switch on a second room',
      title: "More rooms, more turning effort",
      body: "Think of increasing the resistance on an exercise bike: maintaining your speed takes more effort. Here, connecting another room increases the electrical load, so maintaining the rotor’s speed requires more work at the crank.\n\nThe extra effort is needed to supply for another room." },
    { id: 'lenz', topic: 'Load and Lenz’s law', anchor: 'a-coilR', source: 'rewritten',
      trigger: 'Keep two rooms running',
      title: "Why does the crank resist? (Lenz’s Law)",
      body: "Current in the coils produces a magnetic field of its own. By Lenz’s law, that field opposes the change in magnetic field through the coils caused by the magnet’s movement. The coils therefore apply a torque to the magnet opposite its direction of rotation.\n\nThe size of that torque increases with the current. A second room draws more current, so the opposing torque increases. Holding the same rotation speed then takes more force at the crank. The extra mechanical work is the electrical energy that ultimately powers the added room." },
    { id: 'balance', topic: 'Load and Lenz’s law', anchor: 'effort-box', source: 'rewritten',
      trigger: 'Shown after Lenz’s law',
      title: "Match supply to demand",
      body: "If you want to meet increasing energy demand, you could increase your mechanical turning effort or switch a room off. If your input cannot support the connected lighting, the rotor slows and the lights dim.\n\nYou could also seek ways to make the system more efficient. Check the parts tray for some options!" },

    { id: 'turns', topic: 'Upgrades', anchor: 'a-coilL', source: 'rewritten', figure: 'bench',
      trigger: 'Buy More turns',
      title: "More wire turns",
      body: "More turns can increase voltage at the same rotation speed. The longer wire also adds electrical resistance. Supplying more electrical output still requires more mechanical input." },
    { id: 'strongmagnet', topic: 'Upgrades', anchor: 'a-rotor', source: 'rewritten', figure: 'bench',
      trigger: 'Buy Stronger magnet',
      title: "A stronger magnet",
      body: "At the same rotation speed, a stronger magnet can produce a higher voltage. It does not supply the continuing energy for the lights; that still comes from the mechanism turning the rotor." },
    { id: 'efficiency', topic: 'Upgrades', anchor: 'power-box', source: 'rewritten', figure: 'bench',
      trigger: 'Buy Low-loss kit',
      title: "Reducing energy losses",
      body: "Some input energy heats the winding wires through electrical resistance. Some heats the moving parts through friction. Thicker wire and smoother bearings reduce these losses, leaving more energy available for the lights." },
    { id: 'wind', topic: 'Upgrades', anchor: 'a-crank', source: 'rewritten',
      trigger: 'Mount the wind turbine (after the ending)',
      title: "Wind does the work",
      body: "The turbine now uses energy from moving air to turn the rotor. Wind is now the one spinning the crank instead of you. The generator still needs mechanical input, but it’s now coming from a non-human source." },

    // Group's original copy for a feature that is not in this build (no gearbox).
    { id: 'gear', topic: 'Upgrades', anchor: 'a-crank', source: 'supplied', log: false,
      trigger: 'Select a gear ratio (not implemented)',
      title: "Trading force for speed",
      body: "This gear setting turns the rotor farther with each crank revolution. Under load, maintaining that motion requires more turning force at the crank. Gears change the speed–force trade-off; they do not create extra power." }
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
