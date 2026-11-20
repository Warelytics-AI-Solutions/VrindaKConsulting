/* Vrinda K Consulting — shared site engine
   Page transitions, navigation, smooth scroll, reveals, chapter rail/pill.
   Each page script calls VK.boot({...}) with its own hero intro and scenes. */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, '0');

  // Site pages (links to these are handled in-site)
  const PAGES = {
    'index.html': ['01', 'Home'],
    'about.html': ['02', 'About'],
    'services.html': ['03', 'Services'],
    'how-we-work.html': ['04', 'How We Work'],
    'contact.html': ['05', 'Contact'],
  };
  const fileOf = (u) => decodeURIComponent(u.pathname.split('/').pop()) || 'index.html';
  const here = fileOf(location);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = !!(window.gsap && window.ScrollTrigger) && !reduce;
  const REV = 'play none none reverse';
  const VK = (window.VK = { root, $, $$, pad, REV, motion, lenis: null, here });

  /* ---------- Basics ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  const header = $('.site-header');
  const toggle = $('.nav-toggle');
  const nav = $('#site-nav');
  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  };
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  VK.scrollTo = (target) => {
    if (VK.lenis) return VK.lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -80, duration: 1.4, force: true });
    if (typeof target === 'number') scrollTo({ top: target, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---------- Page navigation (no transition screen) ---------- */
  // The flag tells Home to skip its intro when the visitor arrives from another page
  const leave = (href) => {
    try { sessionStorage.setItem('vk-nav', '1'); } catch (e) {}
    location.href = href;
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download') || /^(mailto:|tel:)/i.test(a.getAttribute('href'))) return;
    const url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;
    const file = fileOf(url);
    if (!PAGES[file]) return;
    e.preventDefault();
    closeNav();
    if (file === here && url.search === location.search) {
      const el = url.hash.length > 1 && $(url.hash);
      VK.scrollTo(el || 0);
      return;
    }
    leave(url.href);
  });

  /* ---------- Helpers shared by page scripts ---------- */
  VK.splitWords = (el) => {
    const nodes = [...el.childNodes];
    el.textContent = '';
    const add = (parent, text) =>
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return parent.appendChild(document.createTextNode(' '));
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.textContent = part;
        outer.appendChild(inner);
        parent.appendChild(outer);
      });
    nodes.forEach((n) => {
      if (n.nodeType === 3) add(el, n.textContent);
      else if (n.nodeType === 1) {
        const clone = n.cloneNode(false);
        add(clone, n.textContent);
        el.appendChild(clone);
      }
    });
    return $$('.w > span', el);
  };

  // Reveals that replay in reverse when scrolling back up
  VK.reveals = (section) => {
    $$('h2.split', section).forEach((h) =>
      h._words && gsap.from(h._words, {
        yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.04,
        scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: REV },
      })
    );
    $$('[data-reveal]', section).forEach((el) =>
      gsap.from(el, {
        opacity: 0, y: 36, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: REV },
      })
    );
    $$('[data-stagger]', section).forEach((group) =>
      gsap.from(group.children, {
        opacity: 0, y: 44, duration: 0.9, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: REV },
      })
    );
  };

  // Crossfade a stack of captions inside a scrubbed timeline
  VK.captionSteps = (tl, caps, times) => {
    gsap.set(caps.slice(1), { autoAlpha: 0, y: 28 });
    times.forEach((t, i) => {
      tl.to(caps[i], { autoAlpha: 0, y: -28, duration: 0.4, ease: 'power1.in' }, t)
        .to(caps[i + 1], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power1.out' }, t + 0.35);
    });
  };

  // Run reveals + per-section scenes in document order (keeps pin spacing correct)
  VK.run = (handlers, c) =>
    $$('main > section').forEach((sec) => {
      VK.reveals(sec);
      if (handlers[sec.id]) handlers[sec.id](sec, c);
    });

  const heroDefault = (tl, t) => {
    const hero = $('.page-hero');
    if (!hero) return;
    const h1 = $('h1', hero);
    tl.from($('.eyebrow', hero), { opacity: 0, x: -30, duration: 0.9 }, t)
      .from(h1._words || h1, { yPercent: 120, duration: 1.3, stagger: 0.06, ease: 'power4.out' }, t + 0.1)
      .from($$('[data-hero]', hero), { opacity: 0, y: 30, duration: 1, stagger: 0.12 }, t + 0.6);
  };

  /* ---------- Boot ---------- */
  VK.boot = (opts = {}) => {
    if (!motion) {
      root.classList.remove('js', 'nav-in', 'skip-intro');
      root.classList.add('static');
      if (opts.staticFallback) opts.staticFallback();
      const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 40);
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis) {
      const l = new Lenis({ lerp: 0.085, smoothWheel: true });
      l.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => l.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      VK.lenis = l;
    }
    const L = VK.lenis;
    $$('h1.split, h2.split').forEach((h) => (h._words = VK.splitWords(h)));

    // How did the visitor arrive? Internal link → no intro. Direct visit to Home → full intro.
    const arrived = root.classList.contains('nav-in');
    try { sessionStorage.removeItem('vk-nav'); } catch (e) {}
    const hash = location.hash.length > 1 ? location.hash : '';
    const full = !!opts.intro && !arrived && !hash;

    scrollTo(0, 0);
    if (L) { L.scrollTo(0, { immediate: true, force: true }); L.stop(); }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    let t0 = 0.1;
    if (full) {
      t0 = opts.intro(tl);
    } else {
      const pre = $('.preloader');
      if (pre) pre.style.display = 'none';
    }
    root.classList.remove('nav-in', 'skip-intro');
    tl.add(() => L && L.start(), full ? t0 + 0.8 : t0);
    (opts.hero || heroDefault)(tl, t0);
    if (opts.heroExtra) opts.heroExtra(tl, t0);

    if (full) {
      const skip = () => { if (tl.isActive()) tl.timeScale(5); };
      const evs = ['wheel', 'touchstart', 'keydown', 'mousedown'];
      evs.forEach((ev) => addEventListener(ev, skip, { passive: true }));
      tl.eventCallback('onComplete', () => evs.forEach((ev) => removeEventListener(ev, skip)));
    }

    // Scenes for every breakpoint, rebuilt automatically when the layout changes
    gsap.matchMedia().add(
      { desk: '(min-width: 1081px)', mob: '(max-width: 1080px)', tall: '(min-height: 620px)', roomy: '(min-height: 760px)' },
      (ctx) => {
        const cleanups = [];
        const c = {
          ...ctx.conditions,
          addClass: (el, cls) => { el.classList.add(cls); cleanups.push(() => el.classList.remove(cls)); },
          onCleanup: (fn) => cleanups.push(fn),
        };
        if (opts.scenes) opts.scenes(c);
        return () => cleanups.forEach((fn) => fn());
      }
    );

    globals();
    magnetic();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh());

    if (hash) {
      tl.add(() => {
        const el = $(hash);
        if (!el) return;
        ScrollTrigger.refresh();
        requestAnimationFrame(() => VK.scrollTo(el));
      }, t0 + 0.05);
    }
  };

  // Header state, progress bar, chapter rail (desktop) and chapter pill (mobile)
  function globals() {
    const setProgress = gsap.quickSetter('.progress-bar', 'scaleX');
    const setRail = gsap.quickSetter('.rail-fill', 'scaleY');
    const pill = $('.chapter-pill');
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('scrolled', y > 40);
        const hide = self.direction === 1 && y > 500 && !(nav && nav.classList.contains('open'));
        header.classList.toggle('hidden', hide);
        root.classList.toggle('hdr-hidden', hide);
        if (pill) pill.classList.toggle('show', y > innerHeight * 0.6);
        setProgress(self.progress);
        setRail(self.progress);
      },
    });

    const rail = $('.journey-rail');
    if (!rail) return;
    const railNum = $('.rail-num');
    const railName = $('.rail-name');
    const pillNum = pill && $('b', pill);
    const pillName = pill && $('span', pill);
    $$('[data-chapter]').forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onToggle: (s) => {
          if (!s.isActive) return;
          railNum.textContent = pad(i + 1);
          railName.textContent = sec.dataset.chapter;
          if (pill) { pillNum.textContent = pad(i + 1); pillName.textContent = sec.dataset.chapter; }
          rail.classList.toggle('on-dark', sec.classList.contains('tone-dark'));
          gsap.fromTo([railNum, railName, pillName].filter(Boolean), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, overwrite: true });
        },
      });
    });
  }

  function magnetic() {
    if (!matchMedia('(pointer: fine)').matches) return;
    $$('.btn').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }
})();
