document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. KONFIGURACJA ---
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio';
    
    // Tłumaczenia
    const translations = {
        pl: { "search-btn": "SZUKAJ", "nav-zine": "Zine", "nav-contact": "Kontakt", "nav-privacy": "Prywatność", "nav-terms": "Regulamin" },
        en: { "search-btn": "SEARCH", "nav-zine": "Zine", "nav-contact": "CONTACT", "nav-privacy": "PRIVACY", "nav-terms": "TERMS" }
    };
    
    // Słownik tagów do podpowiedzi
    const tagsData = {
        pl: ["ricoh", "nikon", "fujifilm", "portret", "ulica", "czarnobiale", "abstrakcja", "podroz"],
        en: ["ricoh", "nikon", "fujifilm", "portrait", "street", "monochrome", "abstract", "travel"]
    };

    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    // --- 2. JĘZYK ---
    function updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang] && translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        document.getElementById('lang-pl').classList.toggle('active', currentLang === 'pl');
        document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = currentLang === 'pl' ? 'szukaj...' : 'search...';
    }

    document.getElementById('lang-pl').addEventListener('click', () => { currentLang = 'pl'; localStorage.setItem('portfolio_lang', 'pl'); updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('portfolio_lang', 'en'); updateLanguage(); });

    // --- 3. WYSZUKIWARKA I PODPOWIEDZI ---
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');

    // Podpowiedzi podczas wpisywania
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            suggestionsBox.style.display = "none";
            return;
        }
        const matches = tagsData[currentLang].filter(tag => tag.startsWith(term));
        if (matches.length > 0) {
            suggestionsBox.innerHTML = matches.map(m => `<li>${m}</li>`).join('');
            suggestionsBox.style.display = "block";
        } else {
            suggestionsBox.style.display = "none";
        }
    });

    // Kliknięcie w podpowiedź
    suggestionsBox.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            searchInput.value = e.target.textContent;
            suggestionsBox.style.display = "none";
            performSearch(searchInput.value);
        }
    });

    // Funkcja filtrująca galerię
    const performSearch = (term) => {
        const query = term.toLowerCase().trim();
        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = card.getAttribute('data-category') || "";
            const isMatch = query === "" ? card.classList.contains('highlight') : cats.includes(query);
            card.classList.toggle('hidden', !isMatch);
        });
    };

    // --- 4. GALERIA, LIGHTBOX I MODALE (Delegacja) ---
    document.addEventListener('click', (e) => {
        // Zamykanie podpowiedzi przy kliknięciu gdziekolwiek indziej
        if (!e.target.closest('.search-nav')) suggestionsBox.style.display = "none";

        // MODALE
        if (e.target.closest('.modal-trigger')) {
            const targetId = e.target.closest('.modal-trigger').getAttribute('data-target');
            document.getElementById(targetId)?.classList.add('active');
        }
        if (e.target.classList.contains('custom-modal-close') || e.target.classList.contains('custom-modal')) {
            document.querySelectorAll('.custom-modal').forEach(m => m.classList.remove('active'));
        }
        
        // LIGHTBOX
        if (e.target.closest('.photo-card img')) {
            const lightbox = document.getElementById('lightbox');
            document.getElementById('lightbox-img').src = e.target.src;
            lightbox.classList.add('active');
        }
        if (e.target.classList.contains('close') || e.target.id === 'lightbox') {
            document.getElementById('lightbox').classList.remove('active');
        }
    });

    // --- 5. ŁADOWANIE DANYCH ---
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
    } catch (e) { console.error("Sanity Error:", e); }

    updateLanguage();
});
