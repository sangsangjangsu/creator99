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

  const bunnyFollower = document.createElement('div');
  bunnyFollower.className = 'bunny-cursor-follower';
  bunnyFollower.setAttribute('aria-hidden', 'true');
  bunnyFollower.innerHTML = '<span class="bunny-sprite"></span><span class="bunny-love-bubble">사랑해 ♥</span>';
  document.body.appendChild(bunnyFollower);

  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let bunnyX = 0;
  let bunnyY = 0;
  let bunnyStarted = false;
  let movementTimer;
  let lastTrailTime = 0;
  let clickAnimationTimer;
  let bunnyWaveTimer;
  let bunnyBubbleTimer;
  let bunnyIdleTimer;
  const pixelColors = ['#ff4fa3', '#ff79ba', '#ff9fc8', '#ffd0e7', '#ffffff'];

  function animateBunny() {
    if (bunnyStarted) {
      bunnyX += (cursorX + 42 - bunnyX) * .14;
      bunnyY += (cursorY + 46 - bunnyY) * .14;
      bunnyFollower.style.transform = `translate3d(${bunnyX}px, ${bunnyY}px, 0)`;
    }
    window.requestAnimationFrame(animateBunny);
  }

  animateBunny();

  function scheduleBunnyIdle(delay = 240) {
    window.clearTimeout(bunnyIdleTimer);
    bunnyIdleTimer = window.setTimeout(() => {
      if (bunnyStarted && !bunnyFollower.classList.contains('is-waving')) {
        bunnyFollower.classList.add('is-idle');
      }
    }, delay);
  }

  function createCursorPixel(x, y, options = {}) {
    const pixel = document.createElement('span');
    const angle = options.angle ?? Math.random() * Math.PI * 2;
    const distance = options.distance ?? 18 + Math.random() * 34;
    const size = options.size ?? 4 + Math.floor(Math.random() * 4);
    pixel.className = `cursor-pixel ${options.trail ? 'is-trail' : 'is-burst'}`;
    if (options.trail) pixel.textContent = '♥︎';
    pixel.style.left = `${x}px`;
    pixel.style.top = `${y}px`;
    pixel.style.setProperty('--pixel-size', `${size}px`);
    pixel.style.setProperty('--pixel-color', pixelColors[Math.floor(Math.random() * pixelColors.length)]);
    pixel.style.setProperty('--pixel-x', `${Math.cos(angle) * distance}px`);
    pixel.style.setProperty('--pixel-y', `${Math.sin(angle) * distance + (options.trail ? 13 : 0)}px`);
    pixel.style.setProperty('--pixel-turn', `${Math.round(Math.random() * 180 - 90)}deg`);
    document.body.appendChild(pixel);
    pixel.addEventListener('animationend', () => pixel.remove(), { once: true });
  }

  function createHeartBurst(x, y) {
    for (let index = 0; index < 18; index += 1) {
      createCursorPixel(x, y, {
        angle: (Math.PI * 2 * index) / 18 + Math.random() * .18,
        distance: 28 + Math.random() * 46,
        size: 4 + (index % 3) * 2,
      });
    }
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

    cursorX = event.clientX;
    cursorY = event.clientY;
    if (!bunnyStarted) {
      bunnyX = cursorX + 42;
      bunnyY = cursorY + 46;
      bunnyStarted = true;
    }
    heartCursor.classList.add('is-visible', 'is-moving');
    bunnyFollower.classList.add('is-visible');
    bunnyFollower.classList.remove('is-idle');
    scheduleBunnyIdle();

    const now = window.performance.now();
    if (now - lastTrailTime > 42) {
      createCursorPixel(cursorX, cursorY, {
        trail: true,
        angle: Math.PI / 2 + (Math.random() - .5) * 1.8,
        distance: 10 + Math.random() * 18,
        size: 3 + Math.floor(Math.random() * 4),
      });
      lastTrailTime = now;
    }

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

  window.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    createHeartBurst(event.clientX, event.clientY);
    bunnyFollower.classList.remove('is-idle');
    heartCursor.classList.remove('is-clicking');
    void heartCursor.offsetWidth;
    heartCursor.classList.add('is-clicking');
    bunnyFollower.classList.remove('is-waving');
    bunnyFollower.classList.remove('is-loving');
    void bunnyFollower.offsetWidth;
    bunnyFollower.classList.add('is-waving', 'is-loving');
    window.clearTimeout(clickAnimationTimer);
    window.clearTimeout(bunnyWaveTimer);
    window.clearTimeout(bunnyBubbleTimer);
    clickAnimationTimer = window.setTimeout(() => heartCursor.classList.remove('is-clicking'), 430);
    bunnyWaveTimer = window.setTimeout(() => {
      bunnyFollower.classList.remove('is-waving');
      scheduleBunnyIdle(80);
    }, 800);
    bunnyBubbleTimer = window.setTimeout(() => bunnyFollower.classList.remove('is-loving'), 1100);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    heartCursor.classList.remove('is-visible');
    bunnyFollower.classList.remove('is-visible', 'is-idle');
    window.clearTimeout(bunnyIdleTimer);
  });
}

