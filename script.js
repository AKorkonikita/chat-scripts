// Το ID του Google Sheet σου
const SHEET_ID = "1phqkJYI67_mdb6pmXdiOSQomfafNrzQZV3nBFN3UQ-k"; 

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let scriptsData = [];
let selectedCategory = "Όλα";

document.addEventListener("DOMContentLoaded", () => {
    fetchDataFromGoogleSheet();
});

// Άντληση δεδομένων από το Google Sheet
function fetchDataFromGoogleSheet() {
    fetch(SHEET_URL)
        .then(res => res.text())
        .then(data => {
            const json = JSON.parse(data.substring(47, data.length - 2));
            const rows = json.table.rows;
            
            // Παράκαμψη της 1ης γραμμής (Headers: category, title, text)
            const contentRows = rows.slice(1);

            scriptsData = contentRows
                .filter(row => row.c && (row.c[0] || row.c[1] || row.c[2])) // Αγνοεί κενές γραμμές
                .map((row, index) => ({
                    id: index + 1,
                    category: row.c && row.c[0] && row.c[0].v ? row.c[0].v : "Γενικά",
                    title: row.c && row.c[1] && row.c[1].v ? row.c[1].v : "Χωρίς Τίτλο",
                    text: row.c && row.c[2] && row.c[2].v ? row.c[2].v : ""
                }));

            renderCategories();
            renderScripts(scriptsData);
        })
        .catch(err => console.error("Σφάλμα φόρτωσης δεδομένων:", err));
}

// Εμφάνιση Κατηγοριών
function renderCategories() {
    const categories = ["Όλα", ...new Set(scriptsData.map(item => item.category))];
    const container = document.getElementById("category-buttons");
    
    container.innerHTML = categories.map(cat => 
        `<button class="cat-btn ${cat === selectedCategory ? 'active' : ''}" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join("");
}

// Εμφάνιση Καρτών Κειμένου
function renderScripts(data) {
    const container = document.getElementById("scripts-container");
    
    if (data.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Δεν βρέθηκαν αποτελέσματα.</p>`;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="card">
            <h4>${item.title}</h4>
            <p id="text-${item.id}">${item.text}</p>
            <button class="copy-btn" onclick="copyToClipboard(${item.id}, this)">📋 Αντιγραφή</button>
        </div>
    `).join("");
}

// Φιλτράρισμα ανά Κατηγορία
function filterByCategory(category) {
    selectedCategory = category;
    renderCategories();
    
    const filtered = category === "Όλα" 
        ? scriptsData 
        : scriptsData.filter(item => item.category === category);
        
    renderScripts(filtered);
}

// Αναζήτηση
function filterScripts() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filtered = scriptsData.filter(item => 
        (selectedCategory === "Όλα" || item.category === selectedCategory) &&
        (item.title.toLowerCase().includes(query) || item.text.toLowerCase().includes(query))
    );
    renderScripts(filtered);
}

// Λειτουργία Αντιγραφής (με επιστροφή στο neon green)
function copyToClipboard(id, button) {
    const textElement = document.getElementById(`text-${id}`);
    const text = textElement ? textElement.innerText : "";
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = "✅ Αντιγράφηκε!";
        button.style.background = "#0066ff";
        button.style.color = "#ffffff";
        button.style.boxShadow = "0 0 12px rgba(0, 102, 255, 0.5)";

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = "#00ff66";
            button.style.color = "#0b0f19";
            button.style.boxShadow = "0 0 10px rgba(0, 255, 102, 0.35)";
        }, 1500);
    });
}
