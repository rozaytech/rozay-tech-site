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

// SEGURANÇA
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = 'login.html';
document.getElementById('btnLogout').onclick = () => { localStorage.clear(); window.location.href = 'login.html'; };

// SPA NAVEGAÇÃO
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.spa-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-sec');
        if(!target) return;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => s.classList.toggle('active', s.id === `sec-${target}`));
    });
});

// CLOCK & GREETING
setInterval(() => {
    const d = new Date();
    document.getElementById('clock').innerText = d.toLocaleTimeString('pt-MZ');
    const user = localStorage.getItem('rozay_user') || 'Admin';
    document.getElementById('greeting').innerText = `Boa tarde, ${user}`;
}, 1000);

// MONITOR RF SIMULADO
setInterval(() => {
    if(document.getElementById('rf-val')) {
        document.getElementById('rf-val').innerText = -60 - Math.floor(Math.random() * 10);
        document.getElementById('ping-val').innerText = 20 + Math.floor(Math.random() * 15) + "ms";
    }
}, 3000);

// FIREBASE: CLIENTES
const clientRef = ref(db, 'clients');
onValue(clientRef, (snap) => {
    const data = snap.val();
    const list = document.getElementById('client-list');
    list.innerHTML = "";
    let total = 0;
    let count = 0;

    if(data) {
        Object.keys(data).forEach(id => {
            const c = data[id];
            total += parseFloat(c.valor);
            count++;
            list.innerHTML += `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.tecnologia}</td>
                    <td>${c.valor} MT</td>
                    <td><span style="color:${c.status === 'online' ? '#10b981':'#ef4444'}">● ${c.status.toUpperCase()}</span></td>
                    <td>
                        <button onclick="window.delClient('${id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    }
    document.getElementById('count-clients').innerText = count;
    document.getElementById('total-revenue').innerText = total.toLocaleString() + " MT";
    updateChart(data);
});

// FIREBASE: LOGS
const logRef = ref(db, 'logs');
onValue(logRef, (snap) => {
    const logs = snap.val();
    const terminal = document.getElementById('terminal-logs');
    if(!terminal || !logs) return;
    terminal.innerHTML = "";
    Object.values(logs).reverse().slice(0, 50).forEach(l => {
        terminal.innerHTML += `<div class="log-line"><span class="log-ts">[${l.data}]</span> <b>${l.user}</b>: ${l.detalhes}</div>`;
    });
});

// CRUD FUNÇÕES
document.getElementById('form-client').onsubmit = (e) => {
    e.preventDefault();
    const payload = {
        nome: document.getElementById('name').value,
        tecnologia: document.getElementById('tech').value,
        valor: document.getElementById('price').value,
        status: document.getElementById('status').value,
        data: new Date().toLocaleString()
    };
    push(clientRef, payload);
    push(logRef, { data: new Date().toLocaleString(), user: localStorage.getItem('rozay_user'), detalhes: `Adicionou cliente ${payload.nome}` });
    closeModal();
};

window.delClient = (id) => {
    if(confirm('Apagar cliente?')) {
        remove(ref(db, `clients/${id}`));
        push(logRef, { data: new Date().toLocaleString(), user: localStorage.getItem('rozay_user'), detalhes: `Removeu ID ${id}` });
    }
}

// MODAL CONTROLS
window.openModal = () => document.getElementById('modal-client').style.display = 'flex';
window.closeModal = () => document.getElementById('modal-client').style.display = 'none';

// GRAFICO
let myChart;
function updateChart(data) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if(myChart) myChart.destroy();
    const vals = data ? Object.values(data).map(c => c.valor) : [0];
    const labs = data ? Object.values(data).map(c => c.nome) : ['Sem dados'];
    
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labs,
            datasets: [{ label: 'Faturação por Cliente (MT)', data: vals, backgroundColor: '#2563eb' }]
        },
        options: { plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { ticks: { color: '#fff' } }, x: { ticks: { color: '#fff' } } } }
    });
}