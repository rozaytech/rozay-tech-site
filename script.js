// Loader
let progress = 0;
const progressBar = document.getElementById("loaderProgress");
const percentText = document.getElementById("loaderPercent");

const loaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 2;
    if (progress > 100) progress = 100;
    if (progressBar) progressBar.style.width = progress + "%";
    if (percentText) percentText.innerText = progress + "%";

    if (progress === 100) {
        clearInterval(loaderInterval);
        setTimeout(() => {
            const loader = document.getElementById("loader");
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 500);
        }, 300);
    }
}, 120);

// Dark Mode
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle("dark");
        const icon = themeBtn.querySelector("i");
        icon.classList.toggle("fa-moon");
        icon.classList.toggle("fa-sun");
    };
}

// Data Atual (MZ)
function updateCalendar() {
    const calendar = document.getElementById("calendar");
    if (calendar) {
        calendar.innerText = new Date().toLocaleDateString("pt-MZ");
    }
}
updateCalendar();