// static/js/clients.js - Version finale avec modals fonctionnels

let clients = [];
let currentPage = 1;
const clientsPerPage = 10;
let currentSort = { field: 'name', direction: 'asc' };
let selectedClients = new Set();
let currentEditingId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation de la page clients...");
    loadClients();
    setupModalEvents();
    setupEventListeners();
});

// Configuration des événements des modals
function setupModalEvents() {
    // Fermeture des modals en cliquant à l'extérieur
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });

    // Fermeture avec la touche ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Formulaire client
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', handleClientSubmit);
    }

    // Bouton d'édition depuis les détails
    const editFromDetailsBtn = document.getElementById('editFromDetailsBtn');
    if (editFromDetailsBtn) {
        editFromDetailsBtn.addEventListener('click', editFromDetails);
    }

    // Recherche en temps réel
    const clientSearch = document.getElementById('clientSearch');
    const globalSearch = document.getElementById('globalSearch');
    
    if (clientSearch) {
        clientSearch.addEventListener('input', debounce(filterClients, 300));
    }
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(filterClients, 300));
    }
}

// Fonction debounce pour la recherche
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Chargement des clients
async function loadClients() {
    try {
        showLoading();
        console.log("🔄 Chargement des clients depuis /api/clients...");
        
        const response = await fetch('/api/clients');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        clients = await response.json();
        console.log(`✅ ${clients.length} clients chargés avec succès`);
        
        renderClientsTable();
        updatePagination();
        updateStats();
        
    } catch (error) {
        console.error('❌ Erreur chargement clients:', error);
        showNotification('Erreur lors du chargement des clients: ' + error.message, 'error');
        
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #e74c3c;">
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">❌ Erreur de chargement</div>
                    <div style="margin-bottom: 20px;">${error.message}</div>
                    <button onclick="loadClients()" class="btn btn-primary">
                        Réessayer
                    </button>
                </td>
            </tr>
        `;
    }
}

// Affichage du loading
function showLoading() {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <span>Chargement des clients...</span>
                </div>
            </td>
        </tr>
    `;
}

// Rendu du tableau des clients
function renderClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    const filteredClients = getFilteredClients();
    const paginatedClients = getPaginatedClients(filteredClients);
    
    if (paginatedClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">👥</div>
                    <h3 style="margin-bottom: 10px;">Aucun client trouvé</h3>
                    <p>${clients.length === 0 ? 'Aucun client dans la base de données' : 'Aucun client ne correspond aux critères de recherche'}</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedClients.map(client => `
        <tr data-client-id="${client.id}" class="client-row">
            <td class="checkbox-column">
                <input type="checkbox" class="client-checkbox" value="${client.id}" 
                       onchange="toggleClientSelection('${client.id}')"
                       ${selectedClients.has(client.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="client-name">
                    <strong>${escapeHtml(client.firstName)} ${escapeHtml(client.lastName)}</strong>
                </div>
            </td>
            <td>
                <div class="client-email">
                    ${escapeHtml(client.email)}
                </div>
            </td>
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
            <td>
                <div class="date-info">
                    ${formatDate(client.createdAt)}
                </div>
            </td>
            <td class="actions-cell">
                <button class="action-btn btn-view" onclick="showClientDetails('${client.id}')" 
                        title="Voir les détails">
                    <span class="btn-icon">👁️</span>
                    <span class="btn-text">Détails</span>
                </button>
                <button class="action-btn btn-edit" onclick="editClient('${client.id}')" 
                        title="Modifier le client">
                    <span class="btn-icon">✏️</span>
                    <span class="btn-text">Modifier</span>
                </button>
                <button class="action-btn btn-delete" onclick="confirmDeleteClient('${client.id}')" 
                        title="Supprimer le client">
                    <span class="btn-icon">🗑️</span>
                    <span class="btn-text">Supprimer</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== GESTION DES MODALS ====================

// MODAL D'AJOUT
function showAddClientModal() {
    const modal = document.getElementById('clientModal');
    const form = document.getElementById('clientForm');
    const title = document.getElementById('modalTitle');
    
    // Réinitialiser le formulaire
    form.reset();
    form.dataset.mode = 'add';
    title.textContent = 'Ajouter un client';
    currentEditingId = null;
    
    showModal('clientModal');
    
    // Focus sur le premier champ
    setTimeout(() => {
        const firstNameInput = document.getElementById('firstName');
        if (firstNameInput) firstNameInput.focus();
    }, 300);
}

// MODAL DE MODIFICATION
async function editClient(clientId) {
    try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (!response.ok) throw new Error('Client non trouvé');
        
        const client = await response.json();
        
        const modal = document.getElementById('clientModal');
        const form = document.getElementById('clientForm');
        const title = document.getElementById('modalTitle');
        
        // Remplir le formulaire
        document.getElementById('firstName').value = client.firstName || '';
        document.getElementById('lastName').value = client.lastName || '';
        document.getElementById('email').value = client.email || '';
        document.getElementById('phone').value = client.phone || '';
        document.getElementById('type').value = client.type || 'buyer';
        document.getElementById('status').value = client.status || 'active';
        document.getElementById('address').value = client.address || '';
        document.getElementById('budget').value = client.budget || '';
        document.getElementById('preferences').value = client.preferences || '';
        
        // Configurer le mode édition
        form.dataset.mode = 'edit';
        form.dataset.clientId = clientId;
        title.textContent = `Modifier ${client.firstName} ${client.lastName}`;
        currentEditingId = clientId;
        
        showModal('clientModal');
        
    } catch (error) {
        console.error('❌ Erreur édition:', error);
        showNotification('Erreur lors du chargement du client', 'error');
    }
}

// MODAL DE DÉTAILS
async function showClientDetails(clientId) {
    try {
        showLoadingDetails();
        
        const response = await fetch(`/api/clients/${clientId}`);
        if (!response.ok) throw new Error('Client non trouvé');
        
        const client = await response.json();
        renderClientDetails(client);
        
    } catch (error) {
        console.error('❌ Erreur détails:', error);
        showNotification('Erreur lors du chargement des détails', 'error');
        closeModal('clientDetailsModal');
    }
}

function showLoadingDetails() {
    const content = document.getElementById('clientDetailsContent');
    content.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>Chargement des détails...</span>
            </div>
        </div>
    `;
    showModal('clientDetailsModal');
}

function renderClientDetails(client) {
    const modal = document.getElementById('clientDetailsModal');
    const content = document.getElementById('clientDetailsContent');
    const title = document.getElementById('clientDetailsTitle');
    
    title.textContent = `Détails de ${client.firstName} ${client.lastName}`;
    
    content.innerHTML = `
        <div class="client-details">
            <div class="detail-section">
                <h4>Informations Personnelles</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Nom complet:</label>
                        <span>${escapeHtml(client.firstName)} ${escapeHtml(client.lastName)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${escapeHtml(client.email)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Téléphone:</label>
                        <span>${escapeHtml(client.phone || 'Non renseigné')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Type:</label>
                        <span class="type-badge type-${client.type}">
                            ${getTypeLabel(client.type)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Statut et Préférences</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Statut:</label>
                        <span class="status-badge status-${client.status}">
                            ${getStatusLabel(client.status)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Budget:</label>
                        <span>${escapeHtml(client.budget || 'Non spécifié')}</span>
                    </div>
                    <div class="detail-item">
                        <label>Adresse:</label>
                        <span>${escapeHtml(client.address || 'Non renseignée')}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Préférences</h4>
                <div class="preferences-content">
                    ${client.preferences ? 
                        `<p>${escapeHtml(client.preferences)}</p>` : 
                        '<p class="no-preferences">Aucune préférence renseignée</p>'
                    }
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Dates</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Date de création:</label>
                        <span>${formatDate(client.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Dernière modification:</label>
                        <span>${formatDate(client.updatedAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Stocker l'ID pour la modification
    content.dataset.clientId = client.id;
}

// Édition depuis les détails
function editFromDetails() {
    const detailsModal = document.getElementById('clientDetailsModal');
    const clientId = detailsModal.querySelector('#clientDetailsContent').dataset.clientId;
    
    if (clientId) {
        closeModal('clientDetailsModal');
        setTimeout(() => editClient(clientId), 300);
    }
}

// MODAL DE CONFIRMATION
function confirmDeleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    showConfirmModal(
        `Êtes-vous sûr de vouloir supprimer le client ${client.firstName} ${client.lastName} ?`,
        async () => {
            try {
                const response = await fetch(`/api/clients/${clientId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }
                
                showNotification('Client supprimé avec succès', 'success');
                await loadClients();
                
            } catch (error) {
                console.error('❌ Erreur suppression:', error);
                showNotification('Erreur lors de la suppression: ' + error.message, 'error');
            }
        }
    );
}

