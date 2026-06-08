document.addEventListener('DOMContentLoaded', async () => {
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio';

    // --- 1. TŁUMACZENIA (i18n) ---
    const translations = {
        pl: {
            "search-btn": "SZUKAJ",
            "nav-zine": "Zine",
            "nav-contact": "Kontakt",
            "nav-privacy": "Prywatność",
            "nav-terms": "Regulamin",
            "seo-h1": "Portfolio fotograficzne Alan Łysiak",
            "contact-title": "Kontakt",
            "contact-desc": "Masz pytania lub chcesz podjąć współpracę? Napisz bezpośrednio.",
            "contact-email-label": "Email",
            "contact-email-sub": "Napisz wiadomość",
            "contact-email-btn": "Wyślij Email",
            "contact-insta-label": "Instagram",
            "contact-insta-sub": "Instagram",
            "contact-insta-btn": "Zobacz profil",
            "privacy-title": "Polityka Prywatności",
            "privacy-p1": "Strona używa plików cookies tylko w celach technicznych.",
            "privacy-p2": "Nie zbieramy danych marketingowych.",
            "terms-title": "Regulamin",
            "terms-p1": "Wszystkie zdjęcia są własnością Alana Łysiaka.",
            "terms-p2": "Kopiowanie bez zgody zabronione."
        },
        en: {
            "search-btn": "SEARCH",
            "nav-zine": "Zine",
            "nav-contact": "CONTACT",
            "nav-privacy": "PRIVACY",
            "nav-terms": "TERMS",
            "seo-h1": "Photography Portfolio Alan Łysiak",
            "contact-title": "CONTACT",
            "contact-desc": "Do you have any questions? Feel free to reach out.",
            "contact-email-label": "Email",
            "contact-email-sub": "Send a message",
            "contact-email-btn": "Send Email",
            "contact-insta-label": "Instagram",
            "contact-insta-sub": "Instagram",
            "contact-insta-btn": "View Profile",
            "privacy-title": "Privacy Policy",
            "privacy-p1": "This site uses cookies for technical purposes only.",
            "privacy-p2": "We do not collect marketing data.",
            "terms-title": "Terms of Service",
            "terms-p1": "All photographs are property of Alan Łysiak.",
            "terms-p2": "Copying without permission is prohibited."
        }
    };

    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    function updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = currentLang === 'pl' ? 'szukaj...' : 'search...';
    }

    document.getElementById('lang-pl').addEventListener('click', () => { currentLang = 'pl'; localStorage.setItem('portfolio_lang', 'pl'); updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('portfolio_lang', 'en'); updateLanguage(); });

    // --- 2. POBIERANIE DANYCH Z SANITY ---
    const grid = document.querySelector('.gallery-grid');
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    try {
        const query = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
        const response = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${query}`);
        const { result: photos } = await response.json();

        photos.forEach(photo => {
            const card = document.createElement('div');
            card.className = `photo-card ${photo.isHighlight ? 'highlight' : 'hidden'}`;
            card.setAttribute('data-category', (photo.categories || []).join(' ').toLowerCase());
            card.innerHTML = `<img src="${photo.imageUrl}?auto=format&w=500" alt="${photo.title || 'Photo'}" loading="lazy">`;
            grid.appendChild(card);
        });
    } catch (e) { console.error("Sanity Error:", e); }

    // --- 3. WYSZUKIWARKA I HIGHLIGHTY ---
    const performSearch = () => {
        const term = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = card.getAttribute('data-category') || "";
            const isMatch = term === "" ? card.classList.contains('highlight') : cats.includes(term);
            card.classList.toggle('hidden', !isMatch);
        });
        suggestionsBox.style.display = "none";
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            suggestionsBox.style.display = "none";
            return;
        }
        // Prosta logika podpowiedzi
        suggestionsBox.innerHTML = `<li>${term}...</li>`; 
        suggestionsBox.style.display = "block";
    });

    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
    document.querySelector('.search-btn').addEventListener('click', performSearch);

    // --- 4. MODALE ---
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = trigger.getAttribute('data-target');
            document.getElementById(targetId)?.classList.add('active');
        });
    });

    document.querySelectorAll('.custom-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.custom-modal').forEach(m => m.classList.remove('active'));
        });
    });

    // Inicjalizacja
    updateLanguage();
});
