import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const fbConfig = { 
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U", 
    authDomain: "rozaytech-noc.firebaseapp.com", 
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com", 
    projectId: "rozaytech-noc"
};

const app = initializeApp(fbConfig);
const db = getDatabase(app);

// HAMBURGUER FUNCIONAL
const side = document.getElementById('sidebar');
document.getElementById('mToggle').onclick = () => side.classList.toggle('active');

// SEGURANÇA E SAUDAÇÃO DUPLA
if (localStorage.getItem('rozay_auth') !== 'true') window.location.href = 'login.html';
const activeUser = localStorage.getItem('rozay_user') || 'Admin';
document.getElementById('user-right').innerText = activeUser;
const hrs = new Date().getHours();
document.getElementById('greet-left').innerText = (hrs < 12 ? "Bom dia" : hrs < 18 ? "Boa tarde" : "Boa noite") + ", " + activeUser;

// NAVEGAÇÃO SPA
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => {
        const sec = btn.getAttribute('data-sec');
        if(!sec) return;
        side.classList.remove('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.spa-section').forEach(s => s.classList.toggle('active', s.id === `sec-${sec}`));
    }
});

// MONITOR DE SINAL (OSCILAÇÃO REALISTA)
setInterval(() => {
    const bar = document.getElementById('sig-bar');
    const val = document.getElementById('dbm-val');
    if(bar) {
        const power = 60 + Math.floor(Math.random() * 35);
        bar.style.width = power + "%";
        val.innerText = "-" + (100 - power + 40) + " dBm";
        document.getElementById('ping-val').innerText = 15 + Math.floor(Math.random() * 10);
    }
}, 2000);

// FIREBASE & GRÁFICO CIRCULAR
const clientRef = ref(db, 'clients');
let circleChart;

onValue(clientRef, (snap) => {
    const data = snap.val();
    const list = document.getElementById('client-list');
    list.innerHTML = "";
    let count = 0;
    const stats = {};

    if(data) {
        Object.keys(data).forEach(id => {
            const c = data[id];
            count++;
            stats[c.tecnologia] = (stats[c.tecnologia] || 0) + 1;
            list.innerHTML += `<tr style="border-bottom:1px solid #222;"><td style="padding:12px;">${c.nome}</td><td>${c.tecnologia}</td><td>${c.valor} MT</td><td><button onclick="window.del('${id}')" style="color:red; background:none; border:none;"><i class="fa-solid fa-trash"></i></button></td></tr>`;
        });
    }
    document.getElementById('count-clients').innerText = count;
    updateCircle(stats);
});

function updateCircle(stats) {
    const ctx = document.getElementById('circleChart').getContext('2d');
    if(circleChart) circleChart.destroy();
    circleChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(stats),
            datasets: [{ data: Object.values(stats), backgroundColor: ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'] }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } } }, maintainAspectRatio: false }
    });
}

// PDF EXPORT
window.exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Relatório Rozay Tech - " + activeUser, 14, 20);
    doc.autoTable({ html: '#main-table', startY: 30 });
    doc.save(`NOC_Report_${new Date().getTime()}.pdf`);
};

// MODAL E LOGOUT
window.openModal = () => document.getElementById('modal-client').style.display = 'flex';
window.closeModal = () => document.getElementById('modal-client').style.display = 'none';
document.getElementById('btnLogout').onclick = () => { localStorage.clear(); window.location.href = 'login.html'; };
document.getElementById('form-client').onsubmit = (e) => {
    e.preventDefault();
    push(clientRef, { nome: document.getElementById('name').value, tecnologia: document.getElementById('tech').value, valor: document.getElementById('price').value });
    closeModal();
};