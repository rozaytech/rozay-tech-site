// Loader
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
themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    const icon = themeBtn.querySelector("i");
    icon.classList.toggle("fa-moon");
    icon.classList.toggle("fa-sun");
};

// Data
document.getElementById("calendar").innerText = new Date().toLocaleDateString("pt-MZ");

// --- SUGESTÃO MASTER: SCROLL REVEAL ---
const sr = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1000,
    delay: 200,
    reset: false // A animação acontece apenas uma vez
});

sr.reveal('.hero h1', {});
sr.reveal('.hero p', { delay: 400 });
sr.reveal('.badge', { origin: 'top', delay: 500 });
sr.reveal('.card', { interval: 200 }); // Cards aparecem em sequência
sr.reveal('#sobre h2, #sobre p', { interval: 200 });
sr.reveal('.contact-card', { interval: 150, origin: 'right' });