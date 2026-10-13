// --- Navigation Page Switching (Main Nav) ---
const navButtons = document.querySelectorAll('.nav-btn');
const navPages = document.querySelectorAll('.nav-page');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        navPages.forEach(p => p.classList.add('hidden'));

        btn.classList.add('active');
        const targetPage = document.getElementById(btn.dataset.nav);
        if (targetPage) targetPage.classList.remove('hidden');
    });
});

// --- Profile Sub-Tab Switching ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        button.classList.add('active');
        const targetPane = document.getElementById(button.dataset.target);
        if (targetPane) targetPane.classList.add('active');
    });
});

// --- Verified Pokémon GO Moves & Stats Master Dictionary ---
const pogoDatabase = {
    "mewtwo": {
        id: 150,
        name: "MEWTWO",
        types: ["psychic"],
        weaknesses: ["bug", "ghost", "dark"],
        resistances: ["fighting", "psychic"],
        baseStats: { atk: 300, def: 182, sta: 214 },
        pokedexEntry: "Created by a scientist after years of horrific gene-splicing and DNA-engineering experiments.",
        evolutionFamily: [
            { name: "Mewtwo", id: 150 }
        ],
        fastMoves: [
            { name: "Psycho Cut", dpt: "1.5", ept: "4.5" },
            { name: "Confusion", dpt: "4.0", ept: "3.0" }
        ],
        chargedMoves: [
            { name: "Psystrike (Legacy)", power: 90, energy: -45 },
            { name: "Shadow Ball (Legacy)", power: 100, energy: -55 },
            { name: "Ice Beam", power: 90, energy: -55 },
            { name: "Thunderbolt", power: 90, energy: -55 },
            { name: "Focus Blast", power: 140, energy: -75 }
        ],
        take: "Master League menace! Unmatched Attack stat pressure with Psystrike and incredible coverage options."
    },
    "azumarill": {
        id: 184,
        name: "AZUMARILL",
        types: ["water", "fairy"],
        weaknesses: ["electric", "grass", "poison"],
        resistances: ["water", "ice", "fire", "fighting", "dark", "bug", "dragon"],
        baseStats: { atk: 112, def: 152, sta: 225 },
        pokedexEntry: "Azumarill's long ears are indispensable sensors. By focusing its hearing, this Pokémon can identify prey even in rough rivers.",
        evolutionFamily: [
            { name: "Azurill", id: 298 },
            { name: "Marill", id: 183 },
            { name: "Azumarill", id: 184 }
        ],
        fastMoves: [
            { name: "Bubble", dpt: "2.67", ept: "3.67" },
            { name: "Rock Smash", dpt: "3.0", ept: "2.0" }
        ],
        chargedMoves: [
            { name: "Ice Beam", power: 90, energy: -55 },
            { name: "Play Rough", power: 90, energy: -60 },
            { name: "Hydro Pump", power: 130, energy: -75 }
        ],
        take: "A staple of Great League PvP. High bulk, great typing (Water/Fairy), and excellent coverage options."
    },
    "marill": {
        id: 183,
        name: "MARILL",
        types: ["water", "fairy"],
        weaknesses: ["electric", "grass", "poison"],
        resistances: ["water", "ice", "fire", "fighting", "dark", "bug", "dragon"],
        baseStats: { atk: 37, def: 93, sta: 172 },
        pokedexEntry: "The tip of its tail, which contains oil that is lighter than water, lets it swim without drowning.",
        evolutionFamily: [
            { name: "Azurill", id: 298 },
            { name: "Marill", id: 183 },
            { name: "Azumarill", id: 184 }
        ],
        fastMoves: [
            { name: "Bubble", dpt: "2.67", ept: "3.67" },
            { name: "Tackle", dpt: "3.0", ept: "3.0" }
        ],
        chargedMoves: [
            { name: "Aqua Tail", power: 50, energy: -35 },
            { name: "Body Slam", power: 60, energy: -35 },
            { name: "Bubble Beam", power: 25, energy: -40 }
        ],
        take: "Eligible in Little Cup formats! High bulk for a middle evolution stage."
    },
    "pikachu": {
        id: 25,
        name: "PIKACHU",
        types: ["electric"],
        weaknesses: ["ground"],
        resistances: ["electric", "flying", "steel"],
        baseStats: { atk: 112, def: 96, sta: 111 },
        pokedexEntry: "Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.",
        evolutionFamily: [
            { name: "Pichu", id: 172 },
            { name: "Pikachu", id: 25 },
            { name: "Raichu", id: 26 }
        ],
        fastMoves: [
            { name: "Thunder Shock", dpt: "1.5", ept: "4.5" },
            { name: "Quick Attack", dpt: "2.5", ept: "3.5" },
            { name: "Present (Legacy)", dpt: "1.5", ept: "4.0" }
        ],
        chargedMoves: [
            { name: "Discharge", power: 65, energy: -45 },
            { name: "Thunderbolt", power: 80, energy: -55 },
            { name: "Wild Charge", power: 100, energy: -45 },
            { name: "Surf (Elite TM)", power: 65, energy: -40 }
        ],
        take: "Iconic mascot! While standard Pikachu maxes out below 1500 CP, it can still battle in Great League with clever shield play."
    },
    "bastiodon": {
        id: 411,
        name: "BASTIODON",
        types: ["rock", "steel"],
        weaknesses: ["fighting", "ground", "water"],
        resistances: ["normal", "flying", "rock", "bug", "psychic", "ice", "dragon", "fairy", "poison"],
        baseStats: { atk: 94, def: 286, sta: 155 },
        pokedexEntry: "It lined up in a shield wall with its allies to protect its young from ancient predators.",
        evolutionFamily: [
            { name: "Shieldon", id: 410 },
            { name: "Bastiodon", id: 411 }
        ],
        fastMoves: [
            { name: "Smack Down", dpt: "4.0", ept: "2.67" },
            { name: "Iron Head", dpt: "3.0", ept: "3.0" }
        ],
        chargedMoves: [
            { name: "Stone Edge", power: 100, energy: -55 },
            { name: "Flamethrower", power: 90, energy: -55 }
        ],
        take: "Absolute wall in Great League! Extremely high defense and bulk product, but watch out for double-weakness to Fighting and Ground moves."
    }
};

