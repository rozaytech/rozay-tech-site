// 1. CONFIGURAÇÃO DO FIREBASE (COM AS TUAS CHAVES REAIS)
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
  appId: "1:129382246448:web:f0ce1b7fca23eed17da5f5",
  measurementId: "G-KVGDF0HP3T"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'clientes');

// 2. SEGURANÇA E IDENTIDADE
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";

const loggedUser = localStorage.getItem('rozay_user') || "Engenheiro";
const hour = new Date().getHours();
let saudacao = hour < 12 ? "Bom dia" : (hour < 18 ? "Boa tarde" : "Boa noite");

document.getElementById('welcome-msg').innerText = `${saudacao}, ${loggedUser}!`;
document.getElementById('logged-user-name').innerText = loggedUser;
document.getElementById('user-initial').innerText = loggedUser.charAt(0).toUpperCase();

if(document.getElementById('infra-user-name')) {
    document.getElementById('infra-user-name').innerText = loggedUser;
}

// 3. SINCRONIZAÇÃO EM TEMPO REAL
let clientes = {};
let meuGrafico = null;

onValue(dbRef, (snapshot) => {
    clientes = snapshot.val() || {};
    renderTable();
    initChart();
});

// 4. FUNÇÕES GLOBAIS (PARA O HTML CONSEGUIR CHAMAR)
window.navigateTo = (page, el) => {
    ['resumo', 'clientes', 'infra'].forEach(s => document.getElementById('content-'+s).style.display = 'none');
    document.getElementById('content-'+page).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    if(window.innerWidth < 900) document.getElementById('sidebar').classList.remove('active');
    if(page === 'resumo') initChart();
};

window.toggleModal = () => {
    const m = document.getElementById("modalCliente");
    if(m.style.display !== "flex") {
        m.style.display = "flex";
    } else {
        m.style.display = "none";
        document.getElementById('modalTitle').innerText = "Nova Instalação";
        document.getElementById('formCliente').reset();
        document.getElementById('editIndex').value = "";
    }
};

window.prepararEdicao = (key) => {
    const c = clientes[key];
    document.getElementById('modalTitle').innerText = "Editar Cliente";
    document.getElementById('editIndex').value = key;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('status').value = c.status;
    window.toggleModal();
};

window.eliminar = (key) => {
    if(confirm("Deseja eliminar este registro da nuvem?")) {
        remove(ref(db, `clientes/${key}`));
    }
};

window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
};

window.gerarRelatorioPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataHora = new Date().toLocaleString('pt-MZ');
    doc.setFontSize(18); doc.setTextColor(37, 99, 235);
    doc.text("ROZAY TECH SOLUTIONS - NOC", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Gerado por: ${loggedUser} | Data: ${dataHora}`, 14, 30);
    const rows = Object.values(clientes).map(c => [c.nome, c.tech, c.local, c.status.toUpperCase()]);
    doc.autoTable({ startY: 40, head: [['CLIENTE', 'TECNOLOGIA', 'MORADA', 'ESTADO']], body: rows });
    doc.save(`NOC_Report_${new Date().getTime()}.pdf`);
};

// 5. LÓGICA DO FORMULÁRIO
document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    const key = document.getElementById('editIndex').value;
    const dados = {
        nome: document.getElementById("nome").value,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        status: document.getElementById("status").value,
        lastUpdate: new Date().toLocaleString(),
        user: loggedUser
    };

    if(key === "") {
        push(dbRef, dados);
    } else {
        update(ref(db, `clientes/${key}`), dados);
    }
    window.toggleModal();
    this.reset();
};

// 6. RENDERIZAÇÃO E GRÁFICOS
function renderTable() {
    const tbody = document.getElementById("clientTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    Object.keys(clientes).forEach((key) => {
        const c = clientes[key];
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.tech}</td>
                <td>${c.local}</td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                    <button onclick="prepararEdicao('${key}')" style="color:#2563eb; border:none; background:none; cursor:pointer; margin-right:10px;"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="eliminar('${key}')" style="color:#ef4444; border:none; background:none; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
    updateStats();
}

function updateStats() {
    const lista = Object.values(clientes);
    document.getElementById("count-starlinks").innerText = lista.filter(c => c.tech === "Starlink").length;
    document.getElementById("count-cabeamento").innerText = lista.filter(c => c.tech === "Cabeamento").length;
    document.getElementById("count-alerts").innerText = lista.filter(c => c.status === "offline").length;
}

function initChart() {
    const ctx = document.getElementById('meuGrafico')?.getContext('2d');
    if(!ctx) return;
    if(meuGrafico) meuGrafico.destroy();
    const lista = Object.values(clientes);
    const stats = {
        Starlink: lista.filter(c => c.tech === "Starlink").length,
        Cabeamento: lista.filter(c => c.tech === "Cabeamento").length,
        PtP: lista.filter(c => c.tech === "PtP").length
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

// Menu Mobile
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('sidebar').classList.toggle('active');
};

document.getElementById("current-time-dash").innerText = new Date().toLocaleString();