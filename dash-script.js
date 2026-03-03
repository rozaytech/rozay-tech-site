import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const leadsRef = ref(db, 'leads'); // Nova referência para os pedidos do site

if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = "login.html";
const loggedUser = localStorage.getItem('rozay_user') || "Admin";

function getSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
}

document.getElementById("welcome-msg").innerText = `${getSaudacao()}, ${loggedUser}!`;
document.getElementById("logged-user-name").innerText = loggedUser;
document.getElementById("user-initial").innerText = loggedUser.charAt(0);

let clientes = {};
let meuGrafico = null;

// Escuta Clientes
onValue(dbRef, (snap) => {
    clientes = snap.val() || {};
    renderAll();
});

// Escuta Logs
onValue(logsRef, (snap) => {
    const logs = snap.val() || {};
    const tbody = document.getElementById("logsTableBody");
    if(tbody) {
        tbody.innerHTML = "";
        Object.values(logs).reverse().slice(0, 15).forEach(l => {
            tbody.innerHTML += `<tr><td>${l.data || '---'}</td><td><strong>${l.user || 'Sistema'}</strong></td><td>${l.acao || 'Ação'}</td><td>${l.msg || '---'}</td></tr>`;
        });
    }
});

// ESCUTA LEADS DO SITE (NOVAS VENDAS)
onValue(leadsRef, (snap) => {
    const leads = snap.val() || {};
    const tbody = document.getElementById("leadsTableBody");
    const badge = document.getElementById("lead-count-badge");
    const leadKeys = Object.keys(leads);
    
    if(badge) {
        badge.innerText = leadKeys.length;
        badge.style.display = leadKeys.length > 0 ? "inline-block" : "none";
    }

    if(tbody) {
        tbody.innerHTML = "";
        leadKeys.reverse().forEach(key => {
            const l = leads[key];
            tbody.innerHTML += `
                <tr style="background: rgba(16, 185, 129, 0.05);">
                    <td>${l.data}</td>
                    <td><strong>${l.nome}</strong></td>
                    <td><a href="https://wa.me/${l.telefone.replace(/\s/g, '')}" target="_blank" style="color:#10b981; text-decoration:none;"><i class="fa-brands fa-whatsapp"></i> ${l.telefone}</a></td>
                    <td>${l.interesse}</td>
                    <td>${l.detalhes}</td>
                    <td>
                        <button onclick="converterEmCliente('${key}')" style="color:#10b981; border:none; background:none; cursor:pointer;" title="Arquivar"><i class="fa-solid fa-check-double"></i></button>
                        <button onclick="eliminarLead('${key}')" style="color:#ef4444; border:none; background:none; cursor:pointer; margin-left:10px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
});

window.navigateTo = (page, el) => {
    document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
    document.getElementById('content-' + page).style.display = 'block';
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
    if(window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('active');
};

document.getElementById('menu-toggle').onclick = () => document.getElementById('sidebar').classList.toggle('active');

window.toggleModal = () => {
    const m = document.getElementById("modalCliente");
    m.style.display = (m.style.display === "flex") ? "none" : "flex";
    if(m.style.display === "none") {
        document.getElementById("formCliente").reset();
        document.getElementById('editIndex').value = "";
    }
};

document.getElementById("formCliente").onsubmit = function(e) {
    e.preventDefault();
    const key = document.getElementById('editIndex').value;
    const nomeClie = document.getElementById("nome").value;
    const agora = new Date().toLocaleString('pt-MZ');
    const dados = {
        nome: nomeClie,
        tech: document.getElementById("tech").value,
        local: document.getElementById("local").value,
        valor: Number(document.getElementById("valor").value) || 0,
        status: document.getElementById("status").value,
        user: loggedUser,
        data: agora
    };

    if(key === "") {
        push(dbRef, dados);
        push(logsRef, { data: agora, user: loggedUser, acao: "ADICIONAR", msg: `Registou ${nomeClie}` });
    } else {
        update(ref(db, `clientes/${key}`), dados);
        push(logsRef, { data: agora, user: loggedUser, acao: "EDITAR", msg: `Alterou ${nomeClie}` });
    }
    toggleModal();
};

window.prepararEdicao = (key) => {
    const c = clientes[key];
    document.getElementById('editIndex').value = key;
    document.getElementById('nome').value = c.nome;
    document.getElementById('tech').value = c.tech;
    document.getElementById('local').value = c.local;
    document.getElementById('valor').value = c.valor;
    document.getElementById('status').value = c.status;
    document.getElementById('modalTitle').innerText = "Editar Cliente";
    toggleModal();
};

window.eliminar = (key) => {
    if(confirm("Apagar permanentemente?")) {
        const nome = clientes[key].nome;
        remove(ref(db, `clientes/${key}`));
        push(logsRef, { data: new Date().toLocaleString(), user: loggedUser, acao: "ELIMINAR", msg: `Removeu ${nome}` });
    }
};

// Funções para Leads
window.eliminarLead = (key) => {
    if(confirm("Remover esta solicitação?")) {
        remove(ref(db, `leads/${key}`));
    }
};

window.converterEmCliente = (key) => {
    alert("Lead arquivada. Não esqueça de registar como cliente oficial após o contrato!");
    remove(ref(db, `leads/${key}`));
};

function renderAll() {
    const tbody = document.getElementById("clientTableBody");
    const fbody = document.getElementById("faturacaoTableBody");
    let total = 0; let off = 0;
    
    if(tbody) tbody.innerHTML = "";
    if(fbody) fbody.innerHTML = "";

    Object.keys(clientes).forEach(key => {
        const c = clientes[key];
        const val = Number(c.valor) || 0;
        total += val;
        if(c.status === 'offline') off++;

        if(tbody) tbody.innerHTML += `<tr><td><strong>${c.nome}</strong></td><td>${c.tech}</td><td>${c.local}</td><td>${val.toLocaleString()} MT</td><td><span class="status-badge ${c.status}">${c.status}</span></td><td><button onclick="prepararEdicao('${key}')" style="color:#2563eb;border:none;background:none;cursor:pointer;font-size:16px;margin-right:10px;"><i class="fa-solid fa-pen-to-square"></i></button><button onclick="eliminar('${key}')" style="color:#ef4444;border:none;background:none;cursor:pointer;font-size:16px;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        
        if(fbody) fbody.innerHTML += `<tr><td>${c.nome}</td><td>${c.tech}</td><td>${c.user}</td><td>${c.data || '---'}</td><td><strong>${val.toLocaleString()} MT</strong></td></tr>`;
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

window.gerarRelatorioPDF = (tipo) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const agora = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text(`ROZAY TECH - RELATÓRIO ${tipo.toUpperCase()}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado por: ${loggedUser} em ${agora}`, 14, 28);
    
    let rows, head;
    if(tipo === 'clientes') {
        head = [['Cliente', 'Serviço', 'Local', 'Valor (MT)', 'Estado']];
        rows = Object.values(clientes).map(c => [c.nome, c.tech, c.local, (Number(c.valor) || 0).toString() + " MT", c.status]);
    } else {
        head = [['Cliente', 'Serviço', 'Técnico', 'Data Registro', 'Valor (MT)']];
        rows = Object.values(clientes).map(c => [c.nome, c.tech, c.user, c.data || '---', (Number(c.valor) || 0).toString() + " MT"]);
    }
    
    doc.autoTable({ startY: 40, head: head, body: rows, theme: 'striped' });
    doc.save(`RozayTech_${tipo}_${agora.split(',')[0]}.pdf`);
};

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
setInterval(() => {
    if(document.getElementById("current-time-dash")) 
        document.getElementById("current-time-dash").innerText = new Date().toLocaleString('pt-MZ');
}, 1000);