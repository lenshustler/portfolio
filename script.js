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
    let activeIdx = 0;

    if (grid) {
        try {
            // Pobieramy dane - wymuszamy świeżość przez dopisanie timestampu do URL
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}&nocache=${Date.now()}`;
            
            const response = await fetch(URL);
            const data = await response.json();
            const photos = data.result;

            if (!photos || photos.length === 0) {
                grid.innerHTML = "<p style='color:black; text-align:center; grid-column: 1/-1;'>Baza danych jest pusta.</p>";
            } else {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                photos.forEach((photo, index) => {
                    const card = document.createElement('div');
                    card.className = 'photo-card'; 
                    
                    // --- DIAGNOSTYKA ---
                    console.log(`Zdjęcie: ${photo.title}, Highlight: ${photo.isHighlight}`);

                    // Ścisłe sprawdzenie: tylko jeśli isHighlight jest dokładnie TRUE
                    if (photo.isHighlight === true) {
                        card.classList.add('highlight');
                    } else {
                        card.classList.add('hidden');
                    }

                    card.setAttribute('data-category', (photo.categories || []).join(' '));
                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.setAttribute('draggable', 'false');
                    img.onclick = () => showImage(index);
                    
                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });
                grid.style.opacity = "1";
            }
        } catch (e) { console.error("Błąd:", e); }
    }

    // --- RESZTA SKRYPTU (LIGHTBOX, WYSZUKIWARKA ITP.) ---
    function showImage(index) {
        const visible = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        if (visible.length === 0) return;
        activeIdx = visible.findIndex(img => img.src === images[index].src);
        if (activeIdx === -1) activeIdx = 0;
        updateLightbox(visible);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateLightbox(visibleList) {
        lightboxImg.src = visibleList[activeIdx].src;
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            activeIdx = (activeIdx + 1) % visibleList.length;
            lightboxImg.src = visibleList[activeIdx].src;
        };
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            activeIdx = (activeIdx - 1 + visibleList.length) % visibleList.length;
            lightboxImg.src = visibleList[activeIdx].src;
        };
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (closeBtn) closeBtn.onclick = closeLightbox;
    if (lightbox) lightbox.onclick = (e) => { if (e.target === lightbox || e.target === lightboxImg) closeLightbox(); };

    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === "ArrowRight") nextBtn.click();
            if (e.key === "ArrowLeft") prevBtn.click();
            if (e.key === "Escape") closeLightbox();
        }
    });

    document.addEventListener('contextmenu', (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); });

    document.getElementById('search-input')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.photo-card').forEach(card => {
            const cat = (card.getAttribute('data-category') || "").toLowerCase();
            if (term === "") {
                if (card.classList.contains('highlight')) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            } else {
                card.classList.toggle('hidden', !cat.includes(term));
            }
        });
    });

    const btt = document.getElementById('back-to-top');
    window.onscroll = () => { if (btt) btt.style.display = window.scrollY > 400 ? "block" : "none"; };
    if (btt) btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const counterEl = document.getElementById('frame-count');
    try {
        const r = await fetch('https://abacus.jasoncameron.dev/hit/alan_lysiak_portfolio/pentax_v1');
        const d = await r.json();
        if (counterEl) counterEl.innerText = (200 + (d.value || 0)).toString().padStart(2, '0');
    } catch (e) { if (counterEl) counterEl.innerText = "200"; }
});
