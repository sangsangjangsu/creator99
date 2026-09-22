// 모바일 화면의 메뉴 열기·닫기 기능
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

// 콘텐츠가 화면에 들어올 때 한 번만 등장 애니메이션을 실행
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// 마우스가 움직이는 동안 두근거리는 픽셀 하트 커서
const finePointer = window.matchMedia('(pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (finePointer.matches && !reducedMotion.matches) {
  document.documentElement.classList.add('has-heart-cursor');

  const heartCursor = document.createElement('div');
  heartCursor.className = 'pixel-heart-cursor';
  heartCursor.setAttribute('aria-hidden', 'true');
  heartCursor.innerHTML = '<span class="heart-glyph">♥︎</span>';
  document.body.appendChild(heartCursor);

  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let movementTimer;

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

    cursorX = event.clientX;
    cursorY = event.clientY;
    heartCursor.classList.add('is-visible', 'is-moving');

    if (!cursorFrame) {
      cursorFrame = window.requestAnimationFrame(() => {
        heartCursor.style.left = `${cursorX}px`;
        heartCursor.style.top = `${cursorY}px`;
        cursorFrame = 0;
      });
    }

    window.clearTimeout(movementTimer);
    movementTimer = window.setTimeout(() => heartCursor.classList.remove('is-moving'), 140);
  }, { passive: true });

  document.addEventListener('mouseleave', () => heartCursor.classList.remove('is-visible'));
}
