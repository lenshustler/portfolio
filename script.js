document.addEventListener('DOMContentLoaded', async () => {
    // ==========================================
    // 1. KONFIGURACJA SANITY
    // ==========================================
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio'; 
    const grid = document.querySelector('.gallery-grid');

    const QUERY = `*[_type == "photo"] | order(_createdAt desc) {
        title,
        isHighlight,
        categories,
        "imageUrl": image.asset->url
    }`;
    
    const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${encodeURIComponent(QUERY)}`;

    let images = [];

    // ==========================================
    // 2. POBIERANIE ZDJĘĆ I BUDOWANIE GALERII
    // ==========================================
    if (grid) {
        try {
            console.log("Łączenie z Sanity (Dataset: " + DATASET + ")...");
            const response = await fetch(URL);
            const data = await response.json();
            
            console.log("Dane odebrane:", data);

            let photos = data.result;

            if (!photos || photos.length === 0) {
                console.warn("Brak zdjęć w Sanity.");
                grid.innerHTML = "<p style='color:black; text-align:center; grid-column: 1 / -1; margin-top: 50px;'>Baza danych jest pusta lub zablokowana.</p>";
                grid.style.opacity = "1";
            } else {
                photos.sort(() => Math.random() - 0.5);
                grid.innerHTML = "";

                photos.forEach((photo, index) => {
                    const card = document.createElement('div');
                    card.classList.add('photo-card');
                    
                    if (photo.isHighlight) {
                        card.classList.add('highlight');
                    } else {
                        card.classList.add('hidden'); 
                    }
                    
                    const categoryData = photo.categories ? photo.categories.join(' ') : '';
                    card.setAttribute('data-category', categoryData);

                    const img = document.createElement('img');
                    img.src = photo.imageUrl + "?auto=format";
                    img.alt = photo.title || 'Zdjęcie z portfolio';
                    img.setAttribute('draggable', 'false');

                    if (index < 6) {
                        img.removeAttribute('loading');
                    } else {
                        img.setAttribute('loading', 'lazy');
                    }
                    img.setAttribute('decoding', 'async');

                    card.appendChild(img);
                    grid.appendChild(card);
                    images.push(img);
                });

                setTimeout(() => { grid.style.opacity = "1"; }, 50);

                images.forEach((img, index) => {
                    img.onclick = () => showImage(index);
                });
            }

        } catch (error) {
            console.error('Błąd połączenia z Sanity:', error);
        }
    }

    // ==========================================
    // 3. OBSŁUGA LIGHTBOXA (Z klasą .active)
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');
    let currentIndex = 0;

    function showImage(index) {
        const visibleCards = Array.from(document.querySelectorAll('.photo-card:not(.hidden)'));
        const visibleImages = visibleCards.map(card => card.querySelector('img'));
        
        if (!lightbox || !lightboxImg || visibleImages.length === 0) return;
        
        let activeIndex = visibleImages.findIndex(img => img.src === images[index].src);
        if (activeIndex === -1) activeIndex = 0;

        nextBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let nextIdx = (activeIndex + 1) % visibleImages.length;
            const globalIdx = images.findIndex(img => img.src === visibleImages[nextIdx].src);
            showImage(globalIdx);
        };
        
        prevBtn.onclick = (e) => { 
            e.stopPropagation(); 
            let prevIdx = (activeIndex - 1 + visibleImages.length) % visibleImages.length;
            const globalIdx = images.findIndex(img => img.src === visibleImages[prevIdx].src);
            showImage(globalIdx);
        };

        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        
        // NOWY SPOSÓB WŁĄCZANIA (Dodaje klasę .active zamiast zmieniać style.display)
        lightbox.classList.add('active'); 
        document.body.style.overflow = 'hidden';
    }

    const closeLightbox = () => {
        if (lightbox) {
