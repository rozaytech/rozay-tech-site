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

// --- 1. NAVEGAÇÃO ENTRE ABAS ---
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

// --- 2. RELÓGIO E MONITOR RF ---
setInterval(() => {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleString('pt-MZ');
    const hrs = now.getHours();
    const greet = document.getElementById('greeting');
    greet.innerText = hrs < 12 ? "Bom dia, Admin!" : hrs < 18 ? "Boa tarde, Admin!" : "Boa noite, Admin!";
    
    // Simulação RF
    if(document.getElementById('rf-pwr')) {
        document.getElementById('rf-pwr').innerText = (-(40 + Math.random())).toFixed(1);
        document.getElementById('rf-ms').innerText = Math.floor(12 + Math.random() * 5);
    }
}, 1000);

// --- 3. SINCRONIZAÇÃO DE CLIENTES ---
onValue(ref(db, 'clientes'), (snap) => {
    const tbody = document.getElementById('tbody-clientes');
    if(!tbody) return;
    tbody.innerHTML = "";
    let totalMT = 0;
    let offlineCount = 0;

    if(snap.exists()){
        Object.entries(snap.val()).forEach(([id, c]) => {
            const valor = parseFloat(c.valor || 0);
            totalMT += valor;
            if(c.status === 'offline') offlineCount++;
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${c.nome || 'Sem Nome'}</strong></td>
                    <td>${c.tecnologia || '---'}</td>
                    <td>MT ${valor.toLocaleString()}</td>
                    <td><span class="status-badge ${c.status || 'online'}">${(c.status || 'online').toUpperCase()}</span></td>
                    <td>
                        <button onclick="deleteData('clientes/${id}', '${c.nome}')" style="border:none; background:none; cursor:pointer;">🗑️</button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('stat-clientes').innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
    
    // Atualizar Alerta de Status
    const alertBox = document.getElementById('system-alert');
    if(offlineCount > 0) {
        alertBox.className = "status-alert offline";
        alertBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${offlineCount} Clientes Offline`;
    } else {
        alertBox.className = "status-alert";
        alertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> Sistema Online`;
    }
});

// --- 4. SINCRONIZAÇÃO DE FATURAÇÃO ---
onValue(ref(db, 'faturacao'), (snap) => {
    const tbody = document.getElementById('tbody-faturacao');
    if(!tbody) return;
    tbody.innerHTML = "";
    let totalGlobal = 0;

    if(snap.exists()){
        Object.entries(snap.val()).forEach(([id, f]) => {
            const v = parseFloat(f.valor || 0);
            totalGlobal += v;
            tbody.innerHTML += `
                <tr>
                    <td>${f.cliente || '---'}</td>
                    <td>${f.servico || '---'}</td>
                    <td>MT ${v.toLocaleString()}</td>
                    <td>${f.responsavel || 'Admin'}</td>
                    <td>${f.pago ? '✅ Sim' : '❌ Não'}</td>
                    <td><button onclick="deleteData('faturacao/${id}', 'Fatura')" style="border:none; background:none;">🗑️</button></td>
                </tr>`;
        });
    }
    document.getElementById('total-global-val').innerText = "MT " + totalGlobal.toLocaleString();
    document.getElementById('stat-receita').innerText = "MT " + totalGlobal.toLocaleString();
});

// --- 5. SINCRONIZAÇÃO DE LOGS (CORREÇÃO DO UNDEFINED) ---
onValue(ref(db, 'logs'), (snap) => {
    const tbody = document.getElementById('tbody-logs');
    if(!tbody) return;
    tbody.innerHTML = "";
    if(snap.exists()){
        const logs = Object.values(snap.val()).reverse();
        logs.forEach(log => {
            tbody.innerHTML += `
                <tr>
                    <td><small>${log.data || '---'}</small></td>
                    <td><strong>${log.responsavel || 'Sistema'}</strong></td>
                    <td>${log.acao || 'Ação'}</td>
                    <td>${log.detalhes || '---'}</td>
                </tr>`;
        });
    }
});

// --- 6. GRÁFICO ---
const ctx = document.getElementById('serviceChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Starlink', 'Wireless', 'Consultoria', 'Drones'],
        datasets: [{
            data: [40, 25, 20, 15],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

// --- 7. FUNÇÕES GLOBAIS ---
window.deleteData = (path, name) => {
    if(confirm("Deseja apagar: " + name + "?")) {
        remove(ref(db, path));
        push(ref(db, 'logs'), {
            data: new Date().toLocaleString(),
            responsavel: "Admin",
            acao: "ELIMINAR",
            detalhes: "Removeu " + name
        });
    }
};