/* Inner pages: each page has its own scroll journey */
(() => {
  const { $, $$, pad, REV } = VK;
  const page = document.body.dataset.page;
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  };
  const dash = (el) => { const L = el.getTotalLength(); gsap.set(el, { strokeDasharray: L, strokeDashoffset: L }); return L; };

  /* =====================================================================
     ABOUT — scattered parts connect: network → converge → spotlight → loop → bridge → growth
     ===================================================================== */
  if (page === 'about') {
    // Hero network (decorative)
    const pts = [[820,180],[960,120],[1110,210],[1260,140],[1370,300],[1190,360],[1020,320],[880,430],[1060,500],[1240,560],[1380,650],[940,650],[1120,750],[820,770]];
    const links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,2],[5,6],[6,1],[6,7],[7,8],[8,5],[8,9],[9,4],[9,10],[8,11],[11,12],[12,9],[11,13],[7,0]];
    const svg = $('.constellation');
    const lines = links.map(([a, b]) => svg.appendChild(svgEl('line', { x1: pts[a][0], y1: pts[a][1], x2: pts[b][0], y2: pts[b][1] })));
    const dots = pts.map(([x, y], i) => svg.appendChild(svgEl('circle', { cx: x, cy: y, r: i === 8 ? 9 : 4.5, class: i === 8 ? 'hub' : '' })));

    // Cycle centre text built from the list
    const cycleItems = $$('.cycle-list li');
    const center = $('.cycle-center');
    cycleItems.forEach((li) => {
      const d = document.createElement('div');
      d.className = 'cc-item';
      d.innerHTML = `<b>${li.querySelector('b').textContent}</b><strong>${li.querySelector('h3').textContent}</strong><small>${li.querySelector('p').textContent}</small>`;
      center.appendChild(d);
    });
    const ccItems = $$('.cc-item', center);
    let cur = -1;
    const setCycle = (k) => {
      if (k === cur) return;
      cur = k;
      cycleItems.forEach((li, i) => li.classList.toggle('on', i === k));
      ccItems.forEach((it, i) => it.classList.toggle('on', i === k));
      $$('.cycle-node').forEach((n, i) => n.classList.toggle('on', i <= k));
    };

    VK.boot({
      staticFallback: () => setCycle(0),
      heroExtra: (tl, t) => {
        lines.forEach(dash);
        tl.from(dots, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.05, ease: 'back.out(2)' }, t + 0.2)
          .to(lines, { strokeDashoffset: 0, duration: 1.2, stagger: 0.05, ease: 'power2.inOut' }, t + 0.5);
      },
      scenes: (c) => {
        const { desk, tall, roomy } = c;
        gsap.to('.constellation', { yPercent: 18, opacity: 0.3, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });

        VK.run({
          // Six moving parts arrange around the business, then the ring closes
          who: (sec) => {
            const parts = $$('.part i', sec);
            const ring = $('.converge-ring circle', sec);
            const L = dash(ring);
            const k = desk ? 1 : 0.5;
            const scatter = [[-210, -50, -14], [170, -150, 10], [250, 80, -8], [-30, 190, 12], [-250, 140, 9], [70, -210, -11]];
            const tl = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: desk && roomy
                ? { trigger: sec, start: 'top top', end: '+=140%', pin: true, scrub: 0.8 }
                : { trigger: $('.converge', sec), start: 'top 85%', end: 'center 45%', scrub: 0.8 },
            });
            tl.from(parts, { x: (i) => scatter[i][0] * k, y: (i) => scatter[i][1] * k, rotation: (i) => scatter[i][2], opacity: 0.35, duration: 1.4, stagger: 0.08, ease: 'power2.inOut' }, 0)
              .fromTo(ring, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.9 }, 1.1)
              .from($('.converge-core', sec), { scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, 1.3)
              .to({}, { duration: 0.3 });
            c.onCleanup(() => gsap.set(ring, { clearProps: 'all' }));
          },

          // A spotlight passes over the ten areas while the side panel stays put
          what: (sec) => {
            const items = $$('.spot-list li', sec);
            const count = $('.what-count b', sec);
            items.forEach((li, i) =>
              ScrollTrigger.create({
                trigger: li, start: 'top 58%', end: 'bottom 58%',
                onToggle: (s) => { li.classList.toggle('on', s.isActive); if (s.isActive) count.textContent = pad(i + 1); },
              })
            );
            c.onCleanup(() => items.forEach((li) => li.classList.remove('on')));
          },

          // Approach: a dot travels the loop Understand → Plan → Execute → Improve
          approach: (sec) => {
            const fill = $('.cycle-fill', sec);
            const dot = $('.cycle-dot', sec);
            const C = 2 * Math.PI * 150;
            fill.style.strokeDasharray = C;
            const upd = (p) => {
              fill.style.strokeDashoffset = C * (1 - p);
              const a = (-90 + 360 * p) * (Math.PI / 180);
              dot.setAttribute('cx', 200 + 150 * Math.cos(a));
              dot.setAttribute('cy', 200 + 150 * Math.sin(a));
              setCycle(Math.min(3, Math.floor(p * 4 + 0.001)));
            };
            upd(0);
            if (tall) c.addClass(sec, 'is-scene');
            ScrollTrigger.create(tall
              ? { trigger: sec, start: 'top top', end: '+=220%', pin: true, scrub: 0.6, onUpdate: (s) => upd(s.progress) }
              : { trigger: $('.cycle', sec), start: 'top 80%', end: 'bottom 30%', scrub: 0.6, onUpdate: (s) => upd(s.progress) });
            c.onCleanup(() => fill.removeAttribute('style'));
          },

          // Bridge: your business → VK → the right specialists
          partner: (sec) => {
            const prop = desk ? 'scaleX' : 'scaleY';
            const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: $('.bridge', sec), start: 'top 82%', end: 'center 45%', scrub: 0.6 } });
            const bl = $$('.b-line i', sec);
            tl.from($('.b-node', sec), { opacity: 0, x: desk ? -30 : 0, y: desk ? 0 : -20, duration: 0.4 })
              .fromTo(bl[0], { [prop]: 0 }, { [prop]: 1, duration: 0.6 })
              .from($('.b-core', sec), { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' })
              .fromTo(bl[1], { [prop]: 0 }, { [prop]: 1, duration: 0.5 })
              .from($('.b-branch', sec), { '--spine': 0, duration: 0.4 })
              .from($$('.b-spec', sec), { opacity: 0, x: desk ? -20 : 0, y: desk ? 0 : 14, duration: 0.5, stagger: 0.15 });
          },

          // Growth bars rise stage by stage
          stages: (sec) => {
            const bars = $$('.grow-bar i', sec);
            gsap.fromTo(bars, { [desk ? 'scaleY' : 'scaleX']: 0 }, {
              [desk ? 'scaleY' : 'scaleX']: 1, ease: 'none', stagger: 0.25,
              scrollTrigger: { trigger: $('.grow', sec), start: 'top 80%', end: 'bottom 60%', scrub: 0.6 },
            });
            gsap.from($$('.grow-col > :not(.grow-bar)', sec), {
              opacity: 0, y: 24, duration: 0.8, stagger: 0.06,
              scrollTrigger: { trigger: $('.grow', sec), start: 'top 75%', toggleActions: REV },
            });
          },

          start: ctaGlow,
        }, c);
      },
    });
  }

  /* =====================================================================
     SERVICES — a catalogue you move through with a live index
     ===================================================================== */
  if (page === 'services') {
    const nav = $('.svc-nav');
    const navLinks = $$('.svc-nav a');
    const setActive = (id) => {
      navLinks.forEach((a) => {
        const on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('on', on);
        if (on && nav.scrollWidth > nav.clientWidth + 4) nav.scrollTo({ left: a.parentElement.offsetLeft - 24, behavior: 'smooth' });
      });
    };

    VK.boot({
      heroExtra: (tl, t) => {
        tl.from('.chip-index a', { opacity: 0, y: 20, scale: 0.9, duration: 0.6, stagger: 0.05 }, t + 0.9);
      },
      scenes: (c) => {
        const { desk } = c;
        VK.run({
          catalogue: (sec) => {
            const arts = $$('.svc', sec);
            arts.forEach((art) => {
              ScrollTrigger.create({ trigger: art, start: 'top 45%', end: 'bottom 45%', onToggle: (s) => s.isActive && setActive(art.id) });
              gsap.from($('.svc-num', art), { xPercent: -25, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: art, start: 'top 80%', toggleActions: REV } });
              gsap.to($('.svc-num', art), { y: -70, ease: 'none', scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: true } });
              gsap.from($$('.svc-intro p, .svc-sub', art), { opacity: 0, y: 26, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: $('.svc-intro', art), start: 'top 88%', toggleActions: REV } });
              gsap.from($$('.svc-items li', art), { opacity: 0, x: -16, duration: 0.5, stagger: 0.04, scrollTrigger: { trigger: $('.svc-items', art), start: 'top 85%', toggleActions: REV } });
              gsap.fromTo($('.svc-gain', art), { clipPath: 'inset(0% 100% 0% 0% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', duration: 1, ease: 'power3.inOut', scrollTrigger: { trigger: $('.svc-gain', art), start: 'top 88%', toggleActions: REV } });
            });
            if (desk) {
              gsap.fromTo('.svc-nav-progress i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $('.svc-list', sec), start: 'top 45%', end: 'bottom 45%', scrub: true } });
            }
            c.onCleanup(() => navLinks.forEach((a) => a.classList.remove('on')));
          },

          // Engagement options start as a stacked deck and fan out
          engage: (sec) => {
            const cards = $$('.engage-card', sec);
            if (desk) {
              gsap.fromTo(cards,
                { xPercent: (i) => (1.5 - i) * 106, rotation: (i) => (i - 1.5) * 6, y: 40 },
                { xPercent: 0, rotation: 0, y: 0, ease: 'power1.inOut', scrollTrigger: { trigger: $('.engage-grid', sec), start: 'top 85%', end: 'top 35%', scrub: 0.8 } });
            } else {
              gsap.from(cards, { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: $('.engage-grid', sec), start: 'top 85%', toggleActions: REV } });
            }
          },

          // Working approach: line fills and each step lights as you reach it
          working: (sec) => {
            gsap.fromTo($('.stepper-line i', sec), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $('.stepper', sec), start: 'top 65%', end: 'bottom 65%', scrub: true } });
            $$('.stepper li', sec).forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 65%', end: 'max', toggleClass: 'on' }));
          },

          talk: ctaGlow,
        }, c);
      },
    });
  }

  /* =====================================================================
     HOW WE WORK — a winding road through five stages
     ===================================================================== */
  if (page === 'how') {
    // Accordion (works without animation too)
    const ways = $$('.way');
    ways.forEach((w) =>
      $('.way-head', w).addEventListener('click', () => {
        const open = !w.classList.contains('open');
        ways.forEach((o) => { o.classList.remove('open'); $('.way-head', o).setAttribute('aria-expanded', 'false'); });
        if (open) { w.classList.add('open'); $('.way-head', w).setAttribute('aria-expanded', 'true'); }
        if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 450);
      })
    );

    // Network lines (static geometry, 6 spokes)
    const netSvg = $('.network-lines');
    const spokes = [-90, -30, 30, 90, 150, 210].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return netSvg.appendChild(svgEl('line', { x1: 200, y1: 200, x2: 200 + 150 * Math.cos(a), y2: 200 + 150 * Math.sin(a) }));
    });

    VK.boot({
      heroExtra: (tl, t) => {
        tl.fromTo('.mini-line i', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, t + 0.8)
          .from('.mini-road a', { opacity: 0, y: 16, duration: 0.5, stagger: 0.18 }, t + 0.9);
      },
      scenes: (c) => {
        const { desk } = c;
        VK.run({
          journey: (sec) => {
            const road = $('.road', sec);
            const base = $('.road-base', sec);
            const fill = $('.road-fill', sec);
            const dot = $('.road-dot', sec);
            const nodes = $$('.road-node', sec);
            let len = 0;
            const build = () => {
              const h = road.offsetHeight;
              const pts = nodes.map((n) => [n.offsetLeft + n.offsetWidth / 2, n.offsetTop + n.offsetHeight / 2]);
              let d = `M ${pts[0][0]} 0`;
              let prev = [pts[0][0], 0];
              pts.concat([[pts[pts.length - 1][0], h]]).forEach(([x, y], i) => {
                const dy = y - prev[1];
                const b = desk ? (i % 2 ? -110 : 110) : 0;
                d += ` C ${prev[0] + b} ${prev[1] + dy * 0.45}, ${x + b} ${y - dy * 0.45}, ${x} ${y}`;
                prev = [x, y];
              });
              base.setAttribute('d', d);
              fill.setAttribute('d', d);
              len = fill.getTotalLength();
              fill.style.strokeDasharray = len;
            };
            build();
            fill.style.strokeDashoffset = len;
            ScrollTrigger.create({
              trigger: road, start: 'top 60%', end: 'bottom 60%', scrub: 0.5,
              onRefreshInit: build,
              onUpdate: (s) => {
                fill.style.strokeDashoffset = len * (1 - s.progress);
                const p = fill.getPointAtLength(len * s.progress);
                dot.setAttribute('cx', p.x);
                dot.setAttribute('cy', p.y);
              },
            });
            $$('.road-stage', sec).forEach((st, i) => {
              const node = $('.road-node', st);
              ScrollTrigger.create({ trigger: node, start: 'center 60%', end: 'max', toggleClass: { targets: [node, st], className: 'on' } });
              gsap.from($('.road-card', st), {
                opacity: 0, x: desk ? (i % 2 ? 60 : -60) : 0, y: desk ? 0 : 30, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: node, start: 'center 70%', toggleActions: REV },
              });
              gsap.from($$('.road-list li', st), { opacity: 0, x: -12, duration: 0.5, stagger: 0.06, scrollTrigger: { trigger: node, start: 'center 60%', toggleActions: REV } });
            });
            c.onCleanup(() => fill.removeAttribute('style'));
          },

          // Network grows from the single point of contact
          delivery: (sec) => {
            const chips = $$('.network-list li span', sec);
            if (desk) {
              spokes.forEach(dash);
              const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: $('.network', sec), start: 'top 78%', end: 'center 45%', scrub: 0.6 } });
              tl.from($('.network-core', sec), { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' })
                .to(spokes, { strokeDashoffset: 0, duration: 0.5, stagger: 0.12 })
                .from(chips, { opacity: 0, scale: 0.7, duration: 0.4, stagger: 0.12, ease: 'back.out(1.6)' }, 0.6);
              c.onCleanup(() => gsap.set(spokes, { clearProps: 'all' }));
            } else {
              gsap.from([$('.network-core', sec), ...chips], { opacity: 0, x: -20, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: $('.network', sec), start: 'top 80%', toggleActions: REV } });
            }
          },

          // Promises tick off, then the belief statement lights word by word
          commitment: (sec) => {
            const checks = $$('.promises path', sec);
            checks.forEach(dash);
            gsap.timeline({ scrollTrigger: { trigger: $('.promises', sec), start: 'top 80%', toggleActions: REV } })
              .from($$('.promises li', sec), { opacity: 0, y: 24, duration: 0.6, stagger: 0.1 })
              .to(checks, { strokeDashoffset: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, 0.25);
            const belief = $('.belief', sec);
            if (!belief._words) belief._words = VK.splitWords(belief);
            gsap.fromTo(belief._words, { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: belief, start: 'top 85%', end: 'center 55%', scrub: true } });
            c.onCleanup(() => gsap.set(checks, { clearProps: 'all' }));
          },

          start: ctaGlow,
        }, c);
      },
    });
  }

  /* =====================================================================
     CONTACT — a conversation: the form builds itself, then confirms
     ===================================================================== */
  if (page === 'contact') {
    const form = $('.enquiry');
    const success = $('.form-success');
    const select = $('#f-service');
    const params = new URLSearchParams(location.search);

    // Arriving from a "Discuss this service" or "Schedule a Consultation" link
    const svc = params.get('service');
    if (svc && select.querySelector(`option[value="${CSS.escape(svc)}"]`)) select.value = svc;
    if (params.get('intent') === 'consultation') $('.form-title').textContent = 'Schedule a Consultation';
    const syncSelect = () => select.closest('.field').classList.toggle('has-value', !!select.value);
    select.addEventListener('change', syncSelect);
    syncSelect();

    const fields = $$('.field', form);
    const check = (field) => {
      const input = $('input, select, textarea', field);
      const ok = input.checkValidity() && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      field.classList.toggle('invalid', !ok);
      return ok;
    };
    fields.forEach((f) => $('input, select, textarea', f).addEventListener('blur', () => f.classList.contains('invalid') && check(f)));

    const shake = (el) => {
      if (window.gsap && VK.motion) gsap.fromTo(el, { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
    };
    const showSuccess = (msg) => {
      form.hidden = true;
      success.hidden = false;
      if (msg) $('.success-msg', success).textContent = msg;
      success.classList.remove('play');
      void success.offsetWidth;
      success.classList.add('play');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    $('.success-reset').addEventListener('click', () => {
      form.reset();
      syncSelect();
      success.hidden = true;
      form.hidden = false;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = $('.form-error', form);
      errBox.hidden = true;
      const bad = fields.filter((f) => !check(f));
      if (bad.length) {
        bad.forEach(shake);
        $('input, select, textarea', bad[0]).focus();
        return;
      }
      if (form.company_site.value) return; // spam trap
      const data = Object.fromEntries(new FormData(form));
      delete data.company_site;
      data.service = select.options[select.selectedIndex].text;
      const btn = $('.btn-submit', form);
      btn.classList.add('sending');
      btn.disabled = true;

      const endpoint = form.dataset.endpoint;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('send failed');
          showSuccess();
        } else {
          // No form service configured yet: open the visitor's email app with the enquiry filled in
          const body = `Name: ${data.name}\nBusiness: ${data.business || '-'}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service}\n\n${data.message}`;
          location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent('Enquiry: ' + data.service)}&body=${encodeURIComponent(body)}`;
          showSuccess("Your email app should now open with your enquiry filled in. Press send there and we'll review your requirements and get in touch to discuss the next steps.");
        }
      } catch (err) {
        errBox.textContent = `Sorry, your enquiry could not be sent. Please email us at ${form.dataset.to}.`;
        errBox.hidden = false;
      } finally {
        btn.classList.remove('sending');
        btn.disabled = false;
      }
    });

    VK.boot({
      heroExtra: (tl, t) => {
        tl.from('.talk-bubbles span', { scale: 0, opacity: 0, transformOrigin: '0% 100%', duration: 0.7, stagger: 0.2, ease: 'back.out(1.8)' }, t + 0.5);
      },
      scenes: (c) => {
        VK.run({
          enquiry: (sec) => {
            gsap.from($$('.field, .btn-submit, .form-hint', sec), {
              opacity: 0, y: 28, duration: 0.7, stagger: 0.07, ease: 'power3.out',
              scrollTrigger: { trigger: $('.form-card', sec), start: 'top 85%', toggleActions: REV },
            });
            gsap.from($('.form-card', sec), { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: $('.form-card', sec), start: 'top 92%', toggleActions: REV } });
            gsap.to('.talk-bubbles', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
          },
        }, c);
      },
    });
  }

  function ctaGlow(sec) {
    const orb = $('.cta-orb', sec);
    if (!orb) return;
    gsap.fromTo(orb, { scale: 0.4, opacity: 0.3 }, { scale: 1.3, opacity: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'center center', scrub: true } });
  }
})();
