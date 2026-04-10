// ===== Scroll to top on load =====
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ===== Loading Screen =====
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';

  const loader = document.querySelector('.loader');
  const progress = document.querySelector('.loader-progress');
  let p = 0;
  const interval = setInterval(() => {
    p += Math.random() * 15;
    if (p >= 100) {
      p = 100;
      clearInterval(interval);
      setTimeout(() => {
        window.scrollTo(0, 0);
        loader.classList.add('loaded');
        document.body.style.overflow = '';
        initAnimations();
      }, 300);
    }
    if (progress) progress.textContent = Math.round(p) + '%';
  }, 80);

  setTimeout(() => {
    if (!document.querySelector('.loader')?.classList.contains('loaded')) {
      clearInterval(interval);
      const loader = document.querySelector('.loader');
      if (loader) loader.classList.add('loaded');
      document.body.style.overflow = '';
      initAnimations();
    }
  }, 5000);
});

// ===== Header scroll behavior =====
(() => {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScrollY = 0;
  const threshold = 50;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const vh = window.innerHeight;

    header.classList.toggle('scrolled', currentY > vh / 4);

    if (currentY > vh) {
      if (currentY - lastScrollY > threshold) {
        header.classList.add('hidden-header');
      } else if (lastScrollY - currentY > threshold) {
        header.classList.remove('hidden-header');
      }
    } else {
      header.classList.remove('hidden-header');
    }

    if (Math.abs(currentY - lastScrollY) > threshold) {
      lastScrollY = currentY;
    }
  }, { passive: true });
})();

// ===== Mobile menu =====
(() => {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', menu.classList.contains('open'));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// ===== Industry hover =====
(() => {
  const items = document.querySelectorAll('.industry-item');
  const isMobile = () => window.innerWidth < 768;

  if (isMobile() && items.length) {
    items[0].classList.add('active');
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });

    item.addEventListener('mouseleave', () => {
      if (isMobile()) return;
      item.classList.remove('active');
    });

    item.addEventListener('click', () => {
      if (!isMobile()) return;
      const wasActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
})();

// ===== Portfolio slider =====
(() => {
  const slider = document.querySelector('.portfolio-slider');
  const slides = document.querySelectorAll('.portfolio-slide');
  const prevBtn = document.querySelector('.portfolio-prev');
  const nextBtn = document.querySelector('.portfolio-next');
  const counter = document.querySelector('.portfolio-counter');
  if (!slider || !slides.length) return;

  let current = Math.floor(slides.length / 2);

  function updateSlider() {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === current);
    });
    slides[current].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    if (counter) counter.textContent = String(current + 1).padStart(2, '0');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { if (current > 0) { current--; updateSlider(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => { if (current < slides.length - 1) { current++; updateSlider(); } });

  slides.forEach((s, i) => {
    s.addEventListener('click', () => { current = i; updateSlider(); });
  });

  updateSlider();
})();

// ===== Contact modal =====
(() => {
  const modal = document.querySelector('.modal-overlay');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  const openBtns = document.querySelectorAll('[data-open-contact]');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

// ===== Scroll reveal =====
function initAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

// ===== Team cards hover (desktop) =====
(() => {
  const cards = document.querySelectorAll('.team-card');
  const nameEl = document.querySelector('.team-active-name');
  const bioEl = document.querySelector('.team-active-bio');
  const roleEl = document.querySelector('.team-active-role');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (nameEl) nameEl.textContent = card.dataset.name || '';
      if (bioEl) bioEl.textContent = card.dataset.bio || '';
      if (roleEl) roleEl.textContent = card.dataset.role || '';
    });
  });

  // Set first card data by default
  if (cards.length && nameEl) {
    nameEl.textContent = cards[0].dataset.name || '';
    if (bioEl) bioEl.textContent = cards[0].dataset.bio || '';
    if (roleEl) roleEl.textContent = cards[0].dataset.role || '';
  }
})();

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#contact') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    // Toggle current
    if (!isOpen) item.classList.add('open');
  });
});

// ===== Developer Experience Tabs =====
document.querySelectorAll('.dev-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    // Update tabs
    document.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // Update code blocks
    document.querySelectorAll('.dev-code').forEach(code => {
      code.classList.toggle('active', code.dataset.tab === target);
    });
  });
});

// ===== Contact Form — fetch POST to /api/v1/contact =====
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('contact-status');
  const submitBtn = document.getElementById('contact-submit');

  const showStatus = (msg, isError) => {
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    statusEl.className = `contact-status contact-status--${isError ? 'error' : 'success'}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = form.querySelector('#firstName').value.trim();
    const lastName  = form.querySelector('#lastName').value.trim();
    const email     = form.querySelector('#email').value.trim();
    const company   = form.querySelector('#company').value.trim();
    const gpuRadio  = form.querySelector('input[name="gpu"]:checked');
    const message   = form.querySelector('#message').value.trim();

    const payload = {
      name:     `${firstName} ${lastName}`.trim(),
      email,
      company:  company || null,
      gpu_type: gpuRadio ? gpuRadio.value : null,
      message:  message  || null,
    };

    submitBtn.disabled = true;
    statusEl.style.display = 'none';

    try {
      const res = await fetch('/api/v1/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const lang = document.documentElement.lang || 'en';
      if (res.ok) {
        showStatus(lang === 'ru'
          ? 'Спасибо! Мы свяжемся с вами в ближайшее время.'
          : 'Thank you! We will contact you soon.', false);
        form.reset();
        form.querySelectorAll('.form-radio').forEach(r => r.classList.remove('selected'));
      } else {
        const data = await res.json().catch(() => ({}));
        showStatus(data.detail || (lang === 'ru'
          ? 'Произошла ошибка. Попробуйте снова.'
          : 'Something went wrong. Please try again.'), true);
      }
    } catch {
      showStatus(lang === 'ru'
        ? 'Ошибка сети. Напишите в Telegram для быстрой поддержки.'
        : 'Network error. Please try Telegram for fastest support.', true);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

// ===== /pricing URL scroll redirect =====
(() => {
  const { pathname, hash } = window.location;
  const target = (pathname === '/pricing' || pathname === '/pricing/')
    ? '#packages'
    : (hash === '#pricing' ? '#packages' : null);

  if (!target) return;

  const scrollToPackages = () => {
    const el = document.querySelector(target) || document.querySelector('#packages');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Wait for loader to finish before scrolling
  const loader = document.querySelector('.loader');
  if (loader && !loader.classList.contains('loaded')) {
    loader.addEventListener('transitionend', scrollToPackages, { once: true });
  } else {
    scrollToPackages();
  }
})();

// ===== Social Proof Counter Animation =====
const counters = document.querySelectorAll('.sp-number[data-target]');
if (counters.length) {
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target);
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(animateCounter);
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const spSection = document.querySelector('.social-proof');
  if (spSection) counterObserver.observe(spSection);
}
