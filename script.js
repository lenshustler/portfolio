document.addEventListener('DOMContentLoaded', async () => {
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio';
    
    // --- KONFIGURACJA JĘZYKA ---
    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    const translations = {
        pl: {
            "search-btn": "SZUKAJ",
            "nav-zine": "Zine",
            "nav-contact": "Kontakt",
            "nav-privacy": "Prywatność",
            "nav-terms": "Regulamin",
            "seo-h1": "Portfolio fotograficzne Alan Łysiak",
            "contact-title": "Kontakt",
            "contact-desc": "Masz jakieś pytania lub chcesz podjąć współpracę? Napisz bezpośrednio na mój email.",
            "contact-email-label": "Email",
            "contact-email-sub": "Napisz wiadomość",
            "contact-email-btn": "Wyślij Email",
            "contact-insta-label": "Instagram",
            "contact-insta-sub": "Instagram",
            "contact-insta-btn": "Zobacz profil",
            "privacy-title": "Polityka Prywatności",
            "privacy-p1": "Ta strona szanuje Twoją prywatność. Używamy plików cookies (ciasteczek) oraz pamięci lokalnej przeglądarki wyłącznie w celach technicznych – do prawidłowego działania strony oraz obsługi licznika odwiedzin.",
            "privacy-p2": "Strona nie zbiera, nie przetwarza ani nie przekazuje Twoich danych osobowych firmom zewnętrznym w celach marketingowych.",
            "terms-title": "Regulamin strony",
            "terms-p1": "Wszystkie fotografie oraz materiały prezentowane na tej stronie są własnością Alana Łysiaka i są chronione międzynarodowym prawem autorskim.",
            "terms-p2": "Kopiowanie, pobieranie, rozpowszechnianie, modyfikowanie lub jakiekolwiek komercyjne wykorzystanie zdjęć bez uprzedniej pisemnej zgody autora jest całkowicie zabronione."
        },
        en: {
            "search-btn": "SEARCH",
            "nav-zine": "Zine",
            "nav-contact": "CONTACT",
            "nav-privacy": "PRIVACY",
            "nav-terms": "TERMS",
            "seo-h1": "Photography Portfolio Alan Łysiak",
            "contact-title": "CONTACT",
            "contact-desc": "Do you have any questions or want to collaborate? Send me an email.",
            "contact-email-label": "Email",
            "contact-email-sub": "Send a message",
            "contact-email-btn": "Send Email",
            "contact-insta-label": "Instagram",
            "contact-insta-sub": "Instagram",
            "contact-insta-btn": "View Profile",
            "privacy-title": "Privacy Policy",
            "privacy-p1": "This site respects your privacy. We use cookies and local storage only for technical purposes – to ensure the site works correctly and for the visit counter.",
            "privacy-p2": "This site does not collect, process, or share your personal data with third parties for marketing purposes.",
            "terms-title": "Terms of Service",
            "terms-p1": "All photographs and materials presented on this site are the property of Alan Łysiak and are protected by international copyright law.",
            "terms-p2": "Copying, downloading, distributing, modifying, or any commercial use of the photos without prior written consent from the author is strictly prohibited."
        }
    };

    function updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = currentLang === 'pl' ? 'szukaj...' : 'search...';
        
        // Podświetlenie aktywnego języka
        document.getElementById('lang-pl').style.opacity = currentLang === 'pl' ? '1' : '0.5';
        document.getElementById('lang-en').style.opacity = currentLang === 'en' ? '1' : '0.5';
    }

    document.getElementById('lang-pl').addEventListener('click', () => { currentLang = 'pl'; localStorage.setItem('portfolio_lang', 'pl'); updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('portfolio_lang', 'en'); updateLanguage(); });

    // --- GALERIA I WYSZUKIWARKA ---
    const grid = document.querySelector('.gallery-grid');
    const searchInput = document.getElementById('search-input');
    const suggestions = document.getElementById('search-suggestions');

    // Pobieranie danych
    try {
        const query = encodeURIComponent(`*[_type == "photo"] { title, categories, "imageUrl": image.asset->url }`);
        const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${query}`);
        const { result } = await res.json();

        result.forEach(photo => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.setAttribute('data-cats', (photo.categories || []).join(' ').toLowerCase());
            card.innerHTML = `<img src="${photo.imageUrl}?w=400" alt="${photo.title}">`;
            grid.appendChild(card);
        });
    } catch (e) { console.error("Sanity Error:", e); }

    // Wyszukiwanie
    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        suggestions.innerHTML = "";
        if (val) {
            suggestions.style.display = "block";
            // Tu możesz dodać logikę podpowiedzi z Twojego poprzedniego skryptu
        } else {
            suggestions.style.display = "none";
        }
    });

    updateLanguage();
    
    // --- OBSŁUGA MODALI ---
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(trigger.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    document.querySelectorAll('.custom-modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.custom-modal').forEach(m => m.classList.remove('active'));
        });
    });
});
