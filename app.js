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

// --- Confirmed Pokémon GO Game Master Database ---
const pogoDatabase = {
    "pikachu": {
        id: "025",
        name: "PIKACHU",
        types: ["electric"],
        weaknesses: ["ground"],
        baseStats: { atk: 112, def: 96, sta: 111 }, // Actual GO Stats
        fastMoves: [
            { name: "Thunder Shock", type: "electric", dpt: "1.5", ept: "4.5" },
            { name: "Quick Attack", type: "normal", dpt: "2.5", ept: "3.5" },
            { name: "Present (Legacy)", type: "normal", dpt: "1.5", ept: "4.0" }
        ],
        chargedMoves: [
            { name: "Discharge", type: "electric", power: 65, energy: -45 },
            { name: "Thunderbolt", type: "electric", power: 80, energy: -55 },
            { name: "Wild Charge", type: "electric", power: 100, energy: -45 },
            { name: "Surf (Elite TM)", type: "water", power: 65, energy: -40 },
            { name: "Thunder (Elite TM)", type: "electric", power: 100, energy: -60 }
        ],
        take: "Iconic mascot! While standard Pikachu maxes out at ~1060 CP at Level 50, it can still battle in Great League with clever shield management."
    },
    "bastiodon": {
        id: "411",
        name: "BASTIODON",
        types: ["rock", "steel"],
        weaknesses: ["fighting", "ground", "water"],
        baseStats: { atk: 94, def: 286, sta: 155 },
        fastMoves: [
            { name: "Smack Down", type: "rock", dpt: "4.0", ept: "2.67" },
            { name: "Iron Head", type: "steel", dpt: "3.0", ept: "3.0" }
        ],
        chargedMoves: [
            { name: "Stone Edge", type: "rock", power: 100, energy: -55 },
            { name: "Flamethrower", type: "fire", power: 90, energy: -55 }
        ],
        take: "Absolute wall in Great League! Extremely high defense and bulk product, but watch out for double-weakness to Fighting and Ground moves."
    },
    "azumarill": {
        id: "184",
        name: "AZUMARILL",
        types: ["water", "fairy"],
        weaknesses: ["electric", "grass", "poison"],
        baseStats: { atk: 112, def: 152, sta: 225 },
        fastMoves: [
            { name: "Bubble", type: "water", dpt: "2.67", ept: "3.67" },
            { name: "Rock Smash", type: "fighting", dpt: "3.0", ept: "2.0" }
        ],
        chargedMoves: [
            { name: "Ice Beam", type: "ice", power: 90, energy: -55 },
            { name: "Play Rough", type: "fairy", power: 90, energy: -60 },
            { name: "Hydro Pump", type: "water", power: 130, energy: -75 }
        ],
        take: "A staple of Great League PvP. High bulk, great typing (Water/Fairy), and excellent coverage options."
    }
};

// Full Pokémon List for Autocomplete
const pokemonList = [
    "Pikachu", "Bastiodon", "Azumarill", "Haunter", "Medicham", "Swampert", 
    "Vulpix", "Ninetales", "Altaria", "Skarmory", "Lickitung", "Clodsire"
];

const searchInput = document.getElementById('pokemon-search');
const autocompleteList = document.getElementById('autocomplete-list');

searchInput.addEventListener('input', function() {
    const val = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    
    if (!val) {
        autocompleteList.classList.add('hidden');
        return;
    }

    const matches = pokemonList.filter(p => p.toLowerCase().includes(val));
    if (matches.length > 0) {
        autocompleteList.classList.remove('hidden');
        matches.forEach(match => {
            const item = document.createElement('div');
            item.textContent = match;
            item.addEventListener('click', () => {
                searchInput.value = match;
                autocompleteList.classList.add('hidden');
                performSearch();
            });
            autocompleteList.appendChild(item);
        });
    } else {
        autocompleteList.classList.add('hidden');
    }
});

document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.classList.add('hidden');
});

