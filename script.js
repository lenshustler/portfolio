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

    // --- 1. LOGIKA OKIENEK (MODALI) ---
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

    function updateLightbox() {
        if (visibleImages.length > 0 && lightboxImg) {
            // POPRAWKA: Super szybkie wygaszenie (40ms) przed zmianą źródła pliku
            lightboxImg.style.opacity = '0';
            
            setTimeout(() => {
                const baseUrl = visibleImages[activeIdx].getAttribute('data-fullsrc');
                
                // POPRAWKA: Zarówno mobile jak i desktop ciągną ostry obraz 1600px z wysoką jakością q=90
                lightboxImg.src = baseUrl + "?auto=format&w=1600&q=90";
                
                resetZoom();
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

    // --- 4. WYSZUKIWARKA ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
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
