// ============ BAZOOKA PREMIUM - MAIN APP ============
// Site: BAZOOKA Moto & Scooter
// Contact: magaudouxlucas08@icloud.com

const API_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:3001/api'
  : window.location.origin + '/api'; // Auto-detect

let currentUser = null;
let products = [];
let cart = [];
let allUsers = []; // For admin

// ============ INIT ============
document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  lucide.createIcons();
});

async function initApp() {
  // Check auth
  const token = localStorage.getItem('bazooka_token');
  const userJson = localStorage.getItem('bazooka_user');
  if (token && userJson) {
    currentUser = JSON.parse(userJson);
    showUserDashboard();
    updateAuthButton();
  }

  // Load cart
  const savedCart = localStorage.getItem('bazooka_cart');
  if (savedCart) cart = JSON.parse(savedCart);
  updateCartCount();

  // Load products
  await loadProducts();

  // Init filters
  initFilters();

  // GSAP animations
  initAnimations();
}

// ============ API ============
async function api(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('bazooka_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, opts);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Erreur API');
  return data;
}

// ============ PRODUCTS ============
async function loadProducts() {
  try {
    products = await api('/products');
    renderProducts(products);
  } catch (err) {
    console.error('Failed to load products:', err);
    // Show empty state
    document.getElementById('products-grid').innerHTML = '';
    document.getElementById('no-products').classList.remove('hidden');
  }
}

function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  if (list.length === 0) {
    document.getElementById('no-products').classList.remove('hidden');
    return;
  }

  document.getElementById('no-products').classList.add('hidden');

  list.forEach((product, i) => {
    const item = document.createElement('div');
    item.className = 'masonry-item product-card glass rounded-2xl overflow-hidden cursor-pointer';
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';

    const imgHtml = product.images?.length > 0
      ? `<img src="${API_URL.replace('/api', '')}${product.images[0]}" alt="${product.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">`
      : `<div class="w-full h-64 bg-gradient-to-br from-bazooka-gray to-bazooka-black flex items-center justify-center"><i data-lucide="shopping-bag" class="h-16 w-16 text-gray-600"></i></div>`;

    item.innerHTML = `
      <div class="relative group">
        ${imgHtml}
        <div class="absolute top-4 right-4">
          <span class="px-3 py-1 bg-bazooka-black/80 backdrop-blur text-bazooka-red text-xs font-bold rounded-full uppercase">${product.category}</span>
        </div>
        <div class="absolute bottom-4 left-4 right-4">
          <p class="text-3xl font-black text-white">${product.price.toFixed(2)}€</p>
        </div>
      </div>
      <div class="p-6">
        <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">${product.brand || 'Marque'}</p>
        <h3 class="text-lg font-bold text-white line-clamp-2 mb-4 h-14">${product.name}</h3>
        <div class="flex justify-between items-center">
          <span class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'} font-semibold">
            ${product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
          </span>
          <div class="flex gap-2">
            <button onclick="addToCart('${product.id}')" class="p-2 bg-bazooka-red hover:bg-bazooka-red-dark rounded-lg transition-colors" ${product.stock === 0 ? 'disabled' : ''}>
              <i data-lucide="shopping-cart" class="h-4 w-4 text-white"></i>
            </button>
            ${product.ebay_url ? `<a href="${product.ebay_url}" target="_blank" class="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"><i data-lucide="external-link" class="h-4 w-4 text-white"></i></a>` : ''}
          </div>
        </div>
      </div>
    `;

    grid.appendChild(item);

    setTimeout(() => {
      item.style.transition = 'all 0.6s ease-out';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, i * 50);
  });

  lucide.createIcons();
}

// ============ AUTH ============
async function login(email, password) {
  try {
    const data = await api('/auth/login', 'POST', { email, password });
    localStorage.setItem('bazooka_token', data.token);
    localStorage.setItem('bazooka_user', JSON.stringify(data.user));
    currentUser = data.user;
    showUserDashboard();
    updateAuthButton();
    closeAuthModal();
    showNotification('Connecté avec succès !');
    return true;
  } catch (err) {
    alert('Erreur: ' + err.message);
    return false;
  }
}

