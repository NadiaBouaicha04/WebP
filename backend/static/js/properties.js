// static/js/properties.js
let properties = [];
let currentPage = 1;
const propertiesPerPage = 9;
let selectedProperties = new Set();

// Chargement initial
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Initialisation page biens...");
    loadProperties();
    initializeEventListeners();
});

// Initialiser les écouteurs d'événements
function initializeEventListeners() {
    // Gestion de l'upload d'images
    document.getElementById('images').addEventListener('change', handleImageUpload);
    
    // Recherche en temps réel
    let searchTimeout;
    document.getElementById('propertySearch').addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterProperties();
        }, 300);
    });
    
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
                case '👤 Gestion Clients':
                    window.location.href = '/admin/clients';
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

// Charger les biens
async function loadProperties() {
    try {
        showLoading();
        console.log("🔄 Chargement des biens depuis /api/properties...");
        
        const response = await fetch('/api/properties');
        console.log("📡 Réponse reçue:", response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📦 Données brutes reçues:", data);
        
        properties = Array.isArray(data.properties) ? data.properties : [];
        console.log(`✅ ${properties.length} biens chargés`);
        
        renderPropertiesGrid();
        updatePagination();
        updateStats();
        updateVilleFilter();
        hideLoading();
        
    } catch (error) {
        console.error('❌ Erreur détaillée:', error);
        
        const grid = document.getElementById('propertiesGrid');
        grid.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1 / -1;">
                <div>❌ Erreur lors du chargement des biens</div>
                <div style="font-size: 0.8rem; margin-top: 10px; font-family: monospace;">
                    ${error.message}
                </div>
                <div style="margin-top: 20px;">
                    <button onclick="loadProperties()" style="margin: 5px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
        hideLoading();
    }
}

// Rendu de la grille des biens
function renderPropertiesGrid() {
    const grid = document.getElementById('propertiesGrid');
    const filteredProperties = getFilteredProperties();
    const paginatedProperties = getPaginatedProperties(filteredProperties);
    
    console.log("🎨 Rendu grille:", {
        totalProperties: properties.length,
        filtered: filteredProperties.length,
        paginated: paginatedProperties.length
    });
    
    grid.innerHTML = '';
    
    if (paginatedProperties.length === 0) {
        grid.innerHTML = `
            <div class="loading-spinner" style="grid-column: 1 / -1;">
                ${properties.length === 0 ? 'Aucun bien trouvé dans la base de données' : 'Aucun bien ne correspond aux filtres'}
            </div>
        `;
        return;
    }
    
    paginatedProperties.forEach((property, index) => {
        console.log(`📝 Rendu bien ${index}:`, property);
        
        const firstImage = property.images && property.images.length > 0 
            ? property.images[0] 
            : null;
        
        const card = document.createElement('div');
        card.className = 'property-card';
        card.innerHTML = `
            <div class="property-image">
                ${firstImage ? 
                    `<img src="${firstImage}" alt="${escapeHtml(property.titre)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                    ''
                }
                <div class="no-image" ${firstImage ? 'style="display: none;"' : ''}>
                    🏠
                </div>
                <span class="property-badge badge-${property.statut}">
                    ${getStatusLabel(property.statut)}
                </span>
            </div>
            <div class="property-info">
                <div class="property-header">
                    <h3 class="property-title">${escapeHtml(property.titre)}</h3>
                    <div class="property-price">${property.prix.toLocaleString()}€</div>
                </div>
                <p class="property-type">${getTypeLabel(property.type)} • ${escapeHtml(property.ville)}</p>
                <div class="property-location">
                    📍 ${escapeHtml(property.adresse || property.ville)}
                </div>
                <div class="property-details">
                    <div class="detail-item">
                        <div class="detail-value">${property.surface}m²</div>
                        <div class="detail-label">Surface</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${property.chambres}</div>
                        <div class="detail-label">Chambres</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-value">${property.salles_de_bain}</div>
                        <div class="detail-label">SDB</div>
                    </div>
                </div>
                <p class="property-description">${escapeHtml(property.description)}</p>
                <div class="property-actions">
                    <button class="action-btn btn-view" onclick="viewProperty('${property.id}')" title="Voir">
                        👁️ Voir
                    </button>
                    <button class="action-btn btn-edit" onclick="editProperty('${property.id}')" title="Modifier">
                        ✏️ Modifier
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteProperty('${property.id}')" title="Supprimer">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
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
        'Appartement': 'Appartement',
        'Maison': 'Maison', 
        'Studio': 'Studio',
        'Villa': 'Villa',
        'Loft': 'Loft',
        'Duplex': 'Duplex'
    };
    return labels[type] || type;
}

function getStatusLabel(status) {
    const labels = {
        'disponible': 'Disponible',
        'vendu': 'Vendu',
        'en_attente': 'En attente'
    };
    return labels[status] || status;
}

function showLoading() {
    const grid = document.getElementById('propertiesGrid');
    grid.innerHTML = `
        <div class="loading-spinner" style="grid-column: 1 / -1;">
            Chargement des biens...
        </div>
    `;
}

function hideLoading() {
    // Le rendu se fait via renderPropertiesGrid()
}

function updateStats() {
    const total = properties.length;
    const available = properties.filter(p => p.statut === 'disponible').length;
    const sold = properties.filter(p => p.statut === 'vendu').length;
    const totalValue = properties.reduce((sum, p) => sum + p.prix, 0);
    
    document.getElementById('totalProperties').textContent = total;
    document.getElementById('availableProperties').textContent = available;
    document.getElementById('soldProperties').textContent = sold;
    document.getElementById('totalValue').textContent = totalValue.toLocaleString() + '€';
}

function updateVilleFilter() {
    const villes = [...new Set(properties.map(p => p.ville).filter(Boolean))];
    const select = document.getElementById('villeFilter');
    
    // Garder l'option "Toutes les villes"
    const currentValue = select.value;
    select.innerHTML = '<option value="all">Toutes les villes</option>';
    
    villes.forEach(ville => {
        const option = document.createElement('option');
        option.value = ville;
        option.textContent = ville;
        select.appendChild(option);
    });
    
    // Restaurer la valeur sélectionnée si possible
    if (villes.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Filtrage et pagination
function getFilteredProperties() {
    const searchTerm = document.getElementById('propertySearch').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const villeFilter = document.getElementById('villeFilter').value;
    
    return properties.filter(property => {
        const matchesSearch = !searchTerm || 
            (property.titre && property.titre.toLowerCase().includes(searchTerm)) ||
            (property.description && property.description.toLowerCase().includes(searchTerm)) ||
            (property.ville && property.ville.toLowerCase().includes(searchTerm));
        
        const matchesType = typeFilter === 'all' || property.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || property.statut === statusFilter;
        const matchesVille = villeFilter === 'all' || property.ville === villeFilter;
        
        return matchesSearch && matchesType && matchesStatus && matchesVille;
    });
}

function getPaginatedProperties(filteredProperties) {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    return filteredProperties.slice(startIndex, startIndex + propertiesPerPage);
}

function updatePagination() {
    const filteredProperties = getFilteredProperties();
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    
    document.getElementById('pageInfo').textContent = `Page ${currentPage} sur ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
}

function changePage(direction) {
    const filteredProperties = getFilteredProperties();
    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
    
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderPropertiesGrid();
    updatePagination();
}

function filterProperties() {
    currentPage = 1;
    renderPropertiesGrid();
    updatePagination();
}

// Gestion des modals
function showAddPropertyModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un bien';
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyForm').dataset.editingId = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('propertyModal').style.display = 'block';
}

function closePropertyModal() {
    document.getElementById('propertyModal').style.display = 'none';
    document.getElementById('propertyForm').dataset.editingId = '';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Gestion de l'upload d'images
function handleImageUpload(e) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'preview-image';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Sauvegarder un bien
async function saveProperty() {
    const form = document.getElementById('propertyForm');
    const formData = new FormData(form);
    const editingId = form.dataset.editingId;
    
    try {
        const url = editingId ? `/api/properties/${editingId}` : '/api/properties';
        const method = editingId ? 'PUT' : 'POST';
        
        console.log('📤 Envoi des données:', {
            url: url,
            method: method,
            editingId: editingId
        });
        
        const response = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Bien sauvegardé:', result);
        
        closePropertyModal();
        loadProperties(); // Recharger la liste
        
        alert(editingId ? 'Bien modifié avec succès' : 'Bien ajouté avec succès');
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        alert('Erreur lors de la sauvegarde du bien: ' + error.message);
    }
}

// Fonctions temporaires (à implémenter)
function viewProperty(propertyId) {
    alert('Fonctionnalité à implémenter: Voir bien ' + propertyId);
}

function editProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    document.getElementById('modalTitle').textContent = 'Modifier le bien';
    document.getElementById('titre').value = property.titre;
    document.getElementById('description').value = property.description;
    document.getElementById('type').value = property.type;
    document.getElementById('prix').value = property.prix;
    document.getElementById('surface').value = property.surface;
    document.getElementById('chambres').value = property.chambres;
    document.getElementById('salles_de_bain').value = property.salles_de_bain;
    document.getElementById('ville').value = property.ville;
    document.getElementById('adresse').value = property.adresse || '';
    document.getElementById('code_postal').value = property.code_postal || '';
    document.getElementById('etage').value = property.etage || '';
    document.getElementById('annee_construction').value = property.annee_construction || '';
    document.getElementById('caracteristiques').value = property.caracteristiques ? property.caracteristiques.join(', ') : '';
    
    // Afficher les images existantes
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    if (property.images && property.images.length > 0) {
        property.images.forEach(image => {
            const div = document.createElement('div');
            div.className = 'preview-image';
            div.innerHTML = `
                <img src="${image}" alt="Existing image">
                <span class="remove-image" style="background: #666;">✓</span>
            `;
            preview.appendChild(div);
        });
    }
    
    document.getElementById('propertyForm').dataset.editingId = propertyId;
    document.getElementById('propertyModal').style.display = 'block';
}

function deleteProperty(propertyId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.')) {
        fetch(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la suppression');
            return response.json();
        })
        .then(result => {
            console.log('✅ Bien supprimé:', result);
            loadProperties(); // Recharger la liste
            alert('Bien supprimé avec succès');
        })
        .catch(error => {
            console.error('❌ Erreur suppression:', error);
            alert('Erreur lors de la suppression du bien: ' + error.message);
        });
    }
}

function exportProperties() {
    alert('Fonctionnalité à implémenter: Exporter les biens');
}

// Fermer les modals en cliquant à l'extérieur
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}