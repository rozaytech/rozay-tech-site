// 1. SEGURANÇA E IDENTIDADE
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";

const loggedUser = localStorage.getItem('rozay_user') || "Engenheiro";
const hour = new Date().getHours();
let saudacao = "Boa noite";
if (hour < 12) saudacao = "Bom dia";
else if (hour < 18) saudacao = "Boa tarde";

// Aplicar Boas-vindas
document.getElementById('welcome-msg').innerText = `${saudacao}, ${loggedUser}!`;
document.getElementById('logged-user-name').innerText = loggedUser;
document.getElementById('user-initial').innerText = loggedUser.charAt(0).toUpperCase();

if(document.getElementById('infra-user-name')) {
    document.getElementById('infra-user-name').innerText = loggedUser;
}

// 2. BANCO DE DADOS (LOCAL STORAGE)
let clientes = JSON.parse(localStorage.getItem('rozay_db')) || [
    { nome: "Exemplo Rozay", tech: "Starlink", local: "Tete", status: "online" }
];

let meuGrafico = null;

function salvar() {
    localStorage.setItem('rozay_db', JSON.stringify(clientes));
    updateStats();
}

// 3. NAVEGAÇÃO E MENU
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('active');
};

function navigateTo(page, el) {
    ['resumo', 'clientes', 'infra'].forEach(s => document.getElementById('content-'+s).style.display = 'none');
    document.getElementById('content-'+page).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    if(window.innerWidth < 900) document.getElementById('sidebar').classList.remove('active');
    if(page === 'resumo') initChart();
    if(page === 'clientes') renderTable();
}

// 4. CRUD (CREATE, READ, UPDATE, DELETE)
function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    tbody.innerHTML = clientes.map((c, i) => `
        <tr>
            <td><strong>${c.nome}</strong></td>
            <td>${c.tech}</td>
            <td>${c.local}</td>
            <td><span class="status-badge ${c.status}">${c.status}</span></td>
            <td>
                <button onclick="prepararEdicao(${i})" style="color:#2563eb; border:none; background:none; cursor:pointer; margin-right:10px;"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="eliminar(${i})" style="color:#ef4444; border:none; background:none; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
    updateStats();
}

function prepararEdicao(index) {
    const c = clientes[index];
    document.getElementById('modalTitle').innerText = "Editar Cliente";
    document.getElementById('editIndex').value = index;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('status').value = c.status;
    toggleModal();
}

document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    const index = document.getElementById('editIndex').value;
    
    const novoDado = {
        nome: document.getElementById("nome").value,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        status: document.getElementById("status").value
    };

    if(index === "") {
        clientes.push(novoDado);
    } else {
        clientes[index] = novoDado;
    }

    toggleModal();
    salvar();
    renderTable();
    this.reset();
};

function eliminar(i) {
    if(confirm("Deseja eliminar este registro?")) {
        clientes.splice(i, 1);
        salvar();
        renderTable();
    }
}

function toggleModal() {
    const m = document.getElementById("modalCliente");
    if(m.style.display !== "flex") {
        m.style.display = "flex";
    } else {
        m.style.display = "none";
        document.getElementById('modalTitle').innerText = "Nova Instalação";
        document.getElementById('formCliente').reset();
        document.getElementById('editIndex').value = "";
    }
}

// 5. RELATÓRIO PDF COM DATA E HORA
function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataHora = new Date().toLocaleString('pt-MZ');
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("ROZAY TECH SOLUTIONS - NOC REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado por: ${loggedUser}`, 14, 28);
    doc.text(`Data e Hora: ${dataHora}`, 14, 34); // AQUI ESTÁ A DATA
    
    const rows = clientes.map(c => [c.nome, c.tech, c.local, c.status.toUpperCase()]);
    doc.autoTable({
        startY: 40,
        head: [['CLIENTE', 'TECNOLOGIA', 'MORADA', 'ESTADO']],
        body: rows,
        headStyles: { fillColor: [15, 23, 42] }
    });
    
    doc.save(`Rozay_NOC_Report_${new Date().getTime()}.pdf`);
}

// 6. ESTATÍSTICAS E GRÁFICOS
function updateStats() {
    document.getElementById("count-starlinks").innerText = clientes.filter(c => c.tech === "Starlink").length;
    document.getElementById("count-cabeamento").innerText = clientes.filter(c => c.tech === "Cabeamento").length;
    document.getElementById("count-alerts").innerText = clientes.filter(c => c.status === "offline").length;
}

function initChart() {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if(meuGrafico) meuGrafico.destroy();
    const stats = {
        Starlink: clientes.filter(c => c.tech === "Starlink").length,
        Cabeamento: clientes.filter(c => c.tech === "Cabeamento").length,
        PtP: clientes.filter(c => c.tech === "PtP").length
    };
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{ data: Object.values(stats), backgroundColor: ['#2563eb', '#10b981', '#f59e0b'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function logout() { localStorage.clear(); window.location.href = "login.html"; }

window.onload = () => {
    document.getElementById("current-time-dash").innerText = new Date().toLocaleString();
    renderTable();
    initChart();
};