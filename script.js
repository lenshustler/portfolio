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

    // --- 0. LOGIKA JĘZYKOWA (PL / EN) ---
    const translations = {
        pl: {
            seoTitle: "Alan Łysiak | Fotografia",
            seoDesc: "Alan Łysiak – Portfolio fotograficzne. | Street | Portret | Abstrakcja | Podwójne ekspozycję | Zobacz moje fotografie, ziny i projekty. Kontakt: lyskier@gmail.com",
            searchPlaceholder: "szukaj...",
            searchBtn: "Search",
            randomBtn: "Random",
            contactLink: "Kontakt",
            privacyLink: "Prywatność",
            termsLink: "Regulamin",
            backToTop: "Wróć na górę",
            
            // Lightbox
            prevImg: "Poprzednie zdjęcie",
            nextImg: "Następne zdjęcie",
            closeModal: "Zamknij",

            // Modal Kontakt
            contactTitle: "Kontakt",
            contactDesc: "Masz jakieś pytania lub chcesz podjąć współpracę? Napisz bezpośrednio na mój email.",
            contactSub1: "Napisz wiadomość",
            btnEmail: "Send Email",
            btnProfile: "View Profile",

            // Modal Prywatność
            privacyTitle: "Polityka Prywatności",
            privacyP1: "Ta strona szanuje Twoją prywatność. Używamy plików cookies (ciasteczek) oraz pamięci lokalnej przeglądarki wyłącznie w celach technicznych – do prawidłowego działania strony oraz obsługi licznika odwiedzin.",
            privacyP2: "Strona nie zbiera, nie przetwarza ani nie przekazuje Twoich danych osobowych firmom zewnętrznym w celach marketingowych.",

            // Modal Regulamin
            termsTitle: "Regulamin strony",
            termsP1: "Wszystkie fotografie oraz materiały prezentowane na tej stronie są własnością Alana Łysiaka i są chronione międzynarodowym prawem autorskim.",
            termsP2: "Kopiowanie, pobieranie, rozpowszechnianie, modyfikowanie lub jakiekolwiek komercyjne wykorzystanie zdjęć bez uprzedniej pisemnej zgody autora jest całkowicie zabronione."
        },
        en: {
            seoTitle: "Alan Łysiak | Photography",
            seoDesc: "Alan Łysiak – Photography Portfolio. | Street | Portrait | Abstract | Double exposure | Explore my photos, zines, and projects. Contact: lyskier@gmail.com",
            searchPlaceholder: "search...",
            searchBtn: "Search",
            randomBtn: "Random",
            contactLink: "Contact",
            privacyLink: "Privacy",
            termsLink: "Terms",
            backToTop: "Back to top",
            
            // Lightbox
            prevImg: "Previous photo",
            nextImg: "Next photo",
            closeModal: "Close",

            // Modal Contact
            contactTitle: "Contact",
            contactDesc: "Have questions or want to collaborate? Feel free to write directly to my email.",
            contactSub1: "Send a message",
            btnEmail: "Send Email",
            btnProfile: "View Profile",

            // Modal Privacy
            privacyTitle: "Privacy Policy",
            privacyP1: "This website respects your privacy. We use cookies and local storage solely for technical purposes – to ensure proper site functionality and visit counter operations.",
            privacyP2: "The site does not collect, process, or share your personal data with third parties for marketing purposes.",

            // Modal Terms
            termsTitle: "Terms of Service",
            termsP1: "All photographs and materials presented on this website are the property of Alan Łysiak and are protected by international copyright laws.",
            termsP2: "Copying, downloading, distributing, modifying, or any commercial use of these photographs without prior written permission from the author is strictly prohibited."
        }
    };

    const langPlBtn = document.getElementById('lang-pl');
    const langEnBtn = document.getElementById('lang-en');

    function updateLanguage(lang) {
        localStorage.setItem('site_lang', lang);
        const t = translations[lang];
        if (!t) return;

        // Meta i Tytuł strony
        document.documentElement.lang = lang;
        const seoTitleEl = document.getElementById('seo-title');
        if (seoTitleEl) seoTitleEl.innerText = t.seoTitle;
        const seoDescEl = document.getElementById('seo-desc');
        if (seoDescEl) seoDescEl.setAttribute('content', t.seoDesc);

        // Szukajka i przyciski akcji
        const searchInputEl = document.getElementById('search-input');
        if (searchInputEl) searchInputEl.placeholder = t.searchPlaceholder;
        const searchBtnEl = document.getElementById('search-btn');
        if (searchBtnEl) searchBtnEl.innerText = t.searchBtn;
        const randomBtnEl = document.getElementById('random-btn');
        if (randomBtnEl) randomBtnEl.innerText = t.randomBtn;
        const bttEl = document.getElementById('back-to-top');
        if (bttEl) bttEl.title = t.backToTop;

        // Linki nawigacyjne
        document.querySelectorAll('.link-contact').forEach(el => el.innerText = t.contactLink);
        const privacyEl = document.getElementById('link-privacy');
        if (privacyEl) privacyEl.innerText = t.privacyLink;
        const termsEl = document.getElementById('link-terms');
        if (termsEl) termsEl.innerText = t.termsLink;

        // Dostępność Lightboxa (ARIA)
        if (prevBtn) prevBtn.setAttribute('aria-label', t.prevImg);
        if (nextBtn) nextBtn.setAttribute('aria-label', t.nextImg);
        if (closeBtn) closeBtn.setAttribute('aria-label', t.closeModal);

        // Treści Modal Kontakt
        const mContactTitle = document.getElementById('modal-contact-title');
        if (mContactTitle) mContactTitle.innerText = t.contactTitle;
        const mContactDesc = document.getElementById('modal-contact-desc');
        if (mContactDesc) mContactDesc.innerText = t.contactDesc;
        const mContactSub1 = document.getElementById('modal-contact-sub1');
        if (mContactSub1) mContactSub1.innerText = t.contactSub1;
        const btnEmail = document.getElementById('btn-send-email');
        if (btnEmail) btnEmail.innerText = t.btnEmail;
        const btnProfile = document.getElementById('btn-view-profile');
        if (btnProfile) btnProfile.innerText = t.btnProfile;

        // Treści Modal Prywatność
        const mPrivacyTitle = document.getElementById('modal-privacy-title');
        if (mPrivacyTitle) mPrivacyTitle.innerText = t.privacyTitle;
        const mPrivacyP1 = document.getElementById('modal-privacy-p1');
        if (mPrivacyP1) mPrivacyP1.innerText = t.privacyP1;
        const mPrivacyP2 = document.getElementById('modal-privacy-p2');
        if (mPrivacyP2) mPrivacyP2.innerText = t.privacyP2;

        // Treści Modal Regulamin
        const mTermsTitle = document.getElementById('modal-terms-title');
        if (mTermsTitle) mTermsTitle.innerText = t.termsTitle;
        const mTermsP1 = document.getElementById('modal-terms-p1');
        if (mTermsP1) mTermsP1.innerText = t.termsP1;
        const mTermsP2 = document.getElementById('modal-terms-p2');
        if (mTermsP2) mTermsP2.innerText = t.termsP2;

        // Aktualizacja stanu przycisków PL / EN
        if (langPlBtn && langEnBtn) {
            if (lang === 'pl') {
                langPlBtn.classList.add('active');
                langEnBtn.classList.remove('active');
            } else {
                langEnBtn.classList.add('active');
                langPlBtn.classList.remove('active');
            }
        }
    }

    // Inicjalizacja wybranego języka z localStorage (domyślnie PL)
    const savedLang = localStorage.getItem('site_lang') || 'pl';
    updateLanguage(savedLang);

    if (langPlBtn) langPlBtn.addEventListener('click', () => updateLanguage('pl'));
    if (langEnBtn) langEnBtn.addEventListener('click', () => updateLanguage('en'));


    // --- 1. LOGIKA OKIENEK (MODALI) ---
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modalCloses = document.querySelectorAll('.custom-modal-close');
    const modals = document.querySelectorAll('.custom-modal');

    function updateBodyScroll() {
        const anyModalActive = document.querySelectorAll('.custom-modal.active').length > 0;
        const lightboxActive = lightbox && lightbox.classList.contains('active');
        
        if (anyModalActive || lightboxActive) {
            document.documentElement.classList.add('modal-open');
        } else {
            document.documentElement.classList.remove('modal-open');
        }
    }

    function closeAllModals() {
        modals.forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
        updateBodyScroll();
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetId = trigger.getAttribute('data-target');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.add('active');
                updateBodyScroll();
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

    // --- 2. POBIERANIE DANYCH Z SANITY ---
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
                    card.setAttribute('data-category', (photo.categories || []).join(' '));
                    
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

    // --- 3. LOGIKA LIGHTBOXA ---
    function openLightboxFromImage(clickedImg) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(clickedImg);
        
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox();
        if (lightbox) {
            lightbox.classList.add('active');
            updateBodyScroll();
        }
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
            if (lightbox) {
                lightbox.classList.remove('active'); 
                updateBodyScroll();
            }
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

    // --- 4. WYSZUKIWARKA I PRZYCISK LOSUJ ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    const randomBtn = document.getElementById('random-btn');
    const suggestionsBox = document.querySelector('.suggestions-list');
    const defaultTags = ['street', 'portret', 'abstrakcja', 'monochrome', 'generator'];

    const performSearch = () => {
        if (!searchInput) return;
        const term = searchInput.value.toLowerCase().trim();
        if (term === 'generator') { window.location.href = 'generator/index.html'; return; }

        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = (card.getAttribute('data-category') || "").toLowerCase().split(' ');
            const isMatch = term === "" ? card.classList.contains('highlight') : cats.some(w => w.startsWith(term));
            card.classList.toggle('hidden', !isMatch);
        });
        if (suggestionsBox) suggestionsBox.style.display = "none";
    };

    // Logika przycisku Losuj
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const cards = document.querySelectorAll('.photo-card');
            const allTags = new Set();
            cards.forEach(card => {
                const cats = (card.getAttribute('data-category') || "").trim();
                if (cats) {
                    cats.split(/\s+/).forEach(tag => {
                        if (tag !== 'generator') allTags.add(tag);
                    });
                }
            });
            const tagsArray = Array.from(allTags);
            if (tagsArray.length > 0) {
                const randomTag = tagsArray[Math.floor(Math.random() * tagsArray.length)];
                if (searchInput) {
                    searchInput.value = randomTag;
                    performSearch();
                }
            }
        });
    }

    if (searchInput && suggestionsBox) {
        searchInput.addEventListener('click', () => {
            if (searchInput.value.trim() === "") {
                suggestionsBox.innerHTML = defaultTags.map(t => `<li>${t}</li>`).join('');
                suggestionsBox.style.display = "block";
            }
        });

        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            if (term === "") {
                suggestionsBox.innerHTML = defaultTags.map(t => `<li>${t}</li>`).join('');
                suggestionsBox.style.display = "block";
            } else {
                const cards = document.querySelectorAll('.photo-card');
                let matches = new Set();
                cards.forEach(c => {
                    const catAttr = c.getAttribute('data-category') || "";
                    catAttr.split(' ').forEach(cat => { if(cat.startsWith(term)) matches.add(cat) });
                });
                
                suggestionsBox.innerHTML = Array.from(matches).map(m => `<li>${m}</li>`).join('');
                suggestionsBox.style.display = matches.size > 0 ? "block" : "none";
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== searchInput && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = "none";
            }
        });

        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
        
        suggestionsBox.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                searchInput.value = e.target.textContent;
                performSearch();
            }
        });
    }

    // --- 5. DODATKI ---
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
