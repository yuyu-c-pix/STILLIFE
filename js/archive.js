/* ─────────────────────────────────────────
   js/archive.js  —  Still Life
   zoom 방식: 레이아웃 크기가 실제로 줄어들어
   브라우저가 스크롤을 자연스럽게 처리
───────────────────────────────────────── */

(function () {
  'use strict';

  const wrapper = document.getElementById('page-wrapper');

  function scaleLayout() {
    const scale = window.innerWidth / 1920;
    wrapper.style.zoom = scale;
  }

  scaleLayout();
  window.addEventListener('resize', scaleLayout);

})();