async function register(email, password) {
  try {
    if (password.length < 8) {
      alert('Mot de passe minimum 8 caractères');
      return false;
    }
    const data = await api('/auth/register', 'POST', { email, password });
    localStorage.setItem('bazooka_token', data.token);
    localStorage.setItem('bazooka_user', JSON.stringify(data.user));
    currentUser = data.user;
    showUserDashboard();
    updateAuthButton();
    closeAuthModal();
    showNotification('Compte créé !');
    return true;
  } catch (err) {
    alert('Erreur: ' + err.message);
    return false;
  }
}

function logout() {
  localStorage.removeItem('bazooka_token');
  localStorage.removeItem('bazooka_user');
  currentUser = null;
  hideUserDashboard();
  updateAuthButton();
  closeAuthModal();
  showNotification('Déconnecté');
}

function updateAuthButton() {
  const btn = document.getElementById('auth-btn');
  if (currentUser) {
    btn.textContent = currentUser.email.split('@')[0];
    btn.onclick = () => {
      // Scroll to dashboard
      document.getElementById('user-dashboard').scrollIntoView({ behavior: 'smooth' });
    };
    document.getElementById('admin-indicator').classList.toggle('hidden', currentUser.role !== 'admin');
  } else {
    btn.textContent = 'Connexion';
    btn.onclick = showAuthModal;
    document.getElementById('admin-indicator').classList.add('hidden');
  }
}

function showUserDashboard() {
  const dashboard = document.getElementById('user-dashboard');
  dashboard.classList.remove('hidden');

  // Fill user info
  document.getElementById('user-email').textContent = currentUser.email;
  document.getElementById('user-role').textContent = currentUser.role === 'admin' ? 'ADMINISTRATEUR' : 'MEMBRE';
  document.getElementById('user-role').className = currentUser.role === 'admin'
    ? 'px-3 py-1 bg-bazooka-red/20 text-bazooka-red text-xs font-bold rounded-full border border-bazooka-red/30 animate-pulse'
    : 'px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30';

  // Avatar
  const avatar = currentUser.avatar || 'https://ui-avatars.com/api/?name=User&background=ff0a0a&color=fff';
  document.getElementById('user-avatar-img').src = avatar;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('profile-date').textContent = new Date(currentUser.created_at).toLocaleDateString('fr-FR');
  document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'ADMINISTRATEUR' : 'MEMBRE';
  document.getElementById('profile-role').className = currentUser.role === 'admin'
    ? 'text-bazooka-red font-bold uppercase'
    : 'text-blue-400 font-bold uppercase';

  // Show/hide admin panel
  if (currentUser.role === 'admin') {
    document.getElementById('admin-panel').classList.remove('hidden');
    loadAdminPanel();
  } else {
    document.getElementById('admin-panel').classList.add('hidden');
  }
}

function hideUserDashboard() {
  document.getElementById('user-dashboard').classList.add('hidden');
}

// ============ ADMIN ============
async function loadAdminPanel() {
  try {
    // Load products
    const allProducts = await api('/products');
    renderAdminProducts(allProducts);
    updateAdminStats(allProducts);

    // Load users (admin only)
    const users = await api('/users');
    allUsers = users;
    renderUsersTable(users);
  } catch (err) {
    console.error('Admin panel error:', err);
  }
}

