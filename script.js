document.addEventListener('DOMContentLoaded', () => {
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
        
        const nextCache = new Image(); nextCache.src = visibleImages[nextIdx].getAttribute('data-fullsrc') + config;
        const prevCache = new Image(); prevCache.src = visibleImages[prevIdx].getAttribute('data-fullsrc') + config;
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

    // --- WYSZUKIWARKA Z LISTĄ PODPOWIEDZI (DROPDOWN) ORAZ LOSOWANIE ---
    let suggestionsContainer = document.querySelector('.search-suggestions');
    if (!suggestionsContainer && searchInput) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.zIndex = '1000';
        suggestionsContainer.style.left = '0';
        suggestionsContainer.style.right = '0';
        suggestionsContainer.style.top = '100%';
        suggestionsContainer.style.maxHeight = '200px';
        suggestionsContainer.style.overflowY = 'auto';
        if (searchInput.parentElement) {
            searchInput.parentElement.style.position = 'relative';
            searchInput.parentElement.appendChild(suggestionsContainer);
        }
    }

    let selectedSuggestionIndex = -1;

    function renderSuggestions(matches) {
        if (!suggestionsContainer) return;
        selectedSuggestionIndex = -1;
        if (matches.length > 0) {
            suggestionsContainer.innerHTML = matches.map((cat, index) => {
                const text = cat[currentLang] || cat.pl;
                return `<div class="suggestion-item" data-index="${index}" style="padding: 8px 12px; cursor: pointer; background: var(--bg-color, #fff); border-bottom: 1px solid rgba(0,0,0,0.05);">${text}</div>`;
            }).join('');
            suggestionsContainer.style.display = 'block';
        } else {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        }
    }

    function updateActiveSuggestion() {
        if (!suggestionsContainer) return;
        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach((item, idx) => {
            if (idx === selectedSuggestionIndex) {
                item.style.backgroundColor = 'var(--hover-color, rgba(0,0,0,0.08))';
            } else {
                item.style.backgroundColor = 'var(--bg-color, #fff)';
            }
        });
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (activeCategories.length > 0) {
                const randomCatObj = activeCategories[Math.floor(Math.random() * activeCategories.length)];
                const displayVal = randomCatObj[currentLang] || randomCatObj.pl;
                if (searchInput) {
                    searchInput.value = displayVal;
                    renderSuggestions([]);
                    performSearch();
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase().trim();
            
            // Wymagamy minimum 2 znaków oraz dopasowania tylko od początku słowa (startsWith)
            if (term.length < 2) {
                renderSuggestions([]);
                return;
            }

            const matches = activeCategories.filter(cat => {
                const val = (cat[currentLang] || cat.pl).toLowerCase();
                return val.startsWith(term) || val.split(/\s+/).some(word => word.startsWith(term));
            });

            renderSuggestions(matches);
        });

        searchInput.addEventListener('keydown', (e) => {
            const items = suggestionsContainer ? suggestionsContainer.querySelectorAll('.suggestion-item') : [];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
                    updateActiveSuggestion();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
                    updateActiveSuggestion();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
                    searchInput.value = items[selectedSuggestionIndex].textContent;
                    renderSuggestions([]);
                    performSearch();
                } else {
                    renderSuggestions([]);
                    performSearch();
                }
            }
        });

        if (suggestionsContainer) {
            suggestionsContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.suggestion-item');
                if (item) {
                    searchInput.value = item.textContent;
                    renderSuggestions([]);
                    performSearch();
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (searchInput && suggestionsContainer && !searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                renderSuggestions([]);
            }
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                renderSuggestions([]);
                performSearch();
            });
        }
    }

    // --- TYPEWRITER ---
    if (searchInput) {
        startTypewriter(); 
        searchInput.addEventListener('focus', () => {
            clearTimeout(typewriterTimer);
            searchInput.placeholder = '';
        });
        searchInput.addEventListener('blur', () => {
            if (searchInput.value.trim() === '' && searchInput.placeholder === '') {
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
    const shutterSound = new Audio('images/shutter.mp3');
    shutterSound.volume = 0.4;

    logoLinks.forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetUrl = logo.tagName === 'A' ? logo.href : (logo.closest('a') ? logo.closest('a').href : 'index.html');
            shutterSound.currentTime = 0;
            shutterSound.play().catch(error => { console.log("Odtwarzanie dźwięku zablokowane:", error); });
            setTimeout(() => { window.location.href = targetUrl; }, 250);
        });
    });
});
