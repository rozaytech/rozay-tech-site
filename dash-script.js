// PROTEÇÃO E IDENTIFICAÇÃO
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";

const userName = localStorage.getItem('rozay_user') || "Engenheiro";
document.getElementById('logged-user-name').innerText = userName;
document.getElementById('user-initial').innerText = userName.charAt(0).toUpperCase();

// MENU HAMBÚRGUER
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('hidden');
};

// BANCO DE DADOS
let clientes = JSON.parse(localStorage.getItem('rozay_db')) || [
    { nome: "Hospital Central", tech: "Cabeamento", local: "Maputo", status: "online" },
    { nome: "Complexo Faume", tech: "Starlink", local: "Tete", status: "online" }
];

let meuGrafico = null;

function salvar() {
    localStorage.setItem('rozay_db', JSON.stringify(clientes));
    updateStats();
}

function navigateTo(menu, el) {
    ['resumo', 'clientes', 'infra'].forEach(s => document.getElementById('content-'+s).style.display = 'none');
    document.getElementById('content-'+menu).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    if(menu === 'resumo') initChart();
    if(menu === 'clientes') renderTable();
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('hidden');
}

function initChart() {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if(meuGrafico) meuGrafico.destroy();
    
    const data = {
        Starlink: clientes.filter(c => c.tech === "Starlink").length,
        Cabeamento: clientes.filter(c => c.tech === "Cabeamento").length,
        PtP: clientes.filter(c => c.tech === "PtP").length
    };

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{ data: Object.values(data), backgroundColor: ['#2563eb', '#10b981', '#f59e0b'] }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = clientes.map((c, i) => `
        <tr>
            <td><strong>${c.nome}</strong></td>
            <td>${c.tech}</td>
            <td>${c.local}</td>
            <td><span class="status-badge ${c.status}">${c.status}</span></td>
            <td><button onclick="eliminar(${i})" style="color:red; border:none; background:none; cursor:pointer;"><i class="fa-solid fa-trash"></i></button></td>
        </tr>
    `).join('');
    updateStats();
}

function updateStats() {
    document.getElementById("count-starlinks").innerText = clientes.filter(c => c.tech === "Starlink").length;
    document.getElementById("count-cabeamento").innerText = clientes.filter(c => c.tech === "Cabeamento").length;
    document.getElementById("count-alerts").innerText = clientes.filter(c => c.status === "offline").length;
}

// RELATÓRIO PDF
function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("ROZAY TECH SOLUTIONS - NOC", 14, 20);
    doc.setFontSize(10); doc.text("Responsável: " + userName, 14, 28);
    doc.text("Data: " + new Date().toLocaleString(), 14, 34);

    const rows = clientes.map(c => [c.nome, c.tech, c.local, c.status.toUpperCase()]);
    doc.autoTable({
        startY: 40,
        head: [['CLIENTE', 'TECNOLOGIA', 'LOCALIZAÇÃO', 'STATUS']],
        body: rows,
        headStyles: { fillColor: [15, 23, 42] }
    });
    doc.save("Relatorio_NOC_RozayTech.pdf");
}

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
    if(confirm("Eliminar registro?")) { clientes.splice(i, 1); salvar(); renderTable(); }
}

function toggleModal() {
    const m = document.getElementById("modalCliente");
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

window.onload = () => {
    document.getElementById("current-time-dash").innerText = new Date().toLocaleString();
    renderTable();
    initChart();
};