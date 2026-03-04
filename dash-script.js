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

// Controle do Menu Hambúrguer
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');

menuToggle.onclick = () => sidebar.classList.add('open');
closeMenu.onclick = () => sidebar.classList.remove('open');
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => sidebar.classList.remove('open'));
});

// Relógio e Monitor RF Simulado
setInterval(() => {
    const now = new Date();
    document.getElementById('live-clock').innerText = now.toLocaleString('pt-MZ');
    const hrs = now.getHours();
    document.getElementById('greeting').innerText = hrs < 12 ? "Bom dia, Admin!" : hrs < 18 ? "Boa tarde, Admin!" : "Boa noite, Admin!";

    // Atualiza Monitor RF
    if(document.getElementById('rf-pwr')) {
        document.getElementById('rf-pwr').innerText = (-(40 + Math.random() * 5)).toFixed(1);
        document.getElementById('rf-ms').innerText = Math.floor(10 + Math.random() * 8);
    }
}, 1000);

// Troca de Abas
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

// Sincronização Firebase (Exemplo Leads e Clientes)
onValue(ref(db, 'leads'), (snap) => {
    document.getElementById('badge-leads').innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
});

onValue(ref(db, 'clientes'), (snap) => {
    const tbody = document.getElementById('tbody-clientes');
    tbody.innerHTML = "";
    let total = 0;
    if(snap.exists()) {
        const data = snap.val();
        document.getElementById('stat-clientes').innerText = Object.keys(data).length;
        Object.entries(data).forEach(([id, c]) => {
            total += parseFloat(c.valor || 0);
            tbody.innerHTML += `<tr>
                <td>${c.nome}</td>
                <td>${c.tecnologia || 'Starlink'}</td>
                <td>MT ${c.valor}</td>
                <td><span class="badge ${c.status || 'online'}">${(c.status || 'online').toUpperCase()}</span></td>
                <td><button class="btn-del" onclick="deleteItem('clientes/${id}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        });
    }
    document.getElementById('stat-receita').innerText = "MT " + total.toLocaleString();
    document.getElementById('total-global').innerText = "MT " + total.toLocaleString();
});

// Gráfico de Pizza (Donut) menor
const ctx = document.getElementById('serviceChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Starlink', 'Wireless', 'Consultoria', 'Drones'],
        datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
        }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});