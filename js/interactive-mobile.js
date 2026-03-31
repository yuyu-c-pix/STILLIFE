/* ─────────────────────────────────────────
   js/interactive-mobile.js  —  Still Life
───────────────────────────────────────── */
(function () {
  'use strict';

  /* ── 모바일 여부 체크 ── */
  if (window.innerWidth > 768) return;

  const wrap        = document.querySelector('.int-mobile-wrap');
  const placeholder = document.querySelector('.int-mobile-placeholder');
  const inputEl     = document.querySelector('.int-mobile-input');
  const inputWrap   = document.querySelector('.int-mobile-input-wrap');

  if (!wrap || !inputEl) return;

  /* ══════════════════════════════════════════
     Color combos (CSS 클래스 기반)
  ══════════════════════════════════════════ */
  const COLORS = ['color-blue', 'color-green', 'color-orange', 'color-pink', 'color-white'];
  const SIZES  = ['size-lg', 'size-sm'];
  let colorIdx = 0;
  let sizeToggle = false;

  function rand(min, max) { return Math.floor(Math.random() * (max - min) + min); }

  /* ══════════════════════════════════════════
     Input 활성화 / 비활성화
  ══════════════════════════════════════════ */
  function activateInput() {
    if (placeholder) placeholder.classList.add('hidden');
    inputEl.classList.add('active');
    inputEl.focus();
  }

  function deactivateInput() {
    if (placeholder) placeholder.classList.remove('hidden');
    inputEl.classList.remove('active');
    inputEl.value = '';
  }

  /* placeholder / inputWrap 탭 시 input 활성화 */
  if (inputWrap) {
    inputWrap.addEventListener('click', activateInput);
    inputWrap.addEventListener('touchend', function (e) {
      e.preventDefault();
      activateInput();
    });
  }

  /* ══════════════════════════════════════════
     타임스탬프 포맷
  ══════════════════════════════════════════ */
  function formatDateTime(d) {
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const yr = d.getFullYear();
    let hr    = d.getHours();
    const mn  = String(d.getMinutes()).padStart(2, '0');
    const sc  = String(d.getSeconds()).padStart(2, '0');
    const ap  = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${mo}/${da}/${yr}, ${String(hr).padStart(2, '0')}:${mn}:${sc} ${ap}`;
  }

  /* ══════════════════════════════════════════
     한글/영문 혼합 span 빌드
  ══════════════════════════════════════════ */
  function buildMixedHtml(text) {
    if (!text) return '';
    let html = '', i = 0, lastLang = 'en';
    while (i < text.length) {
      const ch = text[i];
      const c  = ch.charCodeAt(0);
      const isKr = (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0x1100 && c <= 0x11FF) || (c >= 0x3130 && c <= 0x318F);
      const isSymbol = !isKr && !/[a-zA-Z0-9]/.test(ch);
      const lang = isSymbol ? lastLang : (isKr ? 'kr' : 'en');
      if (!isSymbol) lastLang = lang;

      let j = i + 1;
      while (j < text.length) {
        const nc = text[j].charCodeAt(0);
        const nKr = (nc >= 0xAC00 && nc <= 0xD7A3) || (nc >= 0x1100 && nc <= 0x11FF) || (nc >= 0x3130 && nc <= 0x318F);
        const nSym = !nKr && !/[a-zA-Z0-9]/.test(text[j]);
        const nLang = nSym ? lang : (nKr ? 'kr' : 'en');
        if (nLang !== lang && !nSym) break;
        if (!nSym) lastLang = nLang;
        j++;
      }

      const chunk = text.slice(i, j).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += `<span class="t-${lang}">${chunk}</span>`;
      i = j;
    }
    return html;
  }

  /* ══════════════════════════════════════════
     카드 생성
  ══════════════════════════════════════════ */
  let zCounter = 10;

  function createCard(text) {
    const timestamp = formatDateTime(new Date());
    const fullText  = `${timestamp}, ${text}`;

    sizeToggle = !sizeToggle;
    const sizeClass  = sizeToggle ? 'size-lg' : 'size-sm';
    const colorClass = COLORS[colorIdx % COLORS.length];
    colorIdx++;

    /* 카드 위치: wrap 너비 기준 랜덤 배치 */
    const wrapW = wrap.offsetWidth || window.innerWidth;
    const cardW = Math.round(wrapW * 0.564);
    const maxX  = wrapW - cardW - 16;
    const x     = rand(8, Math.max(9, maxX));
    const y     = rand(40, 660);

    const card = document.createElement('div');
    card.className = `int-card-mobile ${sizeClass} ${colorClass}`;
    card.style.cssText = [
      `left: ${x}px`,
      `top: ${y}px`,
      `opacity: 0`,
      `transform: scale(0.85)`,
      `transition: opacity 0.3s ease, transform 0.3s ease`,
      `z-index: ${++zCounter}`,
    ].join(';');
    card.innerHTML = buildMixedHtml(fullText);
    wrap.appendChild(card);

    /* 등장 애니메이션 */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity   = '1';
      card.style.transform = 'scale(1)';
    }));

    makeDraggable(card);
  }

  /* ══════════════════════════════════════════
     Submit
  ══════════════════════════════════════════ */
  function submitInput() {
    const text = inputEl.value.trim();
    if (text) createCard(text);
    deactivateInput();
  }

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
    if (e.key === 'Escape') deactivateInput();
  });

  inputEl.addEventListener('blur', function () {
    /* 약간 딜레이 후 체크 — 버튼 탭 시 blur가 먼저 와도 submit 가능하게 */
    setTimeout(() => {
      if (!inputEl.value.trim()) deactivateInput();
    }, 150);
  });

  /* ══════════════════════════════════════════
     Touch Drag
  ══════════════════════════════════════════ */
  function makeDraggable(el) {
    let startX, startY, origL, origT;

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      origL  = parseFloat(el.style.left)  || 0;
      origT  = parseFloat(el.style.top)   || 0;
      el.style.zIndex = ++zCounter;
      el.classList.add('dragging');
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t  = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      el.style.left = (origL + dx) + 'px';
      el.style.top  = (origT + dy) + 'px';
    }, { passive: false });

    el.addEventListener('touchend', function () {
      el.classList.remove('dragging');
    });
  }

  /* 기존 카드에도 드래그 적용 */
  document.querySelectorAll('.int-card-mobile').forEach(makeDraggable);

})();