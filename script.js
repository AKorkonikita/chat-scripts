const scriptsData = [
    {
        id: 1,
        category: "Χαιρετισμοί",
        title: "Καλωσόρισμα Πελάτη",
        text: "Γεια σας! Ονομάζομαι [Όνομα] από την εξυπηρέτηση πελατών. Πώς μπορώ να σας βοηθήσω σήμερα;"
    },
    {
        id: 2,
        category: "Χαιρετισμοί",
        title: "Κλείσιμο Chat",
        text: "Σας ευχαριστούμε που επικοινωνήσατε μαζί μας. Ευχόμαστε να έχετε μια όμορφη ημέρα!"
    },
    {
        id: 3,
        category: "Παραγγελίες",
        title: "Καθυστέρηση Αποστολής",
        text: "Σας ενημερώνουμε ότι λόγω αυξημένου όγκου παραγγελιών, η αποστολή σας θα καθυστερήσει 1-2 εργάσιμες ημέρες."
    },
    {
        id: 4,
        category: "Επιστροφές",
        title: "Οδηγίες Επιστροφής",
        text: "Μπορείτε να επιστρέψετε το προϊόν εντός 14 ημερών, συμπληρώνοντας τη φόρμα επιστροφής στο site μας."
    }
];

let selectedCategory = "Όλα";

document.addEventListener("DOMContentLoaded", () => {
    renderCategories();
    renderScripts(scriptsData);
});

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