// 1. LOADER FLASH
window.addEventListener('load', () => {
    let p = 0;
    const inv = setInterval(() => {
        p += Math.floor(Math.random() * 20) + 10;
        if (p >= 100) {
            p = 100; clearInterval(inv);
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
            }, 200);
        }
        document.getElementById('loaderProgress').style.width = p + '%';
        document.getElementById('loaderPercent').innerText = p + '%';
    }, 100);
});

// 2. RELÓGIO WHITE LED
function tick() {
    const el = document.getElementById('calendar');
    if (el) el.innerText = new Date().toLocaleTimeString('pt-MZ', { hour12: false });
}
setInterval(tick, 1000); tick();

// 3. TEMA
const tBtn = document.getElementById('themeToggle');
tBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    tBtn.innerHTML = document.body.classList.contains('light-theme') ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

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