/* =========================================
   1. LOADER FLASH SYSTEM
   ========================================= */
window.addEventListener('load', () => {
    let progress = 0;
    const loaderProgress = document.getElementById('loaderProgress');
    const loaderPercent = document.getElementById('loaderPercent');
    const loader = document.getElementById('loader');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 300);
        }
        if (loaderProgress) loaderProgress.style.width = progress + '%';
        if (loaderPercent) loaderPercent.innerText = progress + '%';
    }, 100);
});

/* =========================================
   2. RELÓGIO DIGITAL (WHITE LED)
   ========================================= */
function updateClock() {
    const calendarEl = document.getElementById('calendar');
    if (clockEl = calendarEl) {
        const agora = new Date();
        clockEl.innerText = agora.toLocaleTimeString('pt-MZ', { hour12: false });
    }
}
setInterval(updateClock, 1000);
updateClock();

/* =========================================
   3. TEMA (DARK/LIGHT PERSISTENTE)
   ========================================= */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('rozay_theme', 'light');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('rozay_theme', 'dark');
        }
    });
}

// Manter tema ao recarregar
if (localStorage.getItem('rozay_theme') === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
}

/* =========================================
   4. CONTADOR DE VISITAS (INÍCIO 1041)
   ========================================= */
function initCounter() {
    let visits = localStorage.getItem('rozay_visits_total');
    if (!visits) {
        visits = 1041; 
    } else {
        // Incrementa apenas se for uma nova sessão no browser
        if (!sessionStorage.getItem('counted')) {
            visits = parseInt(visits) + 1;
            sessionStorage.setItem('counted', 'true');
        }
    }
    localStorage.setItem('rozay_visits_total', visits);
    const visitEl = document.getElementById('visits');
    if (visitEl) visitEl.innerText = visits;
}
initCounter();

/* =========================================
   5. SCROLL REVEAL (ANIMAÇÕES)
   ========================================= */
ScrollReveal().reveal('.card', { delay: 200, distance: '30px', interval: 100, origin: 'bottom' });
ScrollReveal().reveal('.hero h1', { delay: 100, origin: 'top', distance: '20px' });
ScrollReveal().reveal('.form-container', { delay: 300, scale: 0.9 });