function renderAdminProducts(list) {
  const container = document.getElementById('admin-products-list');
  container.innerHTML = '';

  list.forEach(product => {
    const card = document.createElement('div');
    card.className = 'glass rounded-xl p-4 flex flex-col md:flex-row gap-4';

    const img = product.images?.[0]
      ? `<img src="${API_URL.replace('/api', '')}${product.images[0]}" class="w-full md:w-32 h-32 object-cover rounded-lg">`
      : `<div class="w-full md:w-32 h-32 bg-bazooka-gray rounded-lg flex items-center justify-center"><i data-lucide="image" class="h-8 w-8 text-gray-600"></i></div>`;

    card.innerHTML = `
      ${img}
      <div class="flex-1">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h5 class="font-bold text-white line-clamp-1">${product.name}</h5>
            <p class="text-sm text-gray-400">${product.brand || 'N/A'} • ${product.category}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-bazooka-red">${product.price.toFixed(2)}€</p>
            <p class="text-sm ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}">Stock: ${product.stock}</p>
          </div>
        </div>
        ${product.ebay_url ? `<a href="${product.ebay_url}" target="_blank" class="text-xs text-blue-400 hover:underline mb-2 block">🔗 Voir sur eBay</a>` : ''}
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

  lucide.createIcons();
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '';

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-bazooka-red/10 hover:bg-bazooka-red/5 transition-colors';

    const avatar = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`;
    const roleBadge = user.role === 'admin'
      ? '<span class="px-2 py-1 bg-bazooka-red/20 text-bazooka-red text-xs font-bold rounded border border-bazooka-red/30">ADMIN</span>'
      : '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded border border-blue-500/30">USER</span>';

    tr.innerHTML = `
      <td class="px-6 py-4">
        <img src="${avatar}" alt="" class="w-10 h-10 rounded-full object-cover border-2 border-bazooka-red/30">
      </td>
      <td class="px-6 py-4 text-white font-medium">${user.email}</td>
      <td class="px-6 py-4">${roleBadge}</td>
      <td class="px-6 py-4 text-gray-400 text-sm">${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
    `;

    tbody.appendChild(tr);
  });
}

function updateAdminStats(products = []) {
  const totalProducts = products.length;
  const totalUsers = allUsers.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  document.getElementById('admin-total-products').textContent = totalProducts;
  document.getElementById('admin-total-users').textContent = totalUsers;
  document.getElementById('admin-total-value').textContent = totalValue.toLocaleString('fr-FR') + '€';
}

// ============ PRODUCT CRUD ============
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('prod-name').value,
    description: document.getElementById('prod-desc').value,
    category: document.getElementById('prod-category').value,
    price: parseFloat(document.getElementById('prod-price').value),
    stock: parseInt(document.getElementById('prod-stock').value),
    brand: document.getElementById('prod-brand').value,
    model: document.getElementById('prod-model').value,
    ebay_url: document.getElementById('prod-ebay').value,
    images: [],
  };

  try {
    await api('/products', 'POST', formData);
    showNotification('Produit créé avec succès !');
    resetProductForm();
    await loadAdminPanel();
    await loadProducts();
  } catch (err) {
    alert('Erreur: ' + err.message);
  }
});

async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  try {
    await api(`/products/${id}`, 'DELETE');
    showNotification('Produit supprimé');
    await loadAdminPanel();
    await loadProducts();
  } catch (err) {
    alert('Erreur: ' + err.message);
  }
}

function editProduct(id) {
  // For simplicity, just alert for now. Full edit would need a modal.
  alert('Fonctionnalité édition à venir. Supprimez et recréez le produit.');
}

function resetProductForm() {
  document.getElementById('add-product-form').reset();
}

// ============ PRODUCT IMAGE UPLOAD (Future) ============
// Will be implemented with product creation modal

// ============ AVATAR ============
function triggerAvatarUpload() {
  document.getElementById('avatar-input').click();
}

async function uploadAvatar() {
  const file = document.getElementById('avatar-input').files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const res = await fetch(`${API_URL}/upload/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('bazooka_token')}` },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      // Update user avatar
      currentUser.avatar = data.url;
      localStorage.setItem('bazooka_user', JSON.stringify(currentUser));
      document.getElementById('user-avatar-img').src = API_URL.replace('/api', '') + data.url;
      showNotification('Avatar mis à jour !');
    } else {
      alert('Erreur upload: ' + data.error);
    }
  } catch (err) {
    alert('Erreur réseau');
  }
}

