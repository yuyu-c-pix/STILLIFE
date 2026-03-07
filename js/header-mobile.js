/* ─────────────────────────────────────────
   js/header-mobile.js  —  Still Life Mobile
   CSS @media가 표시/숨김을 담당
───────────────────────────────────────── */
(function () {
  'use strict';

  /* ── 경로 깊이 감지: home.html(루트) vs 하위폴더 ── */
  const isSubFolder = window.location.pathname.split('/').filter(Boolean).length > 1;
  const base = isSubFolder ? '../' : '';

  /* ── DOM 주입 ── */
  // 모바일 헤더
  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'mobile-header';
  mobileHeader.innerHTML = `
    <div class="logo-block" id="m-logo">
      <img src="${base}assets/images/header/symbol_black.png" alt="logo" class="logo-icon">
      <img src="${base}assets/images/home/wordtype.svg" alt="STILLLIFE" class="logo-text">
    </div>
    <div class="mobile-header-buttons">
      <button class="mobile-header-btn" id="m-menu-btn">Menu</button>
      <button class="mobile-header-btn" id="m-cart-btn">Cart</button>
    </div>
  `;
  document.body.prepend(mobileHeader);

  // 메뉴 오버레이
  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'mobile-menu-overlay';
  menuOverlay.innerHTML = `
    <button class="mobile-menu-close" id="m-menu-close">✕</button>
    <div class="mobile-menu-box">
      <a class="mobile-menu-item" href="${base}about/index.html">About</a>
      <a class="mobile-menu-item" href="${base}archive/index.html">Archive</a>
      <a class="mobile-menu-item" href="${base}shop/index.html">Shop</a>
      <a class="mobile-menu-item" href="${base}interactive/index.html">What You Still</a>
    </div>
  `;
  document.body.appendChild(menuOverlay);

  // 카트 오버레이
  const cartOverlay = document.createElement('div');
  cartOverlay.className = 'mobile-cart-overlay';
  cartOverlay.innerHTML = `
    <button class="mobile-cart-close" id="m-cart-close">✕</button>
    <div class="mobile-cart-box">
      <div class="mobile-cart-title">Cart</div>
      <div class="mobile-cart-list" id="m-cart-list"></div>
      <button class="mobile-checkout-btn" id="m-checkout-btn">Check Out</button>
    </div>
  `;
  document.body.appendChild(cartOverlay);

  /* ── 요소 참조 ── */
  const menuBtn    = document.getElementById('m-menu-btn');
  const cartBtn    = document.getElementById('m-cart-btn');
  const menuClose  = document.getElementById('m-menu-close');
  const cartClose  = document.getElementById('m-cart-close');
  const cartList   = document.getElementById('m-cart-list');
  const checkoutBtn = document.getElementById('m-checkout-btn');
  const logoBlock  = document.getElementById('m-logo');

  /* ── 로고 클릭 → home ── */
  logoBlock.addEventListener('click', () => {
    window.location.href = `${base}home.html`;
  });

  /* ── 메뉴 열기/닫기 ── */
  function openMenu() {
    menuOverlay.classList.add('open');
    menuBtn.classList.add('active');
  }
  function closeMenu() {
    menuOverlay.classList.remove('open');
    menuBtn.classList.remove('active');
  }

  menuBtn.addEventListener('click', () => {
    if (cartOverlay.classList.contains('open')) closeCart();
    menuOverlay.classList.contains('open') ? closeMenu() : openMenu();
  });
  menuClose.addEventListener('click', closeMenu);

  /* 메뉴 아이템 터치 색상 변경 */
  document.querySelectorAll('.mobile-menu-item').forEach(item => {
    item.addEventListener('touchstart', () => item.classList.add('pressed'));
    item.addEventListener('touchend',   () => setTimeout(() => item.classList.remove('pressed'), 300));
  });

  /* ── 카트 열기/닫기 ── */
  function openCart() {
    renderMobileCart();
    cartOverlay.classList.add('open');
    cartBtn.classList.add('active');
  }
  function closeCart() {
    cartOverlay.classList.remove('open');
    cartBtn.classList.remove('active');
  }

  cartBtn.addEventListener('click', () => {
    if (menuOverlay.classList.contains('open')) closeMenu();
    cartOverlay.classList.contains('open') ? closeCart() : openCart();
  });
  cartClose.addEventListener('click', closeCart);

  /* ── Check Out 버튼 ── */
  checkoutBtn.addEventListener('click', () => {
    checkoutBtn.classList.toggle('checked');
  });

  /* ── 카트 렌더링 ── */
  function getMobileCartItems() {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  }

  function renderMobileCart() {
    const items = getMobileCartItems();
    cartList.innerHTML = '';

    if (items.length === 0) {
      cartList.innerHTML = `
        <div class="mobile-cart-empty">
          <span class="mobile-cart-empty-text">Your Cart Is Empty</span>
        </div>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mobile-cart-item';

      const img = document.createElement('img');
      img.className = 'mobile-cart-item-img';
      img.src = item.image || '';
      img.alt = item.name;
      img.onerror = () => { img.style.display = 'none'; };

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'mobile-cart-item-delete';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        const updated = getMobileCartItems().filter(i => i.name !== item.name);
        localStorage.setItem('cart', JSON.stringify(updated));
        renderMobileCart();
      });

      const info = document.createElement('div');
      info.className = 'mobile-cart-item-info';
      info.innerHTML = `
        <div class="mobile-cart-item-name">${item.name}</div>
        <div class="mobile-cart-item-meta-group">
          <div class="mobile-cart-item-meta">Price: ${item.price || '—'}</div>
          <div class="mobile-cart-item-meta">Quantity: ${item.quantity}</div>
        </div>
      `;

      card.appendChild(img);
      card.appendChild(deleteBtn);
      card.appendChild(info);
      cartList.appendChild(card);
    });
  }

  /* cart:updated 이벤트 수신 */
  window.addEventListener('cart:updated', renderMobileCart);

  /* openCart 전역 노출 */
  window.openMobileCart = openCart;

})();