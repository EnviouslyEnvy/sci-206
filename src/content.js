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
     source    'supplied' = group's bubble copy, used as written
               'edited'   = supplied copy with a small change (see `note`)
     log       false hides it from the explanation log (unused content)
   "Seen" state is tracked at runtime in game state (g.seen), not here.
   ========================================================================== */
window.CONTENT = {

  title: 'Lights Back On',
  subtitle: 'A blackout, a box of parts, and one generator',
  // Shown in the credits line of the ending card. Add group member names here.
  team: '',

  intro: [
    '9:42 pm. The storm takes out the whole street.',
    'No grid, no lights — but the garage has a magnet, copper wire, iron, and a crank.',
    'The power is out. We have the parts. Let’s get the lights back on.'
  ],

  crewDialogue: false, // Re-enable the team dialogue and its box by setting this to true.
  crewNames: ['Imani', 'Tobias', 'Wren'],

  bubbles: [
    { id: 'magnet', topic: 'Building the generator', anchor: 'a-rotor', source: 'supplied',
      trigger: 'Select the permanent magnet from the parts tray',
      title: 'No batteries required',
      body: 'A fridge magnet can hold your shopping list all week without a battery. This magnet keeps its magnetic field too—but that alone won’t power our lights.' },
    { id: 'poles', topic: 'Building the generator', anchor: 'a-rotor', source: 'supplied',
      trigger: 'Inspect the N/S labels (tap the ⓘ by the magnet)',
      title: 'Two ends, two poles',
      body: 'These labels mark the magnet’s north and south poles. We’ll mount it so those poles sweep past the coils as it turns.' },
    { id: 'winding', topic: 'Building the generator', anchor: 'a-coilL', position: 'top', source: 'supplied',
      trigger: 'Select the wire before placing and winding it on the coils',
      title: 'Every wrap counts',
      body: 'Wind the wire as you’d wind thread around a spool. Each wrap is a turn. Many turns together make a coil; this cylindrical winding is called a solenoid.' },
    { id: 'coating', topic: 'Building the generator', anchor: 'a-coilR', source: 'supplied', figure: 'coating',
      trigger: 'Inspect the wire coating (tap the ⓘ by the right coil)',
      title: 'Close together, electrically separate',
      body: 'The wire has a thin insulating coating. It lets us pack the turns tightly while keeping current from taking shortcuts between neighboring turns.' },
    { id: 'core', topic: 'Building the generator', anchor: 'a-coreL', source: 'supplied', figure: 'bench',
      trigger: 'Select the soft iron cores from the parts tray',
      title: 'More than a support',
      body: 'This iron isn’t just holding the wire in place. It guides more of the magnet’s field through the winding, helping the coil produce voltage when that field changes.' },
    { id: 'crank', topic: 'Building the generator', anchor: 'a-crank', source: 'supplied',
      trigger: 'Select the crank from the parts tray',
      title: 'You’re the power station',
      body: 'For now, your hand supplies the energy. Turning the crank does mechanical work, which the generator can convert into electrical energy.' },

    { id: 'induction', topic: 'Making voltage', anchor: 'a-coilL', source: 'supplied',
      trigger: 'Spin the magnet until the meter responds',
      title: 'Something is changing',
      body: 'The turning magnet changes the magnetic field passing through the coil’s loops. That produces a voltage between the wire’s ends. This process is electromagnetic induction.' },
    { id: 'faster', topic: 'Making voltage', anchor: 'a-meter', source: 'edited',
      trigger: 'Crank harder so the rotor speeds up',
      note: "Revised at user request; winding count is described as number of turns.",
      title: "Faster spin makes greater voltage generation?",
      body: "Rotating the magnet faster makes the field through the coil change more quickly. As a result of the faster-changing field, the induced voltage rises, assuming the same coil winding (number of turns) and magnet strength." },
    { id: 'stopped', topic: 'Making voltage', anchor: 'a-meter', source: 'edited',
      trigger: 'Let the rotor coast to a stop',
      note: "Revised at user request to emphasize that stopped rotation removes the changing field.",
      title: "No field change? No output.",
      body: "The field through the coil has stopped changing, so the induced voltage settles back to 0.\n\nThe permanent magnet has not lost its strength. The spinning has stopped, so it is no longer changing the magnetic field through the coils. Even a stronger magnet would not generate voltage here if that field was not changing." },
    { id: 'waveform', topic: 'Making voltage', anchor: 'a-scope', source: 'supplied',
      trigger: 'Inspect the voltage trace (tap the ⓘ on the small screen)',
      title: 'Taking turns in each direction',
      body: 'As the north and south poles trade places, the voltage reverses polarity. With the circuit connected, current reverses too. That’s alternating current, or AC.' },

    { id: 'circuit', topic: 'Circuits and loads', anchor: 'a-terminals', source: 'edited',
      trigger: 'Select a wire before connecting the circuit',
      note: "Revised at user request to introduce the household as the load and separate wiring from switching on a room.",
      title: "Connect the household!",
      body: "The household is our electrical load: its lights use the electrical energy supplied by the generator.\n\nConnect the household to both generator terminals using the two wires. Then close a room's switch to complete its circuit, allowing current to flow through the light and back to the generator." },
    { id: 'load', topic: 'Circuits and loads', anchor: 'room-0', source: 'supplied',
      trigger: 'Light the first room',
      title: 'Somewhere for the energy to go',
      body: 'The bulb is our first electrical load. It turns electrical energy into light and heat. Keeping the room lit means continually delivering more energy.' },

    { id: 'heavier', topic: 'Load and Lenz’s law', anchor: 'a-crank', source: 'supplied',
      trigger: 'Connect a second room and keep cranking',
      title: 'The crank feels heavier',
      body: 'Think of turning up the resistance on an exercise bike. Keeping the same speed now takes more effort. Here, the extra effort is needed to supply another room.' },
    { id: 'lenz', topic: 'Load and Lenz’s law', anchor: 'a-coilR', source: 'edited',
      trigger: 'The opposing-rotation arrow appears while two rooms draw current',
      note: 'Revised to state that load current produces an opposing torque that grows with the current, so a second room requires more crank force at the same speed.',
      title: 'Where does that extra drag come from?',
      body: 'Current in the coils produces a magnetic field of its own. By Lenz’s law, that field opposes the change in magnetic field through the coils caused by the spinning magnet. The coils therefore apply a torque to the magnet opposite its direction of rotation.\n\nThe size of that torque increases with the current. A second room draws more current, so the opposing torque increases. Holding the same rotation speed then takes more force at the crank. The extra mechanical work is the electrical energy that ultimately powers the added room.' },
    { id: 'balance', topic: 'Load and Lenz’s law', anchor: 'effort-box', source: 'supplied',
      trigger: 'Offered once the drag has been explained',
      title: 'Balance the demand',
      body: 'Keep both rooms connected and supply more turning effort, or switch one off. If demand exceeds what your input can support, the rotor slows and the lights dim.' },

    { id: 'turns', topic: 'Upgrades', anchor: 'a-coilL', source: 'supplied', figure: 'bench',
      trigger: 'Buy the extra wire turns',
      title: 'Upgrade the winding',
      body: 'Compare it at the same speed: more turns can produce a higher voltage. The extra wire isn’t an energy source, though. More electrical output still needs more mechanical input.' },
    { id: 'strongmagnet', topic: 'Upgrades', anchor: 'a-rotor', source: 'supplied', figure: 'bench',
      trigger: 'Buy the stronger magnet',
      title: 'A stronger magnetic change',
      body: 'At the same rotation speed, a stronger magnet can produce a higher voltage. It changes how the generator performs; it doesn’t replace the work needed to drive it.' },
    { id: 'efficiency', topic: 'Upgrades', anchor: 'power-box', source: 'supplied', figure: 'bench',
      trigger: 'Buy the low-loss kit',
      title: 'Why doesn’t everything reach the lights?',
      body: 'Some of your input warms the wires through electrical resistance. Friction also warms moving parts. Better components can reduce those losses, leaving more energy available for the rooms.' },
    { id: 'wind', topic: 'Upgrades', anchor: 'a-crank', source: 'supplied',
      trigger: 'Mount the wind turbine (after the ending)',
      title: 'Someone else does the turning',
      body: 'You can rest your arm now. Moving water—or wind—supplies the mechanical work. The generator still needs energy; it’s just getting it from somewhere else.' },

    // Supplied copy for a feature that is not in this build (no gearbox). Kept for future use.
    { id: 'gear', topic: 'Upgrades', anchor: 'a-crank', source: 'supplied', log: false,
      trigger: 'Select a gear ratio (not implemented)',
      title: 'Fewer crank turns—with a catch',
      body: 'This gear setting spins the rotor farther with each crank revolution. Under load, the crank also becomes harder to turn. You’re trading turning force for speed.' }
  ],

  // Current objective and left-side objective history, by stage.
  objectives: {
    assemble: 'Build the generator: move each part from the tray onto the workbench.',
    winding:  'Wind the wire onto the coil forms.',
    spin:     'Turn the crank and watch the voltmeter. Nothing is connected to the house yet.',
    faster:   'Crank harder. What happens to the voltage?',
    stop:     'Now let go and let the rotor coast to a stop.',
    wire:     'Run both wires from the generator’s terminals to the house.',
    light:    'Close the living-room switch, then crank to light it.',
    second:   'The kitchen is next. Flip its switch while you keep cranking.',
    balance:  'Get the living room and kitchen both steadily lit.',
    final:    'Last one: light all three rooms, and hold them steady.',
    done:     'Lights restored. The bench is yours — keep experimenting.'
  },

  // Short team reactions. Not physics explanations; those are the bubbles above.
  crew: {
    start:        ['Imani', 'Parts are on the tray. Drag one over, or tap it and then tap where it goes.'],
    magnetIn:     ['Wren', 'Magnet’s on the shaft. It can swing its ends right past the coil forms.'],
    wireStart:    ['Imani', 'Hold the Wind button. I’ll wind the other coil in step with you.'],
    wound:        ['Imani', 'Two coils, joined so their voltages add instead of cancelling.'],
    coreIn:       ['Tobias', 'Iron’s in. It stays put with the coils — only the magnet turns.'],
    crankIn:      ['Tobias', 'Belt’s on. One turn of the handle spins the magnet several times.'],
    built:        ['Wren', 'That’s a generator. Give the crank a few pushes.'],
    firstVolts:   ['Wren', 'The needle moved! And the house isn’t even hooked up.'],
    coast:        ['Tobias', 'Hands off. Watch the needle on the way down.'],
    oneWire:      ['Imani', 'One wire is only half a path. Run the second one.'],
    wired:        ['Imani', 'Both leads are on. The living-room switch is live.'],
    openSpin:     ['Wren', 'Volts on the meter, but the switch is open. Nothing can flow yet.'],
    firstLight:   ['Wren', 'Living room’s lit!'],
    predictRight: ['Tobias', 'Called it. More to supply, more to push.'],
    predictWrong: ['Tobias', 'Not this time — it took more push, not less. Now you’ve felt why.'],
    shed:         ['Imani', 'Switched one off and the crank eased up straight away. Demand works both ways.'],
    twoSteady:    ['Wren', 'Two rooms, steady. Supplies are in — spend them on the machine.'],
    thirdOpen:    ['Tobias', 'The bedroom’s wired in. Whenever you’re ready.'],
    challenge:    ['Tobias', 'Another room needs lighting, but the rotor is slowing. What can you change?'],
    close:        ['Imani', 'So close. A lot of your work is still leaving as heat — any supplies left?'],
    overbright:   ['Wren', 'Easy! That’s more than the lamp needs. You can back off.'],
    upgraded:     ['Imani', 'Fitted. Same crank, different machine — try it.'],
    noSupplies:   ['Imani', 'Not enough supplies for that yet. Discoveries earn more.'],
    windOn:       ['Wren', 'Turbine’s catching the storm. Watch the lights follow the gusts.'],
    windOff:      ['Wren', 'Back to arm power.'],
    done:         ['Wren', 'Every room lit. Nice work, power station.']
  },

  // Friendly corrections for a part dropped in the wrong place.
  misplace: {
    magnet: 'The magnet goes on the rotor shaft, in the gap between the two coil forms. It has to be free to turn.',
    wire:   'The copper wire wraps around the two coil forms on either side of the rotor.',
    core:   'The iron cores slide inside the coil forms. They stay still with the coils.',
    crank:  'The crank mounts on the drive wheel below the rotor, where the belt runs.',
    lead:   'Place one wire on each highlighted generator terminal. Both wires are needed to connect the household.',
    taken:  'That spot already has its part.'
  },

  parts: {
    magnet: { name: 'Bar magnet',   hint: 'permanent, N and S poles' },
    wire:   { name: 'Copper wire',  hint: 'insulated, one long spool' },
    core:   { name: 'Iron cores',   hint: 'soft iron, a pair' },
    crank:  { name: 'Crank & belt', hint: 'your mechanical input' },
    lead:   { name: 'Wire',    hint: 'generator to house' }
  },

  rooms: ['Living room', 'Kitchen', 'Bedroom'],

  prediction: {
    title: 'Before you flip it — a prediction',
    question: 'The living room is lit. If the kitchen is connected too and you want to keep the rotor at the same speed, the crank will need…',
    options: [
      { id: 'less', label: 'Less effort — the current is shared' },
      { id: 'same', label: 'About the same effort' },
      { id: 'more', label: 'More effort' }
    ],
    after: 'Now flip the switch and feel what happens.'
  },

  upgrades: {
    turns:  { name: 'More wire turns', cost: 3,
              blurb: 'Higher voltage at the same speed. More wire also means more resistance to heat up.' },
    magnet: { name: 'Stronger magnet', cost: 3,
              blurb: 'A stronger field sweeping past the coils. Higher voltage at the same speed.' },
    loss:   { name: 'Low-loss kit', cost: 3,
              blurb: 'Thicker wire and smoother bearings. Less of your work leaves as heat.' },
    wind:   { name: 'Wind turbine', cost: 0,
              blurb: 'Let the storm do the turning. Unlocked after the lights are restored.' }
  },

  status: {
    unbuilt:  'Generator not assembled',
    stopped:  'Rotor stopped — no changing field, no voltage',
    open:     'Circuit open — voltage, but no current',
    noRooms:  'All switches open — spinning freely',
    more:     'More input needed — lights are dim',
    stable:   'Lighting stable',
    bright:   'Brighter than the lamps need',
    paused:   'Paused while you read'
  },

  ending: {
    title: 'Lights back on.',
    lead: 'Three rooms, one generator, and every watt of it came through the crank.',
    recap: {
      built:   'You built a generator from a magnet, two coils, iron cores and a crank.',
      open:    'With nothing connected you still read {v} volts — spinning made voltage, but no current flowed until the circuit was complete.',
      stopped: 'When the rotor stopped, the voltage vanished even though the magnet was as strong as ever. The change is what matters.',
      load:    'Each room you switched on made the rotor harder to turn. That drag is the coils’ own magnetism pushing back — Lenz’s law — and it is how your work gets into the wires.',
      predictRight: 'You predicted that a second room would take more effort, then proved it.',
      predictWrong: 'You guessed a second room would not take more effort — and the crank showed you otherwise.',
      upgrades: 'Your upgrades ({list}) changed how well the machine used your effort. None of them made energy.',
      budget:  'At the end you were putting in about {pin} W; {pload} W reached the lamps and the rest left as heat.'
    },
    credits: 'All artwork and sound in this game are drawn and synthesised in code for this project. No external images, music or sound files are used.'
  }
};
