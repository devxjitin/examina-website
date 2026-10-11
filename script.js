const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

// Hero demo: one PC, three mock exam screens. Illustrative only, not an app screenshot.
(function () {
  const scene = document.querySelector('.pc-scene');
  if (!scene) return;
  const screen = scene.querySelector('.pc-screen');
  const pages = Array.from(scene.querySelectorAll('.pc-page'));
  const cursor = scene.querySelector('.pc-cursor');
  const status = scene.querySelector('.pc-status');
  const qn = scene.querySelector('.pc-qn');
  const keys = scene.querySelector('.pc-keys');
  const keyCap = keys.querySelector('.pc-key');
  const modeLabel = keys.querySelector('.pc-mode');
  const dots = Array.from(scene.querySelectorAll('[data-slide]'));
  const pauseBtn = scene.querySelector('.carousel-pause');
  const controls = scene.querySelector('.carousel-controls');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CANCEL = {};
  const SPEED = 42; // ms per character: a medium typing pace
  const HOLD = 2600;
  const modes = [
    { key: 'Q', label: 'Multiple-choice practice' },
    { key: 'S', label: 'Subjective practice' },
    { key: 'C', label: 'Coding practice' }
  ];
  const WRITTEN = 'A stack follows last in, first out: the newest item is removed first. A queue follows first in, first out: the oldest item is removed first.';
  const CODE = [
    ['k', 'def '], ['f', 'squares'], ['p', '(numbers):\n    '], ['k', 'return '], ['p', '[n * n '], ['k', 'for '], ['p', 'n '], ['k', 'in '],
    ['p', 'numbers]\n\n'], ['f', 'print'], ['p', '(squares(['], ['n', '2, 3, 4'], ['p', ']))\n'], ['c', '# [4, 9, 16]']
  ];
  let token = 0, active = 0, autoplay = !reduce.matches;

  const wait = (ms, t) => new Promise((res, rej) => setTimeout(() => (t === token ? res() : rej(CANCEL)), ms));

  function place(x, y, ms) {
    cursor.style.transitionDuration = ms + 'ms';
    cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function target(el, dx, dy) {
    const s = screen.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left + dx * r.width, y: r.top - s.top + dy * r.height };
  }
  function startPoint() {
    const s = screen.getBoundingClientRect();
    return { x: s.width * 0.86, y: s.height * 0.84 };
  }
  async function moveTo(el, dx, dy, ms, t) {
    const p = target(el, dx, dy);
    place(p.x, p.y, ms);
    await wait(ms + 80, t);
  }
  async function click(t) {
    cursor.classList.add('is-click');
    await wait(160, t);
    cursor.classList.remove('is-click');
  }
  async function typeText(node, text, t) {
    for (const ch of text) {
      node.appendChild(document.createTextNode(ch));
      let d = SPEED + Math.random() * 18 - 6;
      if (ch === '\n') d += 220; else if (ch === ',' || ch === ':' || ch === '.') d += 110;
      await wait(d, t);
    }
  }
  async function typeCode(node, t) {
    for (const [cls, text] of CODE) {
      const span = document.createElement('span');
      if (cls !== 'p') span.className = 'tk-' + cls;
      node.appendChild(span);
      for (const ch of text) {
        span.appendChild(document.createTextNode(ch));
        let d = SPEED + Math.random() * 18 - 6;
        if (ch === '\n') d += 220;
        await wait(d, t);
      }
    }
  }

  function reset(i) {
    pages.forEach((p, n) => p.classList.toggle('is-active', n === i));
    dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
    const page = pages[i];
    page.querySelectorAll('.is-selected,.is-hover,.is-focus,.is-typing').forEach(e => e.classList.remove('is-selected', 'is-hover', 'is-focus', 'is-typing'));
    page.querySelectorAll('.pc-typed').forEach(e => { e.textContent = ''; });
    scene.classList.remove('is-done');
    status.textContent = 'Ready';
    qn.textContent = String(i + 1);
    keyCap.textContent = modes[i].key;
    modeLabel.textContent = modes[i].label;
    keys.querySelectorAll('kbd').forEach(k => k.classList.remove('is-down'));
    cursor.classList.remove('is-text', 'is-click', 'is-hidden');
    const sp = startPoint();
    place(sp.x, sp.y, 0);
  }
  function finalState(i) {
    reset(i);
    const page = pages[i];
    cursor.classList.add('is-hidden');
    if (i === 0) { page.querySelector('[data-correct]').classList.add('is-selected'); status.textContent = '✓ Option B selected · review the answer'; }
    if (i === 1) { page.querySelector('.pc-typed').textContent = WRITTEN; page.querySelector('.pc-answer').classList.add('is-typing'); status.textContent = '✓ Written answer entered · review it'; }
    if (i === 2) {
      const code = page.querySelector('.pc-typed');
      CODE.forEach(([cls, text]) => { const s = document.createElement('span'); if (cls !== 'p') s.className = 'tk-' + cls; s.textContent = text; code.appendChild(s); });
      page.querySelector('.pc-editor').classList.add('is-typing');
      status.textContent = '✓ Code entered · review and test it';
    }
  }

  async function pressKeys(t) {
    await wait(500, t);
    keys.querySelectorAll('kbd').forEach(k => k.classList.add('is-down'));
    await wait(450, t);
    keys.querySelectorAll('kbd').forEach(k => k.classList.remove('is-down'));
    status.textContent = 'Examina is working…';
    await wait(250, t);
  }

  const scripts = [
    async function mcq(t) {
      const opt = pages[0].querySelector('[data-correct]');
      await pressKeys(t);
      await moveTo(opt, 0.25, 0.5, 1500, t);
      opt.classList.add('is-hover');
      await wait(350, t);
      await click(t);
      opt.classList.remove('is-hover');
      opt.classList.add('is-selected');
      status.textContent = '✓ Option B selected · review the answer';
    },
    async function written(t) {
      const box = pages[1].querySelector('.pc-answer');
      await pressKeys(t);
      await moveTo(box, 0.1, 0.25, 1400, t);
      cursor.classList.add('is-text');
      await wait(250, t);
      await click(t);
      box.classList.add('is-typing');
      await wait(300, t);
      await typeText(pages[1].querySelector('.pc-typed'), WRITTEN, t);
      status.textContent = '✓ Written answer entered · review it';
    },
    async function code(t) {
      const box = pages[2].querySelector('.pc-editor');
      await pressKeys(t);
      await moveTo(box, 0.22, 0.45, 1400, t);
      cursor.classList.add('is-text');
      await wait(250, t);
      await click(t);
      box.classList.add('is-typing');
      await wait(300, t);
      await typeCode(pages[2].querySelector('.pc-typed'), t);
      status.textContent = '✓ Code entered · review and test it';
    }
  ];

  async function play(i) {
    const t = ++token;
    active = (i + pages.length) % pages.length;
    if (reduce.matches) { finalState(active); return; }
    reset(active);
    try {
      await wait(350, t);
      await scripts[active](t);
      scene.classList.add('is-done');
      if (autoplay) { await wait(HOLD, t); play(active + 1); }
    } catch (e) { if (e !== CANCEL) throw e; }
  }

  function setAutoplay(on) {
    autoplay = on;
    pauseBtn.textContent = on ? 'Ⅱ' : '▶';
    pauseBtn.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
    if (on && scene.classList.contains('is-done')) play(active + 1);
  }
  dots.forEach(d => d.addEventListener('click', () => play(Number(d.dataset.slide))));
  scene.querySelectorAll('[data-direction]').forEach(b => b.addEventListener('click', () => play(active + Number(b.dataset.direction))));
  pauseBtn.addEventListener('click', () => setAutoplay(!autoplay));
  scene.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); play(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); play(active - 1); }
  });
  window.addEventListener('resize', () => { if (reduce.matches) return; const sp = startPoint(); if (!scene.classList.contains('is-done') && token) place(sp.x, sp.y, 0); });
  controls.hidden = false;
  if (reduce.matches) setAutoplay(false);
  pauseBtn.textContent = autoplay ? 'Ⅱ' : '▶';
  play(0);
})();

