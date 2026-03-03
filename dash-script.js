// 1. CONFIGURAÇÃO FIREBASE
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'clientes');
const logsRef = ref(db, 'logs'); // Referência para a área de auditoria

// 2. SEGURANÇA E UTILIZADOR
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

// 3. VARIÁVEIS GLOBAIS
let clientes = {};
let logs = {};
let meuGrafico = null;

// Escuta Clientes
onValue(dbRef, (snapshot) => {
    clientes = snapshot.val() || {};
    renderTable();
    renderFaturacao();
    initChart();
});

// Escuta Logs
onValue(logsRef, (snapshot) => {
    logs = snapshot.val() || {};
    renderLogs();
});

// 4. FUNÇÃO DE REGISTO DE LOGS (AUDITORIA)
function registrarLog(acao, detalhe) {
    const dataHora = new Date().toLocaleString('pt-MZ');
    push(logsRef, {
        dataHora: dataHora,
        usuario: loggedUser,
        acao: acao,
        detalhe: detalhe
    });
}

// 5. FUNÇÕES DE NAVEGAÇÃO E MOBILE MESTRE
window.navigateTo = (page, el) => {
    const sections = ['resumo', 'clientes', 'faturacao', 'infra', 'logs'];
    sections.forEach(s => document.getElementById('content-'+s).style.display = 'none');
    
    document.getElementById('content-'+page).style.display = 'block';
    
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    
    // CORREÇÃO ANDROID: Fecha a barra lateral ao clicar no menu em ecrãs pequenos
    if(window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('active');
    }
    
    if(page === 'resumo') initChart();
};

// Toggle do Menu Mobile
document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

window.toggleModal = () => {
    const m = document.getElementById("modalCliente");
    if(m.style.display !== "flex") {
        m.style.display = "flex";
    } else {
        m.style.display = "none";
        document.getElementById('modalTitle').innerText = "Novo Registo";
        document.getElementById('formCliente').reset();
        document.getElementById('editIndex').value = "";
    }
};

// 6. LÓGICA DE CLIENTES (CRUD COM LOGS)
window.prepararEdicao = (key) => {
    const c = clientes[key];
    document.getElementById('modalTitle').innerText = "Editar Cliente";
    document.getElementById('editIndex').value = key;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('valor').value = c.valor || 0;
    document.getElementById('status').value = c.status;
    window.toggleModal();
};

window.eliminar = (key) => {
    if(confirm("Deseja eliminar este registro permanentemente?")) {
        const nomeRemovido = clientes[key].nome;
        remove(ref(db, `clientes/${key}`)).then(() => {
            registrarLog("Eliminação", `Removeu o cliente: ${nomeRemovido}`);
        });
    }
};

document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    const key = document.getElementById('editIndex').value;
    const nomeCliente = document.getElementById("nome").value;
    const dados = {
        nome: nomeCliente,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        valor: Number(document.getElementById("valor").value),
        status: document.getElementById("status").value,
        lastUpdate: new Date().toLocaleString('pt-MZ'),
        user: loggedUser
    };

    if(key === "") {
        push(dbRef, dados).then(() => {
            registrarLog("Criação", `Adicionou o cliente: ${nomeCliente}`);
        });
    } else {
        update(ref(db, `clientes/${key}`), dados).then(() => {
            registrarLog("Edição", `Editou os dados do cliente: ${nomeCliente}`);
        });
    }
    window.toggleModal();
    this.reset();
};

// 7. RENDERIZAÇÃO DAS TABELAS
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
                <td><strong>${c.valor ? c.valor.toLocaleString() : 0} MT</strong></td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                    <button onclick="prepararEdicao('${key}')" style="color:#2563eb; border:none; background:none; cursor:pointer; margin-right:15px; font-size:16px;"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="eliminar('${key}')" style="color:#ef4444; border:none; background:none; cursor:pointer; font-size:16px;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
    });
    updateStats();
}

function renderFaturacao() {
    const tbody = document.getElementById("faturacaoTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    let somaTotal = 0;

    Object.values(clientes).forEach((c) => {
        const val = c.valor || 0;
        somaTotal += val;
        tbody.innerHTML += `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.tech}</td>
                <td>${c.user || 'Engenheiro'}</td>
                <td style="color: #10b981; font-weight: bold;">${val.toLocaleString()} MT</td>
            </tr>`;
    });

    document.getElementById("total-faturacao").innerText = `Total Global: ${somaTotal.toLocaleString()} MT`;
    document.getElementById("count-receita").innerText = `${somaTotal.toLocaleString()} MT`;
}

function renderLogs() {
    const tbody = document.getElementById("logsTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";
    
    // Inverter para mostrar os mais recentes primeiro
    const chaves = Object.keys(logs).reverse();
    
    chaves.forEach((key) => {
        const l = logs[key];
        let corAcao = l.acao === "Eliminação" ? "color: #ef4444;" : (l.acao === "Criação" ? "color: #10b981;" : "color: #2563eb;");
        
        tbody.innerHTML += `
            <tr class="log-row">
                <td>${l.dataHora}</td>
                <td><strong><i class="fa-solid fa-user-shield"></i> ${l.usuario}</strong></td>
                <td style="${corAcao} font-weight: bold;">${l.acao}</td>
                <td>${l.detalhe}</td>
            </tr>`;
    });
}

function updateStats() {
    const lista = Object.values(clientes);
    document.getElementById("count-total").innerText = lista.length;
    document.getElementById("count-alerts").innerText = lista.filter(c => c.status === "offline").length;
}

function initChart() {
    const ctx = document.getElementById('meuGrafico')?.getContext('2d');
    if(!ctx) return;
    if(meuGrafico) meuGrafico.destroy();
    
    const lista = Object.values(clientes);
    // Agrupar contagem por tecnologia
    const stats = {};
    lista.forEach(c => {
        stats[c.tech] = (stats[c.tech] || 0) + 1;
    });

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{ 
                data: Object.values(stats), 
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f43f5e', '#64748b'], 
                borderWidth: 0 
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 8. PDF FINAL
window.gerarRelatorioPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataHora = new Date().toLocaleString('pt-MZ');
    
    doc.setFontSize(18); doc.setTextColor(37, 99, 235);
    doc.text("ROZAY TECH SOLUTIONS - RELATÓRIO NOC", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`Operador Técnico: ${loggedUser} | Data: ${dataHora}`, 14, 30);
    
    const rows = Object.values(clientes).map(c => [c.nome, c.tech, c.local, `${c.valor || 0} MT`, c.status.toUpperCase()]);
    
    doc.autoTable({ 
        startY: 40, 
        head: [['CLIENTE', 'SERVIÇO', 'MORADA', 'VALOR', 'ESTADO']], 
        body: rows,
        headStyles: { fillColor: [15, 23, 42] }
    });
    
    doc.save(`Inventario_RozayTech_${new Date().getTime()}.pdf`);
};

window.logout = () => {
    localStorage.clear();
    window.location.href = "login.html";
};

// Start Date Time
setInterval(() => {
    document.getElementById("current-time-dash").innerText = new Date().toLocaleString('pt-MZ');
}, 1000);