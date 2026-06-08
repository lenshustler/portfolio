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

    let isMoving = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;

    // ==========================================================================
    // STREFA JĘZYKOWA & SŁOWNIKI TAGÓW
    // ==========================================================================
    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    // Słownik tagów dla autouzupełniania wyszukiwarki
    const tagsData = {
        pl: [
            "ricoh", "nikon", "olympus", "fujifilm", "leica", "pentax",
            "batman", "spiderman", "blackwhite", "monochrome", "abstract", "doublexposure",
            "polska", "gdynia", "gdansk", "sopot", "poznan", "praga", "czechy", 
            "wlochy", "sycylia", "katania", "wenecja", "etna", "hiszpania", "austria", 
            "wieden", "lotwa", "ryga", "litwa", "estonia", "holandia", "amsterdam", 
            "cypr", "czarnogora", "balkany", "chorwacja", "lichtenstein",
            "czarnobiale", "monochromatyczne", "abstrakcja", "portret", "ulica", "street",
            "krajobraz", "dlugi czas", "podroz", "podwojna ekspozycja", "refraktografia", 
            "urban", "noc", "zima", "zorza", "selfie",
            "plaza", "morze", "samochod", "rower", "pociag", "buty", "kwiaty", "znaki", 
            "lis", "pies", "kot", "ptaki", "krowa", "deskorolka"
        ],
        en: [
            "ricoh", "nikon", "olympus", "fujifilm", "leica", "pentax",
            "batman", "spiderman", "blackwhite", "monochrome", "abstract", "doublexposure",
            "poland", "gdynia", "gdansk", "sopot", "poznan", "prague", "czech", 
            "italy", "sicily", "catania", "venice", "etna", "spain", "austria", 
            "vienna", "latvia", "riga", "lithuania", "estonia", "netherlands", "amsterdam", 
            "cyprus", "montenegro", "balkans", "croatia", "lichtenstein",
            "portrait", "street", "landscape", "longexposure", "travel", 
            "refractography", "urban", "night", "winter", "aurora", "selfie",
            "beach", "sea", "car", "bicycle", "train", "shoes", "flowers", "signs", 
            "fox", "dog", "cat", "birds", "cow", "skateboard"
        ]
    };

    // Mapowanie tagów (Łączenie fraz wpisanych przez użytkownika z bazą Sanity)
    const tagTranslations = {
        "poland": "polska",
        "prague": "praga",
        "czech": "czech",
        "italy": "wlochy",
        "sicily": "sicily",
        "sycylia": "sicily",
        "venice": "venezia",
        "wenecja": "venezia",
        "spain": "hiszpania",
        "vienna": "wieden",
        "viena": "wieden",
        "wiedien": "wieden",
        "latvia": "lotwa",
        "riga": "ryga",
        "lithuania": "litwa",
        "netherlands": "holandia",
        "cyprus": "cypr",
        "montenegro": "montenegro",
        "czarnogora": "montenegro",
        "balkans": "balkany",
        "balkany": "balkany",
        "croatia": "chorwacja",
        "czarnobiale": "czarnobiale",
        "czarnobialy": "czarnobiale",
        "abstrakcja": "abstrakcja",
        "portrait": "portret",
        "landscape": "krajobraz",
        "longexposure": "longexposure",
        "night": "noc",
        "winter": "zima",
        "aurora": "zorza",
        "beach": "plaza",
        "sea": "morze",
        "car": "samochod",
        "bicycle": "rower",
        "train": "pociag",
        "shoes": "buty",
        "flower": "kwiaty",
        "flowers": "kwiaty",
        "kwiat": "kwiaty",
        "signs": "znaki",
        "fox": "lis",
        "dog": "pies",
        "cat": "kot",
        "bird": "ptaki",
        "ptak": "ptaki",
        "cow": "krowa",
        "skateboard": "skateboard"
    };

    // Domyślne tagi wyświetlane po kliknięciu w pustą wyszukiwarkę
    const defaultTags = {
        pl: ['street', 'portret', 'abstrakcja', 'monochrome', 'generator'],
        en: ['street', 'portrait', 'abstract', 'monochrome', 'generator']
    };

    // Tłumaczenia elementów interfejsu (UI) HTML
    const uiTranslations = {
        pl: {
            searchPlaceholder: "SZUKAJ...",
            searchBtn: "SZUKAJ",
            linkAbout: "O MNIE",
            linkContact: "KONTAKT",
            modalAboutTitle: "O MNIE",
            modalAboutDesc: "Nazywam się Alan Łysiak. Zajmuję się fotografią uliczną, dokumentalną oraz eksperymentalną. Moje portfolio to zapis momentów, geometrii miast i nieoczywistych struktur rzeczywistości uchwyconych za pomocą aparatów analogowych i cyfrowych.",
            modalContactTitle: "KONTAKT",
            modalContactDesc: "Jeśli chcesz nawiązać współpracę, zakupić odbitki lub po prostu porozmawiać o fotografii – napisz do mnie bezpośrednio lub za pośrednictwem mediów społecznościowych.",
            contactBtn: "NAPISZ"
        },
        en: {
            searchPlaceholder: "SEARCH...",
            searchBtn: "SEARCH",
            linkAbout: "ABOUT",
            linkContact: "CONTACT",
            modalAboutTitle: "ABOUT ME",
            modalAboutDesc: "My name is Alan Łysiak. I specialize in street, documentary, and experimental photography. This portfolio is a collection of fleeting moments, urban geometry, and unconventional textures of reality captured through both analog and digital lenses.",
            modalContactTitle: "CONTACT",
            modalContactDesc: "If you would like to collaborate, purchase prints, or simply talk about photography – feel free to reach out directly or via social media.",
            contactBtn: "MESSAGE"
        }
    };

    function updatePageLanguage() {
        // Aktualizacja klas aktywności w przełączniku języków
        document.querySelectorAll('.lang-switch span').forEach(span => {
            span.classList.toggle('active', span.getAttribute('data-lang') === currentLang);
        });

        const langData = uiTranslations[currentLang];
        
        // Dynamiczne podstawianie tekstów w HTML
        const searchInp = document.getElementById('search-input');
        if (searchInp) searchInp.placeholder = langData.searchPlaceholder;

        const searchB = document.querySelector('.search-btn');
        if (searchB) searchB.textContent = langData.searchBtn;

        const triggerAbout = document.querySelector('.modal-trigger[data-target="modal-about"]');
        if (triggerAbout) triggerAbout.textContent = langData.linkAbout;

        const triggerContact = document.querySelector('.modal-trigger[data-target="modal-contact"]');
        if (triggerContact) triggerContact.textContent = langData.linkContact;

        const aboutTitle = document.querySelector('#modal-about h2');
        if (aboutTitle) aboutTitle.textContent = langData.modalAboutTitle;

        const aboutDesc = document.querySelector('#modal-about .modal-description');
        if (aboutDesc) aboutDesc.textContent = langData.modalAboutDesc;

        const contactTitle = document.querySelector('#modal-contact h2');
        if (contactTitle) contactTitle.textContent = langData.modalContactTitle;

        const contactDesc = document.querySelector('#modal-contact .modal-description');
        if (contactDesc) contactDesc.textContent = langData.modalContactDesc;

        document.querySelectorAll('.contact-card-btn').forEach(btn => {
            btn.textContent = langData.contactBtn;
        });
    }

    // Obsługa kliknięć w przełącznik języków PL / EN
    document.querySelectorAll('.lang-switch span').forEach(span => {
        span.addEventListener('click', () => {
            const selectedLang = span.getAttribute('data-lang');
            if (selectedLang !== currentLang) {
                currentLang = selectedLang;
                localStorage.setItem('portfolio_lang', currentLang);
                updatePageLanguage();
                performSearch(); // Przeładuj filtry galerii dla nowego języka
            }
        });
    });

    // Inicjalizacja języka na starcie
    updatePageLanguage();

    // ==========================================================================
    // --- 1. LOGIKA OKIENEK (MODALI) ---
    // ==========================================================================
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modalCloses = document.querySelectorAll('.custom-modal-close');
    const modals = document.querySelectorAll('.custom-modal');

    function closeAllModals() {
        modals.forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
        if (lightbox && !lightbox.classList.contains('active')) {
            document.documentElement.classList.remove('modal-open');
        }
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetId = trigger.getAttribute('data-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.documentElement.classList.add('modal-open');
            }
        });
    });

    modalCloses.forEach(closeBtnEl => {
        closeBtnEl.addEventListener('click', closeAllModals);
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // ==========================================================================
    // --- 2. POBIERANIE DANYCH Z SANITY ---
    // ==========================================================================
    if (grid) {
        try {
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
            
            const response = await fetch(URL);
            const data = await response.json();
            const photos = data.result;

            if (photos && photos.length > 0) {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                const seoDiv = document.createElement('div');
                seoDiv.style.display = 'none';
                seoDiv.innerHTML = '<h1>Portfolio fotograficzne Alan Łysiak</h1><p>&copy; 2026 Alan Łysiak. Wszystkie prawa zastrzeżone.</p>';
                grid.appendChild(seoDiv);

                photos.forEach((photo) => {
                    if (!photo.imageUrl) return;

                    const card = document.createElement('div');
                    card.className = 'photo-card';
                    card.classList.add(photo.isHighlight ? 'highlight' : 'hidden');
                    
                    // Bezpieczne czyszczenie i zapisywanie kategorii z Sanity
                    const cleanCategories = (photo.categories || []).map(c => c.trim().toLowerCase());
                    card.setAttribute('data-category', cleanCategories.join(' '));
                    
                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format&w=450&q=70";
                    img.setAttribute('data-fullsrc', photo.imageUrl);
                    img.setAttribute('draggable', 'false');
                    img.loading = "lazy"; 
                    img.alt = photo.title || "Zdjęcie";
                    
                    img.onclick = () => openLightboxFromImage(img);
                    
                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });
                grid.style.opacity = "1";
            } else {
                console.log("Brak zdjęć do wyświetlenia w bazie Sanity.");
            }
        } catch (e) { 
            console.error("Błąd połączenia z Sanity:", e); 
        }
    }

    // ==========================================================================
    // --- 3. LOGIKA LIGHTBOXA ---
    // ==========================================================================
    function openLightboxFromImage(clickedImg) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(clickedImg);
        
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox();
        if (lightbox) lightbox.classList.add('active');
        document.documentElement.classList.add('modal-open');
    }

    function resetZoom() {
        currentX = 0;
        currentY = 0;
        if (lightboxImg) {
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(1.0)';
        }
    }

    function preloadAdjacentImages(isMobile) {
        if (visibleImages.length <= 1) return;
        
        const config = isMobile ? "?auto=format&w=1000&q=82" : "?auto=format&w=1600&q=82";
        const nextIdx = (activeIdx + 1) % visibleImages.length;
        const prevIdx = (activeIdx - 1 + visibleImages.length) % visibleImages.length;
        
        const nextCache = new Image();
        nextCache.src = visibleImages[nextIdx].getAttribute('data-fullsrc') + config;
        
        const prevCache = new Image();
        prevCache.src = visibleImages[prevIdx].getAttribute('data-fullsrc') + config;
    }

    function updateLightbox() {
        if (visibleImages.length > 0 && lightboxImg) {
            lightboxImg.style.opacity = '0';
            
            setTimeout(() => {
                const baseUrl = visibleImages[activeIdx].getAttribute('data-fullsrc');
                const isMobile = window.innerWidth < 768;
                
                const config = isMobile ? "?auto=format&w=1000&q=82" : "?auto=format&w=1600&q=82";
                lightboxImg.src = baseUrl + config;
                
                resetZoom();
                preloadAdjacentImages(isMobile);
            }, 40);
        }
    }

    if (lightboxImg) {
        lightboxImg.decoding = "async";
        
        lightboxImg.onload = () => {
            lightboxImg.style.opacity = '1';
        };

        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;

                if (isTouchDevice) {
                    lightboxImg.classList.toggle('zoomed');
                    if (lightboxImg.classList.contains('zoomed')) {
                        lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(2.0)';
                    } else {
                        resetZoom();
                    }
                }
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    if (!lightboxImg.classList.contains('zoomed') && closeBtn) {
                        closeBtn.onclick();
                    }
                }, 250);
            }
        });

        lightboxImg.addEventListener('touchstart', (e) => {
            if (!lightboxImg.classList.contains('zoomed') || e.touches.length !== 1) return;
            isMoving = true;
            lightboxImg.style.transition = 'none';
            startX = e.touches[0].clientX - currentX;
            startY = e.touches[0].clientY - currentY;
        }, { passive: true });

        lightboxImg.addEventListener('touchmove', (e) => {
            if (!isMoving || !lightboxImg.classList.contains('zoomed')) return;
            
            currentX = e.touches[0].clientX - startX;
            currentY = e.touches[0].clientY - startY;

            const maxDrag = window.innerWidth * 0.4;
            if (currentX > maxDrag) currentX = maxDrag;
            if (currentX < -maxDrag) currentX = -maxDrag;
            if (currentY > maxDrag) currentY = maxDrag;
            if (currentY < -maxDrag) currentY = -maxDrag;

            lightboxImg.style.transform = `translate3d(${currentX}px, ${currentY}px, 0px) scale(2.0)`;
        }, { passive: true });

        lightboxImg.addEventListener('touchend', () => {
            if (!isMoving) return;
            isMoving = false;
            lightboxImg.style.transition = 'transform 0.3s ease, opacity 0.06s ease-in-out';
        });
    }

    if (nextBtn) { nextBtn.onclick = (e) => { e.stopPropagation(); if (visibleImages.length > 0) { activeIdx = (activeIdx + 1) % visibleImages.length; updateLightbox(); } }; }
    if (prevBtn) { prevBtn.onclick = (e) => { e.stopPropagation(); if (visibleImages.length > 0) { activeIdx = (activeIdx - 1 + visibleImages.length) % visibleImages.length; updateLightbox(); } }; }
    
    if (closeBtn) { 
        closeBtn.onclick = () => { 
            if (lightbox) lightbox.classList.remove('active'); 
            let anyModalActive = Array.from(modals).some(m => m.classList.contains('active'));
            if (!anyModalActive) document.documentElement.classList.remove('modal-open');
            resetZoom(); 
        }; 
    }
    if (lightbox) { lightbox.onclick = (e) => { if (e.target === lightbox && closeBtn) closeBtn.onclick(); }; }

    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
        lightbox.addEventListener('touchend', e => {
            if (lightboxImg && lightboxImg.classList.contains('zoomed')) return; 
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff > 0 && prevBtn) prevBtn.click();
                if (diff < 0 && nextBtn) nextBtn.click();
            }
        }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            if (lightbox && lightbox.classList.contains('active') && closeBtn) {
                closeBtn.onclick();
            }
            closeAllModals();
        }
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
        if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
    });

    // ==========================================================================
    // --- 4. WYSZUKIWARKA (DWUJĘZYCZNA + MAPOWANIE) ---
    // ==========================================================================
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    const suggestionsBox = document.querySelector('.suggestions-list');

    const performSearch = () => {
        if (!searchInput) return;
        let term = searchInput.value.toLowerCase().trim();
        if (term === 'generator') { window.location.href = 'generator/index.html'; return; }

        // Mapowanie wpisanej frazy na język bazy Sanity
        const translatedTerm = tagTranslations[term] || term;

        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = (card.getAttribute('data-category') || "").split(' ');
            
            // Jeśli wyszukiwarka jest pusta, pokazujemy tylko wyróżnione zdjęcia (isHighlight)
            // W przeciwnym wypadku sprawdzamy zgodność z przetłumaczonym terminem lub oryginalnym wpisem
            const isMatch = term === "" ? 
                card.classList.contains('highlight') : 
                cats.some(w => w.startsWith(translatedTerm) || w.startsWith(term));
                
            card.classList.toggle('hidden', !isMatch);
        });
        if (suggestionsBox) suggestionsBox.style.display = "none";
    };

    if (searchInput && suggestionsBox) {
        // Kliknięcie w puste pole wyszukiwania podrzuca domyślne tagi w wybranym języku
        searchInput.addEventListener('click', () => {
            if (searchInput.value.trim() === "") {
                const currentDefaults = defaultTags[currentLang];
                suggestionsBox.innerHTML = currentDefaults.map(t => `<li>${t}</li>`).join('');
                suggestionsBox.style.display = "block";
            }
        });

        // Wpisywanie tekstu filtruje słownik i generuje dynamiczne podpowiedzi
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term === "") {
                const currentDefaults = defaultTags[currentLang];
                suggestionsBox.innerHTML = currentDefaults.map(t => `<li>${t}</li>`).join('');
                suggestionsBox.style.display = "block";
            } else {
                // Wybieramy słownik powiązany z aktualnie ustawionym językiem na stronie
                const currentDictionary = tagsData[currentLang];
                let matches = new Set();

                currentDictionary.forEach(tag => {
                    if (tag.startsWith(term)) {
                        matches.add(tag);
                    }
                });
                
                suggestionsBox.innerHTML = Array.from(matches).map(m => `<li>${m}</li>`).join('');
                suggestionsBox.style.display = matches.size > 0 ? "block" : "none";
            }
        });

        // Zamknięcie podpowiedzi przy kliknięciu poza wyszukiwarkę
        document.addEventListener('click', (e) => {
            if (e.target !== searchInput && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = "none";
            }
        });

        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
        
        // Wybór elementu z listy podpowiedzi
        suggestionsBox.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                searchInput.value = e.target.textContent;
                performSearch();
            }
        });
    }

    // ==========================================================================
    // --- 5. DODATKI ---
    // ==========================================================================
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
