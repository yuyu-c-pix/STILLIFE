(function () {
  var mobileHome = document.createElement('div');
  mobileHome.className = 'mobile-home';
  mobileHome.innerHTML = '<div class="card-stack-mobile">'
    + '<div class="card card-blue"><div class="card-text">'
    + 'STILLIFE spreads small, meaningful messages through physical objects in public spaces. We work with simple phrases that express ways of thinking or being.'
    + '</div></div>'
    + '<div class="card card-pink"><span class="card-title">STILLIFE</span>'
    + '<span class="card-text">는 공공 공간의 오브제를 통해 작지만 의미 있는 메시지를 전합니다. 삶을 대하는 태도와 생각을 담은 짧은 문장들의 힘.</span></div>'
    + '<div class="card card-orange">We offer attitudes through Still Objects</div>'
    + '<div class="stilllife-bottom"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -4 1840 596" aria-label="STILLLIFE" focusable="false" style="display:block;width:100%;height:auto;"><path d="M247.374 189C213.483 171.067 175.85 160.151 134.421 156.252C114.825 154.589 105 144.505 105 126C105 117.579 107.807 110.614 113.421 105C118.983 99.3861 126 96.5792 134.421 96.5792H180.632V0H131.094C107.028 0 85.0398 5.45792 65.1314 16.3738C45.2749 27.2896 29.4209 42.4158 17.6733 61.7525C5.92578 81.0891 0.052002 103.077 0.052002 127.715C0.052002 152.354 5.76984 173.614 17.2575 191.547C28.7451 209.48 43.9754 223.619 63.0522 233.963C82.077 244.307 102.817 250.649 125.221 252.884C163.27 255.691 194.251 266.866 218.058 286.463C241.865 306.059 253.768 333.765 253.768 369.631C253.768 392.035 248.726 412.463 238.642 430.968C228.558 449.421 214.835 464.131 197.473 475.047C180.112 485.963 160.515 491.421 138.684 491.421H3.37874V588H138.632C180.06 588 217.434 578.488 250.753 559.463C284.073 540.438 310.375 514.656 329.711 482.168C349.048 449.681 358.664 413.035 358.664 372.126C358.664 329.035 348.58 292.181 328.412 261.668C308.243 231.156 281.214 206.933 247.374 189Z"/><path d="M394.791 0H335.949V96.5792H394.791V588H495.581V96.5792H554.37V0H394.791Z"/><path d="M692.95 0H592.16V588H692.95V0Z"/><path d="M852.529 0H751.74V588H955.035V491.369H852.529V0Z"/><path d="M1196.07 491.369H1094.13V0H992.824V588H1196.64V491.369H1196.07Z"/><path d="M1335.22 0H1234.43V588H1335.22V0Z"/><path d="M1454.93 16.3738C1436.16 27.2896 1421.35 42.1559 1410.43 60.8688C1399.52 79.6337 1394.06 100.79 1394.06 124.285V587.948H1494.85L1496.15 239.369H1597.36V142.79H1496.51V136.916C1496.51 125.168 1500.15 115.5 1507.43 107.911C1514.71 100.374 1524.22 96.5792 1535.97 96.5792H1597.3V0H1517.51C1494.54 0 1473.69 5.45792 1454.93 16.3738Z"/><path d="M1750.13 107.963C1757.4 100.426 1766.92 96.6312 1778.66 96.6312H1840V0H1760.21C1737.23 0 1716.39 5.45792 1697.63 16.3738C1678.86 27.2896 1664.05 42.1559 1653.13 60.8688C1642.21 79.6337 1636.76 100.79 1636.76 124.285V587.948H1840.05V491.369H1737.91L1738.85 239.369H1840.05V142.79H1739.21V136.916C1739.21 125.168 1742.85 115.5 1750.13 107.911V107.963Z"/></svg></div>'
    + '</div>';

  var homeContent = document.getElementById('home-content');
  if (homeContent) {
    homeContent.insertAdjacentElement('afterend', mobileHome);
  } else {
    document.body.appendChild(mobileHome);
  }

  function initCards() {
    var blue   = mobileHome.querySelector('.card-blue');
    var pink   = mobileHome.querySelector('.card-pink');
    var orange = mobileHome.querySelector('.card-orange');
    var bottom = mobileHome.querySelector('.stilllife-bottom');

    var items  = [blue, pink, orange];
    var rotate = ['rotate(-8deg)', 'rotate(12deg)', 'rotate(-10.3deg)'];

    items.forEach(function(card, i) {
      setTimeout(function() {
        card.style.transition = 'opacity 0.5s ease, transform 0.65s cubic-bezier(.22,.68,0,1.15)';
        card.style.opacity = '1';
        card.style.transform = rotate[i];
      }, 100 + i * 300);
    });

    setTimeout(function() {
      bottom.style.transition = 'opacity 0.5s ease';
      bottom.style.opacity = '1';
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCards);
  } else {
    initCards();
  }
}());