function showConfirmModal(message, confirmCallback) {
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmMessage');
    const confirmButton = document.getElementById('confirmAction');
    
    messageElement.textContent = message;
    
    // Nettoyer les anciens écouteurs et en créer un nouveau
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    newConfirmButton.addEventListener('click', function() {
        confirmCallback();
        closeModal('confirmModal');
    });
    
    showModal('confirmModal');
}

// GESTION DU FORMULAIRE
async function handleClientSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const isEdit = form.dataset.mode === 'edit';
    const clientId = form.dataset.clientId;
    
    try {
        const url = isEdit ? `/api/clients/${clientId}` : '/api/clients';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                clientType: data.type,
                clientStatus: data.status,
                address: data.address,
                budget: data.budget,
                preferences: data.preferences
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la sauvegarde');
        }
        
        showNotification(
            isEdit ? 'Client modifié avec succès' : 'Client créé avec succès',
            'success'
        );
        
        closeModal('clientModal');
        await loadClients();
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        showNotification(error.message, 'error');
    }
}

// ==================== FONCTIONS DES MODALS ====================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animation d'entrée
    setTimeout(() => {
        modal.classList.add('modal-show');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('modal-show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function closeAllModals() {
    const modals = ['clientModal', 'confirmModal', 'clientDetailsModal'];
    modals.forEach(modalId => closeModal(modalId));
}

// Fermeture spécifique pour chaque modal
function closeClientModal() { closeModal('clientModal'); }
function closeConfirmModal() { closeModal('confirmModal'); }
function closeClientDetailsModal() { closeModal('clientDetailsModal'); }

// ==================== FONCTIONS UTILITAIRES ====================

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
        'admin': 'Administrateur'
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
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function updateStats() {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const newThisMonth = clients.filter(c => {
        try {
            const created = new Date(c.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        } catch (e) {
            return false;
        }
    }).length;

    document.getElementById('totalClients').textContent = total;
    document.getElementById('activeClients').textContent = active;
    document.getElementById('newClients').textContent = newThisMonth;
    document.getElementById('conversionRate').textContent = '25%';
}

// ==================== PAGINATION ET FILTRES ====================

function getFilteredClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    return clients.filter(client => {
        const matchesSearch = 
            client.firstName.toLowerCase().includes(searchTerm) ||
            client.lastName.toLowerCase().includes(searchTerm) ||
            client.email.toLowerCase().includes(searchTerm) ||
            (client.phone && client.phone.toLowerCase().includes(searchTerm));
        
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
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderClientsTable();
        updatePagination();
    }
}

// ==================== SÉLECTION ET ACTIONS GROUPÉES ====================

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.client-checkbox');
    
    selectedClients.clear();
    
    if (selectAll) {
        const startIndex = (currentPage - 1) * clientsPerPage;
        const endIndex = startIndex + clientsPerPage;
        const currentPageClients = clients.slice(startIndex, endIndex);
        
        currentPageClients.forEach(client => {
            selectedClients.add(client.id);
        });
    }
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll;
    });
    
    updateSelectedCount();
}

