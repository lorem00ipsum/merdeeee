/**
 * BAZOOKA Premium - Frontend JavaScript
 * Version: 2.0 PRO
 * Site: https://bazooka-premium.netlify.app
 * Contact: magaudouxlucas08@icloud.com
 */

// ============ CONFIGURATION ============
const CONFIG = {
  API_URL: (() => {
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    // Fallback production – nouveau backend Render
    return 'https://mami-bazooka.onrender.com/api';
  })(),
};

// Global state
let currentUser = null;
let allProducts = [];
let allUsers = []; // For admin
let cart = [];
let uploadedProductImages = []; // Temp store during product creation
let editingProductId = null; // For edit modal
let originalProductImages = []; // Existing product images during edit
let uploadedEditImages = []; // New images added during edit
let debounceTimer = null;

// ============ INIT ============
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 BAZOOKA frontend initialized');

  // Initialize app
  await initApp();

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Init GSAP ScrollTrigger
  initAnimations();
});

async function initApp() {
  // Check authentication status
  await checkAuth();

  // Load cart from localStorage
  const savedCart = localStorage.getItem('bazooka_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }

  // Load products from API
  await loadProducts();

  // Setup event listeners
  setupEventListeners();

  // Refresh admin panel if admin
  if (currentUser && currentUser.role === 'admin') {
    await refreshAdminPanel();
  }
}

// ============ API HELPER ============
async function api(endpoint, method = 'GET', body = null, isFormData = false) {
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('bazooka_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body && !isFormData) {
    options.body = JSON.stringify(body);
  } else if (body && isFormData) {
    options.body = body;
  }

  try {
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============ AUTH ============
async function checkAuth() {
  const token = localStorage.getItem('bazooka_token');
  const userJson = localStorage.getItem('bazooka_user');

  if (!token || !userJson) {
    hideAdminPanel();
    updateNavbarForUser(null);
    updateMobileMenuAuth(null);
    return;
  }

  try {
    const data = await api('/auth/verify');
    currentUser = data.user;
    localStorage.setItem('bazooka_user', JSON.stringify(currentUser));

    updateNavbarForUser(currentUser);
    updateMobileMenuAuth(currentUser);
    if (currentUser.role === 'admin') {
      showAdminPanel();
      await refreshAdminPanel();
    } else {
      hideAdminPanel();
    }
  } catch (error) {
    localStorage.removeItem('bazooka_token');
    localStorage.removeItem('bazooka_user');
    currentUser = null;
    hideAdminPanel();
    updateNavbarForUser(null);
    updateMobileMenuAuth(null);
    showToast('Session expirée, veuillez vous reconnecter', 'error');
  }
}

async function login(email, password) {
  try {
    const data = await api('/auth/login', 'POST', { email, password });

    localStorage.setItem('bazooka_token', data.token);
    localStorage.setItem('bazooka_user', JSON.stringify(data.user));
    currentUser = data.user;

    updateNavbarForUser(currentUser);
    updateMobileMenuAuth(currentUser);
    if (currentUser.role === 'admin') {
      showAdminPanel();
      await refreshAdminPanel();
    } else {
      hideAdminPanel();
    }
    closeAuthModal();
    showToast('Connexion réussie !', 'success');

    return true;
  } catch (error) {
    showToast(error.message || 'Erreur de connexion', 'error');
    return false;
  }
}

async function register(email, password, confirmPassword) {
  try {
    if (password.length < 8) {
      showToast('Mot de passe doit contenir au moins 8 caractères', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return false;
    }

    const data = await api('/auth/register', 'POST', { email, password });

    localStorage.setItem('bazooka_token', data.token);
    localStorage.setItem('bazooka_user', JSON.stringify(data.user));
    currentUser = data.user;

    updateNavbarForUser(currentUser);
    updateMobileMenuAuth(currentUser);
    hideAdminPanel();
    closeAuthModal();
    showToast('Compte créé avec succès !', 'success');

    return true;
  } catch (error) {
    showToast(error.message || 'Erreur d\'inscription', 'error');
    return false;
  }
}

function logout() {
  localStorage.removeItem('bazooka_token');
  localStorage.removeItem('bazooka_user');
  currentUser = null;
  hideAdminPanel();
  updateNavbarForUser(null);
  updateMobileMenuAuth(null);
  closeAuthModal();
  showToast('Déconnecté', 'info');
  }

// ============ UI UPDATES ============

// Show/hide admin panel section (on index.html only)
function showAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.remove('hidden');
}

function hideAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.add('hidden');
}

// Update navbar for authenticated user (avatar, buttons) – safe checks
function updateNavbarForUser(user) {
  const authBtn = document.getElementById('auth-btn');
  const avatarLink = document.getElementById('user-avatar-link');
  const logoutBtn = document.getElementById('logout-btn');
  const badge = document.getElementById('admin-badge');
  const avatarImg = document.getElementById('navbar-avatar');

  if (user) {
    if (authBtn) {
      authBtn.classList.add('hidden');
      authBtn.textContent = ''; // clear
      authBtn.onclick = null;
    }
    if (avatarLink) avatarLink.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (badge) {
      if (user.role === 'admin') badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }
    if (avatarImg) {
      avatarImg.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (authBtn) {
      authBtn.classList.remove('hidden');
      authBtn.textContent = 'Connexion';
      authBtn.onclick = showAuthModal;
    }
    if (avatarLink) avatarLink.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
  }
}

// Update mobile menu auth section – safe checks
function updateMobileMenuAuth(user) {
  const guestSection = document.getElementById('mobile-auth-guest');
  const authSection = document.getElementById('mobile-auth-authenticated');
  const mobileAvatar = document.getElementById('mobile-navbar-avatar');

  if (user) {
    if (guestSection) guestSection.classList.add('hidden');
    if (authSection) authSection.classList.remove('hidden');
    if (mobileAvatar) {
      mobileAvatar.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (guestSection) guestSection.classList.remove('hidden');
    if (authSection) authSection.classList.add('hidden');
  }
}

// ============ UI UPDATES ============

// Show/hide admin panel section (on index.html only)
function showAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.remove('hidden');
}

function hideAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.add('hidden');
}

// Update navbar for authenticated user (avatar, buttons) – safe checks
function updateNavbarForUser(user) {
  const authBtn = document.getElementById('auth-btn');
  const avatarLink = document.getElementById('user-avatar-link');
  const logoutBtn = document.getElementById('logout-btn');
  const badge = document.getElementById('admin-badge');
  const avatarImg = document.getElementById('navbar-avatar');

  if (user) {
    if (authBtn) authBtn.classList.add('hidden');
    if (avatarLink) avatarLink.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (badge) {
      badge.classList.remove('hidden');
      if (user.role !== 'admin') badge.classList.add('hidden');
    }
    if (avatarImg) {
      avatarImg.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (authBtn) {
      authBtn.classList.remove('hidden');
      authBtn.textContent = 'Connexion';
      authBtn.onclick = showAuthModal;
    }
    if (avatarLink) avatarLink.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
  }
}

// Update mobile menu auth section – safe checks
function updateMobileMenuAuth(user) {
  const guestSection = document.getElementById('mobile-auth-guest');
  const authSection = document.getElementById('mobile-auth-authenticated');
  const mobileAvatar = document.getElementById('mobile-navbar-avatar');

  if (user) {
    if (guestSection) guestSection.classList.add('hidden');
    if (authSection) authSection.classList.remove('hidden');
    if (mobileAvatar) {
      mobileAvatar.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (guestSection) guestSection.classList.remove('hidden');
    if (authSection) authSection.classList.add('hidden');
  }
}

// ============ UI UPDATES ============

// Show/hide admin panel section (on index.html only)
function showAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.remove('hidden');
}

function hideAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.add('hidden');
}

// Update navbar for authenticated user (avatar, buttons) – safe checks
function updateNavbarForUser(user) {
  const authBtn = document.getElementById('auth-btn');
  const avatarLink = document.getElementById('user-avatar-link');
  const logoutBtn = document.getElementById('logout-btn');
  const badge = document.getElementById('admin-badge');
  const avatarImg = document.getElementById('navbar-avatar');

  if (user) {
    if (authBtn) authBtn.classList.add('hidden');
    if (avatarLink) avatarLink.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (badge) {
      if (user.role === 'admin') badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }
    if (avatarImg) {
      avatarImg.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (authBtn) {
      authBtn.classList.remove('hidden');
      authBtn.textContent = 'Connexion';
      authBtn.onclick = showAuthModal;
    }
    if (avatarLink) avatarLink.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
  }
}

// Update mobile menu auth section – safe checks
function updateMobileMenuAuth(user) {
  const guestSection = document.getElementById('mobile-auth-guest');
  const authSection = document.getElementById('mobile-auth-authenticated');
  const mobileAvatar = document.getElementById('mobile-navbar-avatar');

  if (user) {
    if (guestSection) guestSection.classList.add('hidden');
    if (authSection) authSection.classList.remove('hidden');
    if (mobileAvatar) {
      mobileAvatar.src = user.avatar || getDefaultAvatar(user.email);
    }
  } else {
    if (guestSection) guestSection.classList.remove('hidden');
    if (authSection) authSection.classList.add('hidden');
  }
}

function getDefaultAvatar(email) {
  const name = email.split('@')[0];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff0a0a&color=fff&size=200`;
}

// ============ PRODUCTS ============
async function loadProducts() {
  try {
    const products = await api('/products');
    allProducts = products;
    renderProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
    showToast('Impossible de charger les produits', 'error');
    allProducts = [];
    renderProducts([]);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return; // Not on index.html

  grid.innerHTML = '';

  if (products.length === 0) {
    const emptyState = document.getElementById('empty-products');
    if (emptyState) emptyState.classList.remove('hidden');
    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = '0';
    return;
  }

  const emptyState = document.getElementById('empty-products');
  if (emptyState) emptyState.classList.add('hidden');
  const countEl = document.getElementById('products-count');
  if (countEl) countEl.textContent = products.length;

  products.forEach((product, index) => {
    const card = createProductCard(product);
    grid.appendChild(card);

    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });

  if (window.lucide) window.lucide.createIcons();
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'masonry-item product-card glass rounded-2xl overflow-hidden cursor-pointer';
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';

  // Image handling
  let imageHtml;
  if (product.images && product.images.length > 0) {
    const imgUrl = product.images[0].startsWith('http')
      ? product.images[0]
      : `${CONFIG.API_URL.replace('/api', '')}${product.images[0]}`;
    imageHtml = `<img src="${imgUrl}" alt="${escapeHtml(product.name)}" class="w-full h-64 object-cover product-image transition-transform duration-500" loading="lazy" onclick="openLightbox('${imgUrl}')">`;
  } else {
    imageHtml = `
      <div class="w-full h-64 bg-gradient-to-br from-bazooka-gray to-bazooka-black flex items-center justify-center">
        <i data-lucide="image" class="h-16 w-16 text-gray-600"></i>
      </div>`;
  }

  card.innerHTML = `
    <div class="relative group">
      ${imageHtml}
      <div class="absolute inset-0 bg-gradient-to-t from-bazooka-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div class="absolute top-4 right-4">
        <span class="px-3 py-1 bg-bazooka-black/80 backdrop-blur text-bazooka-red text-xs font-bold rounded-full uppercase">${product.category}</span>
      </div>
      <div class="absolute bottom-4 left-4 right-4">
        <p class="text-3xl font-black text-white">${formatPrice(product.price)}€</p>
      </div>
    </div>
    <div class="p-6">
      <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">${escapeHtml(product.brand || 'Marque')}</p>
      <h3 class="text-lg font-bold text-white line-clamp-2 mb-4 h-14">${escapeHtml(product.name)}</h3>
      <div class="flex justify-between items-center">
        <span class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'} font-semibold">
          ${product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
        </span>
        <div class="flex gap-2">
          <button onclick="addToCart('${product.id}')"
                  class="p-2 bg-bazooka-red hover:bg-bazooka-red-dark rounded-lg transition-all hover:scale-110"
                  ${product.stock === 0 ? 'disabled' : ''}
                  title="Ajouter au panier">
            <i data-lucide="shopping-cart" class="h-4 w-4 text-white"></i>
          </button>
          ${product.ebay_url ? `
            <a href="${escapeHtml(product.ebay_url)}"
               target="_blank"
               rel="noopener noreferrer"
               class="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all hover:scale-110"
               title="Acheter sur eBay">
              <i data-lucide="external-link" class="h-4 w-4 text-white"></i>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  return card;
}

// ============ ADMIN PANEL ============
async function refreshAdminPanel() {
  if (!currentUser || currentUser.role !== 'admin') return;

  // Check if admin panel exists in DOM (dashboard.html only)
  const adminPanel = document.getElementById('admin-panel');
  if (!adminPanel) return;

  try {
    // Load products
    await loadAdminProducts();

    // Load users
    await loadUsers();

    // Update stats
    updateAdminStats();

    // Set last update time
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
      lastUpdateEl.textContent = `Mis à jour: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Initialize admin switches
    initAdminSwitches();

    // Animate admin panel entrance
    animateAdminPanel();

  } catch (error) {
    console.error('Admin panel refresh error:', error);
  }
}

async function loadAdminProducts() {
  try {
    const products = await api('/products');
    renderAdminProductsList(products);
    return products;
  } catch (error) {
    console.error('Failed to load admin products:', error);
    showToast('Erreur chargement produits admin', 'error');
    return [];
  }
}

function renderAdminProductsList(products) {
  const container = document.getElementById('admin-products-list');
  if (!container) return;

  container.innerHTML = '';

  // Show only last 5 products
  const recentProducts = products.slice(0, 5);

  if (recentProducts.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center py-8">Aucun produit. Commencez par en ajouter !</p>';
    return;
  }

  recentProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'glass rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-bazooka-red/30 transition-colors';

    const imgSrc = (product.images && product.images.length > 0)
      ? `${CONFIG.API_URL.replace('/api', '')}${product.images[0]}`
      : 'https://via.placeholder.com/150?text=No+Image';

    card.innerHTML = `
      <img src="${imgSrc}" alt="${escapeHtml(product.name)}" class="w-full md:w-32 h-32 object-cover rounded-lg">
      <div class="flex-1">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h5 class="font-bold text-white line-clamp-1">${escapeHtml(product.name)}</h5>
            <p class="text-sm text-gray-400">${escapeHtml(product.brand || 'N/A')} • ${product.category}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-bazooka-red">${formatPrice(product.price)}€</p>
            <p class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}">
              Stock: ${product.stock}
            </p>
          </div>
        </div>
        ${product.ebay_url ? `<a href="${escapeHtml(product.ebay_url)}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-400 hover:underline block mb-2">🔗 Voir sur eBay</a>` : ''}
        <div class="flex gap-2 mt-2">
          <button onclick="editProduct('${product.id}')" class="px-3 py-1 bg-bazooka-gray hover:bg-bazooka-red/20 rounded text-sm font-semibold transition-colors">
            <i data-lucide="edit-3" class="h-4 w-4 inline mr-1"></i>Modifier
          </button>
          <button onclick="deleteProduct('${product.id}')" class="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm font-semibold transition-colors">
            <i data-lucide="trash-2" class="h-4 w-4 inline"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  // Update badge count
  const badge = document.getElementById('product-count-badge');
  if (badge) badge.textContent = products.length;

  // Re-init icons
  if (window.lucide) window.lucide.createIcons();
}

async function loadUsers() {
  try {
    const users = await api('/users');
    allUsers = users;
    renderUsersTable(users);
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

// ============ ADMIN SWITCHES ============
function initAdminSwitches() {
  // Check if switches exist (dashboard.html only)
  const switches = document.querySelectorAll('.switch input[type="checkbox"]');
  if (switches.length === 0) return;

  switches.forEach(toggle => {
    const savedState = localStorage.getItem('admin_' + toggle.id);
    if (savedState !== null) {
      toggle.checked = savedState === 'true';
    }

    toggle.addEventListener('change', function() {
      const switchEl = this.parentElement;

      if (this.checked) {
        gsap.to(switchEl.querySelector('.slider'), {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
        showToast('Paramètre activé', 'success');
      } else {
        gsap.to(switchEl.querySelector('.slider'), {
          scale: 0.9,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
        showToast('Paramètre désactivé', 'info');
      }

      localStorage.setItem('admin_' + this.id, this.checked);
      console.log(`Switch ${this.id} changed to: ${this.checked}`);
    });
  });
}

function animateAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (!panel || panel.classList.contains('hidden')) return;

  // Animate panel entrance
  gsap.fromTo(panel, 
    { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    { 
      opacity: 1, 
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power3.out',
      clearProps: 'transform'
    }
  );

  // Stagger animation for child elements
  gsap.fromTo(panel.querySelectorAll('.glass, .btn, .switch'), 
    { 
      opacity: 0, 
      y: 20 
    },
    { 
      opacity: 1, 
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.2,
      ease: 'power2.out'
    }
  );

  // Animate stat cards with bounce
  gsap.fromTo(panel.querySelectorAll('.grid > div'), 
    { 
      scale: 0.8, 
      opacity: 0 
    },
    { 
      scale: 1, 
      opacity: 1,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.3,
      ease: 'back.out(1.7)'
    }
  );
}

// ============ ADMIN STATS ============
function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-bazooka-red/10 hover:bg-bazooka-red/5 transition-colors';

    const avatarUrl = user.avatar || getDefaultAvatar(user.email);
    const roleBadge = user.role === 'admin'
      ? '<span class="px-2 py-1 bg-bazooka-red/20 text-bazooka-red text-xs font-bold rounded border border-bazooka-red/30">ADMIN</span>'
      : '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded border border-blue-500/30">USER</span>';

    const joinedDate = new Date(user.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    tr.innerHTML = `
      <td class="px-6 py-4">
        <img src="${avatarUrl}" alt="${escapeHtml(user.email)}" class="w-10 h-10 rounded-full object-cover border-2 border-bazooka-red/30">
      </td>
      <td class="px-6 py-4 text-white font-medium">${escapeHtml(user.email)}</td>
      <td class="px-6 py-4">${roleBadge}</td>
      <td class="px-6 py-4 text-gray-400 text-sm">${joinedDate}</td>
    `;

    tbody.appendChild(tr);
  });
}

function updateAdminStats(products = allProducts) {
  const totalProducts = products.length;
  const totalUsers = allUsers.length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.stock)), 0);

  const statProducts = document.getElementById('stat-products');
  const statUsers = document.getElementById('stat-users');
  const statValue = document.getElementById('stat-value');
  if (statProducts) statProducts.textContent = totalProducts;
  if (statUsers) statUsers.textContent = totalUsers;
  if (statValue) statValue.textContent = formatPrice(totalValue) + '€';
  }
}

// Image upload for product creation
document.getElementById('prod-images-input').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showToast('Upload des images en cours...', 'info');

  try {
    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);

      const result = await fetch(`${CONFIG.API_URL}/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('bazooka_token')}` },
        body: formData
      });

      const data = await result.json();
      if (result.ok) {
        uploadedUrls.push(data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
  }
}

function removeProductImage(index) {
  uploadedProductImages.splice(index, 1);
  renderProductImagePreviews();
}

async function deleteProduct(id) {
  if (!confirm('Supprimer définitivement ce produit ?')) return;

  try {
    await api(`/products/${id}`, 'DELETE');
    showToast('Produit supprimé', 'success');
    await refreshAdminPanel();
    await loadProducts();
  } catch (error) {
    showToast('Erreur: ' + error.message, 'error');
  }
}

function editProduct(id) {
  openEditModal(id);
}

// ============ CART ============
function addToCart(productId) {
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  localStorage.setItem('bazooka_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Ajouté au panier !', 'success');
}
    cart.push({ productId, quantity: 1 });
  }
  localStorage.setItem('bazooka_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Ajouté au panier !', 'success');
}
});

function renderProductImagePreviews() {
  const container = document.getElementById('image-previews');
  container.innerHTML = '';

  uploadedProductImages.forEach((url, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group';
    const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_URL.replace('/api', '')}${url}`;

    wrapper.innerHTML = `
      <img src="${fullUrl}" alt="Preview ${index + 1}" class="w-full h-24 object-cover rounded-lg border border-bazooka-red/20">
      <button type="button" onclick="removeProductImage(${index})"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <i data-lucide="x" class="h-3 w-3"></i>
      </button>
    `;
    container.appendChild(wrapper);
  });

  if (window.lucide) window.lucide.createIcons();
}

function removeProductImage(index) {
  uploadedProductImages.splice(index, 1);
  renderProductImagePreviews();
}

function resetProductForm() {
  const form = document.getElementById('admin-product-form');
  if (form) form.reset();
  uploadedProductImages = [];
  renderProductImagePreviews();
}

function renderProductImagePreviews() {
  const container = document.getElementById('image-previews');
  if (!container) return;

  container.innerHTML = '';

  uploadedProductImages.forEach((url, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group';
    const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_URL.replace('/api', '')}${url}`;

    wrapper.innerHTML = `
      <img src="${fullUrl}" alt="Preview ${index + 1}" class="w-full h-24 object-cover rounded-lg border border-bazooka-red/20">
      <button type="button" onclick="removeProductImage(${index})"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <i data-lucide="x" class="h-3 w-3"></i>
      </button>
    `;
    container.appendChild(wrapper);
  });

  if (window.lucide) window.lucide.createIcons();
}

function removeProductImage(index) {
  uploadedProductImages.splice(index, 1);
  renderProductImagePreviews();
}
    cart.push({ productId, quantity: 1 });
  }

  localStorage.setItem('bazooka_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Ajouté au panier !', 'success');
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  countEl.textContent = count;
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('translate-x-full');
  if (!sidebar.classList.contains('translate-x-full')) {
    renderCartItems();
  }
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalDisplay = document.getElementById('cart-total-display');
  if (!container || !totalDisplay) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <i data-lucide="shopping-cart" class="h-12 w-12 mx-auto mb-3 text-gray-600"></i>
        <p class="text-gray-400">Votre panier est vide</p>
      </div>`;
    totalDisplay.textContent = '0.00 €';
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const product = allProducts.find(p => p.id === item.productId);
    if (!product) return;

    total += parseFloat(product.price) * item.quantity;

    const div = document.createElement('div');
    div.className = 'glass rounded-xl p-4 flex gap-4';

    const imgSrc = (product.images && product.images.length > 0)
      ? `${CONFIG.API_URL.replace('/api', '')}${product.images[0]}`
      : 'https://via.placeholder.com/60?text=No+Image';

    div.innerHTML = `
      <div class="w-16 h-16 bg-bazooka-gray rounded-lg overflow-hidden flex-shrink-0">
        <img src="${imgSrc}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover">
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-sm line-clamp-1">${escapeHtml(product.name)}</h4>
        <p class="text-bazooka-red font-bold">${formatPrice(product.price)}€</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateCartQty('${product.id}', -1)" class="w-7 h-7 bg-bazooka-gray rounded flex items-center justify-center hover:bg-bazooka-red/20 transition-colors">
            <i data-lucide="minus" class="h-3 w-3"></i>
          </button>
          <span class="w-8 text-center text-sm font-bold">${item.quantity}</span>
          <button onclick="updateCartQty('${product.id}', 1)" class="w-7 h-7 bg-bazooka-gray rounded flex items-center justify-center hover:bg-bazooka-red/20 transition-colors">
            <i data-lucide="plus" class="h-3 w-3"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  if (window.lucide) window.lucide.createIcons();
  totalDisplay.textContent = formatPrice(total) + ' €';
}

function updateCartQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.productId !== productId);
  }

  localStorage.setItem('bazooka_cart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function checkout() {
  if (cart.length === 0) {
    showToast('Panier vide', 'error');
    return;
  }

  // For now, alert. Could be enhanced to open eBay with all items
  alert('Redirection vers eBay pour finaliser la commande (simulation)');
}

// ============ AVATAR UPLOAD ============
async function uploadAvatar() {
  // Called from dashboard.html via onchange on #avatar-input
  const fileInput = document.getElementById('avatar-input');
  if (!fileInput) return;
  const file = fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Veuillez sélectionner une image', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const result = await fetch(`${CONFIG.API_URL}/upload/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bazooka_token')}` },
      body: formData
    });

    const data = await result.json();
    if (result.ok) {
      currentUser.avatar = data.url;
      localStorage.setItem('bazooka_user', JSON.stringify(currentUser));
      // Update navbar avatar if present
      const navbarAvatar = document.getElementById('navbar-avatar');
      if (navbarAvatar) navbarAvatar.src = data.url;
      const mobileAvatar = document.getElementById('mobile-navbar-avatar');
      if (mobileAvatar) mobileAvatar.src = data.url;
      // Update profile page avatar
      const profileLarge = document.getElementById('profile-avatar-large');
      if (profileLarge) profileLarge.src = data.url;
      showToast('Avatar mis à jour !', 'success');
      fileInput.value = '';
    } else {
      showToast(data.error || 'Erreur upload', 'error');
    }
  } catch (error) {
    showToast('Erreur réseau', 'error');
  }
}

