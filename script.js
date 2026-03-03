/**
 * ROZAY TECH SOLUTIONS - Script Principal v2.5
 * Localização: Moçambique
 * Funcionalidades: Loader, Relógio, Tema, Visitas, ScrollReveal, Smooth Scroll e Leads.
 */

/* 1. SISTEMA DE PRE-LOADER (ANIMADO) */
window.addEventListener('load', () => {
    let progress = 0;
    const progressLimit = 100;
    const loaderPercent = document.getElementById('loaderPercent');
    const loaderProgress = document.getElementById('loaderProgress');
    const loader = document.getElementById('loader');

    // Simulação de carregamento de recursos
    const interval = setInterval(() => {
        // Incremento aleatório para parecer natural
        progress += Math.floor(Math.random() * 12) + 5;
        
        if (progress >= progressLimit) {
            progress = progressLimit;
            clearInterval(interval);
            
            // Efeito de saída suave
            setTimeout(() => {
                if (loader) {
                    loader.style.opacity = '0';
                    loader.style.transition = 'opacity 0.6s ease';
                    setTimeout(() => {
                        loader.style.display = 'none';
                    }, 600);
                }
            }, 500);
        }

        // Atualização visual da barra e do texto
        if (loaderProgress) {
            loaderProgress.style.width = progress + '%';
        }
        if (loaderPercent) {
            loaderPercent.innerText = progress + '%';
        }
    }, 120);
});

/* 2. RELÓGIO DIGITAL (MAPUTO TIME - 24H) */
function startRealTimeClock() {
    const calendarEl = document.getElementById('calendar');
    
    function update() {
        if (!calendarEl) return;
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const segundos = String(agora.getSeconds()).padStart(2, '0');
        
        calendarEl.innerText = `${horas}:${minutos}:${segundos}`;
    }

    setInterval(update, 1000);
    update(); // Execução imediata
}
startRealTimeClock();

/* 3. GESTÃO DE TEMA (DARK / LIGHT MODE) */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        // Alterna a classe no body
        document.body.classList.toggle('light-theme');
        
        // Troca o ícone (Lua/Sol)
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('rozay_theme', 'light');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('rozay_theme', 'dark');
        }
    });
}

// Persistência do tema ao recarregar a página
if (localStorage.getItem('rozay_theme') === 'light') {
    document.body.classList.add('light-theme');
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

/* 4. CONTADOR DE VISITAS ÚNICAS */
function initVisitorCounter() {
    let visits = localStorage.getItem('rozay_visits') || 0;
    // Só incrementa se for uma nova sessão (opcional)
    if (!sessionStorage.getItem('session_start')) {
        visits = parseInt(visits) + 1;
        localStorage.setItem('rozay_visits', visits);
        sessionStorage.setItem('session_start', 'true');
    }
    
    const visitEl = document.getElementById('visits');
    if (visitEl) {
        visitEl.innerText = visits;
    }
}
initVisitorCounter();

/* 5. ANIMAÇÕES DE ENTRADA (SCROLL REVEAL) */
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
        origin: 'bottom',
        distance: '50px',
        duration: 1200,
        delay: 200,
        reset: false // Não repete para não cansar o utilizador
    });

    sr.reveal('.hero h1', { delay: 100, origin: 'left' });
    sr.reveal('.hero p', { delay: 300, origin: 'left' });
    sr.reveal('.badge', { delay: 100, scale: 0.9 });
    sr.reveal('.card', { interval: 150, rotate: { x: 10, y: 0, z: 0 } });
    sr.reveal('.section h2', { delay: 100, origin: 'top' });
    sr.reveal('.contact-grid a', { interval: 100, scale: 0.8 });
    sr.reveal('.card form', { delay: 400 });
}

/* 6. NAVEGAÇÃO SUAVE (SMOOTH SCROLL) */
document.querySelectorAll('.nav-links a, .hero a').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Compensação da topbar fixa
                    behavior: 'smooth'
                });
            }
        }
    });
});

console.log("Rozay Tech Solutions: Sistemas operacional.");