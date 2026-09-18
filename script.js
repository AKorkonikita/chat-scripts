const SHEET_ID = '1phqkJYI67_mdb6pmXdiOSQomfafNrzQZV3nBFN3UQ-k';

// Φόρτωση 1ου tab (Scripts) & 2ου tab (Info)
const SCRIPTS_URL = `https://opensheet.elk.sh/${SHEET_ID}/1`;
const INFO_URL = `https://opensheet.elk.sh/${SHEET_ID}/2`;

let allScripts = [];
let allInfos = [];
let currentMode = 'scripts'; // 'scripts' ή 'info'

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerHTML = '🌙 Dark Mode';
    }

    fetchAllData();
});

async function fetchAllData() {
    try {
        const [scriptsRes, infoRes] = await Promise.all([
            fetch(SCRIPTS_URL).then(r => r.json()),
            fetch(INFO_URL).then(r => r.json()).catch(() => [])
        ]);
        
        allScripts = scriptsRes.map(row => ({
            category: row.category || row.Category || 'Γενικά',
            title: row.title || row.Title || 'Χωρίς Τίτλο',
            text: row.text || row.Text || '',
            type: 'script'
        }));

        allInfos = infoRes.map(row => ({
            category: row.category || row.Category || 'Γενικά',
            title: row.title || row.Title || 'Χωρίς Τίτλο',
            text: row.text || row.Text || '',
            type: 'info'
        }));

        renderCategories();
        renderScripts(allScripts);
    } catch (error) {
        console.error('Σφάλμα φόρτωσης:', error);
        document.getElementById('scripts-container').innerHTML = `
            <p style="color: #ef4444; grid-column: 1/-1;">
                ⚠️ Αποτυχία φόρτωσης δεδομένων. Παρακαλώ βεβαιωθείτε ότι το Google Sheet είναι προσβάσιμο.
            </p>`;
    }
}

function renderCategories() {
    const scriptsContainer = document.getElementById('category-buttons');
    const infoContainer = document.getElementById('info-category-buttons');

    // 1. Κατηγορίες Scripts
    const scriptCats = ['Όλα', ...new Set(allScripts.map(s => s.category).filter(Boolean))];
    scriptsContainer.innerHTML = '';
    scriptCats.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => filterContent('scripts', cat, btn);
        scriptsContainer.appendChild(btn);
    });

    // 2. Κατηγορίες Info
    const infoCats = [...new Set(allInfos.map(s => s.category).filter(Boolean))];
    infoContainer.innerHTML = '';
    if (infoCats.length === 0) {
        infoContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.8rem;">Δεν υπάρχουν SOS ακόμα.</p>';
    } else {
        infoCats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-btn info-btn';
            btn.textContent = `💡 ${cat}`;
            btn.onclick = () => filterContent('info', cat, btn);
            infoContainer.appendChild(btn);
        });
    }
}

function filterContent(type, category, clickedBtn) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    const searchBar = document.getElementById('search-bar');

    if (type === 'scripts') {
        currentMode = 'scripts';
        if (searchBar) searchBar.value = '';
        const filtered = category === 'Όλα' ? allScripts : allScripts.filter(s => s.category === category);
        renderScripts(filtered);
    } else if (type === 'info') {
        currentMode = 'info';
        if (searchBar) searchBar.value = '';
        const filtered = allInfos.filter(s => s.category === category);
        renderScripts(filtered);
    } else {
        // Live search φιλτράρισμα
        const query = searchBar.value.toLowerCase();
        const pool = [...allScripts, ...allInfos];
        const filtered = pool.filter(s => 
            (s.title && s.title.toLowerCase().includes(query)) || 
            (s.text && s.text.toLowerCase().includes(query)) ||
            (s.category && s.category.toLowerCase().includes(query))
        );
        renderScripts(filtered);
    }
}

function renderScripts(items) {
    const container = document.getElementById('scripts-container');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Δεν βρέθηκαν αποτελέσματα.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        const isInfo = item.type === 'info';
        card.className = `card ${isInfo ? 'info-card' : ''}`;

        card.innerHTML = `
            <div>
                <h4>${escapeHTML(item.title)}</h4>
                <p>${escapeHTML(item.text)}</p>
            </div>
            ${!isInfo ? `
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeQuotes(item.text)}\`, this)">
                📋 Αντιγραφή
            </button>` : ''}
        `;

        container.appendChild(card);
    });
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Αντιγράφηκε!';
        btn.style.background = '#00cc52';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 1800);
    }).catch(err => console.error('Σφάλμα αντιγραφής: ', err));
}

function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        if (btn) btn.innerHTML = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        if (btn) btn.innerHTML = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function escapeQuotes(str) {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