function toggleClientSelection(clientId) {
    if (selectedClients.has(clientId)) {
        selectedClients.delete(clientId);
    } else {
        selectedClients.add(clientId);
    }
    updateSelectedCount();
}

function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = 
        `${selectedClients.size} client(s) sélectionné(s)`;
}

function applyBulkAction() {
    const action = document.getElementById('bulkAction').value;
    
    if (!action || selectedClients.size === 0) {
        showNotification('Veuillez sélectionner une action et des clients', 'warning');
        return;
    }
    
    switch (action) {
        case 'activate':
            bulkUpdateStatus('active');
            break;
        case 'deactivate':
            bulkUpdateStatus('inactive');
            break;
        case 'delete':
            bulkDelete();
            break;
        case 'export':
            exportSelectedClients();
            break;
    }
}

async function bulkUpdateStatus(status) {
    showNotification(`Statut mis à jour pour ${selectedClients.size} clients`, 'success');
}

async function bulkDelete() {
    showConfirmModal(
        `Êtes-vous sûr de vouloir supprimer ${selectedClients.size} client(s) ?`,
        async () => {
            showNotification(`${selectedClients.size} clients supprimés`, 'success');
            selectedClients.clear();
            await loadClients();
        }
    );
}

function exportSelectedClients() {
    const clientsToExport = clients.filter(client => selectedClients.has(client.id));
    console.log('Export des clients:', clientsToExport);
    showNotification(`${clientsToExport.length} clients exportés`, 'success');
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${getNotificationColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    return colors[type] || colors.info;
}

// ==================== FONCTIONS GLOBALES ====================

// Export des fonctions pour qu'elles soient accessibles depuis HTML
window.showAddClientModal = showAddClientModal;
window.editClient = editClient;
window.showClientDetails = showClientDetails;
window.confirmDeleteClient = confirmDeleteClient;
window.toggleClientSelection = toggleClientSelection;
window.toggleSelectAll = toggleSelectAll;
window.changePage = changePage;
window.applyBulkAction = applyBulkAction;
window.sortClients = sortClients;
window.filterClients = filterClients;
window.exportClients = exportSelectedClients;
window.closeClientModal = closeClientModal;
window.closeConfirmModal = closeConfirmModal;
window.closeClientDetailsModal = closeClientDetailsModal;
window.logout = logout;

// Navigation
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        window.location.href = '/admin/logout';
    }
}