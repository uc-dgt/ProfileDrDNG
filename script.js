  // Nav shadow on scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('shadow', window.scrollY > 8);
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const links = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));

  // Count-up animation for stats bar
  const counters = document.querySelectorAll('[data-count]');
  let counted = false;
  const countObserver = new IntersectionObserver((entries) => {
    if (counted) return;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counted = true;
      counters.forEach(el => {
        const target = parseFloat(el.dataset.count);
        const isDecimal = String(target).includes('.');
        const duration = 1400;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          current = Math.min(increment * step, target);
          el.textContent = isDecimal
            ? current.toFixed(1)
            : Math.round(current).toLocaleString();
          if (step >= steps) clearInterval(timer);
        }, duration / steps);
      });
    });
  }, { threshold: 0.4 });
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) countObserver.observe(statsBar);

  // Professional scroll-reveal for content blocks
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll(
    '.section, .metric-card, .card, .honor-card, .contact-card, .review-item, .pub-item'
  );

  if (!prefersReducedMotion) {
    revealTargets.forEach((el, idx) => {
      el.classList.add('reveal-init');
      el.style.transitionDelay = `${(idx % 5) * 45}ms`;
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  }
