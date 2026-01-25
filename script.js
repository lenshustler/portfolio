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

    // 2. MIESZANIE ZDJĘĆ
    const cards = Array.from(document.querySelectorAll('.photo-card'));
    if (grid && cards.length > 0) {
        cards.sort(() => Math.random() - 0.5);
        grid.innerHTML = "";
        cards.forEach(card => {
            grid.appendChild(card);
            const img = card.querySelector('img');
            if (img) {
                images.push(img);
                img.setAttribute('draggable', 'false');
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

    // 8. LICZNIK (BEZPIECZNA FUNKCJA)
    async function getVisits() {
        const el = document.getElementById('frame-count');
        if (!el) return;
        
        // Zmieniamy nazwę na unikalną, żeby stworzyć nową bazę
        const key = "alan_pentax_final_v10"; 
        
        try {
            // Używamy endpointu 'up', który zwiększa licznik o 1 przy każdym odświeżeniu
            const r = await fetch(`https://api.counterapi.dev/v1/user/${key}/up`);
            const d = await r.json();
            
            if (d && d.count !== undefined) {
                el.innerText = d.count.toString().padStart(2, '0');
            }
        } catch (err) {
            console.log("Błąd licznika:", err);
            el.innerText = "36"; 
        }
    }
    getVisits();
});
