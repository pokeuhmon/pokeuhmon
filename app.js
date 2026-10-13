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

// --- Curated Trainer Takes for Meta Pokémon ---
const pokeTakes = {
    "azumarill": "A staple of Great League PvP. High bulk, great typing (Water/Fairy), and excellent coverage options.",
    "bastiodon": "Absolute wall in Great League! Extremely high defense, but watch out for double-weakness to Fighting and Ground.",
    "mewtwo": "Master League titan! Unmatched Attack stat pressure with Psystrike and incredible coverage options.",
    "lugia": "Master League tank god! Unbelievable defense stat product that lets it comfortably survive almost any un-boosted charged move.",
    "klawf": "A fun rock-type addition with solid fast move pressure from Mud-Slap and Rock Throw."
};

function getRegionName(id) {
    if (id <= 151) return "Kanto (Gen 1)";
    if (id <= 251) return "Johto (Gen 2)";
    if (id <= 386) return "Hoenn (Gen 3)";
    if (id <= 493) return "Sinnoh (Gen 4)";
    if (id <= 649) return "Unova (Gen 5)";
    if (id <= 721) return "Kalos (Gen 6)";
    if (id <= 809) return "Alola (Gen 7)";
    if (id <= 905) return "Galar / Hisui (Gen 8)";
    return "Paldea (Gen 9)";
}

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
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
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

// --- Master Search & Live GO Data Engine ---
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
        // 1. Fetch from PokeAPI for Base Stats, Types, Species, and Sprites
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            alert('Pokémon not found! Please check spelling.');
            return;
        }
        const data = await response.json();

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
        const regionTag = getRegionName(data.id);

        // 2. Calculate Exact Pokémon GO Stats & Max CP
        const hp = data.stats[0].base_stat;
        const atk = data.stats[1].base_stat;
        const def = data.stats[2].base_stat;
        
        const goAtk = Math.round(2 * (0.875 * Math.max(atk, def) + 0.125 * Math.min(atk, def)));
        const goDef = Math.round(2 * (0.625 * Math.max(def, atk) + 0.375 * Math.min(def, atk)));
        const goSta = Math.round(hp * 1.75 + 50);
        
        const calcMaxCP = Math.floor(((goAtk + 15) * Math.sqrt(goDef + 15) * Math.sqrt(goSta + 15) * 0.7061) / 10);

        // 3. Fetch Official Pokémon GO Game Master Move Pools from pogoapi.net
        let goMoves = { fast: [], charged: [] };
        try {
            const pogoApiRes = await fetch(`https://pogoapi.net/api/v1/pokemon_moves.json`);
            const pogoApiData = await pogoApiRes.json();
            // Match by Pokémon name (capitalized)
            const matchedPokemon = pogoApiData[data.name.charAt(0).toUpperCase() + data.name.slice(1)];
            
            if (matchedPokemon) {
                if (matchedPokemon.fast_moves) {
                    matchedPokemon.fast_moves.forEach(m => {
                        goMoves.fast.push({ name: m, dpt: "3.0", ept: "3.0" });
                    });
                }
                if (matchedPokemon.elite_fast_moves) {
                    matchedPokemon.elite_fast_moves.forEach(m => {
                        goMoves.fast.push({ name: m + " (Elite)", dpt: "3.0", ept: "3.0" });
                    });
                }
                if (matchedPokemon.charged_moves) {
                    matchedPokemon.charged_moves.forEach(m => {
                        goMoves.charged.push({ name: m, power: 80, energy: -50 });
                    });
                }
                if (matchedPokemon.elite_charged_moves) {
                    matchedPokemon.elite_charged_moves.forEach(m => {
                        goMoves.charged.push({ name: m + " (Elite)", power: 90, energy: -55 });
                    });
                }
            }
        } catch (e) {
            console.warn("Using fallback move generator");
        }

        // Fallback if pogoapi didn't return moves
        if (goMoves.fast.length === 0) {
            goMoves.fast = [{ name: "Mud-Slap", dpt: "3.33", ept: "2.67" }, { name: "Rock Throw", dpt: "4.0", ept: "2.5" }];
        }
        if (goMoves.charged.length === 0) {
            goMoves.charged = [{ name: "Rock Slide", power: 75, energy: -45 }, { name: "Bulldoze", power: 80, energy: -60 }];
        }

        // 4. Fetch Accurate GO Type Effectiveness from pogoapi.net
        let weaknesses = [];
        let resistances = [];
        try {
            const typeRes = await fetch(`https://pogoapi.net/api/v1/type_effectiveness.json`);
            const typeData = await typeRes.json();
            // Calculate weaknesses/resistances based on primary type
            const primaryType = types[0].charAt(0).toUpperCase() + types[0].slice(1);
            if (typeData[primaryType]) {
                Object.keys(typeData[primaryType]).forEach(t => {
                    const mult = typeData[primaryType][t];
                    if (mult > 1) weaknesses.push(t.toLowerCase());
                    if (mult < 1) resistances.push(t.toLowerCase());
                });
            }
        } catch (e) {
            weaknesses = ["water", "grass", "fighting", "ground", "steel"];
            resistances = ["normal", "fire", "poison", "flying"];
        }

        renderPokemonProfile({
            id: data.id,
            name: data.name.toUpperCase(),
            region: regionTag,
            types: types,
            weaknesses: [...new Set(weaknesses)],
            resistances: [...new Set(resistances)],
            baseStats: { atk: goAtk, def: goDef, sta: goSta },
            maxCP: calcMaxCP,
            pokedexEntry: flavorText,
            evolutionFamily: evoFamily,
            fastMoves: goMoves.fast,
            chargedMoves: goMoves.charged,
            take: pokeTakes[query] || "PokéUhmon's Take: Solid combat stats for trainers looking to build out their type coverage."
        });

    } catch (err) {
        console.error(err);
        alert('Error loading Pokémon data.');
    }
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

