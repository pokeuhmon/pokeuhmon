// --- Navigation Page Switching (Main Nav) ---
const navButtons = document.querySelectorAll('.nav-btn');
const navPages = document.querySelectorAll('.nav-page');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        navPages.forEach(p => p.classList.add('hidden'));

        btn.classList.add('active');
        const targetPage = document.getElementById(btn.dataset.nav);
        if (targetPage) {
            targetPage.classList.remove('hidden');
        }
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
        if (targetPane) {
            targetPane.classList.add('active');
        }
    });
});

// --- Custom "PokéUhmon's Take" Database ---
const pokeTakes = {
    "bastiodon": "Absolute wall in Great League! Extremely high defense and tankiness, but watch out for double-weakness to Fighting and Ground moves.",
    "haunter": "Extreme glass cannon! Hits ridiculously hard with Shadow Ball, but shield management is required because it takes high damage.",
    "azumarill": "A staple of Great League. High bulk, great typing (Water/Fairy), and excellent coverage with Ice Beam and Play Rough.",
    "medicham": "A versatile fighter with Counter and Ice Punch coverage. High stat product at level 50.",
    "swampert": "Hydro Cannon spam machine! Incredible energy generation with Mud Shot makes it dangerous in all leagues."
};

// --- Search & Fetch Logic ---
const searchInput = document.getElementById('pokemon-search');
const searchBtn = document.getElementById('search-btn');
const profileContainer = document.getElementById('pokemon-profile');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) {
            alert('Pokémon not found! Please check the spelling.');
            return;
        }
        const data = await response.json();

        // 1. Basic Info & Artwork
        document.getElementById('poke-name').textContent = data.name.toUpperCase();
        document.getElementById('poke-id').textContent = `#${String(data.id).padStart(3, '0')}`;
        
        const artwork = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        document.getElementById('poke-sprite').src = artwork;

        // Type Badges
        const typesContainer = document.getElementById('poke-types');
        typesContainer.innerHTML = '';
        data.types.forEach(t => {
            const badge = document.createElement('span');
            badge.className = `type-badge type-${t.type.name}`;
            badge.textContent = t.type.name.toUpperCase();
            typesContainer.appendChild(badge);
        });

        // 2. Base Stats
        const hp = data.stats[0].base_stat;
        const atk = data.stats[1].base_stat;
        const def = data.stats[2].base_stat;

        document.getElementById('stat-sta').textContent = hp;
        document.getElementById('stat-atk').textContent = atk;
        document.getElementById('stat-def').textContent = def;

        // 3. Tankiness Scale Calculation (Relative to Bastiodon vs Haunter)
        // Tankiness ~ (Def * HP)
        const statProduct = def * hp;
        const minTank = 5000;   // Glass cannon benchmark
        const maxTank = 35000;  // Top tank benchmark
        let tankPct = ((statProduct - minTank) / (maxTank - minTank)) * 100;
        tankPct = Math.max(5, Math.min(99.9, tankPct)).toFixed(1);

        document.getElementById('tank-bar').style.width = `${tankPct}%`;
        document.getElementById('tank-percent-label').textContent = `${tankPct}%`;

        // 4. PokéUhmon's Take Note
        const takeText = pokeTakes[query] || `PokéUhmon's Take: ${data.name.toUpperCase()} is a solid pick with unique strategy potential. Practice move timing and shield usage to get the most out of it!`;
        document.getElementById('poke-take-text').textContent = takeText;

        // 5. League Eligibility Check (100% Hundo Benchmark)
        updateLeagueStatus('gl-status', atk, def, hp, 1500, "Great League");
        updateLeagueStatus('ul-status', atk, def, hp, 2500, "Ultra League");
        updateLeagueStatus('ml-status', atk, def, hp, 3500, "Master League Cap");

        // Reveal Profile
        profileContainer.classList.remove('hidden');

    } catch (err) {
        console.error(err);
        alert('An error occurred while retrieving Pokémon stats.');
    }
}

function updateLeagueStatus(elementId, atk, def, hp, cap, leagueName) {
    const el = document.getElementById(elementId);
    // Estimated max CP at level 50
    const estMaxCP = Math.floor((atk + 15) * Math.sqrt(def + 15) * Math.sqrt(hp + 15) * 0.008);

    if (estMaxCP < cap && cap !== 1500) {
        el.innerHTML = `<span style="color: #f43f5e;">⚠️ Max CP (~${estMaxCP}) falls short of ${leagueName} cap.</span>`;
    } else {
        el.innerHTML = `<span style="color: #10b981;">✅ Eligible for ${leagueName} (100% Hundo max CP cap).</span>`;
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
        baseStardust = Math.floor(baseStardust * 0.5); // 50% Stardust discount
    }

    document.getElementById('res-stardust').textContent = `${baseStardust.toLocaleString()} Stardust ${isLucky ? '(Lucky Discount Applied!)' : ''}`;
    document.getElementById('res-candy').textContent = `${baseCandy} Regular Candy`;
    document.getElementById('res-second-move').textContent = `10,000 - 75,000 Stardust (Varies by Buddy Distance)`;

    document.getElementById('calc-results').classList.remove('hidden');
});
