import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, update } 
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

// Proteção de Acesso
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";

// Pega o nome do utilizador salvo no login
const loggedUser = localStorage.getItem('rozay_user') || "Admin";

let clientes = {};
let meuGrafico = null;

// Sincronismo Inicial
onValue(dbRef, (snap) => {
    clientes = snap.val() || {};
    renderEverything();
});

onValue(logsRef, (snap) => {
    const logs = snap.val() || {};
    const lbody = document.getElementById("logsTableBody");
    if(lbody) {
        lbody.innerHTML = "";
        Object.values(logs).reverse().slice(0, 15).forEach(l => {
            lbody.innerHTML += `<tr><td>${l.data}</td><td><strong>${l.user}</strong></td><td>${l.acao}</td><td>${l.msg}</td></tr>`;
        });
    }
});

// Interface
window.navigateTo = (page, el) => {
    document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
    document.getElementById('content-' + page).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    if(window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('active');
    if(page === 'resumo') initChart();
};

document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('active');

window.toggleModal = () => {
    const m = document.getElementById("modalCliente");
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
};

// CRUD
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
        push(logsRef, { data: dados.data, user: loggedUser, acao: "Adição", msg: `Registou ${nomeClie}` });
    } else {
        update(ref(db, `clientes/${key}`), dados);
        push(logsRef, { data: dados.data, user: loggedUser, acao: "Edição", msg: `Alterou ${nomeClie}` });
    }
    toggleModal();
    this.reset();
};

window.prepararEdicao = (key) => {
    const c = clientes[key];
    document.getElementById('editIndex').value = key;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('valor').value = c.valor;
    document.getElementById('status').value = c.status;
    document.getElementById('modalTitle').innerText = "Editar Registo";
    toggleModal();
};

window.eliminar = (key) => {
    if(confirm("Apagar da Cloud?")) {
        const nome = clientes[key].nome;
        remove(ref(db, `clientes/${key}`));
        push(logsRef, { data: new Date().toLocaleString(), user: loggedUser, acao: "Eliminação", msg: `Apagou ${nome}` });
    }
};

function renderEverything() {
    const tbody = document.getElementById("clientTableBody");
    const fbody = document.getElementById("faturacaoTableBody");
    let total = 0; let off = 0;
    
    if(tbody) tbody.innerHTML = "";
    if(fbody) fbody.innerHTML = "";

    Object.keys(clientes).forEach(key => {
        const c = clientes[key];
        total += (c.valor || 0);
        if(c.status === 'offline') off++;

        if(tbody) tbody.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td>${c.tech}</td><td>${c.local}</td><td>${(c.valor || 0).toLocaleString()} MT</td><td><span class="status-badge ${c.status}">${c.status}</span></td><td><button onclick="prepararEdicao('${key}')" class="btn-edit-tbl"><i class="fa-solid fa-pen"></i></button><button onclick="eliminar('${key}')" class="btn-del-tbl"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        if(fbody) fbody.innerHTML += `<tr><td>${c.nome}</td><td>${c.user}</td><td>${c.data.split(',')[0]}</td><td><strong>${(c.valor || 0).toLocaleString()} MT</strong></td></tr>`;
    });

    document.getElementById("count-total").innerText = Object.keys(clientes).length;
    document.getElementById("count-receita").innerText = total.toLocaleString() + " MT";
    document.getElementById("count-alerts").innerText = off;
    document.getElementById("total-faturacao-header").innerText = total.toLocaleString() + " MT";
    initChart();
}

function initChart() {
    const ctx = document.getElementById('meuGrafico')?.getContext('2d');
    if(!ctx) return;
    if(meuGrafico) meuGrafico.destroy();
    const stats = {};
    Object.values(clientes).forEach(c => stats[c.tech] = (stats[c.tech] || 0) + 1);
    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(stats), datasets: [{ data: Object.values(stats), backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

window.gerarRelatorioPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ROZAY TECH - RELATÓRIO NOC", 14, 20);
    doc.setFontSize(10);
    doc.text("Gerado por: " + loggedUser + " em " + new Date().toLocaleString(), 14, 28);
    
    const rows = Object.values(clientes).map(c => [c.nome, c.tech, c.local, c.valor + " MT", c.status]);
    doc.autoTable({ startY: 35, head: [['Cliente', 'Serviço', 'Localização', 'Valor', 'Estado']], body: rows });
    doc.save("Relatorio_RozayTech.pdf");
};

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };

// Inicializar UI
document.getElementById("welcome-msg").innerText = `Olá, ${loggedUser}!`;
document.getElementById("logged-user-name").innerText = loggedUser;
document.getElementById("user-initial").innerText = loggedUser.charAt(0);
setInterval(() => document.getElementById("current-time-dash").innerText = new Date().toLocaleString('pt-MZ'), 1000);