// --- Type Effectiveness Chart ---
const typeChart = {
    normal: { weak: ['fighting'], resist: ['ghost'] },
    fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'] },
    water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'] },
    grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'] },
    electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'] },
    ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'] },
    fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'] },
    poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'] },
    ground: { weak: ['water', 'grass', 'ice'], resist: ['electric', 'poison', 'rock'] },
    flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug', 'ground'] },
    psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'] },
    bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'] },
    rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'] },
    ghost: { weak: ['ghost', 'dark'], resist: ['normal', 'fighting', 'poison', 'bug'] },
    dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'grass', 'electric'] },
    steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy', 'poison'] },
    fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark', 'dragon'] },
    dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark', 'psychic'] }
};

// --- Autocomplete Setup ---
const searchInput = document.getElementById('pokemon-search');
const autocompleteList = document.getElementById('autocomplete-list');

searchInput.addEventListener('input', async function() {
    const val = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    
    if (!val || val.length < 2) {
        autocompleteList.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        const data = await res.json();
        const matches = data.results.filter(p => p.name.includes(val)).slice(0, 8);

        if (matches.length > 0) {
            autocompleteList.classList.remove('hidden');
            matches.forEach(match => {
                const item = document.createElement('div');
                item.textContent = match.name.toUpperCase();
                item.addEventListener('click', () => {
                    searchInput.value = match.name;
                    autocompleteList.classList.add('hidden');
                    performSearch();
                });
                autocompleteList.appendChild(item);
            });
        } else {
            autocompleteList.classList.add('hidden');
        }
    } catch (e) {
        autocompleteList.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.classList.add('hidden');
});

// --- Core Search Engine ---
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('pokemon-profile');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    let query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Priority 1: Check verified pogoDatabase first
    if (pogoDatabase[query]) {
        renderPokemonProfile(pogoDatabase[query]);
        return;
    }

    // Priority 2: Dynamic API Fetcher with Fallback
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            alert('Pokémon not found! Please check spelling.');
            return;
        }
        const data = await response.json();

        // Fetch Species & Evolution Data
        const speciesRes = await fetch(data.species.url);
        const speciesData = await speciesRes.json();

        let flavorText = "A wild Pokémon species found in the world.";
        if (speciesData.flavor_text_entries) {
            const entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
            if (entry) flavorText = entry.flavor_text.replace(/[\r\n\x0c]/g, ' ');
        }

        let evoFamily = [];
        if (speciesData.evolution_chain) {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            evoFamily = parseEvolutionChain(evoData.chain);
        }

        const types = data.types.map(t => t.type.name);
        const typeEffectiveness = calculateTypeEffectiveness(types);

        const hp = data.stats[0].base_stat;
        const atk = data.stats[1].base_stat;
        const def = data.stats[2].base_stat;
        const goStats = convertToGoStats(atk, def, hp);

        renderPokemonProfile({
            id: data.id,
            name: data.name.toUpperCase(),
            types: types,
            weaknesses: typeEffectiveness.weaknesses,
            resistances: typeEffectiveness.resistances,
            baseStats: goStats,
            pokedexEntry: flavorText,
            evolutionFamily: evoFamily,
            fastMoves: [
                { name: "Fast Move 1", dpt: "3.0", ept: "3.0" },
                { name: "Fast Move 2", dpt: "2.5", ept: "3.5" }
            ],
            chargedMoves: [
                { name: "Charged Move 1", power: 70, energy: -45 },
                { name: "Charged Move 2", power: 90, energy: -55 }
            ],
            take: "PokéUhmon's Take: Coming Soon!"
        });

    } catch (err) {
        console.error(err);
        alert('Error loading Pokémon data.');
    }
}

