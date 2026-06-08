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

    // --- 1. POBIERANIE DANYCH ---
    if (grid) {
        try {
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;
            
            const response = await fetch(URL);
            const data = await response.json();
            const photos = data.result;

            if (!photos || photos.length === 0) {
                console.log("Brak zdjęć do wyświetlenia.");
            } else {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                photos.forEach((photo) => {
                    const card = document.createElement('div');
                    card.className = 'photo-card';
                    card.classList.add(photo.isHighlight ? 'highlight' : 'hidden');
                    card.setAttribute('data-category', (photo.categories || []).join(' '));
                    
                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.setAttribute('draggable', 'false');
                    
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

    // --- 2. LOGIKA LIGHTBOXA ---
    function openLightboxFromImage(clickedImg) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(clickedImg);
        
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateLightbox() {
        if (visibleImages.length > 0) {
            lightboxImg.style.transition = 'none';
            lightboxImg.src = visibleImages[activeIdx].src;
            lightboxImg.classList.remove('zoomed');
            lightboxImg.style.transform = 'scale(1.0)';
            
            requestAnimationFrame(() => {
                lightboxImg.style.transition = 'transform 0.3s ease';
            });
        }
    }

    if (lightboxImg) {
        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                lightboxImg.classList.toggle('zoomed');
                lightboxImg.style.transform = lightboxImg.classList.contains('zoomed') ? 'scale(2.0)' : 'scale(1.0)';
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    if (!lightboxImg.classList.contains('zoomed')) {
                        closeBtn.onclick();
                    }
                }, 250);
            }
        });
    }

    if (nextBtn) { nextBtn.onclick = (e) => { e.stopPropagation(); if (visibleImages.length > 0) { activeIdx = (activeIdx + 1) % visibleImages.length; updateLightbox(); } }; }
    if (prevBtn) { prevBtn.onclick = (e) => { e.stopPropagation(); if (visibleImages.length > 0) { activeIdx = (activeIdx - 1 + visibleImages.length) % visibleImages.length; updateLightbox(); } }; }
    if (closeBtn) { closeBtn.onclick = () => { lightbox.classList.remove('active'); document.body.style.overflow = 'auto'; lightboxImg.classList.remove('zoomed'); lightboxImg.style.transform = 'scale(1.0)'; }; }
    if (lightbox) { lightbox.onclick = (e) => { if (e.target === lightbox) closeBtn.onclick(); }; }

    // Swipe na urządzeniach mobilnych
    let touchStartX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(diff) > 30) diff > 0 ? prevBtn.click() : nextBtn.click();
        }, { passive: true });
    }

    // Obsługa klawiatury
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            if (lightbox.classList.contains('active')) {
                closeBtn.onclick();
            }
            closeAllModals();
        }
        if (!lightbox.classList.contains('active')) return;
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn.click();
    });

    // --- 3. WYSZUKIWARKA ---
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');
    const suggestionsBox = document.querySelector('.suggestions-list');
    const defaultTags = ['street', 'portret', 'abstrakcja', 'monochrome', 'generator'];

    const performSearch = () => {
        const term = searchInput.value.toLowerCase().trim();
        if (term === 'generator') { window.location.href = 'generator/index.html'; return; }

        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = (
