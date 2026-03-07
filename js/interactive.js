/* ─────────────────────────────────────────
   js/interactive.js  —  Still Life
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

  /* ══════════════════════════════════════════
     Drag
  ══════════════════════════════════════════ */
  let zCounter = 100;
  let dragging = null, dragOffX = 0, dragOffY = 0;

  function makeDraggable(el) {
    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('#int-input-wrap')) return;
      dragging = el;
      const zoom = parseFloat(wrapper.style.zoom) || 1;
      const rect = el.getBoundingClientRect();
      dragOffX = (e.clientX - rect.left) / zoom;
      dragOffY = (e.clientY - rect.top)  / zoom;
      el.classList.add('dragging');
      el.style.zIndex = ++zCounter;
      e.preventDefault();
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const zoom = parseFloat(wrapper.style.zoom) || 1;
    const wRect = wrapper.getBoundingClientRect();
    dragging.style.left = ((e.clientX - wRect.left) / zoom - dragOffX) + 'px';
    dragging.style.top  = ((e.clientY - wRect.top)  / zoom - dragOffY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (dragging) { dragging.classList.remove('dragging'); dragging = null; }
  });

  document.querySelectorAll('.msg-card').forEach(makeDraggable);

  /* ══════════════════════════════════════════
     Input — type anywhere activates
  ══════════════════════════════════════════ */
  const inputWrap  = document.getElementById('int-input-wrap');
  const placeholder = document.getElementById('int-placeholder');
  const inputEl    = document.getElementById('int-input');

  function isKorean(ch) {
    const c = ch.charCodeAt(0);
    return (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0x1100 && c <= 0x11FF) || (c >= 0x3130 && c <= 0x318F);
  }

  function buildMixedHtml(text) {
    if (!text) return '';
    let html = '', i = 0;
    let lastLang = 'en';

    while (i < text.length) {
      const ch = text[i];
      const c = ch.charCodeAt(0);
      const isKr = (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0x1100 && c <= 0x11FF) || (c >= 0x3130 && c <= 0x318F);
      const isSymbol = !isKr && !/[a-zA-Z0-9]/.test(ch);

      const lang = isSymbol ? lastLang : (isKr ? 'kr' : 'en');
      if (!isSymbol) lastLang = lang;

      let j = i + 1;
      while (j < text.length) {
        const nc = text[j].charCodeAt(0);
        const nKr = (nc >= 0xAC00 && nc <= 0xD7A3) || (nc >= 0x1100 && nc <= 0x11FF) || (nc >= 0x3130 && nc <= 0x318F);
        const nSymbol = !nKr && !/[a-zA-Z0-9]/.test(text[j]);
        const nLang = nSymbol ? lang : (nKr ? 'kr' : 'en');
        if (nLang !== lang && !nSymbol) break;
        if (!nSymbol) lastLang = nLang;
        j++;
      }

      const chunk = text.slice(i, j).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html += `<span class="t-${lang}">${chunk}</span>`;
      i = j;
    }
    return html;
  }

  function setCaretToEnd(el) {
    const range = document.createRange();
    const sel   = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function activateInput(firstChar) {
    placeholder.classList.add('hidden');
    inputEl.classList.add('active');
    if (firstChar) {
      inputEl.textContent = firstChar;
      inputEl.innerHTML = buildMixedHtml(firstChar);
    }
    inputEl.focus();
    setCaretToEnd(inputEl);
  }

  function deactivateInput() {
    placeholder.classList.remove('hidden');
    inputEl.classList.remove('active');
    inputEl.innerHTML = '';
  }

  /* Click on Type Here area */
  inputWrap.addEventListener('click', () => activateInput());

  /* Type ANYWHERE on the page activates input */
  document.addEventListener('keydown', (e) => {
    if (e.target === inputEl) return;                  // already in input
    if (e.metaKey || e.ctrlKey || e.altKey) return;    // ignore shortcuts
    if (e.key === 'Enter') { if (inputEl.classList.contains('active')) submitInput(); return; }
    if (e.key === 'Escape') { if (inputEl.classList.contains('active')) deactivateInput(); return; }
    if (e.key.length === 1) {                          // printable character
      activateInput(e.key);
      e.preventDefault();
    }
  });

  /* Backspace from document */
  document.addEventListener('keydown', (e) => {
    if (e.target !== inputEl && !inputEl.classList.contains('active')) return;
  });

  inputEl.addEventListener('blur', () => {
    if (!inputEl.textContent.trim()) deactivateInput();
  });

  let isComposing = false;

  inputEl.addEventListener('compositionstart', () => {
    isComposing = true;
  });

  inputEl.addEventListener('compositionend', () => {
    isComposing = false;
    // 조합 완료 후 한 번만 재빌드
    const text = inputEl.textContent;
    inputEl.innerHTML = buildMixedHtml(text);
    setCaretToEnd(inputEl);
  });

  inputEl.addEventListener('input', () => {
    if (isComposing) return;  // 한글 조합 중에는 스킵
    const text = inputEl.textContent;
    inputEl.innerHTML = buildMixedHtml(text);
    setCaretToEnd(inputEl);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
    if (e.key === 'Escape') deactivateInput();
  });

  /* ══════════════════════════════════════════
     Card Creation
  ══════════════════════════════════════════ */
  const COLOR_COMBOS = [
    { bg: '#FFB040', text: '#53C948' },
    { bg: '#53C948', text: '#FF437D' },
    { bg: '#468DFF', text: '#FF437D' },
    { bg: '#5BE0EF', text: '#468DFF' },
    { bg: '#FF437D', text: '#FFB040' },
    { bg: '#F3F4F8', text: '#FF437D' },
  ];

  // Safe zones avoiding center area (591–1330, y 350–750) and symbol area (662–1258, y 242–837)
  const ZONES = [
    { x: [30,  480],  y: [90,  310] },
    { x: [550, 900],  y: [90,  310] },
    { x: [950, 1600], y: [90,  310] },
    { x: [30,  480],  y: [360, 750] },
    { x: [1380,1850], y: [360, 750] },
    { x: [30,  1850], y: [800, 880] },
  ];

  // 심볼 영역 (회전된 원 중심 960,540 반지름 ~300)
  const SYMBOL_CX = 960, SYMBOL_CY = 540, SYMBOL_R = 310;

  function inSymbolArea(x, y, w, h) {
    // 카드 중심이 심볼 원 안에 있는지 체크
    const cx = x + w / 2;
    const cy = y + h / 2;
    const dx = cx - SYMBOL_CX;
    const dy = cy - SYMBOL_CY;
    return Math.sqrt(dx * dx + dy * dy) < SYMBOL_R;
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  function getExistingRects() {
    return Array.from(wrapper.querySelectorAll('.msg-card')).map(el => ({
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top)  || 0,
      w: el.offsetWidth  || parseFloat(el.style.width) || 200,
      h: el.offsetHeight || 100,
    }));
  }

  function findPosition(cardW, cardH) {
    const MAX_TRIES = 60;
    for (let i = 0; i < MAX_TRIES; i++) {
      const zone = ZONES[rand(0, ZONES.length)];
      const x = rand(zone.x[0], Math.max(zone.x[0] + 1, zone.x[1] - cardW));
      const y = rand(zone.y[0], Math.max(zone.y[0] + 1, zone.y[1] - cardH));

      if (inSymbolArea(x, y, cardW, cardH)) continue;

      const existing = getExistingRects();
      const overlaps = existing.some(r => rectsOverlap(x, y, cardW, cardH, r.x, r.y, r.w, r.h));
      if (!overlaps) return { x, y };
    }
    // 최대 시도 후에도 못 찾으면 그냥 배치
    const zone = ZONES[rand(0, ZONES.length)];
    return {
      x: rand(zone.x[0], zone.x[1]),
      y: rand(zone.y[0], zone.y[1]),
    };
  }

  let sizeToggle = false; // alternates large / small

  function rand(min, max) { return Math.floor(Math.random() * (max - min) + min); }

  function formatDateTime(d) {
    const mo = String(d.getMonth()+1).padStart(2,'0');
    const da = String(d.getDate()).padStart(2,'0');
    const yr = d.getFullYear();
    let hr = d.getHours();
    const mn = String(d.getMinutes()).padStart(2,'0');
    const sc = String(d.getSeconds()).padStart(2,'0');
    const ap = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${mo}/${da}/${yr}, ${String(hr).padStart(2,'0')}:${mn}:${sc} ${ap}`;
  }

  function submitInput() {
    const text = inputEl.textContent.trim();
    if (text) createCard(text);
    deactivateInput();
  }

  function createCard(text) {
    sizeToggle = !sizeToggle;
    const fontSize   = sizeToggle ? 34 : 24;
    const lineHeight = sizeToggle ? '36px' : '26px';
    const combo      = COLOR_COMBOS[rand(0, COLOR_COMBOS.length)];
    const cardWidth  = sizeToggle
      ? Math.min(Math.max(fontSize * text.length * 0.48, 200), 420)
      : Math.min(Math.max(fontSize * text.length * 0.52, 140), 300);

    const timestamp = formatDateTime(new Date());
    const fullText  = `${timestamp}, ${text}`;

    // 카드를 먼저 DOM에 숨겨서 실제 높이 측정
    const card = document.createElement('div');
    card.className = 'msg-card';
    card.style.cssText = [
      `width: ${Math.round(cardWidth)}px`,
      `background: ${combo.bg}`,
      `color: ${combo.text}`,
      `font-size: ${fontSize}px`,
      `line-height: ${lineHeight}`,
      `padding: 12px 16px`,
      `visibility: hidden`,
      `position: absolute`,
      `left: -9999px`,
    ].join(';');
    card.innerHTML = buildMixedHtml(fullText);
    wrapper.appendChild(card);
    const cardH = card.offsetHeight || 100;

    const pos = findPosition(Math.round(cardWidth), cardH);

    card.style.cssText = [
      `left: ${pos.x}px`,
      `top: ${pos.y}px`,
      `width: ${Math.round(cardWidth)}px`,
      `background: ${combo.bg}`,
      `color: ${combo.text}`,
      `font-size: ${fontSize}px`,
      `line-height: ${lineHeight}`,
      `padding: 12px 16px`,
      `opacity: 0`,
      `transform: scale(0.85)`,
      `transition: opacity 0.3s ease, transform 0.3s ease`,
      `z-index: ${++zCounter}`,
    ].join(';');

    card.innerHTML = buildMixedHtml(fullText);
    wrapper.appendChild(card);
    makeDraggable(card);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    }));
  }

})();