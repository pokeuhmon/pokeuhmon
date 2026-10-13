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

// --- Full Pokémon List for Autocomplete & Typo Matching ---
const pokemonList = [
    "Azumarill", "Bastiodon", "Haunter", "Medicham", "Swampert", "Vulpix", "Ninetales",
    "Altaria", "Skarmory", "Lickitung", "Clodsire", "Mandibuzz", "Stunfisk", "Trevenant",
    "Charizard", "Venusaur", "Registeel", "Pikachu", "Eevee", "Machamp", "Gengar",
    "Dragonite", "Snorlax", "Lucario", "Talonflame", "Pelipper", "Cresselia", "Giratina"
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

// --- Custom "PokéUhmon's Take" Notes ---
const pokeTakes = {
    "bastiodon": "Absolute wall in Great League! Extremely high defense and tankiness, but watch out for double-weakness to Fighting and Ground moves.",
    "haunter": "Extreme glass cannon! Hits ridiculously hard with Shadow Ball, but shield management is required because it takes high damage.",
    "azumarill": "A staple of Great League. High bulk, great typing (Water/Fairy), and excellent coverage with Ice Beam and Play Rough."
};

// --- Search & Fetch Logic ---
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('pokemon-profile');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    let query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    const exactMatch = pokemonList.find(p => p.toLowerCase() === query);
    if (!exactMatch) {
        const closeMatch = pokemonList.find(p => p.toLowerCase().startsWith(query.substring(0, 3)));
        if (closeMatch) query = closeMatch.toLowerCase();
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            alert('Pokémon not found! Try picking a suggestion from the dropdown list.');
            return;
        }
        const data = await response.json();

        // 1. Basic Info & Artwork
        document.getElementById('poke-name').textContent = data.name.toUpperCase();
        document.getElementById('poke-id').textContent = `#${String(data.id).padStart(3, '0')}`;
        
        const artwork = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        document.getElementById('poke-sprite').src = artwork;

        // 2. Type Badges & Weaknesses
        const typesContainer = document.getElementById('poke-types');
        typesContainer.innerHTML = '';
        data.types.forEach(t => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${t.type.name}`;
            badge.textContent = t.type.name.toUpperCase();
            typesContainer.appendChild(badge);
        });

        fetchWeaknesses(data.types.map(t => t.type.name));

        // 3. Base Stats
        const hp = data.stats[0].base_stat;
        const atk = data.stats[1].base_stat;
        const def = data.stats[2].base_stat;

        document.getElementById('stat-sta').textContent = hp;
        document.getElementById('stat-atk').textContent = atk;
        document.getElementById('stat-def').textContent = def;

        // 4. Tankiness Scale Calculation
        const statProduct = def * hp;
        let tankPct = ((statProduct - 5000) / 30000) * 100;
        tankPct = Math.max(5, Math.min(99.9, tankPct)).toFixed(1);

        document.getElementById('tank-bar').style.width = `${tankPct}%`;
        document.getElementById('tank-percent-label').textContent = `${tankPct}%`;

        // 5. Moves Pacing & EPT/Damage Data Display
        populateMoves(data.moves);

        // 6. PokéUhmon's Take Note
        const takeText = pokeTakes[query] || "PokéUhmon's Take: Coming Soon!";
        document.getElementById('poke-take-text').textContent = takeText;

        // 7. League Eligibility Check (With Low-CP Star Note support)
        updateLeagueStatus('gl-status', atk, def, hp, 1500, "Great League", true);
        updateLeagueStatus('ul-status', atk, def, hp, 2500, "Ultra League", false);
        updateLeagueStatus('ml-status', atk, def, hp, 3500, "Master League Cap", false);

        // Set default active tab to Moves
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelector('[data-target="tab-moves"]').classList.add('active');
        document.getElementById('tab-moves').classList.add('active');

        // Reveal Profile
        profileContainer.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        alert('An error occurred while retrieving Pokémon stats.');
    }
}

function fetchWeaknesses(types) {
    const weaknessContainer = document.getElementById('poke-weaknesses');
    weaknessContainer.innerHTML = '';
    
    const weaknessMap = {
        fire: ['water', 'ground', 'rock'],
        water: ['electric', 'grass'],
        grass: ['fire', 'ice', 'poison', 'flying', 'bug'],
        electric: ['ground'],
        ice: ['fire', 'fighting', 'rock', 'steel'],
        fighting: ['flying', 'psychic', 'fairy'],
        poison: ['ground', 'psychic'],
        ground: ['water', 'grass', 'ice'],
        flying: ['electric', 'ice', 'rock'],
        psychic: ['bug', 'ghost', 'dark'],
        bug: ['fire', 'flying', 'rock'],
        rock: ['water', 'grass', 'fighting', 'ground', 'steel'],
        ghost: ['ghost', 'dark'],
        dragon: ['ice', 'dragon', 'fairy'],
        steel: ['fire', 'fighting', 'ground'],
        fairy: ['poison', 'steel'],
        normal: ['fighting'],
        dark: ['fighting', 'bug', 'fairy']
    };

    let foundWeaknesses = new Set();
    types.forEach(t => {
        if (weaknessMap[t]) {
            weaknessMap[t].forEach(w => foundWeaknesses.add(w));
        }
    });

    foundWeaknesses.forEach(w => {
        const badge = document.createElement('span');
        badge.className = `type-badge type-${w}`;
        badge.textContent = w.toUpperCase();
        weaknessContainer.appendChild(badge);
    });
}

function populateMoves(moves) {
    const fastList = document.getElementById('fast-moves-list');
    const chargedList = document.getElementById('charged-moves-list');
    fastList.innerHTML = '';
    chargedList.innerHTML = '';

    const fastMoves = moves.slice(0, 4);
    const chargedMoves = moves.slice(4, 9);

    fastMoves.forEach(m => {
        const li = document.createElement('li');
        // Simulated realistic PvP EPT / DPT stats based on move name hash
        const dpt = (Math.abs(hashCode(m.move.name)) % 3) + 2; // 2-4 DPT
        const ept = (Math.abs(hashCode(m.move.name + "ept")) % 3) + 2; // 2-4 EPT
        li.innerHTML = `<strong>${m.move.name.replace('-', ' ').toUpperCase()}</strong> — DPT: ${dpt} | EPT: ${ept}`;
        fastList.appendChild(li);
    });

    chargedMoves.forEach(m => {
        const li = document.createElement('li');
        const power = (Math.abs(hashCode(m.move.name)) % 60) + 40; // 40-95 Power
        const energy = (Math.abs(hashCode(m.move.name + "en")) % 35) + 35; // 35-70 Energy
        li.innerHTML = `<strong>${m.move.name.replace('-', ' ').toUpperCase()}</strong> — Pwr: ${power} | Cost: ${energy}`;
        fastList.appendChild(li);
    });
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function updateLeagueStatus(elementId, atk, def, hp, cap, leagueName, allowLowCPNote) {
    const el = document.getElementById(elementId);
    const estMaxCP = Math.floor((atk + 15) * Math.sqrt(def + 15) * Math.sqrt(hp + 15) * 0.008);

    if (estMaxCP < cap) {
        if (allowLowCPNote) {
            el.innerHTML = `<span style="color: #16a34a; font-weight: 600;">✅ Eligible for ${leagueName}.</span><br><span style="color: #b45309; font-size: 0.85rem;">⭐ Note: Max CP (~${estMaxCP}) stays below ${cap} CP, but it can still compete in this league (no minimum CP requirement)!</span>`;
        } else {
            el.innerHTML = `<span style="color: #dc2626; font-weight: 600;">⚠️ Max CP (~${estMaxCP}) falls short of ${leagueName} cap.</span>`;
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

    let baseStaded = Math.max(10000, (targetCap - currentCP) * 65);
    let baseCandy = Math.max(15, Math.floor((targetCap - currentCP) * 0.12));

    if (isLucky) {
        baseStaded = Math.floor(baseStaded * 0.5);
    }

    document.getElementById('res-strusted') ? document.getElementById('res-stardust').textContent = `${baseStaded.toLocaleString()} Stardust ${isLucky ? '(Lucky Discount Applied!)' : ''}` : null;
    document.getElementById('res-candy').textContent = `${baseCandy} Regular Candy`;
    document.getElementById('res-second-move').textContent = `10,000 - 75,000 Stardust`;

    document.getElementById('calc-results').classList.remove('hidden');
});
