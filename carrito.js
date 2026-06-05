fetch("https://fakestoreapi.com/products")
  .then(res => res.json())
  .then(data => {
    // console.log(data);
  })
  .catch(error => console.error("Error fetching products:", error))

// =========================
// SELECTORES (comprobados)
// =========================

const cartContainer = document.getElementById("cartContainer");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn") || document.querySelector('.checkout-btn') || document.querySelector('.buy-btn');
const buyBtn = document.getElementById("buyBtn") || document.querySelector('.buy-btn');
const successMessage = document.getElementById("successMessage");

// =========================
// VARIABLES
// =========================

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// =========================
// FUNCIONES CARRITO
// =========================

// Añade producto: puede recibir id (Number) o objeto producto
async function addToCart(idOrProduct){
  let product = null;

  if (!idOrProduct) return;

  if (typeof idOrProduct === 'number' || typeof idOrProduct === 'string'){
    // traer producto desde API por id
    try {
      const res = await fetch(`https://fakestoreapi.com/products/${idOrProduct}`);
      if (!res.ok) throw new Error('Producto no encontrado');
      product = await res.json();
    } catch (err) {
      console.error('No se pudo obtener el producto por id:', err);
      return;
    }
  } else if (typeof idOrProduct === 'object'){
    product = idOrProduct;
  }

  if (!product) return;

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId){
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function renderCart(){
  if (!cartContainer) return;

  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = '<p>El carrito está vacío</p>';
    updateCartTotal();
    return;
  }

  cart.forEach(item => {
    const cartItem = generateCartItem(item);
    cartContainer.appendChild(cartItem);
  });

  updateCartTotal();
}

function updateCartTotal(){
  if (!cartTotal) return;
  const total = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  cartTotal.textContent = total.toFixed(2) + '€';
}

function clearCart(){
  cart = [];
  saveCart();
  renderCart();
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart(){
  const cartData = localStorage.getItem('cart');
  if (cartData) {
    cart = JSON.parse(cartData);
  }
  renderCart();
}

function checkout(){
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }
  // Simular pago
  alert("Proceso de pago iniciado (simulado)");
  clearCart();
  if (successMessage) showSuccessMessage();
}

function validateCheckout(){
  if (cart.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }
  // Redirigir a página de checkout si existe
  if (window.location.pathname.includes('boiler_carrito') || window.location.pathname.includes('checkout')){
    checkout();
  } else {
    // Si estamos en otra página, ir a la página de checkout (ruta relativa)
    window.location.href = 'boiler_carrito.html';
  }
}

function showSuccessMessage(){
  if (!successMessage) return;
  successMessage.style.display = 'block';
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
}

function formatPrice(price){
  return (price || 0).toFixed(2) + '€';
}

function generateCartItem(item){
  const cartItem = document.createElement('div');
  cartItem.classList.add('cart-item');

  const info = document.createElement('div');
  info.classList.add('cart-item-info');

  const title = document.createElement('p');
  title.classList.add('cart-item-title');
  title.textContent = item.title || 'Sin título';

  const price = document.createElement('p');
  price.classList.add('cart-item-price');
  price.textContent = `${item.quantity || 1} x ${formatPrice(item.price)}`;

  info.appendChild(title);
  info.appendChild(price);

  const btn = document.createElement('button');
  btn.classList.add('remove-btn');
  btn.textContent = 'Eliminar';
  btn.addEventListener('click', () => removeFromCart(item.id));

  cartItem.appendChild(info);
  cartItem.appendChild(btn);

  return cartItem;
}

// =========================
// EVENTOS (añadir solo si existen los elementos)
// =========================

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', checkout);
}

if (buyBtn) {
  buyBtn.addEventListener('click', validateCheckout);
}

// Si hay botones dinámicos que usan data-id para añadir al carrito, podemos usar delegación
// Ejemplo: <button class="add-btn" data-id="1">Añadir</button>
// Delegación simple en todo el documento:

document.addEventListener('click', (e) => {
  const target = e.target;

  // botones con data-id
  if (target && target.matches && target.matches('.add-btn')){
    const id = target.getAttribute('data-id') || target.dataset.id;
    if (id) addToCart(Number(id));
    return;
  }

});

// =========================
// INIT
// =========================

loadCart();

// Nota: no añadimos listeners a elementos que no existen para evitar errores.

// =====================================
// Código admin / navegación (seguro y simple)
// =====================================

// Si existe un botón que debe llevar al admin, enlazarlo de forma segura.
const adminBtn = document.getElementById('addProductBtn');
if (adminBtn){
  adminBtn.addEventListener('click', () => {
    window.location.href = 'adminboiler.html';
  });
}
