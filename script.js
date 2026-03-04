// 1. RELÓGIO COM DATA E HORA
function updateTime() {
    const el = document.getElementById('calendar');
    if (!el) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const timeStr = now.toLocaleTimeString('pt-MZ', { hour12: false });
    el.innerHTML = `<span style="opacity:0.5; font-size:11px;">${dateStr}</span> • ${timeStr}`;
}
setInterval(updateTime, 1000);
updateTime();

// 2. LOADER FLASH
window.addEventListener('load', () => {
    let p = 0;
    const bar = document.getElementById('loaderProgress');
    const txt = document.getElementById('loaderPercent');
    const inv = setInterval(() => {
        p += Math.floor(Math.random() * 20) + 10;
        if (p >= 100) {
            p = 100; clearInterval(inv);
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
            }, 300);
        }
        if(bar) bar.style.width = p + '%';
        if(txt) txt.innerText = p + '%';
    }, 100);
});

// 3. TEMA
const tBtn = document.getElementById('themeToggle');
tBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isL = document.body.classList.contains('light-theme');
    tBtn.innerHTML = isL ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// 4. CONTADOR 1042
let count = localStorage.getItem('rozay_v');
if (!count) { count = 1042; } else {
    if (!sessionStorage.getItem('hit')) {
        count = parseInt(count) + 1;
        sessionStorage.setItem('hit', 'y');
    }
}
localStorage.setItem('rozay_v', count);
document.getElementById('visits').innerText = count;

// 5. REVEAL
ScrollReveal().reveal('.card', { delay: 100, distance: '30px', origin: 'bottom', interval: 80 });