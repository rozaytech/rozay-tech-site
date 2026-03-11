// Relógio em Tempo Real
function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString('pt-MZ');
    const time = now.toLocaleTimeString('pt-MZ');
    const cal = document.getElementById('calendar');
    if(cal) cal.innerText = `${date} • ${time}`;
}
setInterval(updateClock, 1000);
updateClock();

// Theme Toggle Funcional
const themeBtn = document.getElementById('themeToggle');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    localStorage.setItem('rozay_theme', isDark ? 'dark' : 'light');
});

// Persistência de Tema
if(localStorage.getItem('rozay_theme') === 'light') {
    document.body.classList.remove('dark-theme');
    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

// Configuração do ScrollReveal (Animações)
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1000,
    delay: 200,
    reset: true
});

sr.reveal('.reveal-up');
sr.reveal('.reveal-card', { interval: 150 });
sr.reveal('.contact-triangle', { origin: 'top' });

// Efeito Neon ao posicionar (Hover via JS para garantir brilho extra)
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.boxShadow = `0 0 25px var(--neon)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.boxShadow = 'none';
    });
});