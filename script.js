/**
 * ROZAY TECH SOLUTIONS - SISTEMA CENTRAL
 * Desenvolvido para estabilidade e performance.
 */

/* =========================================
   1. SISTEMA DE LOADER (SPEEDLINE ANIMATION)
   ========================================= */
window.addEventListener('load', () => {
    let progress = 0;
    const progressEl = document.getElementById('loaderProgress');
    const percentEl = document.getElementById('loaderPercent');
    const loader = document.getElementById('loader');

    const loadingSequence = setInterval(() => {
        // Incremento técnico
        progress += Math.floor(Math.random() * 15) + 2;

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingSequence);
            
            // Fade-out do sistema
            setTimeout(() => {
                if(loader) {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity 0.8s ease-out';
                    setTimeout(() => {
                        loader.style.display = 'none';
                        initScrollReveal(); // Inicia animações após o loader
                    }, 800);
                }
            }, 400);
        }

        if(progressEl) progressEl.style.width = progress + '%';
        if(percentEl) percentEl.innerText = progress + '%';
    }, 90);
});

/* =========================================
   2. DIGITAL CLOCK (LED STYLE)
   ========================================= */
function initClock() {
    const clockDisplay = document.getElementById('calendar');
    
    function tick() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        
        if(clockDisplay) {
            clockDisplay.innerText = `${h}:${m}:${s}`;
        }
    }
    
    setInterval(tick, 1000);
    tick();
}
initClock();

/* =========================================
   3. THEME MANAGER (DARK/LIGHT PERSISTENTE)
   ========================================= */
const themeBtn = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('rozay_theme');
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    updateThemeIcon(true);
}

themeBtn?.addEventListener('click', () => {
    const isLight = body.classList.toggle('light-theme');
    localStorage.setItem('rozay_theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight);
});

function updateThemeIcon(isLight) {
    const icon = themeBtn?.querySelector('i');
    if(icon) {
        icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
}

/* =========================================
   4. VISITOR COUNTER (BASE 1041)
   ========================================= */
function manageVisitors() {
    const BASE_COUNT = 1041;
    let currentVisits = localStorage.getItem('rozay_total_visits');
    
    if (!currentVisits) {
        currentVisits = BASE_COUNT;
    } else {
        // Apenas incrementa se for uma nova sessão no browser
        if (!sessionStorage.getItem('rozay_session_active')) {
            currentVisits = parseInt(currentVisits) + 1;
            sessionStorage.setItem('rozay_session_active', 'true');
        }
    }
    
    localStorage.setItem('rozay_total_visits', currentVisits);
    const visitDisplay = document.getElementById('visits');
    if(visitDisplay) visitDisplay.innerText = currentVisits;
}
manageVisitors();

/* =========================================
   5. SCROLL REVEAL (ENGINEERING STYLE)
   ========================================= */
function initScrollReveal() {
    if (typeof ScrollReveal !== 'undefined') {
        const sr = ScrollReveal({
            origin: 'bottom',
            distance: '40px',
            duration: 1000,
            delay: 100,
            reset: false
        });

        sr.reveal('.hero-section h1', { delay: 100, origin: 'top' });
        sr.reveal('.service-card', { interval: 150, scale: 0.9 });
        sr.reveal('.lead-form-box', { origin: 'left' });
        sr.reveal('.quick-contacts a', { interval: 100, origin: 'right' });
    }
}

/* =========================================
   6. FORM VALIDATION & UI
   ========================================= */
console.log("%c Rozay Tech NOC Systems Active ", "color: #2563eb; font-weight: bold; font-size: 14px;");