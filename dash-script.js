import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } 
from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U",
    authDomain: "rozaytech-noc.firebaseapp.com",
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com",
    projectId: "rozaytech-noc",
    storageBucket: "rozaytech-noc.firebasestorage.app",
    messagingSenderId: "129382246448",
    appId: "1:129382246448:web:f0ce1b7fca23eed17da5f5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'clientes');
const logsRef = ref(db, 'logs');

// Segurança
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";
const loggedUser = localStorage.getItem('rozay_user') || "Engenheiro";

let clientes = {};
let meuGrafico = null;

// Escuta Clientes
onValue(dbRef, (snapshot) => {
    clientes = snapshot.val() || {};
    renderTable();
    renderFaturacao();
    updateStats();
    initChart();
});

// Escuta Logs
onValue(logsRef, (snapshot) => {
    const logs = snapshot.val() || {};
    renderLogs(logs);
});

// Navegação Inteligente
window.navigateTo = (page, el) => {
    document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
    document.getElementById('content-' + page).style.display = 'block';
    
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');

    if(window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('active');
    }
    if(page === 'resumo') initChart();
};

document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('active');
};

// CRUD Cloud
window.toggleModal = () => {
    const m = document.getElementById("modalCliente");
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
    if(m.style.display === "none") {
        document.getElementById('formCliente').reset();
        document.getElementById('editIndex').value = "";
        document.getElementById('modalTitle').innerText = "Novo Registo NOC";
    }
};

document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    const key = document.getElementById('editIndex').value;
    const nomeClie = document.getElementById("nome").value;
    const dados = {
        nome: nomeClie,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        valor: Number(document.getElementById("valor").value),
        status: document.getElementById("status").value,
        user: loggedUser,
        data: new Date().toLocaleString('pt-MZ')
    };

    if(key === "") {
        push(dbRef, dados);
        registrarLog("Criação", `Adicionou cliente: ${nomeClie}`);
    } else {
        update(ref(db, `clientes/${key}`), dados);
        registrarLog("Edição", `Editou dados de: ${nomeClie}`);
    }
    toggleModal();
};

window.prepararEdicao = (key) => {
    const c = clientes[key];
    document.getElementById('editIndex').value = key;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('valor').value = c.valor || 0;
    document.getElementById('status').value = c.status;
    document.getElementById('modalTitle').innerText = "Editar Registo";
    toggleModal();
};

window.eliminar = (key) => {
    if(confirm("Deseja eliminar este registo da Nuvem?")) {
        const nome = clientes[key].nome;
        remove(ref(db, `clientes/${key}`));
        registrarLog("Remoção", `Apagou o registo: ${nome}`);
    }
};

// Auditoria
function registrarLog(acao, detalhe) {
    push(logsRef, {
        data: new Date().toLocaleString('pt-MZ'),
        user: loggedUser,
        acao: acao,
        msg: detalhe
    });
}

// Renderizações
function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    Object.keys(clientes).forEach(key => {
        const c = clientes[key];
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.tech}</td>
                <td>${c.local}</td>
                <td><strong>${(c.valor || 0).toLocaleString()} MT</strong></td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                    <button onclick="prepararEdicao('${key}')" style="color:var(--primary);border:none;background:none;cursor:pointer;font-size:16px;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="eliminar('${key}')" style="color:var(--danger);border:none;background:none;cursor:pointer;font-size:16px;margin-left:10px;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function renderFaturacao() {
    const tbody = document.getElementById("faturacaoTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    let total = 0;
    Object.values(clientes).forEach(c => {
        const v = c.valor || 0;
        total += v;
        tbody.innerHTML += `<tr><td>${c.nome}</td><td>${c.user}</td><td>${c.data}</td><td><strong>${v.toLocaleString()} MT</strong></td></tr>`;
    });
    document.getElementById("total-faturacao-header").innerText = total.toLocaleString() + " MT";
    document.getElementById("count-receita").innerText = total.toLocaleString() + " MT";
}

function renderLogs(logsObj) {
    const tbody = document.getElementById("logsTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    Object.values(logsObj).reverse().slice(0, 20).forEach(l => {
        tbody.innerHTML += `<tr><td>${l.data}</td><td><strong>${l.user}</strong></td><td>${l.acao}</td><td>${l.msg}</td></tr>`;
    });
}

function updateStats() {
    const lista = Object.values(clientes);
    document.getElementById("count-total").innerText = lista.length;
    document.getElementById("count-alerts").innerText = lista.filter(c => c.status === 'offline').length;
}

function initChart() {
    const ctx = document.getElementById('meuGrafico')?.getContext('2d');
    if(!ctx) return;
    if(meuGrafico) meuGrafico.destroy();
    const stats = {};
    Object.values(clientes).forEach(c => stats[c.tech] = (stats[c.tech] || 0) + 1);
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(stats), datasets: [{ data: Object.values(stats), backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Relatório
window.gerarRelatorioPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ROZAY TECH - INVENTÁRIO NOC", 14, 20);
    const rows = Object.values(clientes).map(c => [c.nome, c.tech, c.local, c.valor + " MT", c.status.toUpperCase()]);
    doc.autoTable({ startY: 30, head: [['Cliente', 'Serviço', 'Morada', 'Valor', 'Estado']], body: rows });
    doc.save("NOC_RozayTech.pdf");
};

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
document.getElementById("welcome-msg").innerText = `NOC Ativo: ${loggedUser}`;
document.getElementById("logged-user-name").innerText = loggedUser;
document.getElementById("user-initial").innerText = loggedUser.charAt(0).toUpperCase();
setInterval(() => document.getElementById("current-time-dash").innerText = new Date().toLocaleString('pt-MZ'), 1000);