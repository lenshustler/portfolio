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
    let visibleImages = []; 
    let activeIdx = 0;
    let clickTimer = null; 

    // --- 1. POBIERANIE DANYCH ---
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
                    card.classList.add(photo.isHighlight ? 'highlight' : 'hidden');
                    card.setAttribute('data-category', (photo.categories || []).join(' '));
                    
                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.setAttribute('draggable', 'false');
                    
                    img.onclick = () => openLightboxFromImage(img);
                    
                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });
                grid.style.opacity = "1";
            }
        } catch (e) { console.error("Błąd połączenia z Sanity:", e); }
    }

    // --- 2. LOGIKA LIGHTBOXA ---
    function openLightboxFromImage(clickedImg) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(clickedImg);
        
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // POPRAWIONA FUNKCJA - eliminacja skakania
    function updateLightbox() {
        if (visibleImages.length > 0) {
            // Wyłączamy animację na moment zmiany źródła obrazka
            lightboxImg.style.transition = 'none';
            
            lightboxImg.src = visibleImages[activeIdx].src;
            
            // Reset zoomu
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.transform = 'scale(1.0)';
            
            // Wymuszamy na przeglądarce odświeżenie i włączamy płynne przejście z powrotem
            requestAnimationFrame(() => {
                lightboxImg.style.transition = 'transform 0.3s ease';
            });
        }
    }

    // Obsługa kliknięcia w zdjęcie
    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                lightboxImg.classList.toggle('zoomed');
                lightboxImg.style.transform = lightboxImg.classList.contains('zoomed') ? 'scale(2.0)' : 'scale(1.0)';
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    if (!lightboxImg.classList.contains('zoomed')) {
                        closeBtn.onclick();
                    }
                }, 250);
            }
        });
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            if (visibleImages.length === 0) return;
            activeIdx = (activeIdx + 1) % visibleImages.length;
            updateLightbox();
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            if (visibleImages.length === 0) return;
            activeIdx = (activeIdx - 1 + visibleImages.length) % visibleImages.length;
            updateLightbox();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.transform = 'scale(1.0)';
        };
    }

    if (lightbox) {
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeBtn.onclick();
        };
    }

    // Swipe
    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            // Zwiększamy próg na 30, żeby było czulsze, ale stabilne
            if (Math.abs(diff) > 30) diff > 0 ? prevBtn.click() : nextBtn.click();
        }, { passive: true });
    }

    // Klawiatura
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "Escape") closeBtn.onclick();
    });

    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });

    // --- 3. WYSZUKIWARKA ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    const suggestionsBox = document.getElementById('search-suggestions');
    const defaultTags = ['street', 'portret', 'abstrakcja', 'monochrome', 'generator'];

    const performSearch = () => {
        const term = searchInput.value.toLowerCase().trim();
        if (term === 'generator') { window.location.href = 'generator/index.html'; return; }

        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = (card.getAttribute('data-category') || "").toLowerCase().split(' ');
            const isMatch = term === "" ? card.classList.contains('highlight') : cats.some(w => w.startsWith(term));
            card.classList.toggle('hidden', !isMatch);
        });
        if (suggestionsBox) suggestionsBox.style.display = "none";
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term === "") {
                if (suggestionsBox) {
                    suggestionsBox.innerHTML = defaultTags.map(t => `<li>${t}</li>`).join('');
                    suggestionsBox.style.display = "block";
                }
            } else {
                const cards = document.querySelectorAll('.photo-card');
                let matches = new Set();
                cards.forEach(c => c.getAttribute('data-category').split(' ').forEach(cat => {if(cat.startsWith(term)) matches.add(cat)}));
                
                if (suggestionsBox) {
                    suggestionsBox.innerHTML = Array.from(matches).map(m => `<li>${m}</li>`).join('');
                    suggestionsBox.style.display = matches.size > 0 ? "block" : "none";
                }
            }
        });

        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
        
        if (suggestionsBox) suggestionsBox.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                searchInput.value = e.target.textContent;
                performSearch();
            }
        });
    }

    // --- 4. DODATKI ---
    const btt = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => { if (btt) btt.style.display = window.scrollY > 400 ? "block" : "none"; });
    if (btt) btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const counterEl = document.getElementById('frame-count');
    if (counterEl) {
        fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1')
        .then(r => r.json())
        .then(d => counterEl.innerText = (200 + (d.value || 0)).toString().padStart(2, '0'))
        .catch(() => counterEl.innerText = "200");
    }
});
