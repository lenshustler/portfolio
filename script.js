document.addEventListener('DOMContentLoaded', async () => {
    // --- KONFIGURACJA SANITY ---
    const PROJECT_ID = '6g67d261';
    const DATASET = 'portfolio';
    
    // --- ELEMENTY DOM ---
    const grid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const closeBtn = document.querySelector('.close');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    
    const langPlBtn = document.getElementById('lang-pl');
    const langEnBtn = document.getElementById('lang-en');

    // --- ZMIENNE STANOWE ---
    let images = []; 
    let visibleImages = []; 
    let activeIdx = 0;
    let clickTimer = null; 

    let isMoving = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;

    // --- WYBRANE KATEGORIE DO AUTOUZUPEŁNIANIA I PRZYCISKU LOSOWO ---
    const activeCategories = [
        { pl: 'street',             en: 'street' },
        { pl: 'portret',            en: 'portrait' },
        { pl: 'abstrakcja',         en: 'abstract' },
        { pl: 'monochrom',          en: 'monochrome' },
        { pl: 'czarno-białe',       en: 'black & white' },
        { pl: 'podwójna ekspozycja', en: 'double exposure' },
        { pl: 'krajobraz',          en: 'landscape' },
        { pl: 'gdynia',             en: 'gdynia' },
        { pl: 'kwiaty',             en: 'flowers' },
        { pl: 'dzika przyroda',      en: 'wildlife' },
        { pl: 'plaża',              en: 'beach' },
        { pl: 'zima',               en: 'winter' },
        { pl: 'polska',             en: 'poland' },
        { pl: 'albania',            en: 'albania' },
        { pl: 'austria',            en: 'austria' },
        { pl: 'bałkany',            en: 'balkans' },
        { pl: 'bośnia',             en: 'bosnia' },
        { pl: 'bułgaria',           en: 'bulgaria' },
        { pl: 'chorwacja',          en: 'croatia' },
        { pl: 'cypr',               en: 'cyprus' },
        { pl: 'czechy',             en: 'czechia' },
        { pl: 'estonia',            en: 'estonia' },
        { pl: 'niemcy',             en: 'germany' },
        { pl: 'hiszpania',          en: 'spain' },
        { pl: 'holandia',           en: 'netherlands' },
        { pl: 'węgry',              en: 'hungary' },
        { pl: 'włochy',             en: 'italy' },
        { pl: 'łotwa',              en: 'latvia' },
        { pl: 'liechtenstein',      en: 'liechtenstein' },
        { pl: 'litwa',              en: 'lithuania' },
        { pl: 'czarnogóra',         en: 'montenegro' },
        { pl: 'rumunia',            en: 'romania' },
        { pl: 'serbia',             en: 'serbia' },
        { pl: 'słowacja',           en: 'slovakia' }
    ];

    // --- SŁOWA DO ANIMACJI TYPEWRITER ---
    let typewriterTimer;
    let typeIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    
    const typewriterPhrases = {
        pl: ['szukaj...', 'street', 'portret', 'abstrakcja', 'monochrom', 'podwójna ekspozycja', 'krajobraz', 'gdynia', 'polska'],
        en: ['search...', 'street', 'portrait', 'abstract', 'monochrome', 'double exposure', 'landscape', 'gdynia', 'poland']
    };

    function startTypewriter() {
        if (!searchInput) return;
        clearTimeout(typewriterTimer);
        
        const phrases = typewriterPhrases[currentLang] || typewriterPhrases.pl;
        const currentPhrase = phrases[typeIdx];
        
        if (isDeleting) {
            searchInput.placeholder = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
        } else {
            searchInput.placeholder = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
        }

        let speed = isDeleting ? 50 : 120;

        if (!isDeleting && charIdx === currentPhrase.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            typeIdx = (typeIdx + 1) % phrases.length;
            speed = 500;
        }

        typewriterTimer = setTimeout(startTypewriter, speed);
    }

    let currentLang = localStorage.getItem('site_lang') || localStorage.getItem('preferred_lang');
    if (!currentLang) {
        const browserLang = navigator.language || navigator.userLanguage || 'pl';
        currentLang = browserLang.toLowerCase().startsWith('pl') ? 'pl' : 'en';
    }

    const tagDictionary = {
        'abstrakcja':         { pl: 'abstrakcja',         en: 'abstract' },
        'abstract':          { pl: 'abstrakcja',         en: 'abstract' },
        'street':            { pl: 'street',             en: 'street' },
        'portret':           { pl: 'portret',            en: 'portrait' },
        'portrait':          { pl: 'portret',            en: 'portrait' },
        'krajobraz':         { pl: 'krajobraz',          en: 'landscape' },
        'landscape':         { pl: 'krajobraz',          en: 'landscape' },
        'czarnobiale':       { pl: 'czarno-białe',       en: 'black & white' },
        'blackwhite':        { pl: 'czarno-białe',       en: 'black & white' },
        'black & white':     { pl: 'czarno-białe',       en: 'black & white' },
        'monochrome':        { pl: 'monochrom',          en: 'monochrome' },
        'doublexposure':     { pl: 'podwójna ekspozycja', en: 'double exposure' },
        'double exposure':   { pl: 'podwójna ekspozycja', en: 'double exposure' },
        'longexposure':      { pl: 'długa ekspozycja',    en: 'long exposure' },
        'long exposure':     { pl: 'długa ekspozycja',    en: 'long exposure' },
        'refractography':    { pl: 'refraktografia',      en: 'refractography' },
        'refraktografia':    { pl: 'refraktografia',      en: 'refraktografia' },
        'macro':             { pl: 'makro',               en: 'macro' },
        'makro':             { pl: 'makro',               en: 'macro' },
        'urban':             { pl: 'urban',               en: 'urban' },
        'travel':            { pl: 'podróże',             en: 'travel' },
        'podroze':           { pl: 'podróże',             en: 'travel' },
        'podróże':           { pl: 'podróże',             en: 'travel' },
        'wildlife':          { pl: 'dzika przyroda',      en: 'wildlife' },
        'dzika przyroda':    { pl: 'dzika przyroda',      en: 'wildlife' },
        'selfie':            { pl: 'selfie',              en: 'selfie' },
        'generator':         { pl: 'generator',           en: 'generator' },

        'polska':            { pl: 'polska',              en: 'poland' },
        'poland':            { pl: 'polska',              en: 'poland' },
        'albania':           { pl: 'albania',             en: 'albania' },
        'austria':           { pl: 'austria',             en: 'austria' },
        'balkans':           { pl: 'bałkany',             en: 'balkans' },
        'balkany':           { pl: 'bałkany',             en: 'balkans' },
        'bałkany':           { pl: 'bałkany',             en: 'balkans' },
        'bosnia':            { pl: 'bośnia',              en: 'bosnia' },
        'bośnia':            { pl: 'bośnia',              en: 'bosnia' },
        'bulgaria':          { pl: 'bułgaria',            en: 'bulgaria' },
        'bułgaria':          { pl: 'bułgaria',            en: 'bulgaria' },
        'chorwacja':         { pl: 'chorwacja',           en: 'croatia' },
        'croatia':           { pl: 'chorwacja',           en: 'croatia' },
        'cypr':              { pl: 'cypr',                en: 'cyprus' },
        'cyprus':            { pl: 'cypr',                en: 'cyprus' },
        'czech':             { pl: 'czechy',              en: 'czechia' },
        'czechy':            { pl: 'czechy',              en: 'czechia' },
        'czechia':           { pl: 'czechy',              en: 'czechia' },
        'estonia':           { pl: 'estonia',             en: 'estonia' },
        'germany':           { pl: 'niemcy',              en: 'germany' },
        'niemcy':            { pl: 'niemcy',              en: 'germany' },
        'hiszpania':         { pl: 'hiszpania',           en: 'spain' },
        'spain':             { pl: 'hiszpania',           en: 'spain' },
        'holandia':          { pl: 'holandia',            en: 'netherlands' },
        'netherlands':       { pl: 'holandia',            en: 'netherlands' },
        'hungary':           { pl: 'węgry',               en: 'hungary' },
        'wegry':             { pl: 'węgry',               en: 'hungary' },
        'węgry':             { pl: 'węgry',               en: 'hungary' },
        'italy':             { pl: 'włochy',              en: 'italy' },
        'wlochy':            { pl: 'włochy',              en: 'italy' },
        'włochy':            { pl: 'włochy',              en: 'italy' },
        'latvia':            { pl: 'łotwa',               en: 'latvia' },
        'lotwa':             { pl: 'łotwa',               en: 'latvia' },
        'łotwa':             { pl: 'łotwa',               en: 'latvia' },
        'lichtenstein':      { pl: 'liechtenstein',       en: 'liechtenstein' },
        'liechtenstein':     { pl: 'liechtenstein',       en: 'liechtenstein' },
        'lithuania':         { pl: 'litwa',               en: 'lithuania' },
        'litwa':             { pl: 'litwa',               en: 'lithuania' },
        'montenegro':        { pl: 'czarnogóra',          en: 'montenegro' },
        'czarnogora':        { pl: 'czarnogóra',          en: 'montenegro' },
        'czarnogóra':        { pl: 'czarnogóra',          en: 'montenegro' },
        'romania':           { pl: 'rumunia',             en: 'romania' },
        'rumunia':           { pl: 'rumunia',             en: 'romania' },
        'serbia':            { pl: 'serbia',              en: 'serbia' },
        'slowacja':          { pl: 'słowacja',            en: 'slovakia' },
        'słowacja':          { pl: 'słowacja',            en: 'slovakia' },
        'slovakia':          { pl: 'słowacja',            en: 'slovakia' },

        'amsterdam':         { pl: 'amsterdam',           en: 'amsterdam' },
        'belgrad':           { pl: 'belgrad',             en: 'belgrade' },
        'belgrade':          { pl: 'belgrad',             en: 'belgrade' },
        'budapest':          { pl: 'budapeszt',           en: 'budapest' },
        'budapeszt':         { pl: 'budapeszt',           en: 'budapest' },
        'bukareszt':         { pl: 'bukareszt',           en: 'bucharest' },
        'bucharest':         { pl: 'bukareszt',           en: 'bucharest' },
        'catania':           { pl: 'katania',             en: 'catania' },
        'katania':           { pl: 'katania',             en: 'catania' },
        'etna':              { pl: 'etna',                en: 'etna' },
        'gdansk':            { pl: 'gdańsk',              en: 'gdansk' },
        'gdańsk':            { pl: 'gdańsk',              en: 'gdansk' },
        'gdynia':            { pl: 'gdynia',              en: 'gdynia' },
        'poznan':            { pl: 'poznań',              en: 'poznan' },
        'poznań':            { pl: 'poznań',              en: 'poznan' },
        'prague':            { pl: 'praga',               en: 'praga' },
        'praga':             { pl: 'praga',               en: 'praga' },
        'rome':              { pl: 'rzym',                en: 'rome' },
        'rzym':              { pl: 'rzym',                en: 'rome' },
        'ryga':              { pl: 'ryga',                en: 'riga' },
        'riga':              { pl: 'ryga',                en: 'riga' },
        'sicily':            { pl: 'sycylia',             en: 'sicily' },
        'sycylia':           { pl: 'sycylia',             en: 'sicily' },
        'sopot':             { pl: 'sopot',               en: 'sopot' },
        'venezia':           { pl: 'wenecja',             en: 'venice' },
        'wenecja':           { pl: 'wenecja',             en: 'venice' },
        'venice':            { pl: 'wenecja',             en: 'venice' },
        'viena':             { pl: 'wiedeń',              en: 'vienna' },
        'wieden':            { pl: 'wiedeń',              en: 'vienna' },
        'wiedien':           { pl: 'wiedeń',              en: 'vienna' },
        'wiedeń':            { pl: 'wiedeń',              en: 'vienna' },
        'vienna':            { pl: 'wiedeń',              en: 'vienna' },

        'batman':            { pl: 'batman',              en: 'batman' },
        'beach':             { pl: 'plaża',               en: 'beach' },
        'plaza':             { pl: 'plaża',               en: 'beach' },
        'plaża':             { pl: 'plaża',               en: 'beach' },
        'bear':              { pl: 'niedźwiedź',          en: 'bear' },
        'niedzwiedz':        { pl: 'niedźwiedź',          en: 'bear' },
        'niedźwiedź':        { pl: 'niedźwiedź',          en: 'bear' },
        'bicycle':           { pl: 'rower',               en: 'bicycle' },
        'rower':             { pl: 'rower',               en: 'bicycle' },
        'bird':              { pl: 'ptak',                en: 'bird' },
        'ptak':              { pl: 'ptak',                en: 'bird' },
        'buty':              { pl: 'buty',                en: 'shoes' },
        'shoes':             { pl: 'buty',                en: 'shoes' },
        'car':               { pl: 'samochód',            en: 'car' },
        'samochod':          { pl: 'samochód',            en: 'car' },
        'samochód':          { pl: 'samochód',            en: 'car' },
        'cat':               { pl: 'kot',                 en: 'cat' },
        'kot':               { pl: 'kot',                 en: 'cat' },
        'dog':               { pl: 'pies',                en: 'dog' },
        'pies':              { pl: 'pies',                en: 'dog' },
        'flower':            { pl: 'kwiaty',              en: 'flowers' },
        'flowers':           { pl: 'kwiaty',              en: 'flowers' },
        'kwiat':             { pl: 'kwiaty',              en: 'flowers' },
        'kwiaty':            { pl: 'kwiaty',              en: 'flowers' },
        'horse':             { pl: 'koń',                 en: 'horse' },
        'kon':               { pl: 'koń',                 en: 'horse' },
        'koń':               { pl: 'koń',                 en: 'horse' },
        'morze':             { pl: 'morze',               en: 'sea' },
        'sea':               { pl: 'morze',               en: 'sea' },
        'night':             { pl: 'noc',                 en: 'night' },
        'noc':               { pl: 'noc',                 en: 'night' },
        'pajak':             { pl: 'pająk',               en: 'spider' },
        'pająk':             { pl: 'pająk',               en: 'spider' },
        'spider':            { pl: 'pająk',               en: 'spider' },
        'spiderman':         { pl: 'spiderman',           en: 'spiderman' },
        'pociag':            { pl: 'pociąg',              en: 'train' },
        'pociąg':            { pl: 'pociąg',              en: 'train' },
        'train':             { pl: 'pociąg',              en: 'train' },
        'skateboard':        { pl: 'deskorolka',          en: 'skateboard' },
        'deskorolka':        { pl: 'deskorolka',          en: 'skateboard' },
        'winter':            { pl: 'zima',                en: 'zima' },
        'zima':              { pl: 'zima',                en: 'winter' },
        'znaki':             { pl: 'znaki',               en: 'signs' },
        'signs':             { pl: 'znaki',               en: 'signs' },
        'zorza':             { pl: 'zorza',               en: 'aurora' },
        'aurora':            { pl: 'zorza',               en: 'aurora' },
        'tagi':              { pl: 'tagi',                en: 'tags' },
        'tags':              { pl: 'tagi',                en: 'tags' },

        'fujifilm':          { pl: 'fujifilm',            en: 'fujifilm' },
        'nikon':             { pl: 'nikon',               en: 'nikon' },
        'olympus':           { pl: 'olympus',             en: 'olympus' },
        'ricoh':             { pl: 'ricoh',               en: 'ricoh' },
        'sony':              { pl: 'sony',                en: 'sony' }
    };

    function getDisplayTag(rawTag, lang) {
        if (!rawTag) return '';
        const key = rawTag.toLowerCase().trim();
        const entry = tagDictionary[key];
        return entry ? entry[lang] : rawTag;
    }

    const performSearch = () => {
        if (!searchInput) return;
        const term = searchInput.value.toLowerCase().trim();
        if (term === 'generator') { window.location.href = 'generator/index.html'; return; }

        document.querySelectorAll('.photo-card').forEach(card => {
            const cats = (card.getAttribute('data-category') || "").toLowerCase().split(/\s+/);
            const isMatch = term === "" ? card.classList.contains('highlight') : cats.some(cat => {
                if (!cat) return false;
                const entry = tagDictionary[cat];
                if (entry) {
                    return cat.startsWith(term) || 
                           entry.pl.toLowerCase().startsWith(term) || 
                           entry.en.toLowerCase().startsWith(term);
                }
                return cat.startsWith(term);
            });
            card.classList.toggle('hidden', !isMatch);
        });
    };

    const translations = {
        pl: {
            seoTitle: "Alan Łysiak | Fotografia",
            seoDesc: "Alan Łysiak – Portfolio fotograficzne. | Street | Portret | Abstrakcja | Podwójne ekspozycje | Zobacz moje fotografie, ziny i projekty. Kontakt: lyskier@gmail.com",
            searchPlaceholder: "szukaj...",
            searchBtn: "Szukaj",
            randomBtn: "Losowo",
            backToTop: "Wróć na górę",
            contactLink: "Kontakt",
            privacyLink: "Prywatność",
            termsLink: "Regulamin",
            prevImg: "Poprzednie zdjęcie",
            nextImg: "Następne zdjęcie",
            closeModal: "Zamknij",
            contactTitle: "Kontakt",
            contactDesc: "Masz jakieś pytania lub chcesz podjąć współpracę? Napisz bezpośrednio na mój email.",
            contactSub1: "Napisz wiadomość",
            btnEmail: "Wyślij e-mail",
            btnProfile: "Zobacz profil",
            privacyTitle: "Polityka Prywatności",
            privacyP1: "Ta strona szanuje Twoją prywatność. Używamy plików cookies oraz pamięci lokalnej przeglądarki wyłącznie w celach technicznych – do prawidłowego działania strony oraz obsługi licznika odwiedzin.",
            privacyP2: "Strona nie zbiera, nie przetwarza ani nie przekazuje Twoich danych osobowych firmom zewnętrznym w celach marketingowych.",
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
            backToTop: "Back to top",
            contactLink: "Contact",
            privacyLink: "Privacy",
            termsLink: "Terms",
            prevImg: "Previous photo",
            nextImg: "Next photo",
            closeModal: "Close",
            contactTitle: "Contact",
            contactDesc: "Have questions or want to collaborate? Feel free to write directly to my email.",
            contactSub1: "Send a message",
            btnEmail: "Send Email",
            btnProfile: "View Profile",
            privacyTitle: "Privacy Policy",
            privacyP1: "This website respects your privacy. We use cookies and local storage solely for technical purposes – to ensure proper site functionality and visit counter operations.",
            privacyP2: "The site does not collect, process, or share your personal data with third parties for marketing purposes.",
            termsTitle: "Terms of Service",
            termsP1: "All photographs and materials presented on this website are the property of Alan Łysiak and are protected by international copyright laws.",
            termsP2: "Copying, downloading, distributing, modifying, or any commercial use of these photographs without prior written permission from the author is strictly prohibited."
        }
    };

    function updateLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('site_lang', lang);
        localStorage.setItem('preferred_lang', lang);
        const t = translations[lang];
        if (!t) return;

        document.documentElement.lang = lang;
        const seoTitleEl = document.getElementById('seo-title');
        if (seoTitleEl) seoTitleEl.innerText = t.seoTitle;
        const seoDescEl = document.getElementById('seo-desc');
        if (seoDescEl) seoDescEl.setAttribute('content', t.seoDesc);

        const searchBtnEl = document.getElementById('search-btn');
        if (searchBtnEl) searchBtnEl.innerText = t.searchBtn;
        const randomBtnEl = document.getElementById('random-btn');
        if (randomBtnEl) randomBtnEl.innerText = t.randomBtn;
        const bttEl = document.getElementById('back-to-top');
        if (bttEl) bttEl.title = t.backToTop;

        document.querySelectorAll('.link-contact').forEach(el => el.innerText = t.contactLink);
        const privacyEl = document.getElementById('link-privacy');
        if (privacyEl) privacyEl.innerText = t.privacyLink;
        const termsEl = document.getElementById('link-terms');
        if (termsEl) termsEl.innerText = t.termsLink;

        if (prevBtn) prevBtn.setAttribute('aria-label', t.prevImg);
        if (nextBtn) nextBtn.setAttribute('aria-label', t.nextImg);
        if (closeBtn) closeBtn.setAttribute('aria-label', t.closeModal);

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

        const mPrivacyTitle = document.getElementById('modal-privacy-title');
        if (mPrivacyTitle) mPrivacyTitle.innerText = t.privacyTitle;
        const mPrivacyP1 = document.getElementById('modal-privacy-p1');
        if (mPrivacyP1) mPrivacyP1.innerText = t.privacyP1;
        const mPrivacyP2 = document.getElementById('modal-privacy-p2');
        if (mPrivacyP2) mPrivacyP2.innerText = t.privacyP2;

        const mTermsTitle = document.getElementById('modal-terms-title');
        if (mTermsTitle) mTermsTitle.innerText = t.termsTitle;
        const mTermsP1 = document.getElementById('modal-terms-p1');
        if (mTermsP1) mTermsP1.innerText = t.privacyP1; // fallback
        const mTermsP2 = document.getElementById('modal-terms-p2');
        if (mTermsP2) mTermsP2.innerText = t.privacyP2;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.innerText = t[key];
        });

        if (langPlBtn && langEnBtn) {
            if (lang === 'pl') {
                langPlBtn.classList.add('active');
                langEnBtn.classList.remove('active');
            } else {
                langEnBtn.classList.add('active');
                langPlBtn.classList.remove('active');
            }
        }

        if (searchInput) {
            const val = searchInput.value.trim();
            if (val !== '') {
                searchInput.value = getDisplayTag(val, lang);
                performSearch();
            }
        }

        typeIdx = 0;
        charIdx = 0;
        isDeleting = false;
        if (searchInput && document.activeElement !== searchInput) {
            startTypewriter();
        }
    }

    updateLanguage(currentLang);

    if (langPlBtn) langPlBtn.addEventListener('click', () => updateLanguage('pl'));
    if (langEnBtn) langEnBtn.addEventListener('click', () => updateLanguage('en'));

    // --- MODALE ---
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
        modals.forEach(modal => { if (modal) modal.classList.remove('active'); });
        updateBodyScroll();
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetModal = document.getElementById(trigger.getAttribute('data-target'));
            if (targetModal) { targetModal.classList.add('active'); updateBodyScroll(); }
        });
    });

    modalCloses.forEach(el => el.addEventListener('click', closeAllModals));
    modals.forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) closeAllModals(); }));

    // --- POBIERANIE Z SANITY ---
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

    // --- WYSZUKIWARKA Z AUTO-UZUPEŁNIANIEM (INLINE AUTOCOMPLETE) ORAZ LOSOWANIE ---
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

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
                performSearch();
                return;
            }

            const startPos = searchInput.selectionStart;
            const val = searchInput.value;
            if (val && startPos === val.length) {
                const term = val.toLowerCase();
                const match = activeCategories
                    .map(cat => cat[currentLang] || cat.pl)
                    .find(name => name.toLowerCase().startsWith(term));

                if (match && match.toLowerCase() !== term) {
                    searchInput.value = match;
                    searchInput.setSelectionRange(term.length, match.length);
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