function convertToGoStats(atk, def, hp) {
    const goAtk = Math.round(2 * (0.875 * Math.max(atk, def) + 0.125 * Math.min(atk, def)));
    const goDef = Math.round(2 * (0.625 * Math.max(def, atk) + 0.375 * Math.min(def, atk)));
    const goSta = Math.round(hp * 1.75 + 50);
    return { atk: goAtk, def: goDef, sta: goSta };
}

function parseEvolutionChain(chain) {
    const family = [];
    let current = chain;

    while (current) {
        const pokeId = current.species.url.split('/').filter(Boolean).pop();
        family.push({
            name: current.species.name.toUpperCase(),
            id: pokeId
        });
        current = current.evolves_to[0];
    }
    return family;
}

function calculateTypeEffectiveness(types) {
    const mults = {};
    Object.keys(typeChart).forEach(t => mults[t] = 1.0);

    types.forEach(t => {
        if (typeChart[t]) {
            typeChart[t].weak.forEach(w => mults[w] *= 1.6);
            typeChart[t].resist.forEach(r => mults[r] *= 0.625);
        }
    });

    const weaknesses = [];
    const resistances = [];

    Object.keys(mults).forEach(t => {
        if (mults[t] > 1.2) weaknesses.push(t);
        if (mults[t] < 0.8) resistances.push(t);
    });

    return { weaknesses, resistances };
}

