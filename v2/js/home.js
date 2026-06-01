// scale 없음 - 박스 등장 애니메이션만
document.addEventListener('DOMContentLoaded', () => {
  const boxes = [
    { el: document.getElementById('box-orange'), delay: 200 },
    { el: document.getElementById('box-blue'),   delay: 450 },
    { el: document.getElementById('box-pink'),   delay: 700 },
  ];
  boxes.forEach(({ el, delay }) => {
    if (!el) return;
    setTimeout(() => el.classList.add('visible'), delay);
  });
});