document.addEventListener('DOMContentLoaded', () => {
    // 1. ELEMENTY
    const grid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const backToTop = document.getElementById('back-to-top');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');

    let images = [];
    let currentIndex = 0;

    // 2. MIESZANIE ZDJĘĆ I INTELIGENTNE ŁADOWANIE (Zoptymalizowane)
    const cards = Array.from(document.querySelectorAll('.photo-card'));
    if (grid && cards.length > 0) {
        cards.sort(() => Math.random() - 0.5);
        grid.innerHTML = "";
        cards.forEach((card, index) => {
            grid.appendChild(card);
            const img = card.querySelector('img');
            if (img) {
                images.push(img);
                img.setAttribute('draggable', 'false');
                
                // Przydzielanie priorytetu po potasowaniu
                if (index < 6) {
                    // Pierwsze 6 zdjęć na samej górze ładuje się błyskawicznie
                    img.removeAttribute('loading');
                    img.setAttribute('decoding', 'async');
                } else {
                    // Reszta zdjęć czeka, aż zaczniesz scrollować w dół
                    img.setAttribute('loading', 'lazy');
                    img.setAttribute('decoding', 'async');
                }
            }
        });

        // TAA-DAA! Magia! Płynnie pokazuje całą galerię DOPIERO, gdy wszystko jest ułożone
        setTimeout(() => {
            grid.style.opacity = "1";
        }, 50);
    }

    // 3. OBSŁUGA LIGHTBOXA (Z uwzględnieniem filtrowania wyszukiwarki)
    function showImage(index) {
        const visibleImages = images.filter(img => !img.parentElement.classList.contains('hidden'));
        
        if (!lightbox || !lightboxImg || visibleImages.length === 0) return;
        
        let activeIndex = visibleImages.findIndex(img => img.src === images[index].src);
        if (activeIndex === -1) activeIndex = 0;

        nextBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let nextIndex = activeIndex + 1;
            if (nextIndex >= visibleImages.length) nextIndex = 0;
            let globalNextIndex = images.findIndex(img => img.src === visibleImages[nextIndex].src);
            showImage(globalNextIndex);
        };
        
        prevBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let prevIndex = activeIndex - 1;
            if (prevIndex < 0) prevIndex = visibleImages.length - 1;
            let globalPrevIndex = images.findIndex(img => img.src === visibleImages[prevIndex].src);
            showImage(globalPrevIndex);
        };

        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        lightbox.style.display = "flex";
        document.body.style.overflow = 'hidden';
    }

    // 4. EVENTY (KLIKANIE, ZAMYKANIE)
    images.forEach((img, index) => {
        img.onclick = () => showImage(index);
    });

    const closeLightbox = () => {
        lightbox.style.display = "none";
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.onclick = closeLightbox;
    if (lightbox) {
        lightbox.onclick = (e) => { if (e.target === lightbox || e.target === lightboxImg) closeLightbox(); };
    }

    // 5. GESTY SWIPE
    let touchstartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
        lightbox.addEventListener('touchend', e => {
            let touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50 && nextBtn) nextBtn.click();
            if (touchendX > touchstartX + 50 && prevBtn) prevBtn.click();
        }, {passive: true});
    }

    // 6. KLAWIATURA I OCHRONA
    document.onkeydown = (e) => {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
            if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
            if (e.key === "Escape") closeLightbox();
        }
    };
    document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

    // 7. POWRÓT NA GÓRĘ
    window.onscroll = () => { if (backToTop) backToTop.style.display = window.scrollY > 300 ? "block" : "none"; };
    if (backToTop) backToTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 8. LICZNIK (BEZPIECZNA FUNKCJA - POKAZUJE PEŁNĄ LICZBĘ WEJŚĆ)
    async function getGlobalVisits() {
        const el = document.getElementById('frame-count');
        if (!el) return;

        // Twoja ciężko wypracowana baza (wpisz tu ile chcesz)
        const baseVisits = 200; 

        try {
            // Uderzamy do nowego, szybkiego serwera API (Abacus)
            const r = await fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1');
            const d = await r.json();
            
            // Abacus zwraca wynik pod nazwą 'value'
            if (d && d.value !== undefined) {
                // Sumujemy nowe wejścia z Twoją bazą
                const realCount = baseVisits + d.value;
                el.innerText = realCount.toString().padStart(2, '0');
            }
        } catch (err) {
            console.log("Serwer licznika zablokowany przez AdBlocka lub awarię:", err);
            el.innerText = baseVisits.toString().padStart(2, '0');
        }
    }
    getGlobalVisits();

    // 9. SILNIK WYSZUKIWANIA (STYL ARNOLDA)
    function initArnoldSearch() {
        const searchInput = document.getElementById('search-input');
        
        if (!searchInput || !cards.length) return;

        // Na start: Ukrywamy wszystko OPRÓCZ zdjęć z klasą "highlight"
        cards.forEach(card => {
            if (!card.classList.contains('highlight')) {
                card.classList.add('hidden');
            }
        });

        // Nasłuchiwanie wpisywania tekstu
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            cards.forEach(card => {
                const category = (card.getAttribute('data-category') || "").toLowerCase();
                
                // Jeśli pole jest puste, wracamy do trybu "highlight"
                if (searchTerm === "") {
                    if (card.classList.contains('highlight')) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                } 
                // Sprawdzamy, czy kategoria ZAWIERA ten tekst
                else if (category.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } 
                // Ukrywamy to, co nie pasuje
                else {
                    card.classList.add('hidden');
                }
            });
        });
    }
    initArnoldSearch();
});