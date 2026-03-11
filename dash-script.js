import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// CONFIG FIREBASE (Sincronizada com seu App)
const fbConfig = { 
    apiKey: "AIzaSyAe-UYZc4-K94cfrSTDqkG8_UjBjFpJ_-U", 
    authDomain: "rozaytech-noc.firebaseapp.com", 
    databaseURL: "https://rozaytech-noc-default-rtdb.firebaseio.com", 
    projectId: "rozaytech-noc", 
    storageBucket: "rozaytech-noc.firebasestorage.app", 
    messagingSenderId: "129382246448", 
    appId: "1:129382246448:web:f0ce1b7fca23eed17da5f5" 
};

const app = initializeApp(fbConfig);
const db = getDatabase(app);

// 1. PROTEÇÃO DE ROTA & LOGOUT
if (localStorage.getItem('rozay_auth') !== 'true') {
    window.location.href = 'login.html';
}

document.getElementById('btnLogout').onclick = () => {
    localStorage.clear();
    window.location.href = 'login.html';
};

// 2. NAVEGAÇÃO SPA (SEM RECARREGAR)
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.spa-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if(item.classList.contains('return-site')) return;
        e.preventDefault();
        const target = item.getAttribute('data-sec');
        
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(s => {
            s.classList.remove('active');
            if(s.id === `sec-${target}`) s.classList.add('active');
        });
    });
});

// 3. RELÓGIO E SAUDAÇÃO
function updateUIStrings() {
    const now = new Date();
    const hrs = now.getHours();
    const user = localStorage.getItem('rozay_user') || 'Admin';
    let greet = "Boa noite";
    if (hrs < 12) greet = "Bom dia";
    else if (hrs < 18) greet = "Boa tarde";
    document.getElementById('greeting').innerText = `${greet}, ${user}`;
    document.getElementById('calendar').innerText = now.toLocaleString('pt-MZ');
}
setInterval(updateUIStrings, 1000);

// 4. LÓGICA DE DADOS (FIREBASE)
const clientRef = ref(db, 'clients');
const logRef = ref(db, 'logs');

onValue(clientRef, (snapshot) => {
    const data = snapshot.val();
    renderClients(data);
    updateKPIs(data);
    renderChart(data);
});

function renderClients(data) {
    const list = document.getElementById('client-list');
    list.innerHTML = "";
    if(!data) return;

    Object.keys(data).forEach(id => {
        const c = data[id];
        const row = `
            <tr>
                <td><strong>${c.nome}</strong></td>
                <td>${c.tecnologia}</td>
                <td>${parseFloat(c.valor).toLocaleString()} MT</td>
                <td><span class="status-badge ${c.status}">${c.status}</span></td>
                <td>
                    <button class="edit-btn" onclick="editClient('${id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" onclick="deleteClient('${id}', '${c.nome}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        list.innerHTML += row;
    });
}

// FUNÇÕES TÉCNICAS (ADD, EDIT, DELETE)
window.deleteClient = (id, nome) => {
    if(confirm(`Eliminar ${nome}? Esta ação é irreversível.`)) {
        remove(ref(db, `clients/${id}`));
        saveLog("ELIMINAR", `Cliente ${nome} removido do sistema.`);
    }
};

document.getElementById('form-client').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const clientData = {
        nome: document.getElementById('name').value,
        tecnologia: document.getElementById('tech').value,
        valor: document.getElementById('price').value,
        status: document.getElementById('status').value,
        timestamp: new Date().getTime()
    };

    if(id) {
        await update(ref(db, `clients/${id}`), clientData);
        saveLog("EDITAR", `Dados de ${clientData.nome} atualizados.`);
    } else {
        await push(clientRef, clientData);
        saveLog("ADICIONAR", `Novo cliente ${clientData.nome} registado.`);
    }
    closeModal();
};

function saveLog(acao, detalhes) {
    push(logRef, {
        data: new Date().toLocaleString('pt-MZ'),
        user: localStorage.getItem('rozay_user'),
        acao: acao,
        detalhes: detalhes
    });
}

// 5. CHART.JS (Doughnut Elite)
let myChart;
function renderChart(data) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if(myChart) myChart.destroy();
    
    const counts = { Starlink: 0, PtP: 0, Fiber: 0 };
    if(data) {
        Object.values(data).forEach(c => {
            if(c.tecnologia.includes('Starlink')) counts.Starlink++;
            else if(c.tecnologia.includes('PtP')) counts.PtP++;
            else counts.Fiber++;
        });
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Starlink', 'PtP Wireless', 'Fiber MZ'],
            datasets: [{
                data: [counts.Starlink, counts.PtP, counts.Fiber],
                backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
    });
}

// 6. EXPORTAR PDF
document.getElementById('btn-export-pdf').onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ROZAY TECH SOLUTIONS - RELATÓRIO NOC", 14, 15);
    doc.autoTable({ html: 'table', startY: 25 });
    doc.save(`relatorio-clientes-${new Date().getTime()}.pdf`);
};

// CONTROLO DE MODAL
document.getElementById('btn-add-client').onclick = () => {
    document.getElementById('form-client').reset();
    document.getElementById('edit-id').value = "";
    document.getElementById('modal-client').style.display = 'flex';
};
const closeModal = () => document.getElementById('modal-client').style.display = 'none';
document.querySelector('.btn-close').onclick = closeModal;

// REMOVER LOADER
window.onload = () => document.getElementById('loader-global').style.display = 'none';