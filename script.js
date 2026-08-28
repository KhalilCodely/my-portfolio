function setupNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('primary-navigation');

  if (!menuToggle || !navigation) {
    return;
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      navigation.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const navLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = navLinks.find((item) => item.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

function setupTypedRole() {
  const target = document.getElementById('typed-role');
  if (!target) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const roles = [
    'production web applications',
    '.NET Core APIs',
    'React & Next.js interfaces',
    'cloud-native systems on Azure',
  ];

  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  function tick() {
    const current = roles[roleIndex];

    if (deleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    target.textContent = current.slice(0, charIndex);

    let delay = deleting ? 35 : 55;

    if (!deleting && charIndex === current.length) {
      delay = 1600;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 300;
    }

    window.setTimeout(tick, delay);
  }

  tick();
}

function setupPreloader() {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');

  if (!loader || !fill || !pct) return;

  let progress = 0;
  const tick = window.setInterval(() => {
    progress = Math.min(progress + Math.random() * 18 + 8, 100);
    fill.style.width = `${progress}%`;
    pct.textContent = `${Math.round(progress)}%`;

    if (progress >= 100) {
      window.clearInterval(tick);
      window.setTimeout(() => loader.classList.add('done'), 280);
    }
  }, 120);
}

function animateCounter(node) {
  const target = Number(node.dataset.to || 0);
  const suffix = node.dataset.suffix || '';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    node.textContent = `${target}${suffix}`;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = `${Math.round(target * eased)}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function setupCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((node) => observer.observe(node));
}

function setupCertFlip() {
  const isTouch = window.matchMedia('(hover: none)').matches;
  if (!isTouch) return;

  document.querySelectorAll('.cert-flip').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll('section');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => {
    item.classList.add('reveal-on-scroll');
    revealObserver.observe(item);
  });

  const langFills = document.querySelectorAll('.lang-fill');
  const langObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        window.setTimeout(() => entry.target.classList.add('fill'), i * 120);
        langObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  langFills.forEach((fill) => langObserver.observe(fill));
}

function setupTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (window.matchMedia('(hover: none)').matches) {
    return;
  }

  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach((card) => {
    let frame = null;

    card.addEventListener('mousemove', (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-y * 8).toFixed(2);
        const rotateY = (x * 8).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
        frame = null;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupPreloader();
  setupNavigation();
  setupTypedRole();
  setupScrollReveal();
  setupTiltCards();
  setupCounters();
  setupCertFlip();
});
