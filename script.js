// ΒΑΛΕ ΕΔΩ ΤΟ ID ΤΟΥ GOOGLE SHEET ΣΟΥ:https://docs.google.com/spreadsheets/d/1phqkJYI67_mdb6pmXdiOSQomfafNrzQZV3nBFN3UQ-k/edit?gid=0#gid=0
const SHEET_ID = "1a2b3c4d5e6f7g8h9"; 

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let scriptsData = [];
let selectedCategory = "Όλα";

document.addEventListener("DOMContentLoaded", () => {
    fetchDataFromGoogleSheet();
});

function fetchDataFromGoogleSheet() {
    fetch(SHEET_URL)
        .then(res => res.text())
        .then(data => {
            // Καθαρισμός του JSON που επιστρέφει το Google Sheets
            const json = JSON.parse(data.substring(47, data.length - 2));
            const rows = json.table.rows;
            
            scriptsData = rows.map((row, index) => ({
                id: index + 1,
                category: row.c[0] ? row.c[0].v : "Γενικά",
                title: row.c[1] ? row.c[1].v : "Χωρίς Τίτλο",
                text: row.c[2] ? row.c[2].v : ""
            }));

            renderCategories();
            renderScripts(scriptsData);
        })
        .catch(err => console.error("Σφάλμα φόρτωσης δεδομένων:", err));
}

function renderCategories() {
    const categories = ["Όλα", ...new Set(scriptsData.map(item => item.category))];
    const container = document.getElementById("category-buttons");
    
    container.innerHTML = categories.map(cat => 
        `<button class="cat-btn ${cat === selectedCategory ? 'active' : ''}" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join("");
}

function renderScripts(data) {
    const container = document.getElementById("scripts-container");
    container.innerHTML = data.map(item => `
        <div class="card">
            <h4>${item.title}</h4>
            <p id="text-${item.id}">${item.text}</p>
            <button class="copy-btn" onclick="copyToClipboard(${item.id}, this)">📋 Αντιγραφή</button>
        </div>
    `).join("");
}

function filterByCategory(category) {
    selectedCategory = category;
    renderCategories();
    
    const filtered = category === "Όλα" 
        ? scriptsData 
        : scriptsData.filter(item => item.category === category);
        
    renderScripts(filtered);
}

function filterScripts() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filtered = scriptsData.filter(item => 
        (selectedCategory === "Όλα" || item.category === selectedCategory) &&
        (item.title.toLowerCase().includes(query) || item.text.toLowerCase().includes(query))
    );
    renderScripts(filtered);
}

function copyToClipboard(id, button) {
    const text = document.getElementById(`text-${id}`).innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = "✅ Αντιγράφηκε!";
        button.style.background = "#0969da";
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = "#238636";
        }, 1500);
    });
}