// ============ CART ============
function addToCart(productId) {
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  localStorage.setItem('bazooka_cart', JSON.stringify(cart));
  updateCartCount();
  showNotification('Ajouté au panier !');
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  sidebar.classList.toggle('translate-x-full');
  if (!sidebar.classList.contains('translate-x-full')) {
    renderCartItems();
  }
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<div class="text-center py-12 text-gray-400"><i data-lucide="shopping-cart" class="h-12 w-12 mx-auto mb-3 opacity-50"></i><p>Panier vide</p></div>';
    document.getElementById('cart-total').textContent = '0€';
    lucide.createIcons();
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;
    total += product.price * item.quantity;

    const div = document.createElement('div');
    div.className = 'glass rounded-xl p-4 flex gap-4';
    div.innerHTML = `
      <div class="w-16 h-16 bg-bazooka-gray rounded-lg overflow-hidden flex-shrink-0">
        ${product.images?.[0]
          ? `<img src="${API_URL.replace('/api', '')}${product.images[0]}" class="w-full h-full object-cover">`
          : `<div class="w-full h-full flex items-center justify-center"><i data-lucide="package" class="h-6 w-6 text-gray-600"></i></div>`
        }
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-sm line-clamp-1">${product.name}</h4>
        <p class="text-bazooka-red font-bold">${product.price.toFixed(2)}€</p>
        <div class="flex items-center gap-2 mt-2">
          <button onclick="updateCartQty('${product.id}', -1)" class="w-7 h-7 bg-bazooka-gray rounded flex items-center justify-center hover:bg-bazooka-red/20">
            <i data-lucide="minus" class="h-3 w-3"></i>
          </button>
          <span class="w-8 text-center text-sm font-bold">${item.quantity}</span>
          <button onclick="updateCartQty('${product.id}', 1)" class="w-7 h-7 bg-bazooka-gray rounded flex items-center justify-center hover:bg-bazooka-red/20">
            <i data-lucide="plus" class="h-3 w-3"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  lucide.createIcons();
  document.getElementById('cart-total').textContent = total.toFixed(2) + '€';
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
    alert('Panier vide');
    return;
  }
  // Redirect to eBay with cart? Or just alert
  alert('Redirection vers eBay pour paiement (simulé)');
  // In real app, you'd sum up all eBay URLs or send order
}

// ============ FILTERS ============
function initFilters() {
  const search = document.getElementById('search');
  const cat = document.getElementById('category-filter');
  const sort = document.getElementById('sort');

  const apply = () => {
    let filtered = [...products];
    const term = search.value.toLowerCase();

    if (term) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      );
    }

    if (cat.value !== 'all') {
      filtered = filtered.filter(p => p.category === cat.value);
    }

    switch (sort.value) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      default: filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    renderProducts(filtered);
  };

  search.addEventListener('input', apply);
  cat.addEventListener('change', apply);
  sort.addEventListener('change', apply);
}

function resetFilters() {
  document.getElementById('search').value = '';
  document.getElementById('category-filter').value = 'all';
  document.getElementById('sort').value = 'newest';
  renderProducts(products);
}

// ============ MODALS ============
function showAuthModal() {
  if (currentUser) {
    document.getElementById('user-dashboard').scrollIntoView({ behavior: 'smooth' });
  } else {
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
  }
}

function closeAuthModal() {
  const m = document.getElementById('auth-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function switchToRegister() {
  document.getElementById('login-form-container').classList.add('hidden');
  document.getElementById('register-form-container').classList.remove('hidden');
}

function switchToLogin() {
  document.getElementById('register-form-container').classList.add('hidden');
  document.getElementById('login-form-container').classList.remove('hidden');
}

// ============ UI HELPERS ============
function scrollToProducts() {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

function toggleSearch() {
  // Simple implementation: focus on search input
  document.getElementById('search').focus();
}

function showNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-8 right-8 bg-bazooka-red text-white px-6 py-3 rounded-lg shadow-bazooka z-50 font-bold animate-slide-up';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function initAnimations() {
  // GSAP could be added here if needed
}

// ============ FORM SUBMISSIONS ============
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  await login(email, password);
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (password !== confirm) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }
  await register(email, password);
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAuthModal();
});
