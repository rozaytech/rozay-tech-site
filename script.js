/* 1. SISTEMA DE LOADER FLASH SPEED */
window.addEventListener('load', () => {
    let progress = 0;
    const progressEl = document.getElementById('loaderProgress');
    const percentEl = document.getElementById('loaderPercent');
    const loader = document.getElementById('loader');

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 400);
        }
        if (progressEl) progressEl.style.width = progress + '%';
        if (percentEl) percentEl.innerText = progress + '%';
    }, 80);
});

/* 2. RELÓGIO DIGITAL (WHITE LED) */
function updateClock() {
    const clockEl = document.getElementById('calendar');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('pt-MZ', { hour12: false });
    }
}
setInterval(updateClock, 1000);
updateClock();

/* 3. TEMA LIGHT/DARK PERSISTENTE */
const themeBtn = document.getElementById('themeToggle');
const body = document.body;

// Carregar preferência
if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-theme');
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

/* 4. CONTADOR DE VISITAS (BASE 1041) */
let visits = localStorage.getItem('rozay_visits_total');
if (!visits) {
    visits = 1041; 
} else {
    // Só incrementa uma vez por sessão de navegação
    if (!sessionStorage.getItem('counted')) {
        visits = parseInt(visits) + 1;
        sessionStorage.setItem('counted', 'true');
    }
}
localStorage.setItem('rozay_visits_total', visits);
document.getElementById('visits').innerText = visits;

/* 5. ANIMAÇÕES SCROLL REVEAL */
ScrollReveal().reveal('.hero h1', { delay: 200, origin: 'top', distance: '50px' });
ScrollReveal().reveal('.card', { interval: 100, origin: 'bottom', distance: '30px', delay: 200 });
ScrollReveal().reveal('.contact-card-form', { delay: 300, scale: 0.9 });