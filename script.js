// 1. LOADER FLASH
window.addEventListener('load', () => {
    let p = 0;
    const bar = document.getElementById('loaderProgress');
    const txt = document.getElementById('loaderPercent');
    const ldr = document.getElementById('loader');

    const inv = setInterval(() => {
        p += Math.floor(Math.random() * 25) + 5;
        if (p >= 100) {
            p = 100; clearInterval(inv);
            setTimeout(() => {
                ldr.style.opacity = '0';
                setTimeout(() => ldr.style.display = 'none', 500);
            }, 300);
        }
        if (bar) bar.style.width = p + '%';
        if (txt) txt.innerText = p + '%';
    }, 100);
});

// 2. RELÓGIO LED
function tick() {
    const el = document.getElementById('calendar');
    if (el) el.innerText = new Date().toLocaleTimeString('pt-MZ', { hour12: false });
}
setInterval(tick, 1000); tick();

// 3. TEMA
const tBtn = document.getElementById('themeToggle');
tBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isL = document.body.classList.contains('light-theme');
    tBtn.innerHTML = isL ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('rozay_t', isL ? 'light' : 'dark');
});
if(localStorage.getItem('rozay_t') === 'light') {
    document.body.classList.add('light-theme');
    tBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// 4. CONTADOR 1041
let count = localStorage.getItem('rozay_v');
if (!count) { count = 1041; } else {
    if (!sessionStorage.getItem('hit')) {
        count = parseInt(count) + 1;
        sessionStorage.setItem('hit', 'y');
    }
}
localStorage.setItem('rozay_v', count);
document.getElementById('visits').innerText = count;

// 5. REVEAL
ScrollReveal().reveal('.card', { delay: 200, distance: '20px', origin: 'bottom', interval: 100 });