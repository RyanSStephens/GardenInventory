// Garden Inventory Application
class GardenInventory {
  constructor() {
    this.currentSection = 'dashboard';
    this.plants = [];
    this.inventory = [];
    this.harvests = [];
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadDashboard();
    this.setupEventListeners();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        this.showSection(sectionId);
      });
    });
  }

  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionId;

      // Load section-specific data
      switch (sectionId) {
        case 'dashboard':
          this.loadDashboard();
          break;
        case 'plants':
          this.loadPlants();
          break;
        case 'inventory':
          this.loadInventory();
          break;
        case 'harvests':
          this.loadHarvests();
          break;
      }
    }
  }

  async loadDashboard() {
    try {
      const [plantsRes, inventoryRes, harvestsRes] = await Promise.all([
        fetch('/api/plants'),
        fetch('/api/inventory'),
        fetch('/api/harvests')
      ]);

      const plants = await plantsRes.json();
      const inventory = await inventoryRes.json();
      const harvests = await harvestsRes.json();

      // Update dashboard stats
      document.getElementById('total-plants').textContent = plants.length;
      document.getElementById('active-plants').textContent = 
        plants.filter(p => ['growing', 'flowering', 'fruiting'].includes(p.status)).length;
      document.getElementById('inventory-count').textContent = inventory.length;

      // Calculate monthly harvests
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyHarvests = harvests.filter(h => {
        const harvestDate = new Date(h.harvestDate);
        return harvestDate.getMonth() === currentMonth && 
               harvestDate.getFullYear() === currentYear;
      });
      document.getElementById('monthly-harvests').textContent = monthlyHarvests.length;

    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showError('Failed to load dashboard data');
    }
  }

  async loadPlants() {
    try {
      const response = await fetch('/api/plants');
      this.plants = await response.json();
      this.renderPlants();
    } catch (error) {
      console.error('Error loading plants:', error);
      this.showError('Failed to load plants');
    }
  }

  renderPlants() {
    const container = document.getElementById('plants-list');
    if (!this.plants.length) {
      container.innerHTML = '<p class="loading">No plants found. Add your first plant!</p>';
      return;
    }

    container.innerHTML = this.plants.map(plant => `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">${plant.name} ${plant.variety ? `(${plant.variety})` : ''}</h3>
            <span class="status-badge status-${plant.status}">${plant.status}</span>
          </div>
          <div class="card-actions">
            <button class="btn-secondary" onclick="app.editPlant('${plant._id}')">Edit</button>
            <button class="btn-danger" onclick="app.deletePlant('${plant._id}')">Delete</button>
          </div>
        </div>
        <div>
          <p><strong>Category:</strong> ${plant.category}</p>
          <p><strong>Location:</strong> ${plant.location}</p>
          <p><strong>Planted:</strong> ${new Date(plant.plantedDate).toLocaleDateString()}</p>
          ${plant.expectedHarvestDate ? `<p><strong>Expected Harvest:</strong> ${new Date(plant.expectedHarvestDate).toLocaleDateString()}</p>` : ''}
          ${plant.notes ? `<p><strong>Notes:</strong> ${plant.notes}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  async loadInventory() {
    try {
      const response = await fetch('/api/inventory');
      this.inventory = await response.json();
      this.renderInventory();
    } catch (error) {
      console.error('Error loading inventory:', error);
      this.showError('Failed to load inventory');
    }
  }

  renderInventory() {
    const container = document.getElementById('inventory-list');
    if (!this.inventory.length) {
      container.innerHTML = '<p class="loading">No inventory items found. Add your first item!</p>';
      return;
    }

    container.innerHTML = this.inventory.map(item => `
      <div class="card ${item.quantity <= item.minimumStock ? 'low-stock' : ''}">
        <div class="card-header">
          <div>
            <h3 class="card-title">${item.name}</h3>
            <span class="status-badge ${item.quantity <= item.minimumStock ? 'status-seed' : 'status-growing'}">
              ${item.quantity} ${item.unit}
            </span>
          </div>
          <div class="card-actions">
            <button class="btn-secondary" onclick="app.editInventory('${item._id}')">Edit</button>
            <button class="btn-danger" onclick="app.deleteInventory('${item._id}')">Delete</button>
          </div>
        </div>
        <div>
          <p><strong>Category:</strong> ${item.category}</p>
          <p><strong>Location:</strong> ${item.location}</p>
          ${item.supplier ? `<p><strong>Supplier:</strong> ${item.supplier}</p>` : ''}
          ${item.cost ? `<p><strong>Cost:</strong> $${item.cost}</p>` : ''}
          ${item.quantity <= item.minimumStock ? '<p class="error">⚠️ Low Stock Alert!</p>' : ''}
        </div>
      </div>
    `).join('');
  }

  async loadHarvests() {
    try {
      const response = await fetch('/api/harvests');
      this.harvests = await response.json();
      this.renderHarvests();
    } catch (error) {
      console.error('Error loading harvests:', error);
      this.showError('Failed to load harvests');
    }
  }

  renderHarvests() {
    const container = document.getElementById('harvests-list');
    if (!this.harvests.length) {
      container.innerHTML = '<p class="loading">No harvests recorded yet. Record your first harvest!</p>';
      return;
    }

    container.innerHTML = this.harvests.map(harvest => `
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">${harvest.plant ? harvest.plant.name : 'Unknown Plant'}</h3>
            <span class="status-badge status-harvested">${harvest.quantity} ${harvest.unit}</span>
          </div>
          <div class="card-actions">
            <button class="btn-secondary" onclick="app.editHarvest('${harvest._id}')">Edit</button>
            <button class="btn-danger" onclick="app.deleteHarvest('${harvest._id}')">Delete</button>
          </div>
        </div>
        <div>
          <p><strong>Date:</strong> ${new Date(harvest.harvestDate).toLocaleDateString()}</p>
          <p><strong>Quality:</strong> ${harvest.quality}</p>
          ${harvest.storage && harvest.storage.method ? `<p><strong>Storage:</strong> ${harvest.storage.method}</p>` : ''}
          ${harvest.notes ? `<p><strong>Notes:</strong> ${harvest.notes}</p>` : ''}
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Modal close functionality
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
        this.closeModal();
      }
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'plant-form') {
        e.preventDefault();
        this.savePlant(new FormData(e.target));
      } else if (e.target.id === 'inventory-form') {
        e.preventDefault();
        this.saveInventory(new FormData(e.target));
      } else if (e.target.id === 'harvest-form') {
        e.preventDefault();
        this.saveHarvest(new FormData(e.target));
      }
    });
  }

  showAddPlantForm() {
    this.showModal('Add New Plant', this.getPlantFormHTML());
  }

  showAddInventoryForm() {
    this.showModal('Add Inventory Item', this.getInventoryFormHTML());
  }

  showAddHarvestForm() {
    this.showModal('Record Harvest', this.getHarvestFormHTML());
  }

  getPlantFormHTML() {
    return `
      <form id="plant-form">
        <div class="form-group">
          <label for="name">Plant Name *</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="variety">Variety</label>
          <input type="text" id="variety" name="variety">
        </div>
        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select category</option>
            <option value="vegetable">Vegetable</option>
            <option value="fruit">Fruit</option>
            <option value="herb">Herb</option>
            <option value="flower">Flower</option>
            <option value="tree">Tree</option>
            <option value="shrub">Shrub</option>
          </select>
        </div>
        <div class="form-group">
          <label for="plantedDate">Planted Date *</label>
          <input type="date" id="plantedDate" name="plantedDate" required>
        </div>
        <div class="form-group">
          <label for="location">Location *</label>
          <input type="text" id="location" name="location" required>
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="seed">Seed</option>
            <option value="seedling">Seedling</option>
            <option value="growing">Growing</option>
            <option value="flowering">Flowering</option>
            <option value="fruiting">Fruiting</option>
            <option value="harvested">Harvested</option>
            <option value="dormant">Dormant</option>
          </select>
        </div>
        <div class="form-group">
          <label for="expectedHarvestDate">Expected Harvest Date</label>
          <input type="date" id="expectedHarvestDate" name="expectedHarvestDate">
        </div>
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" rows="3"></textarea>
        </div>
        <button type="submit" class="btn-primary">Save Plant</button>
      </form>
    `;
  }

  getInventoryFormHTML() {
    return `
      <form id="inventory-form">
        <div class="form-group">
          <label for="name">Item Name *</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select category</option>
            <option value="seeds">Seeds</option>
            <option value="tools">Tools</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="soil">Soil</option>
            <option value="containers">Containers</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input type="number" id="quantity" name="quantity" min="0" required>
        </div>
        <div class="form-group">
          <label for="unit">Unit *</label>
          <select id="unit" name="unit" required>
            <option value="">Select unit</option>
            <option value="pieces">Pieces</option>
            <option value="packets">Packets</option>
            <option value="pounds">Pounds</option>
            <option value="ounces">Ounces</option>
            <option value="gallons">Gallons</option>
            <option value="liters">Liters</option>
            <option value="bags">Bags</option>
            <option value="bottles">Bottles</option>
          </select>
        </div>
        <div class="form-group">
          <label for="location">Location *</label>
          <input type="text" id="location" name="location" required>
        </div>
        <div class="form-group">
          <label for="supplier">Supplier</label>
          <input type="text" id="supplier" name="supplier">
        </div>
        <div class="form-group">
          <label for="cost">Cost ($)</label>
          <input type="number" id="cost" name="cost" min="0" step="0.01">
        </div>
        <div class="form-group">
          <label for="minimumStock">Minimum Stock Level</label>
          <input type="number" id="minimumStock" name="minimumStock" min="0" value="0">
        </div>
        <button type="submit" class="btn-primary">Save Item</button>
      </form>
    `;
  }

  getHarvestFormHTML() {
    const plantOptions = this.plants.map(plant => 
      `<option value="${plant._id}">${plant.name} ${plant.variety ? `(${plant.variety})` : ''}</option>`
    ).join('');

    return `
      <form id="harvest-form">
        <div class="form-group">
          <label for="plant">Plant *</label>
          <select id="plant" name="plant" required>
            <option value="">Select plant</option>
            ${plantOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="harvestDate">Harvest Date *</label>
          <input type="date" id="harvestDate" name="harvestDate" required>
        </div>
        <div class="form-group">
          <label for="quantity">Quantity *</label>
          <input type="number" id="quantity" name="quantity" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label for="unit">Unit *</label>
          <select id="unit" name="unit" required>
            <option value="">Select unit</option>
            <option value="pounds">Pounds</option>
            <option value="ounces">Ounces</option>
            <option value="pieces">Pieces</option>
            <option value="bunches">Bunches</option>
            <option value="heads">Heads</option>
            <option value="cups">Cups</option>
            <option value="quarts">Quarts</option>
            <option value="gallons">Gallons</option>
          </select>
        </div>
        <div class="form-group">
          <label for="quality">Quality</label>
          <select id="quality" name="quality">
            <option value="excellent">Excellent</option>
            <option value="good" selected>Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" name="notes" rows="3"></textarea>
        </div>
        <button type="submit" class="btn-primary">Record Harvest</button>
      </form>
    `;
  }

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>${title}</h2>
        ${content}
      </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
  }

  closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  }

  async savePlant(formData) {
    try {
      const plantData = Object.fromEntries(formData);
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plantData)
      });

      if (response.ok) {
        this.closeModal();
        this.loadPlants();
        this.showSuccess('Plant added successfully!');
      } else {
        throw new Error('Failed to save plant');
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      this.showError('Failed to save plant');
    }
  }

  async saveInventory(formData) {
    try {
      const inventoryData = Object.fromEntries(formData);
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryData)
      });

      if (response.ok) {
        this.closeModal();
        this.loadInventory();
        this.showSuccess('Inventory item added successfully!');
      } else {
        throw new Error('Failed to save inventory item');
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
      this.showError('Failed to save inventory item');
    }
  }

  async saveHarvest(formData) {
    try {
      const harvestData = Object.fromEntries(formData);
      const response = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(harvestData)
      });

      if (response.ok) {
        this.closeModal();
        this.loadHarvests();
        this.showSuccess('Harvest recorded successfully!');
      } else {
        throw new Error('Failed to record harvest');
      }
    } catch (error) {
      console.error('Error saving harvest:', error);
      this.showError('Failed to record harvest');
    }
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = type;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Global functions for button clicks
function showAddPlantForm() {
  if (window.app) {
    window.app.showAddPlantForm();
  }
}

function showAddInventoryForm() {
  if (window.app) {
    window.app.showAddInventoryForm();
  }
}

function showAddHarvestForm() {
  if (window.app) {
    window.app.showAddHarvestForm();
  }
}

// Initialize the application
window.app = new GardenInventory(); 