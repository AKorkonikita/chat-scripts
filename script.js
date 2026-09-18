// Σύνδεσμος για το Google Sheet σε CSV format
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1phqkJYI67_mdb6pmXdiOSQomfafNrzQZV3nBFN3UQ-k/gviz/tq?tqx=out:csv';

let allScripts = [];

// Φόρτωση δεδομένων κατά την εκκίνηση της σελίδας
window.addEventListener('DOMContentLoaded', () => {
    // Επαναφορά της προτίμησης θέματος (Dark/Light Mode)
    const savedTheme = localStorage.getItem('theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeBtn) themeBtn.innerHTML = '🌙 Dark Mode';
    }

    // Φόρτωση των scripts από το Google Sheet
    fetchScripts();
});

// Συνάρτηση για τη λήψη και επεξεργασία των δεδομένων
async function fetchScripts() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Μετατροπή CSV σε αντικείμενα JavaScript
        allScripts = parseCSV(data);
        
        // Δημιουργία κουμπιών κατηγοριών και προβολή των scripts
        renderCategories(allScripts);
        renderScripts(allScripts);
    } catch (error) {
        console.error('Σφάλμα κατά τη φόρτωση των δεδομένων:', error);
        document.getElementById('scripts-container').innerHTML = `
            <p style="color: #ef4444; grid-column: 1/-1;">
                ⚠️ Αποτυχία φόρτωσης δεδομένων. Παρακαλώ βεβαιωθείτε ότι το Google Sheet είναι προσβάσιμο.
            </p>`;
    }
}

// Απλός Parser για CSV δεδομένα
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    // Προσπερνάμε την πρώτη γραμμή (headers) με slice(1)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Διαχωρισμός με κόμμα (λαμβάνει υπόψη διπλά εισαγωγικά)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (parts.length >= 3) {
            const category = parts[0].replace(/^"|"$/g, '').trim();
            const title = parts[1].replace(/^"|"$/g, '').trim();
            const text = parts[2].replace(/^"|"$/g, '').trim();
            
            // Αγνοούμε επικεφαλίδες αν τυχόν πέρασαν
            if (category.toLowerCase() !== 'category') {
                result.push({ category, title, text });
            }
        }
    }
    return result;
}

// Προβολή των κουμπιών κατηγοριών στο Sidebar
function renderCategories(scripts) {
    const categoryButtonsContainer = document.getElementById('category-buttons');
    if (!categoryButtonsContainer) return;

    // Συλλογή μοναδικών κατηγοριών
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

// Φιλτράρισμα βάσει κατηγορίας
function filterByCategory(category, clickedBtn) {
    // Ενημέρωση ενεργού κουμπιού
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Καθαρισμός της αναζήτησης
    const searchBar = document.getElementById('search-bar');
    if (searchBar) searchBar.value = '';

    if (category === 'Όλα') {
        renderScripts(allScripts);
    } else {
        const filtered = allScripts.filter(s => s.category === category);
        renderScripts(filtered);
    }
}

// Αναζήτηση κειμένου/τίτλου
function filterScripts() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    
    // Επαναφορά ενεργού κουμπιού στο "Όλα"
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

// Προβολή των κάρτων στην οθόνη
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

        const titleText = script.title || 'Χωρίς Τίτλο';
        const bodyText = script.text || '';

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

// Αντιγραφή κειμένου στο Clipboard
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

// Helper functions για ασφάλεια χαρακτήρων
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
