/* ─────────────────────────────────────────
   js/shop.js  —  Still Life
───────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Zoom scaling ── */
  const wrapper = document.getElementById('page-wrapper');
  function scaleLayout() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    wrapper.style.zoom = scale;
  }
  scaleLayout();
  window.addEventListener('resize', scaleLayout);

  /* ── Add To Cart 클릭 ── */
  document.querySelectorAll('.shop-item').forEach(function (item) {
    item.querySelector('.overlay-inner').addEventListener('click', function (e) {
      e.stopPropagation();
      const name  = item.dataset.name;
      const price = item.dataset.price;
      const img   = item.dataset.img;

      // header.js의 window.addToCart 사용 (localStorage + 렌더링 포함)
      if (typeof window.addToCart === 'function') {
        window.addToCart(name, price, img);
      }

      // 기존 코드 아래에 추가
        const label = item.querySelector('.add-to-cart');
        label.textContent = 'Added!';
        label.classList.add('added');
        setTimeout(() => {
        label.textContent = 'Add To Cart';
        label.classList.remove('added');
        }, 1200);

        item.classList.add('pop');
        setTimeout(() => { item.classList.remove('pop'); }, 150);

      // 카트 오버레이 열기 — 모바일/데스크탑 분기
      if (window.innerWidth <= 768) {
        if (typeof window.openMobileCart === 'function') window.openMobileCart();
      } else {
        if (typeof window.openCart === 'function') window.openCart();
      }
    });
  });

})();