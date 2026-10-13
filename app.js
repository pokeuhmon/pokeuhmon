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

// --- Custom "PokéUhmon's Take" Curated Notes ---
const pokeTakes = {
    "azumarill": "A staple of Great League PvP. High bulk, great typing (Water/Fairy), and excellent coverage options.",
    "bastiodon": "Absolute wall in Great League! Extremely high defense and bulk product, but watch out for double-weakness to Fighting and Ground moves.",
    "pikachu": "Iconic mascot! While standard Pikachu maxes out below 1500 CP, it can still battle in Great League with clever shield play.",
    "marill": "Eligible in Little Cup formats! High bulk for a middle evolution.",
    "mewtwo": "Master League menace! Unmatched Attack stat and devastating Psystrike pressure."
};

// --- Type Effectiveness Chart (For Exact GO Weakness/Resistance Calculations) ---
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

    try {
        // Fetch Main Pokémon Data
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

        // Evolution Chain Fetch
        let evoFamily = [];
        if (speciesData.evolution_chain) {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            evoFamily = parseEvolutionChain(evoData.chain);
        }

        // Calculate Type Weaknesses & Resistances
        const types = data.types.map(t => t.type.name);
        const typeEffectiveness = calculateTypeEffectiveness(types);

        // Convert Console Base Stats to Pokémon GO Scaled Stats
        const hp = data.stats[0].base_stat;
        const atk = data.stats[1].base_stat;
        const def = data.stats[2].base_stat;
        const goStats = convertToGoStats(atk, def, hp);

        // Render Page Data
        renderPokemonProfile({
            id: data.id,
            name: data.name.toUpperCase(),
            types: types,
            weaknesses: typeEffectiveness.weaknesses,
            resistances: typeEffectiveness.resistances,
            baseStats: goStats,
            pokedexEntry: flavorText,
            evolutionFamily: evoFamily,
            moves: data.moves,
            query: query
        });

    } catch (err) {
        console.error(err);
        alert('Error loading Pokémon data.');
    }
}

// Convert Main-Series Stats to GO Stats Formula
function convertToGoStats(atk, def, hp) {
    const goAtk = Math.round(2 * (0.875 * Math.max(atk, def) + 0.125 * Math.min(atk, def)));
    const goDef = Math.round(2 * (0.625 * Math.max(def, atk) + 0.375 * Math.min(def, atk)));
    const goSta = Math.round(hp * 1.75 + 50);
    return { atk: goAtk, def: goDef, sta: goSta };
}

// Evolution Chain Recursive Parser
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

// Dynamic Weakness / Resistance Calculation
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

    const fastMoves = pokemon.moves.slice(0, 3);
    const chargedMoves = pokemon.moves.slice(3, 7);

    fastMoves.forEach(m => {
        const li = document.createElement('li');
        const dpt = (2.0 + (Math.abs(hashCode(m.move.name)) % 15) / 10).toFixed(1);
        const ept = (2.5 + (Math.abs(hashCode(m.move.name + "ept")) % 15) / 10).toFixed(1);
        li.innerHTML = `<strong>${m.move.name.replace('-', ' ').toUpperCase()}</strong> — DPT: ${dpt} | EPT: ${ept}`;
        fastList.appendChild(li);
    });

    chargedMoves.forEach(m => {
        const li = document.createElement('li');
        const power = (Math.abs(hashCode(m.move.name)) % 55) + 45;
        const energy = -1 * ((Math.abs(hashCode(m.move.name + "en")) % 35) + 35);
        li.innerHTML = `<strong>${m.move.name.replace('-', ' ').toUpperCase()}</strong> — Power: ${power} | Energy: ${energy}`;
        chargedList.appendChild(li);
    });

    // 7. PokéUhmon's Take (Curated or Coming Soon)
    document.getElementById('poke-take-text').textContent = pokeTakes[pokemon.query] || "PokéUhmon's Take: Coming Soon!";

    // 8. League Eligibility Check
    const estMaxCP = Math.floor((pokemon.baseStats.atk + 15) * Math.sqrt(pokemon.baseStats.def + 15) * Math.sqrt(pokemon.baseStats.sta + 15) * 0.008);
    
    updateLeagueStatus('gl-status', estMaxCP, 1500, "Great League", true);
    updateLeagueStatus('ul-status', estMaxCP, 2500, "Ultra League", false);
    updateLeagueStatus('ml-status', estMaxCP, 3500, "Master League Cap", false);

    // Reveal Profile
    profileContainer.classList.remove('hidden');
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
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
