// 1. RELÓGIO COM DATA E HORA
function updateTime() {
    const el = document.getElementById('calendar');
    if (!el) return;
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    el.innerText = now.toLocaleString('pt-MZ', options).replace(',', ' •');
}
setInterval(updateTime, 1000);
updateTime();

// 2. LOADER
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
    }, 80);
});

// 3. TEMA
const tBtn = document.getElementById('themeToggle');
tBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isL = document.body.classList.contains('light-theme');
    tBtn.innerHTML = isL ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// 4. CONTADOR
let count = localStorage.getItem('rozay_v');
if (!count) count = 1042;
if (!sessionStorage.getItem('hit')) {
    count = parseInt(count) + 1;
    sessionStorage.setItem('hit', 'y');
}
localStorage.setItem('rozay_v', count);
document.getElementById('visits').innerText = count;

// 5. REVEAL
ScrollReveal().reveal('.card', { delay: 100, distance: '20px', origin: 'bottom', interval: 50 });