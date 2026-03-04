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

// 1. Relógio e Saudação Dinâmica
function updateHeader() {
    const now = new Date();
    const hrs = now.getHours();
    const clock = document.getElementById('live-clock');
    const greet = document.getElementById('greeting');
    
    clock.innerText = now.toLocaleString('pt-MZ');
    if (hrs < 12) greet.innerText = "Bom dia, Admin!";
    else if (hrs < 18) greet.innerText = "Boa tarde, Admin!";
    else greet.innerText = "Boa noite, Admin!";
}
setInterval(updateHeader, 1000);

// 2. Navegação entre Abas
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
};

// 3. Monitoramento de Leads (Novas Vendas)
onValue(ref(db, 'leads'), (snap) => {
    const badge = document.getElementById('badge-leads');
    badge.innerText = snap.exists() ? Object.keys(snap.val()).length : 0;
});

// 4. Gestão de Clientes e Redes
onValue(ref(db, 'clientes'), (snap) => {
    const tbody = document.getElementById('tbody-clientes');
    const statClientes = document.getElementById('stat-clientes');
    const alertSystem = document.getElementById('system-alert');
    tbody.innerHTML = "";
    
    let totalMT = 0;
    let offlineDetected = false;

    if (snap.exists()) {
        const data = snap.val();
        statClientes.innerText = Object.keys(data).length;

        Object.entries(data).forEach(([id, c]) => {
            totalMT += parseFloat(c.valor);
            if (c.status === 'offline') offlineDetected = true;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${c.nome}</strong></td>
                    <td>${c.tecnologia}</td>
                    <td>MT ${parseFloat(c.valor).toLocaleString()}</td>
                    <td><span class="status-badge ${c.status}">${c.status.toUpperCase()}</span></td>
                    <td>
                        <button onclick="editItem('clientes/${id}')" class="btn-edit"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="deleteItem('clientes/${id}', '${c.nome}')" class="btn-del"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
    
    document.getElementById('stat-receita').innerText = `MT ${totalMT.toLocaleString()}`;
    if (offlineDetected) {
        alertSystem.className = "status-alert offline";
        alertSystem.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Alerta: Clientes Offline`;
    } else {
        alertSystem.className = "status-alert";
        alertSystem.innerHTML = `<i class="fa-solid fa-circle-check"></i> Sistema Online`;
    }
});

// 5. Funções de Sistema (PDF e CRUD)
window.deleteItem = (path, name) => {
    if (confirm(`Confirmar exclusão de: ${name}?`)) {
        remove(ref(db, path));
        logAction("Eliminar", `Removido: ${name}`);
    }
};

async function logAction(acao, detalhes) {
    await push(ref(db, 'logs'), {
        data: new Date().toLocaleString(),
        responsavel: "Admin",
        acao: acao,
        detalhes: detalhes
    });
}

window.generatePDF = (tableId, filename) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("ROZAY TECH - RELATÓRIO NOC", 14, 15);
    doc.autoTable({ html: `#${tableId}`, margin: { top: 25 } });
    doc.save(`${filename}.pdf`);
};

// 6. Gráfico de Serviços (Exemplo de Distribuição)
const ctx = document.getElementById('serviceChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Starlink', 'Redes Wireless', 'Consultoria', 'Drones'],
        datasets: [{
            data: [40, 30, 20, 10],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
        }]
    }
});