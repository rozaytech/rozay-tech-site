// --- LÓGICA DE NAVEGAÇÃO (TABS) ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-target');

        // 1. Remove classe ativa de todos os botões
        navLinks.forEach(btn => btn.classList.remove('active'));
        // 2. Adiciona ao botão clicado
        link.classList.add('active');

        // 3. Esconde todas as seções
        sections.forEach(section => section.classList.remove('active'));
        // 4. Mostra a seção alvo
        document.getElementById(target).classList.add('active');

        // Fechar menu mobile ao clicar (opcional)
        document.getElementById('sidebar').classList.remove('open');
    });
});

// --- CONTROLE DO MENU HAMBÚRGUER ---
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');

menuToggle.onclick = () => sidebar.classList.add('open');
closeMenu.onclick = () => sidebar.classList.remove('open');

// --- RELÓGIO E SAUDAÇÃO ---
function updateTime() {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleString('pt-MZ');
    const hrs = now.getHours();
    const greet = document.getElementById('greeting');
    if(hrs < 12) greet.innerText = "Bom dia, Admin!";
    else if(hrs < 18) greet.innerText = "Boa tarde, Admin!";
    else greet.innerText = "Boa noite, Admin!";
}
setInterval(updateTime, 1000);

// --- INICIALIZAÇÃO DO GRÁFICO (CHART.JS) ---
const ctx = document.getElementById('serviceChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Starlink', 'Wireless', 'Consultoria', 'Drones'],
        datasets: [{
            data: [40, 25, 20, 15],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    },
    options: {
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    }
});