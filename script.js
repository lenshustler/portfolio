// --- POMOCNICZE: Tasowanie Fishera-Yatesa ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let preloadCache = [];

// --- POBIERANIE Z SANITY ---
    if (grid) {
        try {
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
            
            const response = await fetch(URL);
            const data = await response.json();
            const photos = data.result;

            if (photos && photos.length > 0) {
                shuffleArray(photos);
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
            }
        } catch (e) { 
            console.error("Błąd połączenia z Sanity:", e); 
        }
    }

    // --- LIGHTBOX ---
    function openLightboxFromImage(clickedImg) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(clickedImg);
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox();
        if (lightbox) { lightbox.classList.add('active'); updateBodyScroll(); }
    }

    function resetZoom() {
        currentX = 0; currentY = 0;
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
        
        preloadCache = [new Image(), new Image()];
        preloadCache[0].src = visibleImages[nextIdx].getAttribute('data-fullsrc') + config;
        preloadCache[1].src = visibleImages[prevIdx].getAttribute('data-fullsrc') + config;
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
        lightboxImg.onload = () => { lightboxImg.style.opacity = '1'; };

        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                lightboxImg.classList.toggle('zoomed');
                if (lightboxImg.classList.contains('zoomed')) {
                    lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(2.0)';
                } else {
                    resetZoom();
                }
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    if (!lightboxImg.classList.contains('zoomed') && nextBtn) nextBtn.click();
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
            if (currentX > maxDrag) currentX = maxDrag; if (currentX < -maxDrag) currentX = -maxDrag;
            if (currentY > maxDrag) currentY = maxDrag; if (currentY < -maxDrag) currentY = -maxDrag;
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
            if (lightbox) { lightbox.classList.remove('active'); updateBodyScroll(); }
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
            if (lightbox && lightbox.classList.contains('active') && closeBtn) closeBtn.onclick();
            closeAllModals();
        }
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === "ArrowRight" && nextBtn) nextBtn.click();
        if (e.key === "ArrowLeft" && prevBtn) prevBtn.click();
    });

    // --- WYSZUKIWARKA Z AUTO-UZUPEŁNIANIEM ORAZ LOSOWANIE ---
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (activeCategories.length > 0) {
                const randomCatObj = activeCategories[Math.floor(Math.random() * activeCategories.length)];
                const displayVal = randomCatObj[currentLang] || randomCatObj.pl;
                if (searchInput) {
                    searchInput.value = displayVal;
                    performSearch();
                }
            }
        });
    }

    let lastSearchLength = 0;
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const val = searchInput.value;
            
            // Jeśli użytkownik cofa tekst (backspace), nie uruchamiamy autouzupełniania w przód
            if (val.length < lastSearchLength) {
                lastSearchLength = val.length;
                performSearch();
                return;
            }
            lastSearchLength = val.length;

            const startPos = searchInput.selectionStart;
            if (val && startPos === val.length) {
                const term = val.toLowerCase();
                const match = activeCategories
                    .map(cat => cat[currentLang] || cat.pl)
                    .find(name => name.toLowerCase().startsWith(term));

                if (match && match.toLowerCase() !== term) {
                    searchInput.value = match;
                    searchInput.setSelectionRange(term.length, match.length);
                    lastSearchLength = match.length;
                }
            }
            performSearch();
        });

        if (searchBtn) searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(); });
    }

    // --- TYPEWRITER I DODATKI ---
    if (searchInput) {
        startTypewriter(); 
        searchInput.addEventListener('focus', () => {
            clearTimeout(typewriterTimer);
            searchInput.placeholder = '';
        });
        searchInput.addEventListener('blur', () => {
            if (searchInput.value.trim() === '') {
                startTypewriter();
            }
        });
    }

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

// Obsługa dźwięku migawki dla logo
document.addEventListener('DOMContentLoaded', () => {
    const logoLinks = document.querySelectorAll('.logo-link, .site-logo');
    logoLinks.forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetUrl = logo.tagName === 'A' ? logo.href : (logo.closest('a') ? logo.closest('a').href : 'index.html');
            const shutterSound = new Audio('images/shutter.mp3');
            shutterSound.volume = 0.4;
            shutterSound.play().catch(error => { console.log("Odtwarzanie dźwięku zablokowane:", error); });
            setTimeout(() => { window.location.href = targetUrl; }, 250);
        });
    });
});
