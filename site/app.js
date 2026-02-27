import { TrigramGenerator } from "./dist/index.js";

const MAX_TRANSITION_PAIRS_DISPLAY = 200;

const EXAMPLE_SOURCES = [
  {
    label: "Wish rhyme (long)",
    text: `I wish I may, I wish I might, I wish to carry one clear light through every windy street tonight.
The clock tower leans over the square, and every bell-note drifts like thread between windows where people laugh, argue, and sing.
I fold old hopes into my coat pocket: a paper star, a train ticket, a line from a letter I never sent.
When rain arrives, it writes bright commas on the pavement, and the whole city sounds like a careful drum.
If morning comes with quiet hands, I will still be walking, naming each small wonder as if it were new:
the bakery door at dawn, the bicycle chain that clicks in rhythm, the friend who says, "You made it," and means it.
I pass the river bridge where buses hiss, where late workers sip coffee, where neon signs flicker between blue and gold.
A violin plays under the archway, a soft stubborn melody that repeats and repeats until strangers slow down to listen.
Somewhere a dog barks twice, a window opens, and somebody waters herbs in a metal box that shines like wet tin.
I remember promises made in brighter rooms: read more books, call old friends, learn one new word each day and use it.
The moon climbs above antennas and chimneys, and the rooftops look like folded paper boats sailing on a silver sea.
By midnight the streets thin out; taxis glide; a bakery starts kneading dough for tomorrow's first loaves.
I keep a list in my head of ordinary miracles: warm gloves, dry socks, shared umbrellas, seats offered without being asked.
At two in the morning the city speaks in smaller sounds: train brakes, elevator hum, a key turning in a lock.
Even then the light I asked for does not fade; it changes shape, but stays.
It lives in doorways held open, in maps redrawn, in laughter that arrives exactly when silence becomes too heavy.
When the first birds start, I am still awake, still grateful, still willing to begin again.
I wish I may, I wish I might, I wish to carry this same light into another night, and another, and another.`,
  },
  {
    label: "Adventure tone",
    text: `The lighthouse blinked over the harbor while sailors traded stories of storms, hidden maps, and a reef that moved when no one watched.
At first light, our crew loaded rope, lantern oil, hard bread, dried apples, and a brass compass scratched with initials from three generations.
We passed black cliffs where gulls spun in tight circles, then crossed a long green channel where the tide pulled sideways like a second current.
By noon the wind changed twice, the mast sang, and the navigator marked our course beside a note that read: "Trust the stars after midnight."
Near evening we found a narrow inlet behind a curtain of mist, dropped anchor in silence, and listened to water tap the hull like knuckles on a door.
No treasure glittered on the beach, only old footprints, a broken crate, and a fire ring still warm enough to prove we were not the first to arrive.
Before dawn, we climbed a ridge and saw a valley cut by streams that flashed like drawn blades in the rising sun.
The cartographer unfolded a brittle chart and matched mountain teeth to inked triangles, then circled a basin marked with a faded X.
By afternoon we crossed fern fields, stepped over driftwood carried inland by some forgotten flood, and found carved stones half buried in moss.
Each stone showed the same symbol: a spiral around a star, ringed by dots like tiny islands.
Our quartermaster counted supplies and frowned; we had nine days of food if nothing spoiled, seven if rain trapped us.
Still we pushed on, following cairns from one ridge to the next, while thunder rolled far out at sea.
On the sixth night we reached a cave mouth hidden behind a waterfall, lit lanterns, and watched shadows leap on walls black with age.
Inside, we found journals sealed in wax, crates of tools, a rusted sextant, and a chest of letters never delivered.
The letters spoke of an expedition that chose knowledge over gold, choosing to map currents, winds, and safe harbors for those who came later.
Their final entry ended mid-sentence, but next to it lay a complete atlas wrapped in oilcloth and twine.
We left the coins we found untouched, copied the maps, repaired the old marker posts, and wrote our own notes in the same careful hand.
When we sailed home, the harbor bells sounded the same as before, but nothing felt the same:
we had gone looking for treasure, and returned with routes, warnings, and stories worth more than metal.`,
  },
  {
    label: "Multilingual sample",
    text: `Bonjour le monde! Hei maailma! Hola mundo! Ciao mondo! Salaam, dunia!
Guten Morgen, Welt! Ola mundo! Namaste, duniya! Merhaba, dunya! Sawubona, mhlaba!
In one cafe a violin warms up; in another street a bus sighs at the stop and someone calls out, "Wait for me!"
A child says hello in three languages before breakfast, then counts clouds drifting above rooftops painted red, white, and pale blue.
At the market, signs switch from one script to another, numbers stay familiar, and every stall has its own rhythm: chop, pour, wrap, smile.
One vendor stacks oranges in perfect pyramids, another grinds coffee beans, another mends jackets while telling jokes everyone understands.
Down the block, a barber listens to radio news from two countries at once and nods at every familiar place name.
Schoolchildren practice poems with accents from many homes, rolling the same vowels into different music.
On the train platform, announcements repeat in several languages; people move before the final sentence ends.
A grandmother teaches a recipe without measurements, saying "until it smells right," and three cousins take notes in three alphabets.
The city library hosts story hour where each page is read twice, then acted out with paper crowns and cardboard moons.
At the stadium, fans shout in mixed phrases that no grammar book planned, but everyone knows exactly what each chant means.
In evening kitchens, steam fogs the windows while songs from distant places overlap with laughter from the next apartment.
Night arrives at different hours but with the same soft logic: lights in windows, footsteps in hallways, and conversations that keep going after the tea is gone.
Different words, same human pulse; different songs, same chorus; different names for home, same door opening when a loved one finally returns.
When rain starts, umbrellas bloom in every color and strangers share space under awnings while comparing weather words.
When sun returns, laundry lines brighten balconies and children invent new games using old words from old countries.
By midnight, the city hums softly in many tongues, and every language leaves a small light on for the next traveler.`,
  },
];

