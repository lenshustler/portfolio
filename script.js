document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. WYSZUKIWARKA I PODPOWIEDZI (FIXED)
    // ==========================================
    const searchInput = document.querySelector('.arnold-search');
    const suggestionsList = document.querySelector('.suggestions-list') || document.querySelector('.search-suggestions');
    const photoCards = document.querySelectorAll('.photo-card');

    // Pobranie danych do wyszukiwania z kart galerii (atrybut alt lub data-title)
    const searchItems = Array.from(photoCards).map(card => {
        const img = card.querySelector('img');
        const title = img ? (img.getAttribute('alt') || img.getAttribute('data-title') || '') : '';
        return { card, title: title.trim() };
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query === '') {
                if (suggestionsList) suggestionsList.style.display = 'none';
                photoCards.forEach(card => card.classList.remove('hidden'));
                return;
            }

            // Filtrowanie: sprawdzamy czy któreś słowo w tytule ZACZYNA SIĘ na wpisaną frazę
            const matches = searchItems.filter(item => {
                if (!item.title) return false;
                const words = item.title.toLowerCase().split(/\s+/);
                return words.some(word => word.startsWith(query));
            });

            // Ukrywanie/pokazywanie kart w galerii
            searchItems.forEach(item => {
                if (matches.includes(item)) {
                    item.card.classList.remove('hidden');
                } else {
                    item.card.classList.add('hidden');
                }
            });

            // Generowanie listy podpowiedzi
            if (suggestionsList) {
                suggestionsList.innerHTML = '';
                const uniqueTitles = [...new Set(matches.map(m => m.title))];

                if (uniqueTitles.length > 0) {
                    uniqueTitles.forEach(title => {
                        const li = document.createElement('li');
                        li.className = 'suggestion-item';
                        li.textContent = title;
                        li.addEventListener('click', () => {
                            searchInput.value = title;
                            suggestionsList.style.display = 'none';
                            searchItems.forEach(item => {
                                if (item.title.toLowerCase() === title.toLowerCase()) {
                                    item.card.classList.remove('hidden');
                                } else {
                                    item.card.classList.add('hidden');
                                }
                            });
                        });
                        suggestionsList.appendChild(li);
                    });
                    suggestionsList.style.display = 'block';
                } else {
                    suggestionsList.style.display = 'none';
                }
            }
        });

        // Zamknięcie podpowiedzi po kliknięciu poza wyszukiwarkę
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && suggestionsList && !suggestionsList.contains(e.target)) {
                suggestionsList.style.display = 'none';
            }
        });
    }

    // ==========================================
    // 2. PRZYCISK LOSOWE ZDJĘCIE (#random-btn)
    // ==========================================
    const randomBtn = document.querySelector('#random-btn');
    if (randomBtn && photoCards.length > 0) {
        randomBtn.addEventListener('click', () => {
            const visibleCards = Array.from(photoCards).filter(card => !card.classList.contains('hidden'));
            if (visibleCards.length === 0) return;
            const randomCard = visibleCards[Math.floor(Math.random() * visibleCards.length)];
            const img = randomCard.querySelector('img');
            if (img) {
                openLightbox(img.src, img.alt || '');
            }
        });
    }

    // ==========================================
    // 3. LIGHTBOX (PODGLĄD ZDJĘĆ + ZOOM + NAWIGACJA)
    // ==========================================
    const lightbox = document.querySelector('.lightbox');
    const lightboxContent = document.querySelector('.lightbox-content');
    const closeLightboxBtn = document.querySelector('.lightbox .close') || document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox .prev');
    const nextBtn = document.querySelector('.lightbox .next');

    let currentIndex = 0;
    const getVisibleImages = () => Array.from(photoCards)
        .filter(card => !card.classList.contains('hidden'))
        .map(card => card.querySelector('img'))
        .filter(Boolean);

    function openLightbox(src, alt) {
        if (!lightbox || !lightboxContent) return;
        lightboxContent.src = src;
        lightboxContent.alt = alt;
        lightbox.classList.add('active');
        document.documentElement.classList.add('modal-open');

        const imgs = getVisibleImages();
        currentIndex = imgs.findIndex(img => img.src === src);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.documentElement.classList.remove('modal-open');
        if (lightboxContent) lightboxContent.classList.remove('zoomed');
    }

    photoCards.forEach((card) => {
        const img = card.querySelector('img');
        if (img) {
            img.addEventListener('click', () => {
                openLightbox(img.src, img.alt || '');
            });
        }
    });

    if (closeLightboxBtn) {
        closeLightboxBtn.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgs = getVisibleImages();
            if (imgs.length === 0) return;
            currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
            lightboxContent.src = imgs[currentIndex].src;
            lightboxContent.alt = imgs[currentIndex].alt || '';
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgs = getVisibleImages();
            if (imgs.length === 0) return;
            currentIndex = (currentIndex + 1) % imgs.length;
            lightboxContent.src = imgs[currentIndex].src;
            lightboxContent.alt = imgs[currentIndex].alt || '';
        });
    }

    // Przełączanie zoomu po kliknięciu na zdjęcie w lightboxie
    if (lightboxContent) {
        lightboxContent.addEventListener('click', () => {
            lightboxContent.classList.toggle('zoomed');
        });
    }

    // Obsługa klawiatury (Esc, strzałki)
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
        if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });

    // ==========================================
    // 4. STRZAŁKA POWROTU DO GÓRY (#back-to-top)
    // ==========================================
    const backToTopBtn = document.querySelector('#back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================
    // 5. OBSŁUGA MODALI
    // ==========================================
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal-target');
            const modal = document.querySelector(modalId);
            if (modal) {
                modal.classList.add('active');
                document.documentElement.classList.add('modal-open');
            }
        });
    });

    const modalCloseBtns = document.querySelectorAll('.custom-modal-close, .custom-modal');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target === btn || e.target.classList.contains('custom-modal-close')) {
                const modal = btn.closest('.custom-modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.documentElement.classList.remove('modal-open');
                }
            }
        });
    });

    // ==========================================
    // 6. LICZNIK Klatek (#frame-count)
    // ==========================================
    const frameCountEl = document.querySelector('#frame-count');
    if (frameCountEl) {
        let currentFrame = Math.floor(Math.random() * 36) + 1;
        frameCountEl.textContent = String(currentFrame).padStart(2, '0');
    }

    // ==========================================
    // 7. PRZEŁĄCZNIK JĘZYKÓW (PL / EN)
    // ==========================================
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
