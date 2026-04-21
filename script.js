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
    }

    // 3. OBSŁUGA LIGHTBOXA
    function showImage(index) {
        if (!lightbox || !lightboxImg || images.length === 0) return;
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        lightbox.style.display = "flex";
        document.body.style.overflow = 'hidden';
    }

    // 4. EVENTY (KLIKANIE, STRZAŁKI, ZAMYKANIE)
    images.forEach((img, index) => {
        img.onclick = () => showImage(index);
    });

    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); showImage(currentIndex + 1); };
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); showImage(currentIndex - 1); };

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
            if (touchendX < touchstartX - 50) showImage(currentIndex + 1);
            if (touchendX > touchstartX + 50) showImage(currentIndex - 1);
        }, {passive: true});
    }

    // 6. KLAWIATURA I OCHRONA
    document.onkeydown = (e) => {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowRight") showImage(currentIndex + 1);
            if (e.key === "ArrowLeft") showImage(currentIndex - 1);
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
            // Używamy unikalnej przestrzeni 'alan_lysiak_portfolio' i klucza 'pentax_v1'
            const r = await fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1');
            const d = await r.json();
            
            // Abacus zwraca wynik pod nazwą 'value'
            if (d && d.value !== undefined) {
                // Sumujemy nowe wejścia z Twoją bazą 120
                const realCount = baseVisits + d.value;
                el.innerText = realCount.toString().padStart(2, '0');
            }
        } catch (err) {
            console.log("Serwer licznika zablokowany przez AdBlocka lub awarię:", err);
            // Jeśli komuś AdBlock zablokuje skrypt, to przynajmniej wyświetlimy 
            // Twoją bazę (120), żeby aparat nie był pusty, ani nie pokazywał 36!
            el.innerText = baseVisits.toString().padStart(2, '0');
        }
    }
    getGlobalVisits();
});
