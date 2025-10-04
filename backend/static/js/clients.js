// static/js/clients.js
let clients = [];
let currentPage = 1;
const clientsPerPage = 10;
let currentSort = { field: 'name', direction: 'asc' };
let selectedClients = new Set();

// Chargement initial
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation page clients...");
    loadClients();
    initializeEventListeners();
});

// Initialiser les écouteurs d'événements
function initializeEventListeners() {
    // Gestion du formulaire client
    document.getElementById('clientForm').addEventListener('submit', handleClientSubmit);
    
    // Recherche globale
    document.getElementById('globalSearch').addEventListener('input', filterClients);
    
    // Navigation sidebar
    initializeSidebarNavigation();
}

// Navigation sidebar
function initializeSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-item:not(.active):not(.logout)');
    navItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            switch(text) {
                case '📊 Dashboard':
                    window.location.href = '/admin/dashboard';
                    break;
                case '🏘️ Gestion Biens':
                    window.location.href = '/admin/properties';
                    break;
                case '📅 Rendez-vous':
                    window.location.href = '/admin/appointments';
                    break;
                case '💰 Transactions':
                    window.location.href = '/admin/transactions';
                    break;
                case '📋 Contrats':
                    window.location.href = '/admin/contracts';
                    break;
                case '🏢 Agences':
                    window.location.href = '/admin/agencies';
                    break;
                case '⚙️ Paramètres':
                    window.location.href = '/admin/settings';
                    break;
            }
        });
    });
}

// Déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = '/admin/logout';
    }
}

