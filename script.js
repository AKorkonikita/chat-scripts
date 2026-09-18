// Σύνδεσμος για το Google Sheet (Opensheet API για αποφυγή CORS & άμεση φόρτωση)
const SHEET_ID = '1phqkJYI67_mdb6pmXdiOSQomfafNrzQZV3nBFN3UQ-k';
const SHEET_URL = `https://opensheet.elk.sh/${SHEET_ID}/1`;

let allScripts = [];

// Φόρτωση δεδομένων κατά την εκκίνηση
window.addEventListener('DOMContentLoaded', () => {
    // Επαναφορά θέματος
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerHTML = '🌙 Dark Mode';
    }

    fetchScripts();
});

// Λήψη δεδομένων JSON
async function fetchScripts() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        
        // Καθαρισμός και μορφοποίηση δεδομένων
        allScripts = data.map(row => ({
            category: row.category || row.Category || 'Γενικά',
            title: row.title || row.Title || 'Χωρίς Τίτλο',
            text: row.text || row.Text || ''
        }));
        
        renderCategories(allScripts);
        renderScripts(allScripts);
    } catch (error) {
        console.error('Σφάλμα φόρτωσης:', error);
        document.getElementById('scripts-container').innerHTML = `
            <p style="color: #ef4444; grid-column: 1/-1;">
                ⚠️ Αποτυχία φόρτωσης δεδομένων. Παρακαλώ βεβαιωθείτε ότι το Google Sheet είναι προσβάσιμο.
            </p>`;
    }
}

// Προβολή Κατηγοριών
function renderCategories(scripts) {
    const categoryButtonsContainer = document.getElementById('category-buttons');
    if (!categoryButtonsContainer) return;

    const categories = ['Όλα', ...new Set(scripts.map(s => s.category).filter(Boolean))];
    categoryButtonsContainer.innerHTML = '';
    
    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => filterByCategory(cat, btn);
        categoryButtonsContainer.appendChild(btn);
    });
}

// Φιλτράρισμα βάσει Κατηγορίας
function filterByCategory(category, clickedBtn) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';

    if (category === 'Όλα') {
        renderScripts(allScripts);
    } else {
        const filtered = allScripts.filter(s => s.category === category);
        renderScripts(filtered);
    }
}

// Αναζήτηση
function filterScripts() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    
    document.querySelectorAll('.cat-btn').forEach((btn, index) => {
        if (index === 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    const filtered = allScripts.filter(s => 
        (s.title && s.title.toLowerCase().includes(query)) || 
        (s.text && s.text.toLowerCase().includes(query)) ||
        (s.category && s.category.toLowerCase().includes(query))
    );
    
    renderScripts(filtered);
}

// Προβολή Καρτών
function renderScripts(scripts) {
    const container = document.getElementById('scripts-container');
    if (!container) return;

    container.innerHTML = '';

    if (scripts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">Δεν βρέθηκαν αποτελέσματα.</p>';
        return;
    }

    scripts.forEach(script => {
        const card = document.createElement('div');
        card.className = 'card';

        const titleText = script.title;
        const bodyText = script.text;

        card.innerHTML = `
            <div>
                <h4>${escapeHTML(titleText)}</h4>
                <p>${escapeHTML(bodyText)}</p>
            </div>
            <button class="copy-btn" onclick="copyToClipboard(\`${escapeQuotes(bodyText)}\`, this)">
                📋 Αντιγραφή
            </button>
        `;

        container.appendChild(card);
    });
}

// Αντιγραφή στο Clipboard
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Αντιγράφηκε!';
        btn.style.background = '#00cc52';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 1800);
    }).catch(err => {
        console.error('Σφάλμα αντιγραφής: ', err);
    });
}

// Διαχείριση Dark / Light Mode
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
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function escapeQuotes(str) {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
