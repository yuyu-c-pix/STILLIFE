// 모든 페이지 공통: 일정 시간 무활동이면 스플래쉬(index.html)로 이동
const IDLE_TIME = 120000; // 2분 (원하는 값으로 변경)

let idleTimer;

function goSplash() {
  // 어디서든 루트 index.html로
  window.location.href = "/index.html"; // GitHub Pages 프로젝트면 아래 BASE 방식 추천(아래 참고)
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(goSplash, IDLE_TIME);
}

["mousemove", "mousedown", "touchstart", "scroll", "keydown"].forEach((event) => {
  document.addEventListener(event, resetIdleTimer, { passive: true });
});

resetIdleTimer();