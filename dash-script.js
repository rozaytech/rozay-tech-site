import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U", 
    authDomain: "rozaytech-noc.firebaseapp.com", 
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com", 
    projectId: "rozaytech-noc" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- NAVEGAÇÃO E INTERFACE ---
const navLinks = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab-content');

navLinks.forEach(link => {
    link.onclick = function() {
        const target = this.getAttribute('data-target');
        navLinks.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(target).classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
    };
});

// Menu Mobile
document.getElementById('menuToggle').onclick = () => document.getElementById('sidebar').classList.add('open');
document.getElementById('closeMenu').onclick = () => document.getElementById('sidebar').classList.remove('open');

// Relógio e Saudação
setInterval(() => {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleString('pt-MZ');
    const hrs = now.getHours();
    const greet = document.getElementById('greeting');
    greet.innerText = hrs < 12 ? "Bom dia, Admin!" : hrs < 18 ? "Boa tarde, Admin!" : "Boa noite, Admin!";
    
    // Monitor RF Simulado
    if(document.getElementById('rf-pwr')) {
        document.getElementById('rf-pwr').innerText = (-(40 + Math.random())).toFixed(1);
        document.getElementById('rf-ms').innerText = Math.floor(12 + Math.random() * 6);
    }
}, 1000);

// --- DADOS FIREBASE ---

// Clientes & Redes
onValue(ref(db, 'clientes'), (snap) => {
    const tbody = document.getElementById('tbody-clientes');
    tbody.innerHTML = "";
    let totalMT = 0;
    let offlineCount = 0;

    if(snap.exists()){
        Object.entries(snap.val()).forEach(([id, c]) => {
            totalMT += parseFloat(c.valor || 0);
            if(c.status === 'offline') offlineCount++;
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.tecnologia}</td>
                    <td>MT ${parseFloat(c.valor).toLocaleString()}</td>
                    <td><span class="status-badge ${c.status}">${c.status.toUpperCase()}</span></td>
                    <td>
                        <button onclick="editData('clientes/${id}')" class="btn-edit">✏️</button>
                        <button onclick="deleteData('clientes/${id}', '${c.nome}')" class="btn-del">🗑️</button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('stat-clientes').innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
    document.getElementById('stat-receita').innerText = "MT " + totalMT.toLocaleString();
    
    // Alerta de Sistema
    const alertBox = document.getElementById('system-alert');
    if(offlineCount > 0) {
        alertBox.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${offlineCount} Clientes Offline`;
        alertBox.style.background = "#fee2e2"; alertBox.style.color = "#ef4444";
    } else {
        alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> Sistema Online`;
        alertBox.style.background = "#dcfce7"; alertBox.style.color = "#10b981";
    }
});

// Logs do Sistema
onValue(ref(db, 'logs'), (snap) => {
    const tbody = document.getElementById('tbody-logs');
    tbody.innerHTML = "";
    if(snap.exists()){
        Object.values(snap.val()).reverse().forEach(log => {
            tbody.innerHTML += `<tr><td>${log.data}</td><td>${log.responsavel}</td><td>${log.acao}</td><td>${log.detalhes}</td></tr>`;
        });
    }
});

// Função para Registar Logs
async function registrarLog(acao, detalhes) {
    await push(ref(db, 'logs'), {
        data: new Date().toLocaleString(),
        responsavel: "Admin",
        acao: acao,
        detalhes: detalhes
    });
}

// --- GRÁFICOS ---
const ctx = document.getElementById('serviceChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Starlink', 'Redes Wireless', 'Consultoria', 'Drones'],
        datasets: [{
            data: [45, 25, 15, 15],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

// --- FUNÇÕES EXPORTADAS ---
window.deleteData = (path, name) => {
    if(confirm("Deseja apagar " + name + "?")) {
        remove(ref(db, path));
        registrarLog("Eliminar", "Eliminou o registo de " + name);
    }
}