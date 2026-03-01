// PROTEÇÃO E LOGOUT
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";

function logout() {
    localStorage.removeItem('rozay_auth');
    window.location.href = "login.html";
}

// PERSISTÊNCIA (BASE DE DADOS NO NAVEGADOR)
let clientes = JSON.parse(localStorage.getItem('rozay_db')) || [
    { nome: "Porto de Maputo", tech: "Starlink", local: "Maputo", status: "online" },
    { nome: "Hotel Tofo", tech: "PtP", local: "Inhambane", status: "online" }
];

let meuGrafico = null;

function salvar() {
    localStorage.setItem('rozay_db', JSON.stringify(clientes));
    updateStats();
}

// NAVEGAÇÃO
function navigateTo(menuKey, element) {
    const sections = ['content-resumo', 'content-clientes', 'content-infra'];
    sections.forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('content-' + menuKey).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    element.classList.add('active');
    if(menuKey === 'resumo') initChart();
    if(menuKey === 'clientes') renderTable();
}

// GRÁFICOS DINÂMICOS (REAGEM AOS DADOS)
function initChart() {
    const canvas = document.getElementById('meuGrafico');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(meuGrafico) meuGrafico.destroy();
    
    const counts = {
        Starlink: clientes.filter(c => c.tech === "Starlink").length,
        PtP: clientes.filter(c => c.tech === "PtP").length,
        Fibra: clientes.filter(c => c.tech === "Fibra").length
    };

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { padding: 20, font: { weight: 'bold' } } } }
        }
    });
}

// SIMULAÇÃO DE REDE (ALERTA EM TEMPO REAL)
setInterval(() => {
    if(clientes.length > 0) {
        // Chance de 15% de um status mudar a cada 10 segundos
        if(Math.random() > 0.85) {
            let i = Math.floor(Math.random() * clientes.length);
            clientes[i].status = (clientes[i].status === 'online') ? 'offline' : 'online';
            renderTable();
            salvar();
        }
    }
}, 10000);

// TABELA E ESTATÍSTICAS
function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    if(!tbody) return;
    tbody.innerHTML = clientes.map((c, i) => `
        <tr>
            <td><strong>${c.nome}</strong></td>
            <td><span style="font-size: 11px; font-weight:bold; color:#64748b">${c.tech}</span></td>
            <td>${c.local}</td>
            <td><span class="status-badge ${c.status}">${c.status}</span></td>
            <td><button onclick="eliminar(${i})" style="color:#ef4444; border:none; background:none; cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
    updateStats();
}

function updateStats() {
    document.getElementById("count-starlinks").innerText = clientes.filter(c => c.tech === "Starlink").length;
    document.getElementById("count-ptp").innerText = clientes.filter(c => c.tech === "PtP").length;
    document.getElementById("count-alerts").innerText = clientes.filter(c => c.status === "offline").length;
}

// OPERAÇÕES
document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    clientes.push({
        nome: document.getElementById("nome").value,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        status: "online"
    });
    toggleModal();
    this.reset();
    salvar();
    renderTable();
};

function eliminar(i) {
    if(confirm("Remover sistema da monitorização?")) {
        clientes.splice(i, 1);
        salvar();
        renderTable();
    }
}

function toggleModal() {
    const m = document.getElementById("modalCliente");
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
}

window.onload = () => {
    document.getElementById("current-time-dash").innerText = new Date().toLocaleString('pt-MZ');
    renderTable();
    initChart();
};