import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U", 
    authDomain: "rozaytech-noc.firebaseapp.com", 
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com", 
    projectId: "rozaytech-noc" 
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- NAVEGAÇÃO ENTRE ABAS ---
const links = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab-content');

links.forEach(link => {
    link.onclick = function() {
        const target = this.getAttribute('data-target');
        links.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(target).classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
    };
});

// Menu Mobile
document.getElementById('menuToggle').onclick = () => document.getElementById('sidebar').classList.add('open');
document.getElementById('closeMenu').onclick = () => document.getElementById('sidebar').classList.remove('open');

// --- INTERFACE E RELÓGIO ---
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

// --- SINCRONIZAÇÃO FIREBASE ---

// Clientes
onValue(ref(db, 'clientes'), (snap) => {
    const tbody = document.getElementById('tbody-clientes');
    if(!tbody) return;
    tbody.innerHTML = "";
    let totalMT = 0;
    if(snap.exists()){
        Object.entries(snap.val()).forEach(([id, c]) => {
            totalMT += parseFloat(c.valor || 0);
            tbody.innerHTML += `<tr>
                <td><strong>${c.nome || '---'}</strong></td>
                <td>${c.tecnologia || '---'}</td>
                <td>MT ${parseFloat(c.valor || 0).toLocaleString()}</td>
                <td><span class="status-badge ${c.status || 'online'}">${(c.status || 'online').toUpperCase()}</span></td>
                <td><button onclick="deleteData('clientes/${id}', '${c.nome}')" style="border:none; background:none; cursor:pointer;">🗑️</button></td>
            </tr>`;
        });
    }
    document.getElementById('stat-clientes').innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
    document.getElementById('stat-receita').innerText = "MT " + totalMT.toLocaleString();
});

// Faturação
onValue(ref(db, 'faturacao'), (snap) => {
    const tbody = document.getElementById('tbody-faturacao');
    if(!tbody) return;
    tbody.innerHTML = "";
    let global = 0;
    if(snap.exists()){
        Object.entries(snap.val()).forEach(([id, f]) => {
            const val = parseFloat(f.valor || 0);
            global += val;
            tbody.innerHTML += `<tr>
                <td>${f.cliente || '---'}</td>
                <td>${f.servico || '---'}</td>
                <td>MT ${val.toLocaleString()}</td>
                <td>${f.responsavel || 'Admin'}</td>
                <td>${f.pago || 'Não'}</td>
                <td><button onclick="deleteData('faturacao/${id}', 'Fatura')" style="border:none; background:none;">🗑️</button></td>
            </tr>`;
        });
    }
    document.getElementById('total-global-val').innerText = "MT " + global.toLocaleString();
});

// Logs
onValue(ref(db, 'logs'), (snap) => {
    const tbody = document.getElementById('tbody-logs');
    if(!tbody) return;
    tbody.innerHTML = "";
    if(snap.exists()){
        Object.values(snap.val()).reverse().forEach(log => {
            tbody.innerHTML += `<tr>
                <td><small>${log.data || '---'}</small></td>
                <td>${log.responsavel || 'Sistema'}</td>
                <td>${log.acao || '---'}</td>
                <td>${log.detalhes || '---'}</td>
            </tr>`;
        });
    }
});

// --- GRÁFICO ---
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

// Função Delete Global
window.deleteData = (path, name) => {
    if(confirm("Eliminar " + name + "?")) {
        remove(ref(db, path));
        push(ref(db, 'logs'), {
            data: new Date().toLocaleString(),
            responsavel: "Admin",
            acao: "ELIMINAR",
            detalhes: "Apagou " + name
        });
    }
};