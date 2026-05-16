document.addEventListener('DOMContentLoaded', async () => {
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio'; 
    const grid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');
    let images = [];
    let activeIdx = 0;

    // --- 1. POBIERANIE DANYCH Z SANITY ---
    if (grid) {
        try {
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
            
            const response = await fetch(URL);
            const data = await response.json();
            const photos = data.result;

            if (!photos || photos.length === 0) {
                grid.innerHTML = "<p style='color:black; text-align:center; grid-column: 1/-1;'>Baza danych jest pusta.</p>";
            } else {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                photos.forEach((photo, index) => {
                    const card = document.createElement('div');
                    card.className = 'photo-card'; 
                    
                    if (photo.isHighlight === true) {
                        card.classList.add('highlight');
                    } else {
                        card.classList.add('hidden');
                    }

                    card.setAttribute('data-category', (photo.categories || []).join(' '));
                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.setAttribute('draggable', 'false');
                    img.onclick = () => showImage(index);
                    
                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });
                grid.style.opacity = "1";
            }
        } catch (e) { console.error("Błąd połączenia z Sanity:", e); }
    }

    // --- 2. LOGIKA LIGHTBOXA I GESTÓW (SWIPE) ---
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipe() {
        const swipeThreshold = 50; // Minimalna odległość przesunięcia
        if (touchEndX < touchStartX - swipeThreshold) {
            nextBtn.click(); // Przesunięcie w lewo -> następne
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            prevBtn.click(); // Przesunięcie w prawo -> poprzednie
        }
    }

    if (lightbox) {
        lightbox.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function showImage(index) {
        const visible = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        if (visible.length === 0) return;
        
        activeIdx = visible.findIndex(img => img.src === images[index].src);
        if (activeIdx === -1) activeIdx = 0;

        const updateLightbox = () => {
            lightboxImg.src = visible[activeIdx].src;
        };

        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        nextBtn.onclick = (e) => {
            e.stopPropagation();
            activeIdx = (activeIdx + 1) % visible.length;
            updateLightbox();
        };
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            activeIdx = (activeIdx - 1 + visible.length) % visible.length;
            updateLightbox();
        };
    }

    if (closeBtn) closeBtn.onclick = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (lightbox) lightbox.onclick = (e) => { 
        if (e.target === lightbox || e.target === lightboxImg) {
            closeBtn.onclick();
        }
    };

    // Obsługa klawiatury
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === "ArrowRight") nextBtn.click();
            if (e.key === "ArrowLeft") prevBtn.click();
            if (e.key === "Escape") closeBtn.onclick();
        }
    });

    // Blokada prawokliku na zdjęciach
    document.addEventListener('contextmenu', (e) => { 
        if (e.target.tagName === 'IMG') e.preventDefault(); 
    });

    // --- 3. WYSZUKIWARKA I PODPOWIEDZI ---
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.photo-card');
            
            // 1. Zbieranie unikalnych kategorii z załadowanych zdjęć
            let allCategories = new Set();
            cards.forEach(card => {
                const cats = card.getAttribute('data-category');
                if (cats) {
                    cats.split(' ').forEach(c => {
                        if(c) allCategories.add(c.toLowerCase());
                    });
                }
            });
            const uniqueCategories = Array.from(allCategories);

            // 2. Filtrowanie zdjęć na żywo
            cards.forEach(card => {
                const cat = (card.getAttribute('data-category') || "").toLowerCase();
                if (term === "") {
                    // Powrót do stanu początkowego (tylko Highlight)
                    if (card.classList.contains('highlight')) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                } else {
                    card.classList.toggle('hidden', !cat.includes(term));
                }
            });

            // 3. Pokazywanie podpowiedzi
            if (term === "" || !suggestionsBox) {
                if (suggestionsBox) suggestionsBox.style.display = "none";
            } else {
                // Znajdź kategorie pasujące do wpisanego tekstu
                const matches = uniqueCategories.filter(c => c.includes(term) && c !== term);
                
                if (matches.length > 0) {
                    suggestionsBox.innerHTML = matches.map(match => `<li>${match}</li>`).join('');
                    suggestionsBox.style.display = "block";
                } else {
                    suggestionsBox.style.display = "none";
                }
            }
        });

        // 4. Kliknięcie w podpowiedź
        if (suggestionsBox) {
            suggestionsBox.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    // Wpisz klikniętą kategorię do inputa
                    searchInput.value = e.target.textContent;
                    suggestionsBox.style.display = "none";
                    
                    // Wymuś zdarzenie 'input', żeby galeria się odświeżyła
                    searchInput.dispatchEvent(new Event('input'));
                }
            });
        }

        // 5. Ukrywanie podpowiedzi po kliknięciu gdziekolwiek indziej
        document.addEventListener('click', (e) => {
            if (e.target !== searchInput && e.target !== suggestionsBox) {
                if (suggestionsBox) suggestionsBox.style.display = "none";
            }
        });
    }

    // --- 4. DODATKI (STRZAŁKA I LICZNIK) ---
    const btt = document.getElementById('back-to-top');
    window.onscroll = () => { if (btt) btt.style.display = window.scrollY > 400 ? "block" : "none"; };
    if (btt) btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const counterEl = document.getElementById('frame-count');
    try {
        fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1')
        .then(r => r.json())
        .then(d => { 
            if (counterEl) counterEl.innerText = (200 + (d.value || 0)).toString().padStart(2, '0'); 
        });
    } catch (e) { 
        if (counterEl) counterEl.innerText = "200"; 
    }
});
