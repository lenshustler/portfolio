document.addEventListener('DOMContentLoaded', async () => {
    // ==========================================
    // 1. KONFIGURACJA SANITY
    // ==========================================
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio'; 
    const grid = document.querySelector('.gallery-grid');

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
            console.log("Łączenie z Sanity...");
            const response = await fetch(URL);
            const data = await response.json();
            let photos = data.result;

            if (!photos || photos.length === 0) {
                grid.innerHTML = "<p style='color:black; text-align:center; grid-column: 1 / -1; margin-top: 50px;'>Baza danych jest pusta.</p>";
            } else {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                photos.forEach((photo, index) => {
                    const card = document.createElement('div');
                    card.classList.add('photo-card');
                    
                    // Pokazujemy WSZYSTKIE zdjęcia od razu
                    const categoryData = photo.categories ? photo.categories.join(' ') : '';
                    card.setAttribute('data-category', categoryData);

                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.alt = photo.title || 'Zdjęcie';
                    img.setAttribute('draggable', 'false');
                    img.setAttribute('loading', index < 6 ? 'eager' : 'lazy');

                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });

                grid.style.opacity = "1";

                images.forEach((img, index) => {
                    img.onclick = () => showImage(index);
                });
            }
        } catch (error) {
            console.error('Błąd Sanity:', error);
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

    function showImage(index) {
        const visibleCards = Array.from(document.querySelectorAll('.photo-card:not(.hidden)'));
        const visibleImages = visibleCards.map(card => card.querySelector('img'));
        
        if (!lightbox || !lightboxImg || visibleImages.length === 0) return;
        
        let activeIndex = visibleImages.findIndex(img => img.src === images[index].src);
        if (activeIndex === -1) activeIndex = 0;

        nextBtn.onclick = (e) => { 
            e.stopPropagation(); 
            activeIndex = (activeIndex + 1) % visibleImages.length;
            lightboxImg.src = visibleImages[activeIndex].src;
        };
        
        prevBtn.onclick = (e) => { 
            e.stopPropagation(); 
            activeIndex = (activeIndex - 1 + visibleImages.length) % visibleImages.length;
            lightboxImg.src = visibleImages[activeIndex].src;
        };

        lightboxImg.src = images[index].src;
        lightbox.classList.add('active'); 
        document.body.style.overflow = 'hidden';
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    }

    if (lightbox) {
        lightbox.onclick = (e) => { 
            if (e.target === lightbox || e.target === lightboxImg) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        };
    }

    // ==========================================
    // 4. STRZAŁKA I LICZNIK
    // ==========================================
    const backToTop = document.getElementById('back-to-top');
    window.onscroll = () => { 
        if (backToTop) {
            backToTop.style.display = window.scrollY > 300 ? "block" : "none"; 
        }
    };
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
        } catch (err) { el.innerText = "200"; }
    }
    getGlobalVisits();

    // ==========================================
    // 5. WYSZUKIWARKA
    // ==========================================
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.photo-card').forEach(card => {
                const cat = (card.getAttribute('data-category') || "").toLowerCase();
                card.classList.toggle('hidden', term !== "" && !cat.includes(term));
            });
        });
    }
});