// ============ PRODUCT EDITING ============
async function openEditModal(productId) {
  editingProductId = productId;
  try {
    const product = await api(`/products/${productId}`);
    // Populate fields
    document.getElementById('edit-prod-name').value = product.name || '';
    document.getElementById('edit-prod-price').value = product.price || '';
    document.getElementById('edit-prod-stock').value = product.stock || 0;
    document.getElementById('edit-prod-category').value = product.category || 'moto';
    document.getElementById('edit-prod-brand').value = product.brand || '';
    document.getElementById('edit-prod-model').value = product.model || '';
    document.getElementById('edit-prod-year').value = product.year || '';
    document.getElementById('edit-prod-ebay').value = product.ebay_url || '';
    document.getElementById('edit-prod-desc').value = product.description || '';
    
    // Initialize images for editing
    originalProductImages = product.images || [];
    uploadedEditImages = [];
    renderEditImagePreviews();
    
    // Show modal
    const modal = document.getElementById('edit-product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } catch (error) {
    showToast('Erreur chargement produit', 'error');
  }
}

function closeEditModal() {
  const modal = document.getElementById('edit-product-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  editingProductId = null;
  originalProductImages = [];
  uploadedEditImages = [];
  const form = document.getElementById('edit-product-form');
  if (form) form.reset();
  const previews = document.getElementById('edit-image-previews');
  if (previews) previews.innerHTML = '';
}

async function editProduct(productId) {
  await openEditModal(productId);
}

// Image handling for editing
function handleEditImageUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  showToast('Upload des images en cours...', 'info');
  handleEditImageUploadFiles(files);
}

async function handleEditImageUploadFiles(files) {
  try {
    const uploadedUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      const result = await fetch(`${CONFIG.API_URL}/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('bazooka_token')}` },
        body: formData
      });
      const data = await result.json();
      if (result.ok) {
        uploadedUrls.push(data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    }
    uploadedEditImages = [...uploadedEditImages, ...uploadedUrls];
    renderEditImagePreviews();
    showToast(`${uploadedUrls.length} image(s) ajoutée(s)`, 'success');
  } catch (error) {
    console.error('Upload error:', error);
    showToast('Erreur upload: ' + error.message, 'error');
  }
}

