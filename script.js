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

// Practice examples are illustrative, not screenshots of an app interface.
const practiceCarousel = document.querySelector('.practice-carousel');
if (practiceCarousel) {
  const slides = [...practiceCarousel.querySelectorAll('.practice-slide')];
  const dots = [...practiceCarousel.querySelectorAll('[data-slide]')];
  const pauseButton = practiceCarousel.querySelector('.carousel-pause');
  const slideContainer = practiceCarousel.querySelector('.practice-slides');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let timer;

  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => { slide.hidden = position !== activeSlide; });
    dots.forEach((dot, position) => dot.setAttribute('aria-current', String(position === activeSlide)));
  }
  function updatePlayback() {
    clearInterval(timer);
    const playing = !paused && !hovered && !document.hidden;
    practiceCarousel.classList.toggle('demo-complete', paused || reducedMotion.matches);
    practiceCarousel.classList.toggle('demo-paused', hovered || document.hidden);
    slideContainer.setAttribute('aria-live', paused ? 'polite' : 'off');
    pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    pauseButton.textContent = paused ? '▶' : 'Ⅱ';
    if (playing) timer = setInterval(() => showSlide(activeSlide + 1), 6000);
  }
  function navigate(index) {
    paused = true;
    showSlide(index);
    updatePlayback();
  }
  dots.forEach(dot => dot.addEventListener('click', () => navigate(Number(dot.dataset.slide))));
  practiceCarousel.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => navigate(activeSlide + Number(button.dataset.direction)));
  });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    updatePlayback();
  });
  practiceCarousel.addEventListener('mouseenter', () => { hovered = true; updatePlayback(); });
  practiceCarousel.addEventListener('mouseleave', () => { hovered = false; updatePlayback(); });
  practiceCarousel.addEventListener('focusin', event => {
    if (event.target !== pauseButton) { paused = true; updatePlayback(); }
  });
  practiceCarousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      navigate(activeSlide + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) paused = true;
    updatePlayback();
  });
  document.addEventListener('visibilitychange', updatePlayback);
  practiceCarousel.querySelector('.carousel-controls').hidden = false;
  practiceCarousel.classList.add('demo-enabled');
  showSlide(0);
  updatePlayback();
}

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
