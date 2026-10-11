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

const enquiryForm = document.querySelector('#interest-form');
if (enquiryForm) {
  const plan = new URLSearchParams(window.location.search).get('plan');
  const planSelect = enquiryForm.elements.namedItem('plan');
  if (['lite', 'go', 'general', 'support'].includes(plan)) planSelect.value = plan;
  const status = document.querySelector('#form-status');
  const submitButton = enquiryForm.querySelector('button[type="submit"]');
  let sending = false;
  enquiryForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !enquiryForm.reportValidity()) return;
    sending = true;
    submitButton.disabled = true;
    enquiryForm.setAttribute('aria-busy', 'true');
    status.className = '';
    status.textContent = 'Sending your enquiry…';
    const request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 20000);
    try {
      const response = await fetch(enquiryForm.action, {
        method: 'POST',
        body: new FormData(enquiryForm),
        headers: { Accept: 'application/json' },
        signal: request.signal
      });
      if (!response.ok) throw new Error('Enquiry submission failed');
      status.className = 'success';
      status.textContent = 'Thank you! Your enquiry has been sent. We will reply by email about your question or licence purchase. This is an enquiry, not a completed purchase.';
      enquiryForm.reset();
    } catch (error) {
      status.className = 'error';
      status.textContent = error.name === 'AbortError'
        ? 'The request timed out. Delivery could not be confirmed. Your details are still here; please try again later.'
        : 'Your enquiry could not be confirmed. Your details are still here. Check your connection and try again.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      submitButton.disabled = false;
      enquiryForm.removeAttribute('aria-busy');
    }
  });
}

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