function renderEditImagePreviews() {
  const container = document.getElementById('edit-image-previews');
  if (!container) return;
  container.innerHTML = '';

  originalProductImages.forEach((url, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group';
    const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_URL.replace('/api', '')}${url}`;
    wrapper.innerHTML = `
      <img src="${fullUrl}" alt="Original ${idx+1}" class="w-full h-24 object-cover rounded-lg border border-bazooka-red/20 opacity-75">
      <span class="absolute bottom-0 left-0 px-1 text-xs bg-black/70 text-white">Original</span>
    `;
    container.appendChild(wrapper);
  });

  uploadedEditImages.forEach((url, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group';
    const fullUrl = url.startsWith('http') ? url : `${CONFIG.API_URL.replace('/api', '')}${url}`;
    wrapper.innerHTML = `
      <img src="${fullUrl}" alt="Nouvelle ${index+1}" class="w-full h-24 object-cover rounded-lg border border-green-500/30">
      <button type="button" onclick="removeEditProductImage(${index})"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <i data-lucide="x" class="h-3 w-3"></i>
      </button>
    `;
    container.appendChild(wrapper);
  });

  if (window.lucide) window.lucide.createIcons();
}

function removeEditProductImage(index) {
  uploadedEditImages.splice(index, 1);
  renderEditImagePreviews();
}

// ============ FILTERS ============
function setupEventListeners() {
  // Search input with debounce – only on index.html
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });

    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);

    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
  }

  // Auth forms – modal (index.html) or inline? Actually modal in both
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      await login(email, password);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      await register(email, password, confirm);
    });
  }

  // Admin product creation form – only present on dashboard.html for admins
  const adminProductForm = document.getElementById('admin-product-form');
  if (adminProductForm) {
    adminProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById('prod-name').value.trim(),
        description: document.getElementById('prod-desc').value.trim(),
        category: document.getElementById('prod-category').value,
        price: parseFloat(document.getElementById('prod-price').value),
        stock: parseInt(document.getElementById('prod-stock').value),
        brand: document.getElementById('prod-brand').value.trim(),
        model: document.getElementById('prod-model').value.trim(),
        year: parseInt(document.getElementById('prod-year').value) || new Date().getFullYear(),
        ebay_url: document.getElementById('prod-ebay').value.trim(),
        images: uploadedProductImages,
      };

      if (!formData.name || !formData.price || formData.price <= 0) {
        showToast('Veuillez remplir le nom et un prix valide', 'error');
        return;
      }
      if (formData.stock < 0) {
        showToast('Le stock ne peut être négatif', 'error');
        return;
      }

      try {
        await api('/products', 'POST', formData);
        showToast('Produit créé avec succès !', 'success');
        resetProductForm();
        await refreshAdminPanel();
        await loadProducts();
      } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
      }
    });
  }

  // Admin product image upload
  const prodImagesInput = document.getElementById('prod-images-input');
  if (prodImagesInput) {
    prodImagesInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      showToast('Upload des images en cours...', 'info');

      try {
        const uploadedUrls = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append('image', file);

          const result = await fetch(`${CONFIG.API_URL}/upload/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('bazooka_token')}` },
            body: formData
          });

          const data = await result.json();
          if (result.ok) {
            uploadedUrls.push(data.url);
          } else {
            throw new Error(data.error || 'Upload failed');
          }
        }

        uploadedProductImages = [...uploadedProductImages, ...uploadedUrls];
        renderProductImagePreviews();
        showToast(`${uploadedUrls.length} image(s) uploadée(s)`, 'success');
      } catch (error) {
        console.error('Upload error:', error);
        showToast('Erreur lors de l\'upload: ' + error.message, 'error');
      }
    });
  }

  // Edit product form (modal) – exists on dashboard.html
  const editProductForm = document.getElementById('edit-product-form');
  if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!editingProductId) return;

      const formData = {
        name: document.getElementById('edit-prod-name').value.trim(),
        description: document.getElementById('edit-prod-desc').value.trim(),
        category: document.getElementById('edit-prod-category').value,
        price: parseFloat(document.getElementById('edit-prod-price').value),
        stock: parseInt(document.getElementById('edit-prod-stock').value),
        brand: document.getElementById('edit-prod-brand').value.trim(),
        model: document.getElementById('edit-prod-model').value.trim(),
        year: parseInt(document.getElementById('edit-prod-year').value) || null,
        ebay_url: document.getElementById('edit-prod-ebay').value.trim(),
        images: [...originalProductImages, ...uploadedEditImages],
      };

      if (!formData.name || !formData.price || formData.price <= 0) {
        showToast('Nom et prix valide requis', 'error');
        return;
      }
      if (formData.stock < 0) {
        showToast('Le stock ne peut être négatif', 'error');
        return;
      }

      try {
        await api(`/products/${editingProductId}`, 'PUT', formData);
        showToast('Produit mis à jour !', 'success');
        closeEditModal();
        await refreshAdminPanel();
        await loadProducts();
      } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
      }
    });
  }

  // Edit product image upload
  const editImagesInput = document.getElementById('edit-prod-images-input');
  if (editImagesInput) {
    editImagesInput.addEventListener('change', (e) => {
      handleEditImageUpload(e);
    });
  }

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeLightbox();
      closeEditModal();
    }
  });
}

  // Auth forms – present on both pages (modal in index, inline in dashboard? Actually modal in both)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      await login(email, password);
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      await register(email, password, confirm);
    });
  }

  // Admin product form – only on dashboard.html (admin)
  const adminProductForm = document.getElementById('admin-product-form');
  if (adminProductForm) {
    adminProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // ... existing handler code (already defined elsewhere, keep as is)
    });
  }

  // Edit product form – modal exists on dashboard.html
  const editProductForm = document.getElementById('edit-product-form');
  if (editProductForm) {
    editProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!editingProductId) return;

      const formData = {
        name: document.getElementById('edit-prod-name').value.trim(),
        description: document.getElementById('edit-prod-desc').value.trim(),
        category: document.getElementById('edit-prod-category').value,
        price: parseFloat(document.getElementById('edit-prod-price').value),
        stock: parseInt(document.getElementById('edit-prod-stock').value),
        brand: document.getElementById('edit-prod-brand').value.trim(),
        model: document.getElementById('edit-prod-model').value.trim(),
        year: parseInt(document.getElementById('edit-prod-year').value) || null,
        ebay_url: document.getElementById('edit-prod-ebay').value.trim(),
        images: [...originalProductImages, ...uploadedEditImages],
      };

      if (!formData.name || !formData.price || formData.price <= 0) {
        showToast('Nom et prix valide requis', 'error');
        return;
      }
      if (formData.stock < 0) {
        showToast('Le stock ne peut être négatif', 'error');
        return;
      }

      try {
        await api(`/products/${editingProductId}`, 'PUT', formData);
        showToast('Produit mis à jour !', 'success');
        closeEditModal();
        await refreshAdminPanel();
        await loadProducts();
      } catch (error) {
        showToast('Erreur: ' + error.message, 'error');
      }
    });
  }

  // Edit product image upload
  const editImagesInput = document.getElementById('edit-prod-images-input');
  if (editImagesInput) {
    editImagesInput.addEventListener('change', (e) => {
      handleEditImageUpload(e);
    });
  }

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAuthModal();
      closeLightbox();
      closeEditModal();
    }
  });
}

     if (formData.stock < 0) {
       showToast('Le stock ne peut être négatif', 'error');
       return;
     }

     try {
       await api(`/products/${editingProductId}`, 'PUT', formData);
       showToast('Produit mis à jour !', 'success');
       closeEditModal();
       await refreshAdminPanel();
       await loadProducts();
     } catch (error) {
       showToast('Erreur: ' + error.message, 'error');
     }
   });

   // Edit product image upload
   document.getElementById('edit-prod-images-input').addEventListener('change', (e) => {
     handleEditImageUpload(e);
   });

   // Close modals on Escape
   document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       closeAuthModal();
       closeLightbox();
       closeEditModal();
     }
   });
}

function applyFilters() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-filter').value;
  const sort = document.getElementById('sort-filter').value;

  let filtered = [...allProducts];

  // Search
  if (searchTerm) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm)) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }

  // Category
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  // Sort
  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case 'price-desc':
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  renderProducts(filtered);
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('sort-filter').value = 'newest';
  renderProducts(allProducts);
}

// ============ MODALS ============
function showAuthModal() {
  if (currentUser) {
    window.location.href = 'dashboard.html';
    return;
  }
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function switchToRegister() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('register-container').classList.remove('hidden');
}

function switchToLogin() {
  document.getElementById('register-container').classList.add('hidden');
  document.getElementById('login-container').classList.remove('hidden');
}

function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox || !img) return;
  img.src = imageSrc;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-bazooka-red'
  }[type] || 'bg-gray-600';

  toast.className = `toast ${bgColor} px-6 py-4 rounded-lg shadow-lg font-semibold`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ UTILITIES ============
function formatPrice(price) {
  return parseFloat(price).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleSearch() {
  const searchBar = document.getElementById('search-bar');
  if (!searchBar) return;
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    const input = document.getElementById('global-search-input');
    if (input) input.focus();
  }
}

function handleGlobalSearch() {
  // Same as filters but for global search bar
  applyFilters();
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  menu.classList.toggle('hidden');
}

// ============ ANIMATIONS ============
function initAnimations() {
  // Simple entrance animations – no ScrollTrigger to avoid disappearing
  gsap.from('.font-display', {
    duration: 1.2,
    y: 100,
    opacity: 0,
    ease: 'power4.out',
    delay: 0.5
  });

  gsap.from('.glass', {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.8
  });
}

// ============ INITIALIZATION ============
// Make functions globally available
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchToRegister = switchToRegister;
window.switchToLogin = switchToLogin;
window.toggleCart = toggleCart;
window.toggleSearch = toggleSearch;
window.toggleMobileMenu = toggleMobileMenu;
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.checkout = checkout;
window.resetFilters = resetFilters;
 window.openLightbox = openLightbox;
 window.closeLightbox = closeLightbox;
 window.uploadAvatar = uploadAvatar;
 window.deleteProduct = deleteProduct;
 window.editProduct = editProduct;
 window.openEditModal = openEditModal;
 window.closeEditModal = closeEditModal;
 window.removeEditProductImage = removeEditProductImage;
 window.resetProductForm = resetProductForm;
 window.removeProductImage = removeProductImage;
 window.showToast = showToast;
 window.logout = logout;
