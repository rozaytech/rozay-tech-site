// Relógio em Tempo Real
function updateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('pt-MZ');
    const time = now.toLocaleTimeString('pt-MZ');
    const clock = document.getElementById('calendar');
    if(clock) clock.innerText = `${date} • ${time}`;
}
setInterval(updateTime, 1000);
updateTime();

// Theme Toggle Funcional
const btn = document.getElementById('themeToggle');
btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// Animações Suaves
ScrollReveal().reveal('.section', { 
    delay: 200, 
    distance: '20px', 
    origin: 'bottom',
    interval: 100 
});