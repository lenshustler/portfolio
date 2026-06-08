document.addEventListener('DOMContentLoaded', async () => {
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio';

    // --- 1. TŁUMACZENIA I JĘZYK ---
    const translations = {
        pl: { "search-btn": "SZUKAJ", "nav-zine": "Zine", "nav-contact": "Kontakt", "nav-privacy": "Prywatność", "nav-terms": "Regulamin", "seo-h1": "Portfolio fotograficzne Alan Łysiak", "contact-title": "Kontakt", "contact-desc": "Masz pytania lub chcesz podjąć współpracę? Napisz bezpośrednio.", "contact-email-label": "Email", "contact-email-sub": "Napisz wiadomość", "contact-email-btn": "Wyślij Email", "contact-insta-label": "Instagram", "contact-insta-sub": "Instagram", "contact-insta-btn": "Zobacz profil", "privacy-title": "Polityka Prywatności", "privacy-p1": "Strona używa plików cookies tylko w celach technicznych.", "privacy-p2": "Nie zbieramy danych marketingowych.", "terms-title": "Regulamin", "terms-p1": "Wszystkie zdjęcia są własnością Alana Łysiaka.", "terms-p2": "Kopiowanie bez zgody zabronione." },
        en: { "search-btn": "SEARCH", "nav-zine": "Zine", "nav-contact": "CONTACT", "nav-privacy": "PRIVACY", "nav-terms": "TERMS", "seo-h1": "Photography Portfolio Alan Łysiak", "contact-title": "CONTACT", "contact-desc": "Do you have any questions? Feel free to reach out.", "contact-email-label": "Email", "contact-email-sub": "Send a message", "contact-email-btn": "Send Email", "contact-insta-label": "Instagram", "contact-insta-sub": "Instagram", "contact-insta-btn": "View Profile", "privacy-title": "Privacy Policy", "privacy-p1": "This site uses cookies for technical purposes only.", "privacy-p2": "We do not collect marketing data.", "terms-title": "Terms of Service", "terms-p1": "All photographs are property of Alan Łysiak.", "terms-p2": "Copying without permission is prohibited." }
    };

    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    function updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        document.getElementById('lang-pl').classList.toggle('active', currentLang === 'pl');
        document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = currentLang === 'pl' ? 'szukaj...' : 'search...';
    }

    document.getElementById('lang-pl').addEventListener('click', () => { currentLang = 'pl'; localStorage.setItem('portfolio_lang', 'pl'); updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('portfolio_lang', 'en'); updateLanguage(); });

    // --- 2. POBIERANIE ZDJĘĆ I LICZNIK ---
    const grid = document.querySelector('.gallery-grid');
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

        // Aktualizacja licznika
        const frameCount = document.getElementById('frame-count');
        if (frameCount) frameCount.textContent = photos.length.toString().padStart(2, '0');
    } catch (e) { console.error(e); }

    // --- 3. LIGHTBOX (Delegacja zdarzeń - klucz do naprawy!) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    document.addEventListener('click', (e) => {
        // Kliknięcie w zdjęcie
        if (e.target.closest('.photo-card img')) {
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
        }
        // Kliknięcie w zamknięcie
        if (e.target.classList.contains('close') || e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // --- 4. WYSZUKIWARKA (Reszta logiki bez zmian) ---
    // (Tu zachowaj swoją logikę wyszukiwania z poprzedniego kroku)
    updateLanguage();
});