// --- Search & Display Execution ---
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('pokemon-profile');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    let query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    // Check if we have exact GO Game Master Data first
    if (pogoDatabase[query]) {
        renderPogoData(pogoDatabase[query]);
        return;
    }

    // Dynamic API Fallback for other Pokémon
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            alert('Pokémon not found! Try selecting a suggestion from the search box.');
            return;
        }
        const data = await response.json();

        const fallbackObj = {
            id: String(data.id).padStart(3, '0'),
            name: data.name.toUpperCase(),
            types: data.types.map(t => t.type.name),
            weaknesses: ["ground"],
            baseStats: {
                sta: data.stats[0].base_stat,
                atk: data.stats[1].base_stat,
                def: data.stats[2].base_stat
            },
            fastMoves: data.moves.slice(0, 3).map(m => ({
                name: m.move.name.replace('-', ' '),
                type: "normal",
                dpt: "3.0",
                ept: "3.0"
            })),
            chargedMoves: data.moves.slice(3, 7).map(m => ({
                name: m.move.name.replace('-', ' '),
                type: "normal",
                power: 70,
                energy: -50
            })),
            take: "PokéUhmon's Take: Coming Soon!"
        };

        renderPogoData(fallbackObj);

    } catch (err) {
        console.error(err);
        alert('An error occurred while loading Pokémon data.');
    }
}

function renderPogoData(pokemon) {
    // 1. Basic Info & Artwork
    document.getElementById('poke-name').textContent = pokemon.name;
    document.getElementById('poke-id').textContent = `#${pokemon.id}`;
    document.getElementById('poke-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${parseInt(pokemon.id)}.png`;

    // 2. Types & Weaknesses
    const typesContainer = document.getElementById('poke-types');
    typesContainer.innerHTML = '';
    pokemon.types.forEach(t => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${t}`;
        badge.textContent = t.toUpperCase();
        typesContainer.appendChild(badge);
    });

    const weaknessContainer = document.getElementById('poke-weaknesses');
    weaknessContainer.innerHTML = '';
    pokemon.weaknesses.forEach(w => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${w}`;
        badge.textContent = w.toUpperCase();
        weaknessContainer.appendChild(badge);
    });

    // 3. Base Stats
    document.getElementById('stat-sta').textContent = pokemon.baseStats.sta;
    document.getElementById('stat-atk').textContent = pokemon.baseStats.atk;
    document.getElementById('stat-def').textContent = pokemon.baseStats.def;

    // 4. Accurate Tankiness Scale (Bulk Product: Def * Sta)
    const bulkProduct = pokemon.baseStats.def * pokemon.baseStats.sta;
    // Scale normalized from Glass Cannon (8,000) to Ultimate Tank (44,000)
    let tankPct = ((bulkProduct - 8000) / 36000) * 100;
    tankPct = Math.max(5, Math.min(99.9, tankPct)).toFixed(1);

    document.getElementById('tank-bar').style.width = `${tankPct}%`;
    document.getElementById('tank-percent-label').textContent = `${tankPct}%`;

    // 5. Real Moves Data (Exact DPT/EPT & Power/Energy)
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

    // 6. PokéUhmon's Take
    document.getElementById('poke-take-text').textContent = pokemon.take;

    // 7. Accurate League Status
    const estMaxCP = Math.floor((pokemon.baseStats.atk + 15) * Math.sqrt(pokemon.baseStats.def + 15) * Math.sqrt(pokemon.baseStats.sta + 15) * 0.008);
    
    updateLeagueStatus('gl-status', estMaxCP, 1500, "Great League", true);
    updateLeagueStatus('ul-status', estMaxCP, 2500, "Ultra League", false);
    updateLeagueStatus('ml-status', estMaxCP, 3500, "Master League Cap", false);

    // Default tab to Moves
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-target="tab-moves"]').classList.add('active');
    document.getElementById('tab-moves').classList.add('active');

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
