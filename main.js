// SELECTORES
const productsContainer = document.getElementById('productsContainer');
const cartContainer = document.getElementById('cartContainer');
const cartTotal = document.getElementById('cartTotal');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const loginModal = document.getElementById('loginModal');
const accountBtn = document.querySelector('.account-btn');
const closeLogin = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');

// VARIABLES
let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Fallback: muestra productos estáticos cuando la API no está disponible
const SAMPLE_PRODUCTS = [
  { id: 1, title: 'Auriculares inalámbricos premium', price: 99.99, category: 'electronics', image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg', description: 'Ejemplo auriculares' },
  { id: 2, title: 'Chaqueta moderna casual', price: 79.99, category: 'clothing', image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg', description: 'Ejemplo chaqueta' },
  { id: 3, title: 'Collar dorado elegante', price: 149.99, category: 'jewelry', image: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg', description: 'Ejemplo collar' }
];

// OBTENER PRODUCTOS
async function getProducts(){
  try{
    const res = await fetch('https://fakestoreapi.com/products');
    const data = await res.json();
    products = data;
    filteredProducts = data;
    renderProducts(products);
    renderCategories(products);
  }catch(e){
    console.warn('Error fetching products, usando fallback local', e);
    // Si la petición falla (p.ej. al abrir via file://), usar productos de muestra
    products = SAMPLE_PRODUCTS.slice();
    filteredProducts = products;
    renderProducts(products);
    renderCategories(products);
  }
}

// RENDER PRODUCTOS
function renderProducts(list){
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  list.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-title">${product.title}</h3>
        <p class="product-price">${product.price} €</p>
        <div class="card-actions">
          <button class="add-btn" data-id="${product.id}">Añadir</button>
          <button class="details-btn" data-id="${product.id}">Ver</button>
          <button class="fav-btn" data-id="${product.id}">${favorites.includes(product.id)?'❤️':'🤍'}</button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });
  updateFavoriteButtons();
}

// CATEGORIAS
function renderCategories(arr){
  if (!categoryFilter) return;
  categoryFilter.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'all';
  categoryFilter.appendChild(all);
  const cats = [...new Set(arr.map(p=>p.category))];
  cats.forEach(c=>{
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    categoryFilter.appendChild(o);
  });
}

// FILTROS
function filterProducts(){
  const q = (searchInput && searchInput.value) ? searchInput.value.toLowerCase() : '';
  const cat = (categoryFilter && categoryFilter.value) ? categoryFilter.value : 'all';
  const sort = (sortSelect && sortSelect.value) ? sortSelect.value : 'default';
  let res = products.slice();
  if (q) res = res.filter(p=>p.title.toLowerCase().includes(q));
  if (cat && cat !== 'all') res = res.filter(p=>p.category===cat);
  if (sort==='priceAsc') res.sort((a,b)=>a.price-b.price);
  if (sort==='priceDesc') res.sort((a,b)=>b.price-a.price);
  if (sort==='az') res.sort((a,b)=>a.title.localeCompare(b.title));
  if (sort==='za') res.sort((a,b)=>b.title.localeCompare(a.title));
  renderProducts(res);
}

// CARRITO
function buscarProducto(id){
  return products.find(p=>p.id===id);
}
function addToCart(id){
  const prod = buscarProducto(Number(id));
  if (!prod) return;
  const item = cart.find(i=>i.id===prod.id);
  if (item) item.quantity = (item.quantity||1)+1;
  else cart.push({...prod, quantity:1});
  saveCart();
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(i=>i.id!==id);
  saveCart();
  renderCart();
}
function renderCart(){
  if (!cartContainer) return;
  cartContainer.innerHTML = '';
  if (cart.length===0){
    cartContainer.innerHTML = '<p>El carrito está vacío</p>';
    if (cartTotal) cartTotal.textContent = '0€';
    return;
  }
  let total = 0;
  cart.forEach(item=>{
    total += (item.price||0)*(item.quantity||1);
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-price">${item.quantity} x ${item.price}€</p>
      </div>
      <button class="remove-btn" data-id="${item.id}">X</button>
    `;
    cartContainer.appendChild(div);
  });
  if (cartTotal) cartTotal.textContent = total.toFixed(2) + '€';
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCart(){
  const d = localStorage.getItem('cart');
  if (d) cart = JSON.parse(d);
  renderCart();
}

// FAVORITOS
function toggleFavorite(id){
  id = Number(id);
  const idx = favorites.indexOf(id);
  if (idx===-1) favorites.push(id);
  else favorites.splice(idx,1);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButtons();
}
function loadFavorites(){
  const d = localStorage.getItem('favorites');
  if (!d) return;
  try{ favorites = JSON.parse(d); }catch(e){ favorites = []; }
}

function updateFavoriteButtons(){
  document.querySelectorAll('.fav-btn').forEach(btn => {
    const id = Number(btn.getAttribute('data-id'));
    if (favorites.includes(id)){
      btn.textContent = '❤️';
      btn.classList.add('favorited');
    } else {
      btn.textContent = '🤍';
      btn.classList.remove('favorited');
    }
  });
}

// LOGIN Y SESION
async function handleLogin(e){
  e.preventDefault();
  if (!loginForm) return;
  const usuario = loginForm.username.value;
  const contrasena = loginForm.password.value;
  try{
    const res = await fetch('https://fakestoreapi.com/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:usuario,password:contrasena})});
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if (data && data.token){
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('username', usuario);
      // intentar obtener datos del usuario desde la API y guardarlos en sessionStorage
      try{
        const usersRes = await fetch('https://fakestoreapi.com/users');
        if (usersRes.ok){
          const usersArr = await usersRes.json();
          const found = usersArr.find(u=>u.username===usuario);
          if (found){
            sessionStorage.setItem('userId', found.id);
            const display = `${found.name.firstname||''} ${found.name.lastname||''}`.trim();
            sessionStorage.setItem('displayName', display || usuario);
            if (found.email) sessionStorage.setItem('email', found.email);
            try{ localStorage.setItem('profile_cache', JSON.stringify(found)); }catch(err){}
          }
        }
      }catch(e){ console.warn('No se pudo obtener user details', e); }
      if (loginModal) loginModal.classList.add('hidden');
      loginForm.reset();
      const redirect = sessionStorage.getItem('postLoginRedirect');
      if (redirect){
        sessionStorage.removeItem('postLoginRedirect');
        window.location.href = redirect;
      } else {
        window.location.href = 'index.html';
      }
    }
  }catch(e){
    sessionStorage.setItem('token','dev-token-mock');
    sessionStorage.setItem('username', loginForm.username.value || 'user');
    // también guardar displayName/email en fallback
    try{
      const uname = loginForm.username.value || 'user';
      sessionStorage.setItem('displayName', uname);
      sessionStorage.setItem('email', loginForm.email ? loginForm.email.value : '');
      // guardar cache simple de perfil para prefijar formulario
      const simple = { username: uname, email: loginForm.email ? loginForm.email.value : '', name: { firstname: uname, lastname: '' } };
      try{ localStorage.setItem('profile_cache', JSON.stringify(simple)); }catch(err){}
    }catch(err){}
    if (loginModal) loginModal.classList.add('hidden');
    loginForm.reset();
    const redirect = sessionStorage.getItem('postLoginRedirect');
    if (redirect){
      sessionStorage.removeItem('postLoginRedirect');
      window.location.href = redirect;
    } else {
      window.location.href = 'index.html';
    }
  }
}
function checkSession(){
  const token = sessionStorage.getItem('token');
  const username = sessionStorage.getItem('username');
  if (!token){ if (loginModal) loginModal.classList.remove('hidden'); }
  else { if (loginModal) loginModal.classList.add('hidden'); }
  // mostrar logo admin si el username es admin
  const logo = document.querySelector('.logo');
  const adminLink = document.getElementById('adminAccess');
  const adminBtn = document.getElementById('adminHeaderBtn');
  // mantener texto simple en boton de cuenta; perfil se gestiona en la página de perfil
  if (accountBtn){
    accountBtn.textContent = 'Mi cuenta';
  }
  // actualizar enlace de perfil en el header
  try{
    const profileLink = document.getElementById('profileLink');
    const displayName = sessionStorage.getItem('displayName') || username;
    if (profileLink){
      if (username){
        profileLink.textContent = displayName ? `Perfil: ${displayName}` : 'Perfil';
        profileLink.href = 'perfil_boiler.html';
        profileLink.addEventListener('click', ()=>{});
      } else {
        profileLink.textContent = 'Perfil';
        profileLink.href = 'perfil_boiler.html';
        profileLink.addEventListener('click', (e)=>{ e.preventDefault(); sessionStorage.setItem('postLoginRedirect','perfil_boiler.html'); if (loginModal) loginModal.classList.remove('hidden'); });
      }
    }
  }catch(e){}
  const allowed = ['admin','mors','mor2314','mor_2314','mor'];
  if (allowed.includes(username)){
    if (logo) logo.textContent = 'NovaShopAdmin';
    if (adminLink) adminLink.style.display = '';
    if (adminBtn) adminBtn.style.display = '';
  } else {
    if (logo) logo.innerHTML = 'Mini<span>Shop</span>';
    if (adminLink) adminLink.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'none';
  }
}
function logout(){
  sessionStorage.removeItem('token');
  if (loginModal) loginModal.classList.add('hidden');
}

// EVENTOS
if (searchInput) searchInput.addEventListener('input', filterProducts);
if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
if (sortSelect) sortSelect.addEventListener('change', filterProducts);
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (accountBtn) accountBtn.addEventListener('click', ()=>{ if (loginModal) loginModal.classList.remove('hidden'); });
if (closeLogin) closeLogin.addEventListener('click', ()=>{ if (loginModal) loginModal.classList.add('hidden'); if (loginForm) loginForm.reset(); });

// Dropdown (tres puntos) 
const dropdownBtn = document.querySelector('.dropdown .account-btn');
const dropdownContent = document.querySelector('.dropdown-content');
if (dropdownBtn){
  dropdownBtn.addEventListener('click', (ev)=>{
    ev.stopPropagation();
    if (dropdownContent) dropdownContent.classList.toggle('visible');
  });
  // close on outside click
  document.addEventListener('click', ()=>{ if (dropdownContent) dropdownContent.classList.remove('visible'); });
}
// alternativa: identificar el botón de "⋮" por su texto y asegurar toggle
try{
  const allBtns = Array.from(document.querySelectorAll('.account-btn'));
  const dotsBtn = allBtns.find(b=>b.textContent && b.textContent.trim()==='⋮');
  if (dotsBtn && !dropdownBtn){
    dotsBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); if (dropdownContent) dropdownContent.classList.toggle('visible'); });
  }
}catch(e){/* noop */}

// Menú de cuenta (avatar) — Perfil / Cerrar sesión
let accountMenuEl = null;
function createAccountMenu(){
  if (accountMenuEl) return accountMenuEl;
  const menu = document.createElement('div');
  menu.className = 'account-menu';
  menu.innerHTML = `
    <a href="perfil_boiler.html">Perfil</a>
    <button id="logoutBtn">Cerrar sesión</button>
  `;
  document.body.appendChild(menu);
  // logout listener
  menu.querySelector('#logoutBtn').addEventListener('click', ()=>{
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('postLoginRedirect');
    location.reload();
  });
  accountMenuEl = menu;
  return menu;
}

function toggleAccountMenu(button){
  const username = sessionStorage.getItem('username');
  if (!username) { if (loginModal) loginModal.classList.remove('hidden'); return; }
  const menu = createAccountMenu();
  if (menu.classList.contains('open')){
    menu.classList.remove('open'); menu.style.display='none';
    return;
  }
  // position menu under button
  const r = button.getBoundingClientRect();
  menu.style.left = (r.left) + 'px';
  menu.style.top = (r.bottom + 8) + 'px';
  menu.style.display = 'block';
  menu.classList.add('open');
}

// attach to account button
  try{
    const accountButtons = Array.from(document.querySelectorAll('.account-btn'));
    accountButtons.forEach(btn=>{
      btn.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        const username = sessionStorage.getItem('username');
        // permitir acceso al panel admin para admin, mors o mor2314
        if (username && (username === 'admin' || username === 'mors' || username === 'mor2314' || username === 'mor' || username === 'mor_2314')){
          window.location.href = 'adminboiler.html';
          return;
        }
        toggleAccountMenu(btn);
      });
    });
    // close account menu clicking outside
    document.addEventListener('click', ()=>{ if (accountMenuEl) { accountMenuEl.style.display='none'; accountMenuEl.classList.remove('open'); } });
  }catch(e){/* noop */}

// Finalizar compra desde el panel del carrito
const checkoutBtn = document.querySelector('.checkout-btn');
if (checkoutBtn) checkoutBtn.addEventListener('click', ()=> window.location.href = 'boiler_carrito.html');

document.addEventListener('click', (e)=>{
  const t = e.target;
  if (!t) return;
  if (t.matches && t.matches('.add-btn')){
    const id = t.getAttribute('data-id'); if (id) addToCart(Number(id));
  }
  if (t.matches && t.matches('.remove-btn')){
    const id = t.getAttribute('data-id'); if (id) removeFromCart(Number(id));
  }
  if (t.matches && t.matches('.fav-btn')){
    const id = t.getAttribute('data-id'); if (id) toggleFavorite(Number(id));
  }
  if (t.matches && t.matches('.details-btn')){
    const id = t.getAttribute('data-id');
    if (id) window.location.href = `detallerboiler.html?id=${id}`;
  }
});

// INICIALIZAR
function init(){
  getProducts();
  loadCart();
  loadFavorites();
  checkSession();
}
init();

// botones globales
const buyButton = document.getElementById('buyButton');
if (buyButton) buyButton.addEventListener('click', ()=> window.location.href = 'boiler_carrito.html');
const adminAccess = document.getElementById('adminAccess');
if (adminAccess) adminAccess.addEventListener('click', (e)=>{
  e.preventDefault();
  const username = sessionStorage.getItem('username');
  // permitir admin y usuarios autorizados (mors, mor2314)
  if (username === 'admin' || username === 'mors' || username === 'mor2314' || username === 'mor' || username === 'mor_2314'){
    window.location.href = 'adminboiler.html';
  } else {
    // pedir login antes de entrar al panel admin
    sessionStorage.setItem('postLoginRedirect','adminboiler.html');
    if (loginModal) loginModal.classList.remove('hidden');
  }
});

// header admin button (visible)
const adminHeaderBtn = document.getElementById('adminHeaderBtn');
if (adminHeaderBtn) adminHeaderBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  const username = sessionStorage.getItem('username');
  if (username === 'admin' || username === 'mors' || username === 'mor2314' || username === 'mor' || username === 'mor_2314'){
    window.location.href = 'adminboiler.html';
  } else {
    sessionStorage.setItem('postLoginRedirect','adminboiler.html');
    if (loginModal) loginModal.classList.remove('hidden');
  }
});



/*
OBJETIVO:
Simular login con FakeStoreAPI.

ENDPOINT:
https://fakestoreapi.com/auth/login

USUARIO TEST:
mor_2314
83r5^_ */