// 시냇물 배경음, 클릭 게임음, 드래그 슬라임음을 Web Audio로 생성
const AudioEngine = window.AudioContext || window.webkitAudioContext;
const soundToggle = document.createElement('button');
soundToggle.className = 'sound-toggle';
soundToggle.type = 'button';
soundToggle.setAttribute('aria-label', '사이트 사운드 켜기 또는 끄기');
document.body.appendChild(soundToggle);

let soundEnabled = window.localStorage.getItem('portfolio-sound') !== 'off';
let audioContext;
let masterGain;
let streamSource;
let streamGain;
let waterBubbleTimer;
let pointerStart;
let dragActive = false;
let lastDragTime = -1000;
let lastSquishTime = 0;

function updateSoundButton() {
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  if (!soundEnabled) {
    soundToggle.textContent = '♫ SOUND OFF';
  } else if (!audioContext) {
    soundToggle.textContent = '♫ 소리 시작';
  } else {
    soundToggle.textContent = '♫ SOUND ON';
  }
}

function playWaterBubble() {
  if (!audioContext || !soundEnabled || document.hidden) return;
  const start = audioContext.currentTime + .03;
  const bubbleCount = Math.random() > .68 ? 2 : 1;

  for (let index = 0; index < bubbleCount; index += 1) {
    const time = start + index * .13;
    const bubble = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    bubble.type = 'sine';
    bubble.frequency.setValueAtTime(780 + Math.random() * 340, time);
    bubble.frequency.exponentialRampToValueAtTime(430 + Math.random() * 120, time + .18);
    filter.type = 'lowpass';
    filter.frequency.value = 1800;

    gain.gain.setValueAtTime(.0001, time);
    gain.gain.exponentialRampToValueAtTime(.022, time + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, time + .22);

    bubble.connect(gain);
    gain.connect(filter).connect(masterGain);
    bubble.start(time);
    bubble.stop(time + .24);
  }
}

function createCuteStreamSound() {
  const frameCount = audioContext.sampleRate * 4;
  const streamBuffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const streamData = streamBuffer.getChannelData(0);
  let flowingSample = 0;

  for (let index = 0; index < frameCount; index += 1) {
    const ripple = Math.random() * 2 - 1;
    flowingSample = (flowingSample + ripple * .045) / 1.045;
    streamData[index] = flowingSample * 2.4 + ripple * .055;
  }

  streamSource = audioContext.createBufferSource();
  streamSource.buffer = streamBuffer;
  streamSource.loop = true;

  const highPass = audioContext.createBiquadFilter();
  const lowPass = audioContext.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 120;
  lowPass.type = 'lowpass';
  lowPass.frequency.value = 1450;
  lowPass.Q.value = .55;

  streamGain = audioContext.createGain();
  streamGain.gain.value = .034;

  const flowPulse = audioContext.createOscillator();
  const flowDepth = audioContext.createGain();
  flowPulse.type = 'sine';
  flowPulse.frequency.value = .24;
  flowDepth.gain.value = .007;
  flowPulse.connect(flowDepth).connect(streamGain.gain);

  streamSource.connect(highPass).connect(lowPass).connect(streamGain).connect(masterGain);
  streamSource.start();
  flowPulse.start();

  playWaterBubble();
  waterBubbleTimer = window.setInterval(playWaterBubble, 2350);
}

