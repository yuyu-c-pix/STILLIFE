/* ─────────────────────────────────────────
   js/interactive-mobile.js  —  Still Life
───────────────────────────────────────── */
(function () {
  'use strict';

  if (window.innerWidth > 768) return;

  function hasKorean(str) {
    return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(str);
  }

  const wrap      = document.querySelector('.int-mobile-wrap');
  const placeholder = document.querySelector('.int-mobile-placeholder');
  const inputEl   = document.querySelector('.int-mobile-input');
  const inputWrap = document.querySelector('.int-mobile-input-wrap');

  if (!wrap || !inputEl) return;

  const COLORS = ['color-blue', 'color-green', 'color-orange', 'color-pink', 'color-white'];
  let colorIdx = 0;
  let sizeToggle = false;

  function rand(min, max) { return Math.floor(Math.random() * (max - min) + min); }

  /* ══════════════════════════════════════════
     Input — 포커스 기반 (display 대신 opacity)
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

  /* click만 사용 — touchstart는 double-focus를 유발하므로 제거 */
  if (inputWrap) {
    inputWrap.addEventListener('click', function () { activateInput(); });
  }

  /* input이 실제로 포커스 받았을 때 (placeholder를 우회해서 탭해도 대응) */
  inputEl.addEventListener('focus', function () {
    if (placeholder) placeholder.classList.add('hidden');
    inputEl.classList.add('active');
  });

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
     Type Here 영역 계산 (카드 배치 제외 zone)
  ══════════════════════════════════════════ */
  function getInputZone() {
    const main = document.querySelector('.int-mobile-main');
    if (!main) return { top: 640, bottom: 1000 };
    const wrapRect = wrap.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    return {
      top:    mainRect.top    - wrapRect.top - 60,
      bottom: mainRect.bottom - wrapRect.top + 60,
    };
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

    const wrapW = wrap.offsetWidth || window.innerWidth;
    const cardW = Math.round(wrapW * 0.564);
    const maxX  = wrapW - cardW - 16;
    const x     = rand(8, Math.max(9, maxX));

    /* Type Here 영역을 피해 y 결정 */
    const zone  = getInputZone();
    const wrapH = wrap.scrollHeight;
    let y;
    for (let i = 0; i < 30; i++) {
      y = rand(40, Math.max(41, wrapH - 160));
      if (y + 140 < zone.top || y > zone.bottom) break;
    }

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

  inputEl.addEventListener('input', function () {
    inputEl.classList.toggle('kr-font', hasKorean(inputEl.value));
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); submitInput(); }
    if (e.key === 'Escape') deactivateInput();
  });

  /* blur: 400ms 대기 + activeElement 재확인 (iOS 키보드 애니메이션 대응) */
  inputEl.addEventListener('blur', function () {
    setTimeout(function () {
      if (document.activeElement === inputEl) return;
      const val = inputEl.value.trim();
      if (val) submitInput();
      else deactivateInput();
    }, 400);
  });

  /* ══════════════════════════════════════════
     Touch Drag — getBoundingClientRect로 실제 픽셀 위치 계산
  ══════════════════════════════════════════ */
  function makeDraggable(el) {
    let startX, startY, origL, origT;

    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;

      /* vw/right 등 비픽셀 단위 대응 — 실제 렌더 위치를 측정 */
      el.style.right = 'auto';
      const wrapRect = wrap.getBoundingClientRect();
      const elRect   = el.getBoundingClientRect();
      origL = elRect.left - wrapRect.left;
      origT = elRect.top  - wrapRect.top;

      el.style.left = origL + 'px';
      el.style.top  = origT + 'px';
      el.style.zIndex = ++zCounter;
      el.classList.add('dragging');
    }, { passive: true });

    el.addEventListener('touchmove', function (e) {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      const t  = e.touches[0];
      el.style.left = (origL + t.clientX - startX) + 'px';
      el.style.top  = (origT + t.clientY - startY) + 'px';
    }, { passive: false });

    el.addEventListener('touchend', function () {
      el.classList.remove('dragging');
    });
  }

  document.querySelectorAll('.int-card-mobile').forEach(makeDraggable);

  const STORAGE_KEY = 'stillife_nickname';

  /* ══════════════════════════════════════════
     Color helpers for presence dots
  ══════════════════════════════════════════ */
  const DOT_COLORS = ['#FF437D', '#53C948', '#FFB040', '#468DFF', '#5BE0EF'];
  const DOT_TEXT_MAP = {
    '#FF437D': '#FFB040', '#53C948': '#FFB040',
    '#FFB040': '#468DFF', '#468DFF': '#FF437D', '#5BE0EF': '#468DFF',
  };
  function colorForName(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xFFFF;
    return DOT_COLORS[h % DOT_COLORS.length];
  }

  /* ══════════════════════════════════════════
     Dot animation — shared pool (sim + live)
  ══════════════════════════════════════════ */
  const allDots = [];
  const DOT_MIN_Y = 90, DOT_MAX_Y = 530;

  function addDot(name, bg, fg, delay) {
    const el = document.createElement('div');
    el.className = 'presence-mob';
    const dotFont = hasKorean(name)
      ? '"Sandoll 60","megascope-variable",sans-serif'
      : '"megascope-variable",sans-serif';
    el.innerHTML =
      '<div class="presence-mob-dot" style="background:' + bg + '"></div>' +
      '<div class="presence-mob-name" style="background:' + bg + ';color:' + fg + ';font-family:' + dotFont + '">' + name + '</div>';
    el.style.opacity = '0';
    wrap.appendChild(el);
    const x = rand(10, Math.max(11, window.innerWidth - 110));
    const y = rand(DOT_MIN_Y, DOT_MAX_Y);
    const speed = 0.32 + Math.random() * 0.38;
    const angle = Math.random() * Math.PI * 2;
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    setTimeout(function () {
      el.style.transition = 'opacity 0.7s ease';
      el.style.opacity = '1';
    }, delay == null ? 100 : delay);
    const dot = { el, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    allDots.push(dot);
    return dot;
  }

  function removeDot(dot) {
    dot.el.style.transition = 'opacity 0.5s ease';
    dot.el.style.opacity = '0';
    setTimeout(function () { dot.el.remove(); }, 500);
    const idx = allDots.indexOf(dot);
    if (idx !== -1) allDots.splice(idx, 1);
  }

  /* rAF loop starts immediately — picks up dots as they're added */
  (function animateLoop() {
    const maxX = window.innerWidth - 110;
    allDots.forEach(function (d) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 10)         { d.x = 10;         d.vx =  Math.abs(d.vx); }
      if (d.x > maxX)       { d.x = maxX;        d.vx = -Math.abs(d.vx); }
      if (d.y < DOT_MIN_Y)  { d.y = DOT_MIN_Y;  d.vy =  Math.abs(d.vy); }
      if (d.y > DOT_MAX_Y)  { d.y = DOT_MAX_Y;  d.vy = -Math.abs(d.vy); }
      d.el.style.left = d.x + 'px';
      d.el.style.top  = d.y + 'px';
    });
    requestAnimationFrame(animateLoop);
  })();

  /* ══════════════════════════════════════════
     C — 카드 슬라이드인 (페이지 로드 후 2.2s)
  ══════════════════════════════════════════ */
  function initCardSlideIn() {
    const cards = Array.from(document.querySelectorAll('.int-card-mobile'));
    if (!cards.length) return;
    const shuffled = cards.slice().sort(function () { return Math.random() - 0.5; });
    const targets  = shuffled.slice(0, Math.min(2, shuffled.length));
    targets.forEach(function (target, i) {
      target.style.transition = 'none';
      target.style.transform  = 'translateX(110vw)';
      setTimeout(function () {
        target.style.transition = 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1)';
        target.style.transform  = 'translateX(0)';
      }, 2200 + i * 400);
    });
  }

  /* ══════════════════════════════════════════
     A — Simulated presence dots
  ══════════════════════════════════════════ */
  function initPresenceDots(userName) {
    const sims = [
      { name: 'Woody',  bg: '#FFB040', fg: '#53C948' },
      { name: 'Zuhoon', bg: '#FF437D', fg: '#E0FCFF' },
      { name: 'Rosy',   bg: '#468DFF', fg: '#FF437D' },
    ];
    const userBg = userName ? colorForName(userName) : '#53C948';
    const userFg = userName ? (DOT_TEXT_MAP[userBg] || '#fff') : '#FFB040';
    sims.concat([{ name: userName || 'Sol', bg: userBg, fg: userFg }]).forEach(function (p, i) {
      addDot(p.name, p.bg, p.fg, 1000 + i * 700);
    });
  }

  /* ══════════════════════════════════════════
     Liveblocks — real users as floating dots
  ══════════════════════════════════════════ */
  function initLiveblocks(name) {
    const lb = window.Liveblocks;
    if (!lb || !lb.createClient) return;
    const client = lb.createClient({ publicApiKey: window.STILLIFE_LB_KEY });
    let room;
    try {
      const res = client.enterRoom('stillife-interactive', {
        initialPresence: { cursor: null, name: name, color: colorForName(name), isMobile: true }
      });
      room = res.room || res;
    } catch (e) { return; }

    const liveDots = {};
    room.subscribe('others', function (others) {
      const arr = others.toArray ? others.toArray() : (Array.isArray(others) ? others : []);
      const activeIds = new Set(arr.map(function (o) { return o.connectionId; }));

      arr.forEach(function (other) {
        const p = other.presence;
        if (!p || !p.name) return;
        const id = other.connectionId;
        if (!liveDots[id]) {
          const bg = p.color || colorForName(p.name);
          const fg = DOT_TEXT_MAP[bg] || '#fff';
          liveDots[id] = addDot(p.name, bg, fg, 100);
        }
      });

      Object.keys(liveDots).forEach(function (id) {
        if (!activeIds.has(Number(id))) { removeDot(liveDots[id]); delete liveDots[id]; }
      });
    });
  }

  /* ══════════════════════════════════════════
     Nickname → start experience
  ══════════════════════════════════════════ */
  function startMobileExperience(userName) {
    initCardSlideIn();
    initPresenceDots(userName);
    initLiveblocks(userName);
  }

  function hideOverlayMob() {
    var ovr = document.getElementById('nickname-overlay-mob');
    if (!ovr) return;
    try { ovr.remove(); } catch (e) {
      try { ovr.style.setProperty('display', 'none', 'important'); } catch (e2) {}
    }
  }

  (function initNickname() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      hideOverlayMob();           /* ← 이전에 빠진 코드: saved 경로에서도 overlay 숨김 */
      startMobileExperience(saved);
      return;
    }

    var overlay   = document.getElementById('nickname-overlay-mob');
    var nickInput = document.getElementById('nick-input-mob');
    if (!overlay || !nickInput) { startMobileExperience(''); return; }

    var submitted = false;
    function submitNick() {
      if (submitted) return;
      var name = (nickInput.value || '').trim();
      if (!name) return;
      submitted = true;
      try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
      hideOverlayMob();           /* DOM에서 완전 제거 — CSS로 다시 보일 수 없음 */
      try { startMobileExperience(name); } catch (e) {}
    }

    nickInput.addEventListener('input', function () {
      nickInput.classList.toggle('kr-font', hasKorean(nickInput.value || ''));
    });

    nickInput.addEventListener('keydown', function (e) {
      var isEnter = (e.key === 'Enter' || e.keyCode === 13);
      if (isEnter && !e.isComposing) { e.preventDefault(); submitNick(); }
    });

    nickInput.addEventListener('blur', function () {
      setTimeout(function () {
        if ((nickInput.value || '').trim()) submitNick();
      }, 400);
    });
  })();

})();
