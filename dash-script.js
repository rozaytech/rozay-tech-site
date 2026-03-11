import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const fbConfig = { 
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U", 
    authDomain: "rozaytech-noc.firebaseapp.com", 
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com", 
    projectId: "rozaytech-noc"
};

const app = initializeApp(fbConfig);
const db = getDatabase(app);

// AUTH & UI
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = 'login.html';
const activeUser = localStorage.getItem('rozay_user') || 'Admin';

// HAMBURGUER
const sidebar = document.getElementById('sidebar');
document.getElementById('mToggle').onclick = () => sidebar.classList.toggle('active');

// RELÓGIO & DATA ATUALIZADOS
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('pt-MZ');
    const hrs = now.getHours();
    const greet = hrs < 12 ? "Bom dia" : hrs < 18 ? "Boa tarde" : "Boa noite";
    document.getElementById('greet-left').innerText = `${greet}, ${activeUser}`;
    document.getElementById('user-right').innerText = activeUser;
}
setInterval(updateClock, 1000);
updateClock();

// SPA NAVEGAÇÃO
document.querySelectorAll('.nav-item').forEach(item => {
    item.onclick = () => {
        const sec = item.getAttribute('data-sec');
        if(!sec) return;
        sidebar.classList.remove('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.spa-section').forEach(s => s.classList.toggle('active', s.id === `sec-${sec}`));
    }
});

// MONITOR RF REALISTA
setInterval(() => {
    const bar = document.getElementById('sig-bar');
    const val = document.getElementById('dbm-val');
    if(bar) {
        const power = 70 + Math.floor(Math.random() * 25);
        bar.style.width = power + "%";
        val.innerText = "-" + (100 - power + 40) + " dBm";
        document.getElementById('ping-val').innerText = 18 + Math.floor(Math.random() * 8);
    }
}, 2500);

// LOGS AUDITORIA (CORREÇÃO DE COR)
const logRef = ref(db, 'logs');
onValue(logRef, (snap) => {
    const terminal = document.getElementById('terminal-logs');
    if(!terminal || !snap.val()) return;
    const logs = Object.values(snap.val()).reverse().slice(0, 50);
    terminal.innerHTML = logs.map(l => `
        <div class="log-line">
            <span class="log-ts">[${l.data}]</span>
            <span style="color:#2563eb">#${l.user}:</span>
            <span style="color:#eee">${l.detalhes}</span>
        </div>
    `).join('');
});

// CLIENTES & FINANCEIRO
const clientRef = ref(db, 'clients');
let circleChart;

onValue(clientRef, (snap) => {
    const data = snap.val();
    const list = document.getElementById('client-list');
    const fatDetails = document.getElementById('fat-detalhes');
    list.innerHTML = "";
    
    let totalRev = 0, count = 0;
    const stats = {};

    if(data) {
        Object.keys(data).forEach(id => {
            const c = data[id];
            const v = parseFloat(c.valor) || 0;
            totalRev += v;
            count++;
            stats[c.tecnologia] = (stats[c.tecnologia] || 0) + v;

            list.innerHTML += `
                <tr>
                    <td><b>${c.nome}</b></td>
                    <td>${c.tecnologia}</td>
                    <td>${v.toLocaleString()} MT</td>
                    <td>
                        <button class="btn-edit" onclick="window.editClient('${id}', '${c.nome}', '${c.tecnologia}', '${c.valor}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-del" onclick="window.delClient('${id}', '${c.nome}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }

    // Update Dash
    document.getElementById('count-home').innerText = count;
    document.getElementById('rev-home').innerText = totalRev.toLocaleString() + " MT";
    document.getElementById('fat-total').innerText = totalRev.toLocaleString() + " MT";
    document.getElementById('fat-media').innerText = count > 0 ? (totalRev/count).toLocaleString(undefined, {maximumFractionDigits:2}) + " MT" : "0.00 MT";
    
    // Detalhes Facturação
    if(fatDetails) {
        fatDetails.innerHTML = Object.entries(stats).map(([label, val]) => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #222;">
                <span>${label}</span>
                <span style="color:var(--success); font-weight:bold;">${val.toLocaleString()} MT</span>
            </div>
        `).join('');
    }

    updateCircle(stats);
});

function updateCircle(stats) {
    const ctx = document.getElementById('circleChart').getContext('2d');
    if(circleChart) circleChart.destroy();
    circleChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{ data: Object.values(stats), backgroundColor: ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4'] }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } } }, maintainAspectRatio: false }
    });
}

// CRUD OPERAÇÕES
window.openModal = () => {
    document.getElementById('form-client').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('modal-title').innerText = "Novo Registro de Serviço";
    document.getElementById('modal-client').style.display = 'flex';
};

window.closeModal = () => document.getElementById('modal-client').style.display = 'none';

document.getElementById('form-client').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const payload = {
        nome: document.getElementById('name').value,
        tecnologia: document.getElementById('tech').value,
        valor: document.getElementById('price').value,
        data_mod: new Date().toLocaleString()
    };

    if(id) {
        update(ref(db, `clients/${id}`), payload);
        push(logRef, { data: new Date().toLocaleString(), user: activeUser, detalhes: `Editou cliente: ${payload.nome}` });
    } else {
        push(clientRef, payload);
        push(logRef, { data: new Date().toLocaleString(), user: activeUser, detalhes: `Adicionou cliente: ${payload.nome}` });
    }
    closeModal();
};

window.editClient = (id, nome, tech, valor) => {
    document.getElementById('edit-id').value = id;
    document.getElementById('name').value = nome;
    document.getElementById('tech').value = tech;
    document.getElementById('price').value = valor;
    document.getElementById('modal-title').innerText = "Editar Serviço";
    document.getElementById('modal-client').style.display = 'flex';
};

window.delClient = (id, nome) => {
    if(confirm(`Tem certeza que deseja apagar ${nome}?`)) {
        remove(ref(db, `clients/${id}`));
        push(logRef, { data: new Date().toLocaleString(), user: activeUser, detalhes: `ELIMINOU REGISTRO: ${nome}` });
    }
};

// PDF COM CARIMBO DE TEMPO COMPLETO
window.exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const now = new Date().toLocaleString('pt-MZ');
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("ROZAY TECH SOLUTIONS - NOC REPORT", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Operador: ${activeUser}`, 14, 28);
    doc.text(`Data/Hora da Emissão: ${now}`, 14, 34);
    doc.text(`Status do Sistema: NOMINAL`, 14, 40);
    
    doc.autoTable({
        html: '#main-table',
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 }
    });

    const finalY = doc.lastAutoTable.finalY || 50;
    doc.text(`--- Fim do Relatório (Total: ${document.getElementById('rev-home').innerText}) ---`, 14, finalY + 10);

    doc.save(`Relatorio_NOC_RozayTech_${new Date().getTime()}.pdf`);
};

document.getElementById('btnLogout').onclick = () => { localStorage.clear(); window.location.href = 'login.html'; };