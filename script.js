/* =========================================
   SISTEMA DE LOADER (O seu original)
   ========================================= */
window.addEventListener('load', () => {
    let progress = 0;
    const progressLimit = 100;
    const loaderPercent = document.getElementById('loaderPercent');
    const loaderProgress = document.getElementById('loaderProgress');
    const loader = document.getElementById('loader');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= progressLimit) {
            progress = progressLimit;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 500);
        }
        if (loaderProgress) loaderProgress.style.width = progress + '%';
        if (loaderPercent) loaderPercent.innerText = progress + '%';
    }, 100);
});

/* =========================================
   RELÓGIO EM TEMPO REAL (Novo)
   ========================================= */
function updateClock() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const now = new Date();
        // Formato Moçambique (24h)
        const timeString = now.toLocaleTimeString('pt-MZ', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        calendarEl.innerText = timeString;
    }
}
// Atualiza a cada 1 segundo
setInterval(updateClock, 1000);
updateClock(); // Inicia imediatamente

/* =========================================
   CONTADOR DE VISITAS (LocalStorage)
   ========================================= */
function updateVisits() {
    let visits = localStorage.getItem('rozay_visits') || 0;
    visits = parseInt(visits) + 1;
    localStorage.setItem('rozay_visits', visits);
    const visitEl = document.getElementById('visits');
    if (visitEl) visitEl.innerText = visits;
}
updateVisits();

/* =========================================
   ALTERNADOR DE TEMA (Dark/Light)
   ========================================= */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

/* =========================================
   ANIMAÇÕES SCROLL REVEAL (As suas originais)
   ========================================= */
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '60px',
        duration: 1000,
        delay: 200,
        reset: false // Para animar apenas uma vez ao descer
    });

    sr.reveal('.hero h1', { delay: 100, origin: 'left' });
    sr.reveal('.hero p', { delay: 300, origin: 'left' });
    sr.reveal('.badge', { delay: 100, scale: 0.8 });
    sr.reveal('.card', { interval: 100 });
    sr.reveal('.section h2', { delay: 100, origin: 'top' });
    sr.reveal('.contact-grid a', { interval: 150 });
}

/* =========================================
   SMOOTH SCROLL (Navegação Suave)
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});