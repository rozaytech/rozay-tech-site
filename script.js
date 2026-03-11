// REMOVIDO LOADER PARA GANHAR PERFORMANCE

// RELÓGIO E CALENDÁRIO
function updateClock() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('pt-MZ');
    
    const calendarEl = document.getElementById('calendar');
    if(calendarEl) calendarEl.innerText = `${day}/${month}/${year} • ${time}`;
}
setInterval(updateClock, 1000);
updateClock();

// THEME TOGGLE
const themeBtn = document.getElementById('themeToggle');
themeBtn.onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
};

// SCROLL REVEAL (ANIMAÇÕES SUAVES)
ScrollReveal().reveal('.hero-left', { delay: 200, origin: 'left', distance: '50px' });
ScrollReveal().reveal('.card', { interval: 100, scale: 0.85 });
ScrollReveal().reveal('.contact-card', { interval: 150, origin: 'bottom', distance: '30px' });

// REMOVIDO O FIREBASE LEADS (Já que agora o contacto é direto via WA/Email)