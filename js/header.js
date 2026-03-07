const SYMBOL_COLORS = ['#FFB040','#53C948','#468DFF','#5BE0EF','#FF437D','#F3F4F8'];

const menuBtn     = document.getElementById('menu-btn');
const navBar      = document.getElementById('nav-bar');
const symbolWrap  = document.getElementById('symbol-wrap');
const symbolSvg   = document.getElementById('symbol-svg');
const cartBtn     = document.getElementById('cart-btn');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose   = document.getElementById('cart-close-btn');
const cartList    = document.getElementById('cart-items-list');

let menuOpen = false;
let cartOpen = false;

function setSymbolColor(color) {
  symbolSvg.querySelectorAll('path, circle').forEach(el => {
    const f = el.getAttribute('fill');
    if (f && f !== 'none' && f !== 'white') el.setAttribute('fill', color);
    const s = el.getAttribute('stroke');
    if (s && s !== 'none') el.setAttribute('stroke', color);
  });
}

function closeMenu() {
  menuOpen = false;
  navBar.classList.remove('open');
  symbolWrap.classList.remove('menu-open');
  setSymbolColor('black');
}

function closeCart() {
  cartOpen = false;
  cartOverlay.classList.remove('open');
}

menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (cartOpen) closeCart();
  menuOpen = !menuOpen;
  navBar.classList.toggle('open', menuOpen);
  symbolWrap.classList.toggle('menu-open', menuOpen);
  if (menuOpen) {
    const color = SYMBOL_COLORS[Math.floor(Math.random() * SYMBOL_COLORS.length)];
    setSymbolColor(color);
  } else {
    setSymbolColor('black');
  }
});

cartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (menuOpen) closeMenu();
  cartOpen = !cartOpen;
  cartOverlay.classList.toggle('open', cartOpen);
});

cartClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeCart();
});

document.addEventListener('click', (e) => {
  if (menuOpen && !navBar.contains(e.target) && e.target !== menuBtn) closeMenu();
  if (cartOpen && !cartOverlay.contains(e.target) && e.target !== cartBtn) closeCart();
});

navBar.addEventListener('click', (e) => e.stopPropagation());
cartOverlay.addEventListener('click', (e) => e.stopPropagation());

// ── 카트 렌더링 ──
function getCartItems() {
  try {
    const stored = localStorage.getItem('cart');
    if (stored) return JSON.parse(stored);
    return [];
  } catch { return []; }
}

function renderCart() {
  const items = getCartItems();
  cartList.innerHTML = '';

  if (items.length === 0) {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'cart-empty-block';
    emptyBlock.innerHTML = '<span class="cart-empty-text">Your Cart Is Empty</span>';
    cartList.appendChild(emptyBlock);
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'cart-item';

    const img = document.createElement('img');
    img.className = 'cart-item-img';
    img.src = item.image || '';
    img.alt = item.name;
    img.onerror = () => { img.style.display = 'none'; };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'cart-item-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = getCartItems();
      const updated = current.filter(i => i.name !== item.name);
      localStorage.setItem('cart', JSON.stringify(updated));
      renderCart();
    });

    const textWrap = document.createElement('div');
    textWrap.className = 'cart-item-text';

    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = item.name;

    const metaGroup = document.createElement('div');
    metaGroup.className = 'cart-item-meta-group';

    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-meta';
    priceEl.textContent = `Price: ${item.price || '—'}`;

    const qtyEl = document.createElement('div');
    qtyEl.className = 'cart-item-meta';
    qtyEl.textContent = `Quantity: ${item.quantity}`;

    metaGroup.appendChild(priceEl);
    metaGroup.appendChild(qtyEl);
    textWrap.appendChild(nameEl);
    textWrap.appendChild(metaGroup);
    card.appendChild(img);
    card.appendChild(deleteBtn);
    card.appendChild(textWrap);
    cartList.appendChild(card);
  });
}

window.addEventListener('storage', renderCart);
window.addEventListener('cart:updated', renderCart);

renderCart();

window.addToCart = function(name, price, image) {
  const items = getCartItems();
  const existing = items.find(i => i.name === name);
  if (existing) { existing.quantity += 1; }
  else { items.push({ name, price: price || '—', quantity: 1, image: image || '' }); }
  localStorage.setItem('cart', JSON.stringify(items));
  renderCart();
};

window.openCart = function() {
  cartOpen = true;
  cartOverlay.classList.add('open');
};

symbolWrap.addEventListener('click', (e) => {
  if (!menuOpen) {
    window.location.href = 'home.html';
  }
});