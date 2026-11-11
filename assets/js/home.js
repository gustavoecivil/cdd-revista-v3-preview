// Home v2 — interações. Sem dependências. Tudo funciona (estático) sem este arquivo.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // Parede de ferramentas: acende uma vez ao entrar na tela.
  const wall = document.querySelector('[data-tools]');
  if (wall) {
    if (hasIO && !reduce) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { wall.classList.add('is-visible'); io.disconnect(); } }), { threshold: 0.3 });
      io.observe(wall);
    }
  }

  // Cinco destinos do sinal: abas acessíveis (setas do teclado inclusive).
  const dest = document.querySelector('[data-destinos]');
  if (dest) {
    const tabs = [...dest.querySelectorAll('[role="tab"]')];
    const panels = [...dest.querySelectorAll('[role="tabpanel"]')];
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  }

  // Tapioca: o passo no centro da tela define o elo em destaque.
  const tale = document.querySelector('[data-tale]');
  if (tale) {
    const steps = [...tale.querySelectorAll('.tale-step')];
    const dots = [...tale.querySelectorAll('.tale-dots li')];
    const elo = tale.querySelector('[data-tale-elo]');
    const n = tale.querySelector('[data-tale-n]');
    let current = -1;
    const set = (i) => {
      if (i === current) return; current = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k <= i));
      if (elo) { elo.textContent = dots[i] ? dots[i].textContent : ''; elo.classList.toggle('is-q', steps[i].classList.contains('tale-step--q')); }
      if (n) n.textContent = String(i + 1).padStart(2, '0');
    };
    if (hasIO) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach((s) => io.observe(s));
    }
    set(0);
  }

  // Cadeia: linha dourada acompanha o scroll; elos ficam acesos depois de vistos.
  const chain = document.querySelector('[data-chain]');
  if (chain) {
    const fill = chain.querySelector('[data-chain-fill]');
    const elos = [...chain.querySelectorAll('.elo')];
    if (hasIO) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -38% 0px' });
      elos.forEach((el) => io.observe(el));
    } else elos.forEach((el) => el.classList.add('is-seen'));
    if (fill && !reduce) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = chain.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.62 - r.top) / r.height));
        fill.style.setProperty('--p', p.toFixed(3));
      };
      const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();
    }
  }

  // Como você sabe?
  const opts = [...document.querySelectorAll('[data-ask]')];
  const cards = [...document.querySelectorAll('[data-ask-card]')];
  opts.forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.ask);
    opts.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    cards.forEach((c) => {
      const on = Number(c.dataset.askCard) === i;
      c.classList.remove('is-active');
      if (on) { void c.offsetWidth; c.classList.add('is-active'); }
    });
  }));

  // Vídeo-fonte: troca a capa pelo player só quando a pessoa pede (sem cookies, sem peso inicial).
  const box = document.querySelector('[data-yt]');
  const play = (start) => {
    if (!box) return;
    const f = document.createElement('iframe');
    const q = new URLSearchParams({ start: String(start ?? box.dataset.start), autoplay: '1', rel: '0' });
    if (box.dataset.end) q.set('end', box.dataset.end);
    f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?${q}`;
    f.title = box.dataset.title;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.replaceChildren(f);
  };
  if (box) {
    const btn = box.querySelector('.sv-play');
    if (btn) btn.addEventListener('click', () => play());
    // Capítulos e botões "Ouvir este trecho": tocam na própria página, no minuto certo.
    document.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      play(Number(a.dataset.jump));
      box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }));
  }

  // Final: quanto tempo a pessoa passou aqui (um dado real, não uma estatística inventada).
  const timer = document.querySelector('[data-timer]');
  if (timer) {
    const out = timer.querySelector('[data-timer-out]');
    const t0 = performance.now();
    const fmt = () => {
      const s = Math.max(1, Math.round((performance.now() - t0) / 1000));
      const m = Math.floor(s / 60), r = s % 60;
      const ms = m ? `${m} ${m === 1 ? 'minuto' : 'minutos'}` : '';
      const ss = `${r} ${r === 1 ? 'segundo' : 'segundos'}`;
      return m ? (r ? `${ms} e ${ss}` : ms) : ss;
    };
    timer.hidden = false;
    let id = null;
    const tick = () => { out.textContent = fmt(); };
    if (hasIO) {
      new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { tick(); id = id || setInterval(tick, 1000); }
        else if (id) { clearInterval(id); id = null; }
      })).observe(timer);
    } else tick();
  }
})();
