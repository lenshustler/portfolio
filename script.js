document.addEventListener('DOMContentLoaded', async () => {
    // ==========================================
    // 1. KONFIGURACJA SANITY
    // ==========================================
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio'; 
    const grid = document.querySelector('.gallery-grid');

    // Pobieramy WSZYSTKIE zdjęcia typu photo (usuwamy filtr Highlight z zapytania)
    const QUERY = `*[_type == "photo"] | order(_createdAt desc) {
        title,
        isHighlight,
        categories,
        "imageUrl": image.asset->url
    }`;
    
    const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;

    let images = [];

    // ==========================================
    // 2. POBIERANIE ZDJĘĆ I BUDOWANIE GALERII
    // ==========================================
    if (grid) {
        try {
            console.log("Łączenie z Sanity (Dataset: " + DATASET + ")...");
            const response = await fetch(URL);
            const data = await response.json();
            
            console.log("Dane odebrane:", data);

            let photos = data.result;

            if (!photos || photos.length === 0) {
                console.warn("Brak zdjęć w Sanity.");
                grid.innerHTML = "<p style='color:white; text-align:center;'>Baza danych jest pusta.</p>";
                return;
            }

            photos.sort(() => Math.random() - 0.5);
            grid.innerHTML = "";

            photos.forEach((photo, index) => {
                const card = document.createElement('div');
                card.classList.add('photo-card');
                
                // Jeśli zdjęcie NIE jest wyróżnione, na starcie dodajemy klasę hidden
                if (photo.isHighlight) {
                    card.classList.add('highlight');
                } else {
                    card.classList.add('hidden'); 
                }
                
                const categoryData = photo.categories ? photo.categories.join(' ') : '';
                card.setAttribute('data-category', categoryData);

                const img = document.createElement('img');
                img.src = photo.imageUrl + "?auto=format";
                img.alt = photo.title || 'Zdjęcie z portfolio';
                img.setAttribute('draggable', 'false');

                if (index < 6) {
                    img.removeAttribute('loading');
                } else {
                    img.setAttribute('loading', 'lazy');
                }
                img.setAttribute('decoding', 'async');

                card.appendChild(img);
                grid.appendChild(card);
                images.push(img);
            });

            setTimeout(() => { grid.style.opacity = "1"; }, 50);

            images.forEach((img, index) => {
                img.onclick = () => showImage(index);
            });

        } catch (error) {
            console.error('Błąd połączenia z Sanity:', error);
        }
    }

    // ==========================================
    // 3. OBSŁUGA LIGHTBOXA 
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');
    let currentIndex = 0;

    function showImage(index) {
        const visibleCards = Array.from(document.querySelectorAll('.photo-card:not(.hidden)'));
        const visibleImages = visibleCards.map(card => card.querySelector('img'));
        
        if (!lightbox || !lightboxImg || visibleImages.length === 0) return;
        
        let activeIndex = visibleImages.findIndex(img => img.src === images[index].src);
        if (activeIndex === -1) activeIndex = 0;

        nextBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let nextIdx = (activeIndex + 1) % visibleImages.length;
            const globalIdx = images.findIndex(img => img.src === visibleImages[nextIdx].src);
            showImage(globalIdx);
        };
        
        prevBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let prevIdx = (activeIndex - 1 + visibleImages.length) % visibleImages.length;
            const globalIdx = images.findIndex(img => img.src === visibleImages[prevIdx].src);
            showImage(globalIdx);
        };

        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        lightbox.style.display = "flex";
        document.body.style.overflow = 'hidden';
    }

    const closeLightbox = () => {
        if (lightbox) {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    };

    if (closeBtn) closeBtn.onclick = closeLightbox;
    if (lightbox) {
        lightbox.onclick = (e) => { if (e.target === lightbox || e.target === lightboxImg) closeLightbox(); };
    }

    let touchstartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
        lightbox.addEventListener('touchend', e => {
            let touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50 && nextBtn) nextBtn.click();
            if (touchendX > touchstartX + 50 && prevBtn) prevBtn.click();
        }, {passive: true});
    }

    document.onkeydown = (e) => {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowRight") nextBtn.click();
            if (e.key === "ArrowLeft") prevBtn.click();
            if (e.key === "Escape") closeLightbox();
        }
    };
    document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

    const backToTop = document.getElementById('back-to-top');
    window.onscroll = () => { if (backToTop) backToTop.style.display = window.scrollY > 300 ? "block" : "none"; };
    if (backToTop) backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    async function getGlobalVisits() {
        const el = document.getElementById('frame-count');
        if (!el) return;
        try {
            const r = await fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1');
            const d = await r.json();
            if (d && d.value !== undefined) {
                el.innerText = (200 + d.value).toString().padStart(2, '0');
            }
        } catch (err) {
            el.innerText = "200";
        }
    }
    getGlobalVisits();

    // ==========================================
    // 7. WYSZUKIWARKA
    // ==========================================
    function initArnoldSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const cards = document.querySelectorAll('.photo-card');

            cards.forEach(card => {
                const categories = (card.getAttribute('data-category') || "").toLowerCase();
                
                if (searchTerm === "") {
                    // Puste szukanie -> pokazujemy tylko Highlight
                    if (card.classList.contains('highlight')) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                } else if (categories.includes(searchTerm)) {
                    // Szukanie aktywne -> pokazujemy wszystko co pasuje
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }
    setTimeout(initArnoldSearch, 400); 
});