async function ensureAudio() {
  if (!AudioEngine) return false;

  if (!audioContext) {
    audioContext = new AudioEngine();
    masterGain = audioContext.createGain();
    masterGain.gain.value = soundEnabled ? .72 : 0;
    masterGain.connect(audioContext.destination);
    createCuteStreamSound();
  }

  if (audioContext.state === 'suspended') await audioContext.resume();
  return true;
}

function setMasterVolume(volume) {
  if (!audioContext || !masterGain) return;
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, .04);
}

function playPopTriplet() {
  if (!audioContext || !soundEnabled) return;
  const start = audioContext.currentTime;

  [520, 680, 840].forEach((frequency, index) => {
    const time = start + index * .085;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * .72, time + .09);
    gain.gain.setValueAtTime(.0001, time);
    gain.gain.exponentialRampToValueAtTime(.07, time + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, time + .105);
    oscillator.connect(gain).connect(masterGain);
    oscillator.start(time);
    oscillator.stop(time + .12);
  });
}

function playSlimeSquish() {
  if (!audioContext || !soundEnabled) return;
  const start = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const wobble = audioContext.createOscillator();
  const wobbleDepth = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(210, start);
  oscillator.frequency.exponentialRampToValueAtTime(72, start + .18);
  wobble.type = 'sine';
  wobble.frequency.value = 24;
  wobbleDepth.gain.value = 28;
  wobble.connect(wobbleDepth).connect(oscillator.frequency);

  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.11, start + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, start + .2);
  oscillator.connect(gain).connect(masterGain);
  oscillator.start(start);
  wobble.start(start);
  oscillator.stop(start + .22);
  wobble.stop(start + .22);
}

updateSoundButton();

document.addEventListener('pointerdown', (event) => {
  const isSoundButton = event.target instanceof Element && event.target.closest('.sound-toggle');
  if (soundEnabled && !isSoundButton) {
    ensureAudio().then((ready) => {
      if (ready) updateSoundButton();
    });
  }
  if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  dragActive = false;
});

document.addEventListener('pointermove', (event) => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  if (distance < 7) return;

  dragActive = true;
  const now = window.performance.now();
  if (now - lastSquishTime > 115) {
    playSlimeSquish();
    lastSquishTime = now;
  }
}, { passive: true });

function finishPointer() {
  if (dragActive) lastDragTime = window.performance.now();
  pointerStart = undefined;
  dragActive = false;
}

document.addEventListener('pointerup', finishPointer);
document.addEventListener('pointercancel', finishPointer);

document.addEventListener('click', (event) => {
  if (event.target.closest('.sound-toggle')) return;
  if (window.performance.now() - lastDragTime < 320) return;
  ensureAudio().then((ready) => {
    if (ready) playPopTriplet();
  });
});

soundToggle.addEventListener('click', async () => {
  if (soundEnabled && !audioContext) {
    const ready = await ensureAudio();
    if (ready) {
      setMasterVolume(.72);
      updateSoundButton();
      playPopTriplet();
    }
    return;
  }

  soundEnabled = !soundEnabled;
  window.localStorage.setItem('portfolio-sound', soundEnabled ? 'on' : 'off');
  updateSoundButton();

  if (soundEnabled) {
    const ready = await ensureAudio();
    if (ready) {
      setMasterVolume(.72);
      playPopTriplet();
    }
  } else {
    setMasterVolume(0);
  }
});

document.addEventListener('visibilitychange', () => {
  setMasterVolume(document.hidden || !soundEnabled ? 0 : .72);
});
