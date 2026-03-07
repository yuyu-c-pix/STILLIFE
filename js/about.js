function applyScale() {
  var el = document.getElementById('about-content');
  if (!el) return;
  var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  el.style.transform = 'scale(' + scale + ')';
}
applyScale();
window.addEventListener('resize', applyScale);