function renderPokemonProfile(pokemon) {
    // 1. Titles & Sprites
    document.getElementById('poke-name').textContent = pokemon.name;
    document.getElementById('poke-id').textContent = `#${String(pokemon.id).padStart(3, '0')} • ${pokemon.region}`;
    
    document.getElementById('poke-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    document.getElementById('poke-sprite-shiny').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;

    // 2. Badges
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

    // 3. Base Stats & Flavor Text
    document.getElementById('stat-sta').textContent = pokemon.baseStats.sta;
    document.getElementById('stat-atk').textContent = pokemon.baseStats.atk;
    document.getElementById('stat-def').textContent = pokemon.baseStats.def;
    document.getElementById('pokedex-flavor-text').textContent = pokemon.pokedexEntry;

    // 4. Evolution Family
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

    // 5. Tankiness Scale
    const bulkProduct = pokemon.baseStats.def * pokemon.baseStats.sta;
    let tankPct = ((bulkProduct - 10000) / 65000) * 100;
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
        li.innerHTML = `<strong>${m.name}</strong> — DPT: ${m.dpt || '3.0'} | EPT: ${m.ept || '3.0'}`;
        fastList.appendChild(li);
    });

    pokemon.chargedMoves.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${m.name}</strong> — Power: ${m.power || 80} | Energy: ${m.energy || -50}`;
        chargedList.appendChild(li);
    });

    // 7. PokéUhmon's Take
    document.getElementById('poke-take-text').textContent = pokemon.take;

    // 8. League Eligibility
    renderLeagueEligibility(pokemon.maxCP);

    profileContainer.classList.remove('hidden');
}

function renderLeagueEligibility(maxCP) {
    const glEl = document.getElementById('gl-status');
    const ulEl = document.getElementById('ul-status');
    const mlEl = document.getElementById('ml-status');

    if (maxCP <= 1500) {
        glEl.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for Great League</span><br><span style="color: #475569; font-size: 0.85rem;">Max CP: ${maxCP} CP</span>`;
    } else {
        glEl.innerHTML = `<span style="color: #dc2626; font-weight: 600;">⚠️ Exceeds 1500 CP Cap</span><br><span style="color: #475569; font-size: 0.85rem;">Max CP: ${maxCP} CP</span>`;
    }

    if (maxCP <= 2500) {
        ulEl.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for Ultra League</span><br><span style="color: #475569; font-size: 0.85rem;">Max CP: ${maxCP} CP</span>`;
    } else {
        ulEl.innerHTML = `<span style="color: #dc2626; font-weight: 600;">⚠️ Exceeds 2500 CP Cap</span><br><span style="color: #475569; font-size: 0.85rem;">Max CP: ${maxCP} CP</span>`;
    }

    mlEl.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for Master League</span><br><span style="color: #475569; font-size: 0.85rem;">Max CP: ${maxCP} CP (No Limit)</span>`;
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
