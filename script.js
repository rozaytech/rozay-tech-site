// Loader Progressivo
let progress = 0;
const loaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;
    document.getElementById("loaderProgress").style.width = progress + "%";
    document.getElementById("loaderPercent").innerText = progress + "%";
    if (progress === 100) {
        clearInterval(loaderInterval);
        setTimeout(() => {
            const l = document.getElementById("loader");
            l.style.opacity = "0";
            setTimeout(() => l.style.display = "none", 600);
        }, 300);
    }
}, 100);

// Dark Mode
const themeBtn = document.getElementById("themeToggle");
if(themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle("dark");
        const icon = themeBtn.querySelector("i");
        icon.classList.toggle("fa-moon");
        icon.classList.toggle("fa-sun");
    };
}

// Data Moçambique
document.getElementById("calendar").innerText = new Date().toLocaleDateString("pt-MZ");

// --- SCROLL REVEAL (Ajustado para começar do Topo) ---
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '50px',
    duration: 1000,
    delay: 200,
    reset: false
});

// Animação imediata para o Topo e Hero
sr.reveal('.topbar', { origin: 'top', delay: 100 });
sr.reveal('.navbar', { origin: 'top', delay: 300 });
sr.reveal('.badge', { origin: 'top', delay: 500 });
sr.reveal('.hero h1', { delay: 600 });
sr.reveal('.hero p', { delay: 800 });

// Animação para o resto das seções
sr.reveal('#sobre', { delay: 400 });
sr.reveal('.card', { interval: 150 });
sr.reveal('.contact-card', { interval: 100, origin: 'right' });