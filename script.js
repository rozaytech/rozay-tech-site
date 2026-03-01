// Loader Progressivo Real
let progress = 0;
const progressBar = document.getElementById("loaderProgress");
const percentText = document.getElementById("loaderPercent");
const loaderDiv = document.getElementById("loader");

const loaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 5) + 2; // Incremento aleatório para parecer natural

    if (progress > 100) progress = 100;

    if (progressBar) progressBar.style.width = progress + "%";
    if (percentText) percentText.innerText = progress + "%";

    if (progress === 100) {
        clearInterval(loaderInterval);
        setTimeout(() => {
            loaderDiv.style.opacity = "0"; // Efeito fade-out
            setTimeout(() => {
                loaderDiv.style.display = "none";
            }, 500);
        }, 300);
    }
}, 100);

// Dark Mode com Troca de Ícone
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle("dark");
        const icon = themeBtn.querySelector("i");
        
        if (document.body.classList.contains("dark")) {
            icon.classList.replace("fa-moon", "fa-sun");
        } else {
            icon.classList.replace("fa-sun", "fa-moon");
        }
    };
}

// Calendário Atualizado
function updateCalendar() {
    const calendar = document.getElementById("calendar");
    if (calendar) {
        // Exibe a data no formato local de Moçambique
        calendar.innerText = new Date().toLocaleDateString("pt-MZ");
    }
}
updateCalendar();

// Evitar recarregamento do formulário (apenas para teste)
document.getElementById('contactForm').onsubmit = (e) => {
    e.preventDefault();
    alert("Pedido enviado com sucesso! (Simulação)");
};