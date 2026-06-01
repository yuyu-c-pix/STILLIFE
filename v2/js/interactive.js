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
    /* 타이핑 중 배경 카드 클릭/드래그 차단 */
    document.querySelectorAll('.msg-card').forEach(function(c) { c.style.pointerEvents = 'none'; });
  }

  function deactivateInput() {
    placeholder.classList.remove('hidden');
    inputEl.classList.remove('active');
    inputEl.innerHTML = '';
    /* 배경 카드 인터랙션 복원 */
    document.querySelectorAll('.msg-card').forEach(function(c) { c.style.pointerEvents = ''; });
  }

  /* Click on Type Here area */
  inputWrap.addEventListener('click', () => activateInput());

  /* Type ANYWHERE on the page activates input */
  document.addEventListener('keydown', (e) => {
    if (e.target === inputEl) return;
    /* nick-input에 타이핑 중이거나 overlay가 열려 있으면 메인 input 건드리지 않음 */
    if (e.target.id === 'nick-input') return;
    const nickOverlay = document.getElementById('nickname-overlay');
    if (nickOverlay && !nickOverlay.classList.contains('hidden')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Enter') { if (inputEl.classList.contains('active')) submitInput(); return; }
    if (e.key === 'Escape') { if (inputEl.classList.contains('active')) deactivateInput(); return; }
    if (e.key.length === 1) {
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

/* ══════════════════════════════════════════
   C — 카드 슬라이드인 (페이지 로드 후 1.8s)
══════════════════════════════════════════ */
(function () {
  /* 랜덤 카드를 오른쪽 바깥에서 슬라이드인 */
  const _allCards = Array.from(document.querySelectorAll('.msg-card'));
  if (!_allCards.length) return;
  const target = _allCards[Math.floor(Math.random() * _allCards.length)];

  target.style.transform = 'translateX(420px)';
  target.style.opacity   = '0';

  setTimeout(function () {
    target.style.transition = 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease';
    target.style.transform  = 'translateX(0)';
    target.style.opacity    = '1';
  }, 1800);
})();

/* ══════════════════════════════════════════
   Nickname overlay + Custom cursor (desktop)
══════════════════════════════════════════ */
(function () {
  if (window.innerWidth <= 768) return;

  const STORAGE_KEY = 'stillife_nickname';
  const BADGE_COLORS = ['#FF437D', '#53C948', '#FFB040', '#468DFF', '#5BE0EF'];

  const overlay   = document.getElementById('nickname-overlay');
  const nickInput = document.getElementById('nick-input');
  const nickLabel = document.getElementById('nick-label');
  const nickWrap  = document.getElementById('nick-type-wrap');
  const cursorEl  = document.getElementById('user-cursor');
  const badgeEl   = document.getElementById('user-badge');

  function focusNickInput() {
    if (nickLabel) nickLabel.classList.add('hidden');
    nickInput.classList.add('active');
    nickInput.focus();
  }

  function colorForName(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
    return BADGE_COLORS[Math.abs(h) % BADGE_COLORS.length];
  }

  const BADGE_TEXT = { '#FF437D': '#E0FCFF', '#53C948': '#FFB040', '#FFB040': '#53C948', '#468DFF': '#FF437D', '#5BE0EF': '#468DFF' };
  const OX = 6.75, OY = 6.11;

  function startCursor(name) {
    const color = colorForName(name);
    cursorEl.style.color = color;
    badgeEl.style.background = color;
    badgeEl.style.color = BADGE_TEXT[color] || '#fff';
    badgeEl.textContent = name;
    cursorEl.style.display = 'block';

    document.addEventListener('mousemove', function (e) {
      cursorEl.style.transform = 'translate(' + (e.clientX - OX) + 'px,' + (e.clientY - OY) + 'px)';
    });

    initLiveblocks(name, color);
  }

  function createOtherCursorEl(name, color) {
    const textColor = BADGE_TEXT[color] || '#fff';
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:7999;display:none;color:' + color + ';will-change:transform';
    el.innerHTML =
      '<svg width="31" height="31" viewBox="0 0 33.966 33.9856" fill="none" overflow="visible">' +
        '<path d="M7.40344 6.69426L31.2058 16.2577L32.4929 16.7747L31.1723 17.1974L20.5489 20.601L17.0597 31.1948L16.6261 32.512L16.1197 31.2207L6.75168 7.34069L6.32865 6.26241L7.40344 6.69426Z" fill="currentColor" stroke="black" stroke-width="1"/>' +
        '<circle cx="25.5704" cy="25.3744" r="3.30908" fill="currentColor" stroke="black" stroke-width="1"/>' +
      '</svg>' +
      '<div style="position:absolute;top:40px;left:40px;padding:4px 8px;border:1px solid #000;' +
        'font-family:megascope-variable,sans-serif;font-size:20px;font-weight:500;line-height:26px;' +
        'letter-spacing:0.4px;white-space:nowrap;' +
        'background:' + color + ';color:' + textColor + '">' + name + '</div>';
    document.body.appendChild(el);
    return el;
  }

  function initLiveblocks(name, color) {
    const lb = window.Liveblocks;
    if (!lb || !lb.createClient) return;
    const client = lb.createClient({ publicApiKey: window.STILLIFE_LB_KEY });
    let room;
    try {
      const res = client.enterRoom('stillife-interactive', {
        initialPresence: { cursor: null, name: name, color: color, isMobile: false }
      });
      room = res.room || res;
    } catch (e) { return; }

    /* Broadcast own cursor as normalised viewport fraction */
    document.addEventListener('mousemove', function (e) {
      room.updatePresence({ cursor: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight } });
    });
    document.addEventListener('mouseleave', function () { room.updatePresence({ cursor: null }); });

    /* Render / update / remove other users' cursors */
    const otherCursors = {};
    room.subscribe('others', function (others) {
      const arr = others.toArray ? others.toArray() : (Array.isArray(others) ? others : []);
      const activeIds = new Set(arr.map(function (o) { return o.connectionId; }));

      arr.forEach(function (other) {
        const p = other.presence;
        if (!p || !p.name || p.isMobile) return;
        const id = other.connectionId;
        if (!otherCursors[id]) otherCursors[id] = createOtherCursorEl(p.name, p.color || '#468DFF');
        const el = otherCursors[id];
        if (!p.cursor) { el.style.display = 'none'; return; }
        el.style.transform = 'translate(' + (p.cursor.x * window.innerWidth - OX) + 'px,' + (p.cursor.y * window.innerHeight - OY) + 'px)';
        el.style.display = 'block';
      });

      Object.keys(otherCursors).forEach(function (id) {
        if (!activeIds.has(Number(id))) { otherCursors[id].remove(); delete otherCursors[id]; }
      });
    });
  }

  function dismissOverlay(name) {
    overlay.classList.add('hiding');
    setTimeout(function () { overlay.classList.add('hidden'); }, 450);
    startCursor(name);
  }

  function submitNick() {
    const val = nickInput.value.trim();
    if (!val) {
      nickInput.style.borderBottomColor = '#FF437D';
      nickInput.focus();
      return;
    }
    localStorage.setItem(STORAGE_KEY, val);
    dismissOverlay(val);
  }

  if (nickWrap) nickWrap.addEventListener('click', focusNickInput);

  nickInput.addEventListener('blur', function () {
    if (!nickInput.value.trim()) {
      nickInput.classList.remove('active');
      if (nickLabel) nickLabel.classList.remove('hidden');
    }
  });

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    overlay.classList.add('hidden');
    startCursor(saved);
  } else {
    nickInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitNick(); }
      if (e.key !== 'Enter') nickInput.style.borderBottomColor = '';
    });
    setTimeout(focusNickInput, 200);
  }
})();