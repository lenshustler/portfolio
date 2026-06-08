document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA TŁUMACZEŃ ---
    const translations = {
        pl: { "search-btn": "SZUKAJ", "nav-zine": "Zine", "nav-contact": "Kontakt", "nav-privacy": "Prywatność", "nav-terms": "Regulamin", "contact-title": "Kontakt", "contact-desc": "Masz jakieś pytania lub chcesz podjąć współpracę? Napisz bezpośrednio na mój email.", "contact-email-label": "Email", "contact-email-sub": "Napisz wiadomość", "contact-email-btn": "Wyślij Email", "contact-insta-label": "Instagram", "contact-insta-sub": "Instagram", "contact-insta-btn": "Zobacz profil", "privacy-title": "Polityka Prywatności", "privacy-p1": "Ta strona szanuje Twoją prywatność. Używamy plików cookies oraz pamięci lokalnej przeglądarki wyłącznie w celach technicznych.", "privacy-p2": "Strona nie zbiera danych w celach marketingowych.", "terms-title": "Regulamin strony", "terms-p1": "Wszystkie fotografie są własnością Alana Łysiaka.", "terms-p2": "Kopiowanie bez zgody zabronione." },
        en: { "search-btn": "SEARCH", "nav-zine": "Zine", "nav-contact": "CONTACT", "nav-privacy": "PRIVACY", "nav-terms": "TERMS", "contact-title": "Contact", "contact-desc": "Do you have any questions or want to collaborate? Send me an email.", "contact-email-label": "Email", "contact-email-sub": "Send a message", "contact-email-btn": "Send Email", "contact-insta-label": "Instagram", "contact-insta-sub": "Instagram", "contact-insta-btn": "View Profile", "privacy-title": "Privacy Policy", "privacy-p1": "This site respects your privacy. We use cookies and local storage only for technical purposes.", "privacy-p2": "We do not collect personal data for marketing purposes.", "terms-title": "Terms of Service", "terms-p1": "All photographs are the property of Alan Łysiak.", "terms-p2": "Copying without permission is prohibited." }
    };
    let currentLang = localStorage.getItem('portfolio_lang') || 'pl';

    function updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang] && translations[currentLang][key]) el.textContent = translations[currentLang][key];
        });
        document.getElementById('lang-pl').style.opacity = currentLang === 'pl' ? '1' : '0.5';
        document.getElementById('lang-en').style.opacity = currentLang === 'en' ? '1' : '0.5';
    }

    // --- ZMIENNE PROJEKTU ---
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

    // --- OBSŁUGA JĘZYKA ---
    document.getElementById('lang-pl').addEventListener('click', () => { currentLang = 'pl'; localStorage.setItem('portfolio_lang', 'pl'); updateLanguage(); });
    document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('portfolio_lang', 'en'); updateLanguage(); });

    // --- MODALE ---
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modalCloses = document.querySelectorAll('.custom-modal-close');
    const modals = document.querySelectorAll('.custom-modal');

    function closeAllModals() {
        modals.forEach(m => m.classList.remove('active'));
        if (!lightbox.classList.contains('active')) document.documentElement.classList.remove('modal-open');
    }

    modalTriggers.forEach(t => t.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = t.getAttribute('data-target');
        const m = document.getElementById(targetId);
        if (m) { m.classList.add('active'); document.documentElement.classList.add('modal-open'); }
    }));

    modalCloses.forEach(b => b.addEventListener('click', closeAllModals));
    modals.forEach(m => m.addEventListener('click', (e) => { if (e.target === m) closeAllModals(); }));

    // --- POBIERANIE DANYCH ---
    if (grid) {
        try {
            const QUERY = encodeURIComponent(`*[_type == "photo"] | order(_createdAt desc) { title, isHighlight, categories, "imageUrl": image.asset->url }`);
            const response = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`);
            const { result: photos } = await response.json();

            if (photos) {
                photos.sort(() => Math.random() - 0.5);
                const seoDiv = grid.querySelector('div[style="display: none;"]');
                grid.innerHTML = "";
                if(seoDiv) grid.appendChild(seoDiv);

                photos.forEach(p => {
                    if (!p.imageUrl) return;
                    const card = document.createElement('div');
                    card.className = `photo-card ${p.isHighlight ? 'highlight' : 'hidden'}`;
                    card.setAttribute('data-category', (p.categories || []).join(' '));
                    const img = document.createElement('img');
                    img.src = `${p.imageUrl}?auto=format&w=450&q=70`;
                    img.setAttribute('data-fullsrc', p.imageUrl);
                    img.onclick = () => openLightboxFromImage(img);
                    card.appendChild(img);
                    grid.appendChild(card);
                });
            }
        } catch (e) { console.error("Error:", e); }
    }

    // --- LIGHTBOX ---
    function openLightboxFromImage(img) {
        visibleImages = Array.from(document.querySelectorAll('.photo-card:not(.hidden) img'));
        activeIdx = visibleImages.indexOf(img);
        updateLightbox();
        lightbox.classList.add('active');
        document.documentElement.classList.add('modal-open');
    }

    function updateLightbox() {
        if (visibleImages[activeIdx]) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = visibleImages[activeIdx].getAttribute('data-fullsrc') + "?auto=format&w=1600&q=90";
            }, 40);
        }
    }

    lightboxImg.onload = () => lightboxImg.style.opacity = '1';
    
    if (closeBtn) closeBtn.onclick = () => { lightbox.classList.remove('active'); document.documentElement.classList.remove('modal-open'); };
    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); activeIdx = (activeIdx + 1) % visibleImages.length; updateLightbox(); };
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); activeIdx = (activeIdx - 1 + visibleImages.length) % visibleImages.length; updateLightbox(); };

    // --- WYSZUKIWARKA ---
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.photo-card').forEach(c => {
                const cats = (c.getAttribute('data-category') || "").toLowerCase();
                c.classList.toggle('hidden', term !== "" && !cats.includes(term));
            });
        });
    }

    // --- START ---
    updateLanguage();
    const btt = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => { if (btt) btt.style.display = window.scrollY > 400 ? "block" : "none"; });
    if (btt) btt.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
});
