(async function () {
  const sections = [
    'sections/nav.html',
    'sections/hero.html',
    'sections/intro.html',
    'sections/protocol.html',
    'sections/science.html',
    'sections/unbox.html',
    'sections/about.html',
    'sections/testimonials.html',
    'sections/order.html',
    'sections/footer.html',
  ];

  const html = await Promise.all(sections.map(url => fetch(url).then(r => r.text())));
  document.body.insertAdjacentHTML('afterbegin', html.join('\n'));

  initNav();
  initProtocol();
  initVideo();
  initUnbox();
  initTestimonials();
  initOrder();
})();

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });
}

function initProtocol() {
  const days = document.querySelectorAll('.day[data-day]');
  const visuals = document.querySelectorAll('.day-visual[data-day]');
  const pips = document.querySelectorAll('.progress-pip[data-pip]');

  if (!days.length) return;

  let current = null;

  function activate(n) {
    if (n === current) return;
    current = n;
    days.forEach(d => d.classList.toggle('is-active', d.dataset.day === n));
    visuals.forEach(v => v.classList.toggle('is-active', v.dataset.day === n));
    pips.forEach(p => p.classList.toggle('is-active', p.dataset.pip === n));
  }

  function updateActive() {
    const target = window.innerHeight * 0.38;
    let best = null, bestDist = Infinity;
    days.forEach(d => {
      const r = d.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height / 2) - target);
      if (dist < bestDist) { bestDist = dist; best = d.dataset.day; }
    });
    if (best) activate(best);
  }

  activate('1');
  window.addEventListener('scroll', updateActive, { passive: true });
}

function initUnbox() {
  const stickySec = document.querySelector('.unbox-scenes');
  const imgs      = document.querySelectorAll('.unbox-img');
  const contents  = document.querySelectorAll('.unbox-content');
  const counterEl = document.querySelector('.unbox-counter-current');

  if (!stickySec || !imgs.length) return;

  const TOTAL = imgs.length; // 6

  // Stack images in order — each sits on top of the previous
  imgs.forEach((img, i) => { img.style.zIndex = i + 1; });

  let activeContent = -1;

  function setContent(n) {
    if (n === activeContent) return;
    activeContent = n;
    contents.forEach((c, i) => c.classList.toggle('is-active', i === n));
    if (counterEl) counterEl.textContent = String(n + 1).padStart(2, '0');
  }

  function update() {
    const rect     = stickySec.getBoundingClientRect();
    const scrolled = -rect.top;

    // Above the section — show first image, hide the rest
    if (scrolled <= 0) {
      imgs.forEach((img, i) => {
        img.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
      });
      setContent(0);
      return;
    }

    const scrollable = stickySec.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    // progress 0→1 maps across TOTAL-1 transitions (5 for 6 images)
    const progress = Math.min(scrolled / scrollable, 1);
    const raw      = progress * (TOTAL - 1); // 0 to 5
    const scene    = Math.floor(raw);        // which image is fully visible
    const within   = raw - scene;            // 0→1: how far into the next reveal

    imgs.forEach((img, i) => {
      if (i <= scene) {
        // Already revealed — sit at top, covered by images above
        img.style.transform = 'translateY(0)';
      } else if (i === scene + 1) {
        // The next image sliding up in real time
        img.style.transform = `translateY(${(1 - within) * 100}%)`;
      } else {
        // Future images — waiting below
        img.style.transform = 'translateY(100%)';
      }
    });

    // Switch content label when the incoming image is more than halfway up
    const contentIdx = (within >= 0.5 && scene < TOTAL - 1) ? scene + 1 : scene;
    setContent(contentIdx);
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initVideo() {
  const vid = document.querySelector('.hero-video');
  if (!vid) return;
  vid.playbackRate = 0.5;
  vid.play().catch(() => {
    // Autoplay blocked — video stays on poster frame, that's fine
  });
}

function initOrder() {
  const form    = document.getElementById('orderForm');
  const success = document.querySelector('.order-success');
  if (!form) return;

  function setError(input, message) {
    const field = input.closest('.order-field');
    field.classList.add('order-field--error');
    let msg = field.querySelector('.order-error');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'order-error';
      field.appendChild(msg);
    }
    msg.textContent = message;
  }

  function clearError(input) {
    const field = input.closest('.order-field');
    field.classList.remove('order-field--error');
    const msg = field.querySelector('.order-error');
    if (msg) msg.textContent = '';
  }

  function validate() {
    let valid = true;
    const name    = form.querySelector('#orderName');
    const email   = form.querySelector('#orderEmail');
    const phone   = form.querySelector('#orderPhone');
    const date    = form.querySelector('#orderDate');
    const address = form.querySelector('#orderAddress');

    if (!name.value.trim()) {
      setError(name, 'Please enter your full name.');
      valid = false;
    }
    if (!email.value.trim()) {
      setError(email, 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (!phone.value.trim()) {
      setError(phone, 'Please enter your phone number.');
      valid = false;
    }
    if (!date.value) {
      setError(date, 'Please select your preferred start date.');
      valid = false;
    }
    if (!address.value.trim()) {
      setError(address, 'Please enter your delivery address.');
      valid = false;
    }

    return valid;
  }

  // Clear error as user corrects a field
  form.querySelectorAll('.order-input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // When Stripe is integrated: redirect to Stripe Checkout here instead
  });
}

function initTestimonials() {
  const slides = document.querySelectorAll('.testi-slide');
  const dots   = document.querySelectorAll('.testi-dot');
  const bgNum  = document.querySelector('.testi-bg-number');

  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = n;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    if (bgNum) bgNum.textContent = String(current + 1);
  }

  function startTimer() {
    timer = setInterval(() => goTo((current + 1) % slides.length), 5500);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });

  startTimer();
}
