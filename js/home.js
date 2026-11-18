/* Home page journey: intro curtain, hero, and the scroll scenes for each section */
(() => {
  const { $, $$, pad, REV } = VK;

  /* ---------- 360° wheel (also used by the no-animation fallback) ---------- */
  const wheelFills = buildWheel();
  const areaItems = $$('.area-list li');
  const wheelCount = $('.wheel-count');
  const areaNum = $('.area-current b');
  const areaText = $('.area-current span');
  let lastArea = -1;
  const setWheel = (p) => {
    const v = p * 10;
    wheelFills.forEach((f, i) => {
      const k = Math.min(1, Math.max(0, v - i));
      f.style.strokeDashoffset = f._len * (1 - k);
    });
    const n = Math.max(0, Math.min(10, Math.ceil(v - 0.0001)));
    if (n === lastArea) return;
    lastArea = n;
    areaItems.forEach((li, i) => li.classList.toggle('on', i < n));
    wheelCount.textContent = pad(n);
    const k = Math.max(1, n);
    areaNum.textContent = pad(k);
    areaText.textContent = areaItems[k - 1].textContent;
  };

  VK.boot({
    staticFallback: () => setWheel(1),

    // Full intro: only when someone lands directly on the home page
    intro: (tl) => {
      gsap.set('.pre-mark rect', { strokeDasharray: 312 });
      tl.from('.pre-mark rect', { strokeDashoffset: 312, duration: 1.4, ease: 'power2.inOut' }, 0.2)
        .from('.pre-letters', { opacity: 0, scale: 0.85, duration: 0.8 }, 0.9)
        .from('.pre-line', { opacity: 0, y: 14, duration: 0.8 }, 1.2)
        .to('.pre-bar i', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 1.3)
        .to('.preloader-inner', { opacity: 0, y: -30, duration: 0.6, ease: 'power2.in' }, 2.5)
        .to('.preloader', { yPercent: -100, duration: 1.2, ease: 'power4.inOut' }, 2.8)
        .set('.preloader', { display: 'none' }, 4.0);
      return 3.2;
    },

    hero: (tl, t) => {
      const path = $('#journeyPath');
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: 0 });
      const scoreEl = $('.score b');
      const score = { v: 0 };
      scoreEl.textContent = '0';
      tl.from(path, { strokeDashoffset: len, duration: 3, ease: 'power2.inOut' }, t)
        .from('.hero-eyebrow', { opacity: 0, x: -30, duration: 0.9 }, t + 0.3)
        .from($('.hero h1')._words, { yPercent: 120, duration: 1.4, stagger: 0.07, ease: 'power4.out' }, t + 0.4)
        .from('.hero-card', { opacity: 0, y: 60, duration: 1.3 }, t + 1.0)
        .from('.hero-fade', { opacity: 0, y: 30, duration: 1.1, stagger: 0.15 }, t + 1.3)
        .from('.health-list b', { scaleX: 0, duration: 1.6, stagger: 0.1, ease: 'power3.inOut' }, t + 1.6)
        .to(score, { v: 64, duration: 2.4, ease: 'power2.out', onUpdate: () => (scoreEl.textContent = Math.round(score.v)) }, t + 1.6)
        .from('.path-dot', { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.8 }, t + 2.0)
        .from('.scroll-cue', { opacity: 0, duration: 0.8 }, t + 3.0);
    },

    scenes: (c) => {
      const { desk, tall } = c;

      // Hero: dot travels the path and content recedes as you scroll away
      if (window.MotionPathPlugin) {
        gsap.to('.path-dot', {
          motionPath: { path: '#journeyPath', align: '#journeyPath', alignOrigin: [0.5, 0.5], start: 0.06, end: 1 },
          ease: 'none', immediateRender: true,
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
        });
      }
      gsap.to('.hero-grid', {
        y: -80, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      VK.run({
        /* 02 Clarity: scattered needs line up into a plan */
        about: (sec) => {
          if (!tall) {
            gsap.from($$('.caption, .tiles li', sec), {
              opacity: 0, y: 30, duration: 0.8, stagger: 0.08,
              scrollTrigger: { trigger: $('.clarity-stage', sec), start: 'top 85%', toggleActions: REV },
            });
            return;
          }
          c.addClass(sec, 'is-scene');
          const caps = $$('.caption', sec);
          const tiles = $$('.tiles li', sec);
          const nums = $$('.tiles li span', sec);
          // keep the scattered tiles inside the screen on narrow phones
        const k = desk ? 1 : Math.min(0.45, innerWidth / 1100);
          const ky = k * gsap.utils.clamp(0.25, 1, (innerHeight - 600) / 300);
          const scatter = [[-90, -60, -9], [120, 50, 7], [-40, 70, 11], [80, -80, -6], [-130, 30, 8]];
          gsap.set(nums, { opacity: 0 });
          gsap.set('.tiles-line i', { scaleX: 0 });
          tiles.forEach((t, i) => gsap.set(t, { x: scatter[i][0] * k, y: scatter[i][1] * ky, rotation: scatter[i][2], opacity: 0.6 }));
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: sec, start: 'top top', end: '+=260%', pin: true, scrub: 0.8 },
          });
          tiles.forEach((t, i) => tl.to(t, { x: scatter[i][0] * k * 1.5, y: Math.min(0, scatter[i][1]) * ky * 1.4, rotation: scatter[i][2] * 1.4, duration: 2 }, 0));
          VK.captionSteps(tl, caps, [0.8, 2.0, 3.4]);
          tl.to(tiles, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power2.inOut' }, 2.1)
            .to(nums, { opacity: 1, duration: 0.4, stagger: 0.12 }, 2.7)
            .to('.tiles-line i', { scaleX: 1, duration: 0.9 }, 3.0)
            .to({}, { duration: 0.6 }, 4.0);
        },

        /* 03 Services: desktop horizontal track · mobile card deck */
        services: (sec) => {
          const track = $('.services-track', sec);
          const cards = $$('.service-card', track);
          const count = $('.meter-count', sec);
          const fill = $('.meter-fill', sec);
          const real = 10;
          const meter = (p, n) => {
            count.textContent = pad(Math.min(real, Math.round(p * (n - 1)) + 1));
            fill.style.transform = `scaleX(${Math.max(0.1, p)})`;
          };
          if (desk && tall) {
            c.addClass(sec, 'is-pinned');
            const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
            gsap.to(track, {
              x: () => -dist(), ease: 'none',
              scrollTrigger: {
                trigger: sec, start: 'top top', end: () => '+=' + dist(),
                pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
                onUpdate: (s) => meter(s.progress, real),
              },
            });
          } else if (tall) {
            c.addClass(sec, 'is-deck');
            gsap.set(cards.slice(1), { yPercent: 112 });
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: sec, start: 'top top', end: () => '+=' + (cards.length - 1) * innerHeight * 0.55,
                pin: true, scrub: 0.6, invalidateOnRefresh: true,
                onUpdate: (s) => meter(s.progress, cards.length),
              },
            });
            for (let i = 1; i < cards.length; i++) {
              tl.to(cards[i], { yPercent: 0, duration: 1 }, i - 1)
                .to(cards[i - 1], { scale: 0.92, y: -18, opacity: 0.55, duration: 1 }, i - 1);
              if (i > 1) tl.to(cards[i - 2], { opacity: 0, duration: 0.5 }, i - 1);
            }
          } else {
            gsap.from(cards, { opacity: 0, x: 40, stagger: 0.06, duration: 0.8, scrollTrigger: { trigger: track, start: 'top 85%', toggleActions: REV } });
          }
        },

        /* 04 Assessment: wheel fills one area at a time */
        assessment: (sec) => {
          setWheel(0);
          if (tall) {
            if (!desk) c.addClass(sec, 'is-compact');
            ScrollTrigger.create({
              trigger: $('.assess-stage', sec), start: 'center center', end: desk ? '+=1400' : '+=1100',
              pin: true, onUpdate: (s) => setWheel(s.progress),
            });
          } else {
            ScrollTrigger.create({ trigger: $('.assess-stage', sec), start: 'top 75%', end: 'bottom 35%', onUpdate: (s) => setWheel(s.progress) });
          }
        },

        /* 05 Stages: equal cards, a line fills along them and each stage lifts as it is reached */
        clients: (sec) => {
          const stages = $$('.stage', sec);
          const setLit = (p) => stages.forEach((s, i) => s.classList.toggle('active', p >= i / (stages.length - 1) - 0.02));
          c.addClass(sec, 'is-track');
          c.onCleanup(() => stages.forEach((s) => s.classList.remove('active')));
          const prop = desk ? 'scaleX' : 'scaleY';
          gsap.fromTo($('.stage-line i', sec), { [prop]: 0 }, {
            [prop]: 1, ease: 'none',
            scrollTrigger: {
              trigger: $('.stages-wrap', sec), start: desk ? 'top 75%' : 'top 70%', end: desk ? 'top 30%' : 'bottom 60%', scrub: 0.6,
              onUpdate: (s) => setLit(s.progress),
            },
          });
          setLit(0);
        },

        /* 06 Industries: each symbol draws itself in turn, then settles into its badge */
        industries: (sec) => {
          const tiles = $$('.ind', sec);
          const shapes = tiles.map((t) => $$('.ind-icon svg > *', t));
          shapes.flat().forEach((el) => {
            const L = el.getTotalLength();
            gsap.set(el, { strokeDasharray: L, strokeDashoffset: L });
          });
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: $('.ind-grid', sec), start: 'top 82%', end: desk ? 'bottom 75%' : 'bottom 70%', scrub: 0.6,
              onUpdate: (st) => tiles.forEach((t, i) => t.classList.toggle('on', st.progress >= (i + 1) / tiles.length - 0.01)),
            },
          });
          tiles.forEach((t, i) => {
            // Cards stay in place (no sliding) so the grid never overlaps; only their contents animate
            tl.from(t, { opacity: 0.3, duration: 0.5 }, i * 0.5)
              .from($('.ind-icon', t), { scale: 0.7, duration: 0.5, ease: 'back.out(1.6)' }, i * 0.5)
              .to(shapes[i], { strokeDashoffset: 0, duration: 0.7, stagger: 0.12 }, i * 0.5 + 0.1)
              .from($('.ind-name', t), { opacity: 0, y: 8, duration: 0.4 }, i * 0.5 + 0.4);
          });
          c.onCleanup(() => { gsap.set(shapes.flat(), { clearProps: 'all' }); tiles.forEach((t) => t.classList.remove('on')); });
        },

        /* 07 Process: desktop one step at a time · mobile vertical line */
        process: (sec) => {
          const steps = $$('.process li', sec);
          c.onCleanup(() => steps.forEach((li) => li.classList.remove('active', 'current')));
          if (desk && tall) {
            c.addClass(sec, 'is-scene');
            const panel = $('.process-panel', sec);
            const items = steps.map((li) => {
              const d = document.createElement('div');
              d.className = 'panel-item';
              d.innerHTML = `<b>${li.querySelector('span').textContent}</b><div><h3>${li.querySelector('h3').innerHTML}</h3><p>${li.querySelector('p').innerHTML}</p></div>`;
              panel.appendChild(d);
              return d;
            });
            c.onCleanup(() => (panel.innerHTML = ''));
            let cur = -1;
            const setStep = (p) => {
              const k = Math.round(p * (steps.length - 1));
              if (k === cur) return;
              cur = k;
              steps.forEach((li, i) => { li.classList.toggle('active', i <= k); li.classList.toggle('current', i === k); });
              items.forEach((it, i) => it.classList.toggle('on', i === k));
            };
            setStep(0);
            gsap.fromTo($('.process-line i', sec), { scaleX: 0 }, {
              scaleX: 1, ease: 'none',
              scrollTrigger: { trigger: sec, start: 'top top', end: '+=260%', pin: true, scrub: 0.6, onUpdate: (s) => setStep(s.progress) },
            });
          } else {
            const prop = desk ? 'scaleX' : 'scaleY';
            gsap.fromTo($('.process-line i', sec), { [prop]: 0 }, {
              [prop]: 1, ease: 'none',
              scrollTrigger: {
                trigger: $('.process-wrap', sec), start: 'top 70%', end: desk ? 'top 30%' : 'bottom 65%', scrub: true,
                onUpdate: (s) => steps.forEach((li, i) => li.classList.toggle('active', s.progress >= i / (steps.length - 1) - 0.02)),
              },
            });
          }
        },

        /* 08 Specialists: tangled lines → one relationship through VK */
        specialists: (sec) => {
          const tangles = $$('.hub-lines .tangle', sec);
          const straights = $$('.hub-lines .straight', sec);
          const others = $$('.hub-node:not(.n-top) span', sec);
          if (!tall) {
            gsap.from([$('.hub-core', sec), ...others], {
              scale: 0.6, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.6)',
              scrollTrigger: { trigger: $('.hub', sec), start: 'top 80%', toggleActions: REV },
            });
            return;
          }
          c.addClass(sec, 'is-scene');
          const len = (l) => l.getTotalLength();
          tangles.forEach((t) => gsap.set(t, { strokeDasharray: len(t), strokeDashoffset: len(t), opacity: 1 }));
          straights.forEach((l) => gsap.set(l, { strokeDasharray: len(l), strokeDashoffset: len(l) }));
          gsap.set($('.hub-core', sec), { scale: 0.3, autoAlpha: 0 });
          gsap.set($('.hub-orbit', sec), { opacity: 0 });
          gsap.set(others, { scale: 0.6, autoAlpha: 0 });
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: $('.spec-stage', sec), start: 'top top', end: '+=220%', pin: true, scrub: 0.8 },
          });
          tl.to(others, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.25, ease: 'back.out(1.6)' }, 0)
            .to(tangles, { strokeDashoffset: 0, duration: 1, stagger: 0.25 }, 0.3)
            .to(tangles, { opacity: 0, duration: 0.6 }, 2.0)
            .to($('.hub-core', sec), { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)' }, 2.1)
            .to(straights, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15 }, 2.5)
            .to($('.hub-orbit', sec), { opacity: 1, duration: 0.8 }, 2.6)
            .to({}, { duration: 0.6 }, 3.6);
          VK.captionSteps(tl, $$('.caption', sec), [2.0]);
          c.onCleanup(() => gsap.set([...tangles, ...straights], { clearProps: 'all' }));
        },

        /* 10 Founder: portrait unveils, then the cause → effect chain builds */
        founder: (sec) => {
          gsap.timeline({ scrollTrigger: { trigger: $('.founder-photo', sec), start: 'top 75%', toggleActions: REV } })
            .fromTo($('.photo-inner', sec), { clipPath: 'inset(100% 0% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.4, ease: 'power4.inOut' })
            .from($('.photo-inner > *', sec), { scale: 1.25, duration: 1.8, ease: 'power3.out' }, 0)
            .from($('.photo-frame', sec), { x: -24, y: -24, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.4);
          const chain = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: $('.chain', sec), start: 'top 85%', end: 'bottom 50%', scrub: 0.6 } });
          $$('.chain li', sec).forEach((li, i) => {
            chain.from(li.children[0], { autoAlpha: 0, x: -20, duration: 0.5 }, i)
              .from(li.children[1], { scaleX: 0, duration: 0.4 }, i + 0.4)
              .from(li.children[2], { autoAlpha: 0, x: -12, duration: 0.4 }, i + 0.7);
          });
        },

        /* 11 CTA: warm glow expands as you arrive */
        contact: (sec) => {
          gsap.fromTo($('.cta-orb', sec), { scale: 0.4, opacity: 0.3 }, {
            scale: 1.3, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: true },
          });
        },
      }, c);
    },
  });

  function buildWheel() {
    const g = $('.wheel-segs');
    if (!g) return [];
    const ns = 'http://www.w3.org/2000/svg';
    const cx = 200, r = 170, gap = 2.2, fills = [];
    for (let i = 0; i < 10; i++) {
      const a0 = ((i * 36 + gap) * Math.PI) / 180;
      const a1 = (((i + 1) * 36 - gap) * Math.PI) / 180;
      const d = `M ${cx + r * Math.cos(a0)} ${cx + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cx + r * Math.sin(a1)}`;
      ['seg-base', 'seg-fill'].forEach((cls) => {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', d);
        p.setAttribute('class', cls);
        g.appendChild(p);
        if (cls === 'seg-fill') {
          p._len = r * (a1 - a0);
          p.style.strokeDasharray = p._len;
          p.style.strokeDashoffset = p._len;
          fills.push(p);
        }
      });
    }
    return fills;
  }
})();
