// Διαχείριση Dark / Light Mode
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        btn.innerHTML = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    } else {
        btn.innerHTML = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Επαναφορά της επιλογής του χρήστη κατά τη φόρτωση
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('theme-toggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (btn) btn.innerHTML = '🌙 Dark Mode';
    }
});
