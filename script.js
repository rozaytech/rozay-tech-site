// 1. LOADER
window.addEventListener('load', () => {
    let p = 0;
    const inv = setInterval(() => {
        p += Math.floor(Math.random() * 20) + 5;
        if (p >= 100) {
            p = 100; clearInterval(inv);
            setTimeout(() => {
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
            }, 300);
        }
        document.getElementById('loaderProgress').style.width = p + '%';
        document.getElementById('loaderPercent').innerText = p + '%';
    }, 100);
});

// 2. RELÓGIO
function clock() {
    const d = new Date();
    document.getElementById('calendar').innerText = d.toLocaleTimeString('pt-MZ', { hour12: false });
}
setInterval(clock, 1000); clock();

// 3. TEMA
const btn = document.getElementById('themeToggle');
btn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    btn.querySelector('i').classList.toggle('fa-moon');
    btn.querySelector('i').classList.toggle('fa-sun');
});

// 4. CONTADOR (INÍCIO 1041)
let v = localStorage.getItem('rozay_v');
if (!v) { v = 1041; } else { v = parseInt(v) + 1; }
localStorage.setItem('rozay_v', v);
document.getElementById('visits').innerText = v;

// 5. REVEAL
ScrollReveal().reveal('.card', { delay: 200, distance: '20px', origin: 'bottom', interval: 100 });