const sourcesEl = document.querySelector("#sources");
const exampleSourceEl = document.querySelector("#exampleSource");
const sourceCountEl = document.querySelector("#sourceCount");
const seedEl = document.querySelector("#seed");
const maxTokensEl = document.querySelector("#maxTokens");
const statusEl = document.querySelector("#status");
const outputEl = document.querySelector("#output");
const transitionsPanelEl = document.querySelector("#transitionsPanel");
const transitionSummaryEl = document.querySelector("#transitionSummary");
const transitionPairsEl = document.querySelector("#transitionPairs");
const sources = [];

function setStatus(text) {
  statusEl.textContent = text;
}

function updateSourceCount() {
  sourceCountEl.textContent = `Sources added: ${sources.length}`;
}

function addResolvedSource(text) {
  sources.push(text);
  updateSourceCount();
  refreshTransitionPairs();
  setStatus(`Added source ${sources.length}.`);
}

function addSource() {
  const text = sourcesEl.value.trim();
  if (text.length === 0) {
    setStatus("Paste source text before adding.");
    return;
  }

  addResolvedSource(text);
  sourcesEl.value = "";
}

function addExampleSource() {
  const index = Number(exampleSourceEl.value);
  const selectedExample = EXAMPLE_SOURCES[index];
  if (selectedExample === undefined) {
    setStatus("Choose an example source before adding.");
    return;
  }

  addResolvedSource(selectedExample.text);
}

function parseSeed() {
  const raw = seedEl.value.trim();
  if (raw.length === 0) {
    return undefined;
  }

  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new Error("Seed must be an integer.");
  }

  return value;
}

function parseMaxTokens() {
  const value = Number(maxTokensEl.value);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Max tokens must be a positive integer.");
  }

  return value;
}

function formatToken(token) {
  return JSON.stringify(token);
}

function formatNextTokenCounts(nextTokens) {
  const counts = new Map();

  for (const token of nextTokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([token, count]) => `${formatToken(token)} (${count})`)
    .join(", ");
}

function clearTransitionPairs() {
  transitionSummaryEl.textContent = "";
  transitionPairsEl.textContent = "";
  transitionsPanelEl.open = false;
}

function renderTransitionPairs(transitions) {
  if (transitions.length === 0) {
    transitionSummaryEl.textContent = "No transition pairs available.";
    transitionPairsEl.textContent = "";
    transitionsPanelEl.open = true;
    return;
  }

  const displayTransitions = transitions.slice(0, MAX_TRANSITION_PAIRS_DISPLAY);
  transitionPairsEl.textContent = displayTransitions
    .map(({ pair, nextTokens }, index) => {
      const pairLabel = `[${formatToken(pair[0])}, ${formatToken(pair[1])}]`;
      const nextTokenCounts = formatNextTokenCounts(nextTokens);
      return `${index + 1}. ${pairLabel} -> ${nextTokenCounts}`;
    })
    .join("\n");

  if (displayTransitions.length < transitions.length) {
    transitionSummaryEl.textContent =
      `Showing ${displayTransitions.length} of ${transitions.length} transition pairs.`;
  } else {
    transitionSummaryEl.textContent = `Showing all ${transitions.length} transition pairs.`;
  }

  transitionsPanelEl.open = true;
}

function refreshTransitionPairs() {
  if (sources.length === 0) {
    clearTransitionPairs();
    return;
  }

  const generator = new TrigramGenerator();
  for (const source of sources) {
    generator.addSource(source);
  }

  renderTransitionPairs(generator.getTransitionList());
}

function generate() {
  outputEl.textContent = "";

  try {
    if (sources.length === 0) {
      throw new Error("Add at least one non-empty source.");
    }

    const seed = parseSeed();
    const maxTokens = parseMaxTokens();
    const generator = new TrigramGenerator(seed === undefined ? {} : { seed });

    for (const source of sources) {
      generator.addSource(source);
    }

    const transitions = generator.getTransitionList();
    const pairCount = transitions.length;
    renderTransitionPairs(transitions);
    generator.finalize();

    const text = generator.generate({ maxTokens });
    outputEl.textContent = text || "(No output. Try longer sources.)";
    setStatus(`Generated with ${sources.length} source(s), ${pairCount} transition pair(s).`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Unexpected error");
  }
}

function clearOutput() {
  outputEl.textContent = "";
  setStatus("");
}

function clearSources() {
  sources.length = 0;
  sourcesEl.value = "";
  outputEl.textContent = "";
  updateSourceCount();
  clearTransitionPairs();
  setStatus("Cleared all sources and reset model.");
}

function initExampleSourceOptions() {
  for (const [index, example] of EXAMPLE_SOURCES.entries()) {
    const option = document.createElement("option");
    option.value = index.toString();
    option.textContent = example.label;
    exampleSourceEl.append(option);
  }
}

initExampleSourceOptions();
clearTransitionPairs();
document.querySelector("#addSource")?.addEventListener("click", addSource);
document.querySelector("#addExample")?.addEventListener("click", addExampleSource);
document.querySelector("#clearSources")?.addEventListener("click", clearSources);
document.querySelector("#generate")?.addEventListener("click", generate);
document.querySelector("#clear")?.addEventListener("click", clearOutput);
