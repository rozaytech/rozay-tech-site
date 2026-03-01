// 1. Sistema do Loader
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

// 2. Tema Dark/Light
const themeBtn = document.getElementById("themeToggle");
if(themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle("dark");
        const icon = themeBtn.querySelector("i");
        icon.classList.toggle("fa-moon");
        icon.classList.toggle("fa-sun");
    };
}

// 3. Data Atual (Moçambique)
document.getElementById("calendar").innerText = new Date().toLocaleDateString("pt-MZ");

// 4. Contador de Visitas (Simulação Profissional)
function updateVisits() {
    // Usamos o localStorage para simular persistência se a API falhar
    let visits = localStorage.getItem('visit_count') || 1240;
    visits = parseInt(visits) + 1;
    localStorage.setItem('visit_count', visits);
    
    // Mostra o número formatado
    document.getElementById('visits').innerText = visits.toLocaleString();
}
updateVisits();

// 5. Animações de Scroll
const sr = ScrollReveal({ 
    origin: 'bottom', 
    distance: '60px', 
    duration: 1000, 
    delay: 200, 
    reset: false 
});

sr.reveal('.badge', { origin: 'top', delay: 400 });
sr.reveal('.hero h1', { delay: 500 });
sr.reveal('.card', { interval: 200 });
sr.reveal('#sobre', { delay: 300 });