// Sticky header shadow and active section highlight
(function () {
  const header = document.querySelector('#site-header');
  const links = Array.from(document.querySelectorAll('#navigation > a'));
  if (!header || !links.length) return;
  const groups = { why: 'features', shortcuts: 'usage', video: 'guide', setup: 'guide', 'cursor-signals': 'guide', 'exam-assistance': 'compare', 'get-started': 'contact' };
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  function update() {
    header.classList.toggle('scrolled', window.scrollY > 10);
    const line = header.offsetHeight + 80;
    let current = sections[0] ? sections[0].id : '';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= line) current = section.id; });
    const target = groups[current] || current;
    links.forEach(link => {
      const active = link.getAttribute('href') === '#' + target;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Reviews slideshow
(function () {
  const stage = document.querySelector('.rv-stage');
  if (!stage) return;
  const cards = Array.from(stage.querySelectorAll('.rv-card'));
  const dotsBox = document.querySelector('.rv-dots');
  const pauseBtn = document.querySelector('.rv-pause');
  const n = cards.length;
  if (n < 2) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0, timer = null, paused = reduce, hovering = false;

  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show review ' + (i + 1) + ' of ' + n);
    b.addEventListener('click', () => { go(i); });
    dotsBox.appendChild(b);
    return b;
  });

  function size() {
    cards.forEach(c => { c.style.height = 'auto'; });
    const h = Math.max.apply(null, cards.map(c => c.offsetHeight));
    stage.style.setProperty('--rv-h', h + 'px');
    stage.style.height = h + 'px';
    cards.forEach(c => { c.style.height = ''; });
  }

  function render() {
    cards.forEach((card, i) => {
      let d = ((i - active) % n + n) % n;
      if (d > n / 2) d -= n;
      card.classList.toggle('is-active', d === 0);
      card.classList.toggle('is-prev', d === -1);
      card.classList.toggle('is-next', d === 1);
      card.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', (i + 1) + ' of ' + n);
    });
    dots.forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
  }

  function go(i, user) {
    active = (i + n) % n;
    render();
    restart();
  }
  function restart() {
    clearInterval(timer);
    if (!paused && !hovering) timer = setInterval(() => go(active + 1), 6000);
  }
  function setPaused(value) {
    paused = value;
    pauseBtn.classList.toggle('is-paused', paused);
    pauseBtn.setAttribute('aria-label', paused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
    restart();
  }

  document.querySelector('.rv-prev').addEventListener('click', () => go(active - 1));
  document.querySelector('.rv-next').addEventListener('click', () => go(active + 1));
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  stage.addEventListener('mouseenter', () => { hovering = true; restart(); });
  stage.addEventListener('mouseleave', () => { hovering = false; restart(); });
  stage.addEventListener('focusin', () => { hovering = true; restart(); });
  stage.addEventListener('focusout', () => { hovering = false; restart(); });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
  });
  let startX = null;
  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
  cards.forEach((card, i) => card.addEventListener('click', () => { if (i !== active) go(i); }));

  pauseBtn.classList.toggle('is-paused', paused);
  if (paused) pauseBtn.setAttribute('aria-label', 'Play automatic slideshow');
  stage.classList.add('is-ready');
  size();
  render();
  restart();
  window.addEventListener('resize', size);
  window.addEventListener('load', size);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
})();