function renderPokemonProfile(pokemon) {
    // 1. Titles & Sprites
    document.getElementById('poke-name').textContent = pokemon.name;
    document.getElementById('poke-id').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
    
    document.getElementById('poke-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    document.getElementById('poke-sprite-shiny').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;

    // 2. Types, Weaknesses & Resistances Badges
    const renderBadges = (containerId, items) => {
        const el = document.getElementById(containerId);
        el.innerHTML = '';
        items.forEach(item => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${item}`;
            badge.textContent = item.toUpperCase();
            el.appendChild(badge);
        });
    };

    renderBadges('poke-types', pokemon.types);
    renderBadges('poke-weaknesses', pokemon.weaknesses);
    renderBadges('poke-resistances', pokemon.resistances);

    // 3. Base Stats & Pokédex Flavor Text Entry
    document.getElementById('stat-sta').textContent = pokemon.baseStats.sta;
    document.getElementById('stat-atk').textContent = pokemon.baseStats.atk;
    document.getElementById('stat-def').textContent = pokemon.baseStats.def;
    document.getElementById('pokedex-flavor-text').textContent = pokemon.pokedexEntry;

    // 4. Evolution Family Links
    const evoContainer = document.getElementById('evolution-chain');
    evoContainer.innerHTML = '';
    if (pokemon.evolutionFamily && pokemon.evolutionFamily.length > 0) {
        pokemon.evolutionFamily.forEach((evo, idx) => {
            const card = document.createElement('div');
            card.className = 'evo-card';
            card.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png" alt="${evo.name}">
                <div style="font-weight: bold; font-size: 0.85rem; margin-top: 0.25rem;">${evo.name}</div>
            `;
            card.addEventListener('click', () => {
                searchInput.value = evo.name;
                performSearch();
            });
            evoContainer.appendChild(card);

            if (idx < pokemon.evolutionFamily.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'evo-arrow';
                arrow.textContent = '➔';
                evoContainer.appendChild(arrow);
            }
        });
    }

    // 5. Bulk Product & Tankiness Scale
    const bulkProduct = pokemon.baseStats.def * pokemon.baseStats.sta;
    let tankPct = ((bulkProduct - 8000) / 36000) * 100;
    tankPct = Math.max(5, Math.min(99.9, tankPct)).toFixed(1);

    document.getElementById('tank-bar').style.width = `${tankPct}%`;
    document.getElementById('tank-percent-label').textContent = `${tankPct}%`;

    // 6. Moves Display
    const fastList = document.getElementById('fast-moves-list');
    const chargedList = document.getElementById('charged-moves-list');
    fastList.innerHTML = '';
    chargedList.innerHTML = '';

    pokemon.fastMoves.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.name.toUpperCase()}</strong> — DPT: ${m.dpt} | EPT: ${m.ept}`;
        fastList.appendChild(li);
    });

    pokemon.chargedMoves.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.name.toUpperCase()}</strong> — Power: ${m.power} | Energy: ${m.energy}`;
        chargedList.appendChild(li);
    });

    // 7. PokéUhmon's Take
    document.getElementById('poke-take-text').textContent = pokemon.take;

    // 8. League Eligibility Check
    const estMaxCP = Math.floor((pokemon.baseStats.atk + 15) * Math.sqrt(pokemon.baseStats.def + 15) * Math.sqrt(pokemon.baseStats.sta + 15) * 0.008);
    
    updateLeagueStatus('gl-status', estMaxCP, 1500, "Great League", true);
    updateLeagueStatus('ul-status', estMaxCP, 2500, "Ultra League", false);
    updateLeagueStatus('ml-status', estMaxCP, 3500, "Master League Cap", false);

    // Reveal Profile
    profileContainer.classList.remove('hidden');
}

function updateLeagueStatus(elementId, maxCP, cap, leagueName, allowLowCPNote) {
    const el = document.getElementById(elementId);

    if (maxCP < cap) {
        if (allowLowCPNote) {
            el.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for ${leagueName}.</span><br><span style="color: #b45309; font-size: 0.85rem;">⭐ Note: Max CP (~${maxCP}) stays below ${cap} CP, but it can still compete in this league (no minimum CP requirement)!</span>`;
        } else {
            el.innerHTML = `<span style="color: #dc2626; font-weight: 600;">⚠️ Max CP (~${maxCP}) falls short of ${leagueName} cap.</span>`;
        }
    } else {
        el.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for ${leagueName}.</span>`;
    }
}

// --- Stardust & Candy Calculator ---
document.getElementById('calc-btn').addEventListener('click', () => {
    const currentCP = parseInt(document.getElementById('calc-current-cp').value) || 0;
    const targetCap = parseInt(document.getElementById('calc-target-league').value);
    const isLucky = document.getElementById('calc-is-lucky').checked;

    if (currentCP <= 0) {
        alert('Please enter a valid current CP.');
        return;
    }

    let baseStardust = Math.max(10000, (targetCap - currentCP) * 65);
    let baseCandy = Math.max(15, Math.floor((targetCap - currentCP) * 0.12));

    if (isLucky) {
        baseStardust = Math.floor(baseStardust * 0.5);
    }

    document.getElementById('res-stardust').textContent = `${baseStardust.toLocaleString()} Stardust ${isLucky ? '(Lucky Discount Applied!)' : ''}`;
    document.getElementById('res-candy').textContent = `${baseCandy} Regular Candy`;
    document.getElementById('res-second-move').textContent = `10,000 - 75,000 Stardust`;

    document.getElementById('calc-results').classList.remove('hidden');
});
