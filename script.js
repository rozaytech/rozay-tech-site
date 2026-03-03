/* LOADER */
window.addEventListener('load', () => {
    let p = 0;
    const bar = document.getElementById('loaderProgress');
    const txt = document.getElementById('loaderPercent');
    const loader = document.getElementById('loader');

    const interval = setInterval(() => {
        p += Math.floor(Math.random() * 15) + 5;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 300);
        }
        if (bar) bar.style.width = p + '%';
        if (txt) txt.innerText = p + '%';
    }, 100);
});

/* RELÓGIO */
function updateClock() {
    const el = document.getElementById('calendar');
    if (el) el.innerText = new Date().toLocaleTimeString('pt-MZ', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

/* TEMA */
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const icon = themeBtn.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

/* CONTADOR (Base 1041) */
let visits = localStorage.getItem('rozay_visits');
if (!visits) {
    visits = 1041;
} else {
    visits = parseInt(visits) + 1;
}
localStorage.setItem('rozay_visits', visits);
document.getElementById('visits').innerText = visits;

/* REVEAL */
ScrollReveal().reveal('.card', { delay: 200, distance: '30px', origin: 'bottom', interval: 100 });