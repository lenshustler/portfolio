document.addEventListener('DOMContentLoaded', () => {
    // 1. POBIERANIE ELEMENTÓW
    const grid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const backToTop = document.getElementById('back-to-top');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');

    let images = [];
    let currentIndex = 0;

    // 2. MIESZANIE I LISTA ZDJĘĆ
    const cards = Array.from(document.querySelectorAll('.photo-card'));
    if (grid && cards.length > 0) {
        cards.sort(() => Math.random() - 0.5);
        grid.innerHTML = "";
        cards.forEach(card => {
            grid.appendChild(card);
            const img = card.querySelector('img');
            if (img) {
                images.push(img);
                img.setAttribute('draggable', 'false'); // Ochrona przed przeciąganiem
            }
        });
    }

    // 3. FUNKCJA POKAZYWANIA ZDJĘCIA
    function showImage(index) {
        if (!lightbox || !lightboxImg || images.length === 0) return;
        
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        
        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        lightbox.style.display = "flex";
        document.body.style.overflow = 'hidden';
    }

    // 4. KLIKANIE W MINIATURKI
    images.forEach((img, index) => {
        img.style.cursor = "pointer";
        img.onclick = (e) => {
            e.preventDefault();
            showImage(index);
        };
    });

    // 5. STRZAŁKI NAWIGACJI
    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            showImage(currentIndex + 1);
        };
    }

    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            showImage(currentIndex - 1);
        };
    }

    // 6. ZAMYKANIE LIGHTBOXA
    const closeLightbox = () => {
        if (lightbox) {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    };

    if (closeBtn) closeBtn.onclick = closeLightbox;

    if (lightbox) {
        lightbox.onclick = (e) => {
            // Zamknij jeśli kliknięto w tło lub samo zdjęcie
            if (e.target === lightbox || e.target === lightboxImg) {
                closeLightbox();
            }
        };
    }

    // 7. GESTY SWIPE (Dla telefonów)
    let touchstartX = 0;
    let touchendX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, {passive: true});

        lightbox.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50) showImage(currentIndex + 1); // Swipe w lewo
            if (touchendX > touchstartX + 50) showImage(currentIndex - 1); // Swipe w prawo
        }, {passive: true});
    }

    // 8. PRZYCISK BACK TO TOP
    window.addEventListener('scroll', () => {
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.style.display = "block";
            } else {
                backToTop.style.display = "none";
            }
        }
    });

    if (backToTop) {
        backToTop.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // 9. KLAWIATURA I OCHRONA
    document.onkeydown = (e) => {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "ArrowRight") showImage(currentIndex + 1);
            if (e.key === "ArrowLeft") showImage(currentIndex - 1);
            if (e.key === "Escape") closeLightbox();
        }
    };

    // Blokada prawego przycisku na zdjęciach
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
});