// Charger les clients
async function loadClients() {
    try {
        showLoading();
        console.log("🔄 Chargement des clients depuis /api/clients...");
        
        const response = await fetch('/api/clients');
        console.log("📡 Réponse reçue:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📦 Données brutes reçues:", data);
        
        clients = Array.isArray(data) ? data : [];
        console.log(`✅ ${clients.length} clients chargés`);
        
        renderClientsTable();
        updatePagination();
        updateStats();
        hideLoading();
        
    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div>❌ Erreur lors du chargement des clients</div>
                    <div style="font-size: 0.8rem; margin-top: 10px; font-family: monospace;">
                        ${error.message}
                    </div>
                    <div style="margin-top: 20px;">
                        <button onclick="testAPI()" style="margin: 5px; padding: 8px 16px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Tester l'API
                        </button>
                        <button onclick="loadClients()" style="margin: 5px; padding: 8px 16px; background: #2c5aa0; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Réessayer
                        </button>
                    </div>
                </td>
            </tr>
        `;
        hideLoading();
    }
}

// Rendu du tableau
function renderClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    const filteredClients = getFilteredClients();
    const paginatedClients = getPaginatedClients(filteredClients);
    
    console.log("🎨 Rendu tableau:", {
        totalClients: clients.length,
        filtered: filteredClients.length,
        paginated: paginatedClients.length
    });
    
    tbody.innerHTML = '';
    
    if (paginatedClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    ${clients.length === 0 ? 'Aucun client trouvé dans la base de données' : 'Aucun client ne correspond aux filtres'}
                </td>
            </tr>
        `;
        return;
    }
    
    paginatedClients.forEach((client, index) => {
        console.log(`📝 Rendu client ${index}:`, client);
        
        // Gérer l'affichage des noms vides
        const displayName = client.firstName || client.lastName 
            ? `${client.firstName} ${client.lastName}`.trim()
            : 'Non renseigné';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" value="${client.id}" onchange="toggleClientSelection('${client.id}')" 
                       ${selectedClients.has(client.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="client-name">
                    <strong>${escapeHtml(displayName)}</strong>
                </div>
            </td>
            <td>${escapeHtml(client.email)}</td>
            <td>${escapeHtml(client.phone || 'Non renseigné')}</td>
            <td>
                <span class="type-badge type-${client.type}">
                    ${getTypeLabel(client.type)}
                </span>
            </td>
            <td>
                <span class="status-badge status-${client.status}">
                    ${getStatusLabel(client.status)}
                </span>
            </td>
            <td>${formatDate(client.createdAt)}</td>
            <td class="actions-cell">
                <button class="action-btn btn-view" onclick="viewClient('${client.id}')" title="Voir">
                    👁️
                </button>
                <button class="action-btn btn-edit" onclick="editClient('${client.id}')" title="Modifier">
                    ✏️
                </button>
                <button class="action-btn btn-delete" onclick="deleteClient('${client.id}')" title="Supprimer">
                    🗑️
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Gestion du formulaire client
function handleClientSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const clientData = Object.fromEntries(formData);
    
    console.log('📝 Données du formulaire:', clientData);
    
    // Ici vous ajouterez l'appel API pour sauvegarder le client
    saveClient(clientData);
}

async function saveClient(clientData) {
    try {
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            closeModal('clientModal');
            loadClients(); // Recharger la liste
            showNotification('Client enregistré avec succès!', 'success');
        } else {
            throw new Error('Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

// Fonctions utilitaires
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTypeLabel(type) {
    const labels = {
        'buyer': 'Acheteur',
        'seller': 'Vendeur',
        'tenant': 'Locataire',
        'landlord': 'Propriétaire',
        'admin': 'Administrateur',
        'user': 'Utilisateur',
        'both': 'Acheteur/Vendeur'
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Actif',
        'inactive': 'Inactif',
        'pending': 'En attente'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (e) {
        return dateString;
    }
}

function showLoading() {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div class="loading-spinner">Chargement des clients...</div>
            </td>
        </tr>
    `;
}

function hideLoading() {
    // Le rendu se fait via renderClientsTable()
}

function updateStats() {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const newThisMonth = clients.filter(c => {
        try {
            const created = new Date(c.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && 
                   created.getFullYear() === now.getFullYear();
        } catch (e) {
            return false;
        }
    }).length;
    
    document.getElementById('totalClients').textContent = total;
    document.getElementById('activeClients').textContent = active;
    document.getElementById('newClients').textContent = newThisMonth;
    
    // Calcul simple du taux de conversion
    const conversionRate = total > 0 ? Math.round((active / total) * 100) : 0;
    document.getElementById('conversionRate').textContent = conversionRate + '%';
}

// Filtrage et pagination
function getFilteredClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    return clients.filter(client => {
        const matchesSearch = !searchTerm || 
            (client.firstName && client.firstName.toLowerCase().includes(searchTerm)) ||
            (client.lastName && client.lastName.toLowerCase().includes(searchTerm)) ||
            (client.email && client.email.toLowerCase().includes(searchTerm));
        
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesType = typeFilter === 'all' || client.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });
}

function getPaginatedClients(filteredClients) {
    const startIndex = (currentPage - 1) * clientsPerPage;
    return filteredClients.slice(startIndex, startIndex + clientsPerPage);
}

function updatePagination() {
    const filteredClients = getFilteredClients();
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
    
    document.getElementById('pageInfo').textContent = `Page ${currentPage} sur ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const filteredClients = getFilteredClients();
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
    
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderClientsTable();
    updatePagination();
}

// Gestion de la sélection
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('#clientsTableBody input[type="checkbox"]');
    
    if (selectAll.checked) {
        checkboxes.forEach(checkbox => {
            selectedClients.add(checkbox.value);
            checkbox.checked = true;
        });
    } else {
        selectedClients.clear();
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
    
    updateSelectedCount();
}

function toggleClientSelection(clientId) {
    if (selectedClients.has(clientId)) {
        selectedClients.delete(clientId);
    } else {
        selectedClients.add(clientId);
    }
    
    const checkboxes = document.querySelectorAll('#clientsTableBody input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    document.getElementById('selectAll').checked = allChecked;
    
    updateSelectedCount();
}

function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = 
        `${selectedClients.size} client(s) sélectionné(s)`;
}

// Gestion des modals
function showAddClientModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Implémentez une notification toast ici
    alert(message);
}

// Fonctions de test
async function testAPI() {
    try {
        console.log("🔧 Test de l'API en cours...");
        const response = await fetch('/api/clients/structure');
        const data = await response.json();
        console.log("🔧 Résultat du test API:", data);
        alert(`Test API: ${JSON.stringify(data, null, 2)}`);
        return data;
    } catch (error) {
        console.error('❌ Test API échoué:', error);
        alert('❌ Test API échoué: ' + error.message);
        return null;
    }
}

// Fonctions temporaires (à implémenter)
function viewClient(clientId) {
    alert('Fonctionnalité à implémenter: Voir client ' + clientId);
}

function editClient(clientId) {
    alert('Fonctionnalité à implémenter: Modifier client ' + clientId);
}

function deleteClient(clientId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        alert('Fonctionnalité à implémenter: Supprimer client ' + clientId);
    }
}

function filterClients() {
    currentPage = 1;
    renderClientsTable();
    updatePagination();
}

function exportClients() {
    alert('Fonctionnalité à implémenter: Exporter les clients');
}

function applyBulkAction() {
    const action = document.getElementById('bulkAction').value;
    if (!action || selectedClients.size === 0) {
        alert('Veuillez sélectionner une action et au moins un client');
        return;
    }
    alert(`Fonctionnalité à implémenter: ${action} sur ${selectedClients.size} clients`);
}

// Fermer les modals en cliquant à l'extérieur
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (let modal of modals) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}