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
    + '<div class="stilllife-bottom"><img src="assets/images/home/wordtype.svg" alt="STILLLIFE"></div>'
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