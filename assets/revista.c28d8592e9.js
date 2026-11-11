// Revista Cultura Data-Driven — interações (sem dependências)
(() => {
  const doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  // Menu móvel
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    const close = () => { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      if (open) nav.querySelector('a')?.focus();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); btn.focus(); } });
    matchMedia('(min-width: 1081px)').addEventListener('change', close);
  }

  // Vídeos do YouTube carregados só após o clique (privacidade e desempenho)
  document.querySelectorAll('.video[data-yt]').forEach(box => {
    const trigger = box.querySelector('a');
    if (!trigger) return;
    trigger.addEventListener('click', e => {
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0${box.dataset.start ? '&start=' + box.dataset.start : ''}`;
      f.title = box.dataset.title || 'YouTube';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      box.replaceChildren(f);
      f.focus();
    });
  });

  // Copiar link
  document.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', async () => {
      const done = b.dataset.done || 'OK';
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = done; }
      catch { window.prompt('', b.dataset.copy); }
    });
  });

  // Revelação suave ao rolar
  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));

  // Laboratório: paradoxo dos aniversários
  const range = document.getElementById('people-range');
  if (range) {
    const out = document.getElementById('people-output');
    const prob = document.getElementById('prob-output');
    const pairs = document.getElementById('pairs-output');
    const dots = document.getElementById('birthday-dots');
    const fmt = new Intl.NumberFormat(doc.lang, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const intf = new Intl.NumberFormat(doc.lang);
    const update = () => {
      const n = Number(range.value);
      let p = 1;
      for (let i = 0; i < n; i++) p *= (365 - i) / 365;
      out.textContent = n;
      prob.textContent = fmt.format(1 - p);
      pairs.textContent = intf.format(n * (n - 1) / 2);
      dots.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const d = document.createElement('i');
        if (i < Math.round(n * (1 - p))) d.className = 'hit';
        return d;
      }));
    };
    range.addEventListener('input', update);
    update();
  }

  // Exercício de storytelling
  document.querySelectorAll('.quiz').forEach(q => {
    const answer = document.getElementById(q.dataset.answer);
    q.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      q.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      answer.textContent = b.dataset.explain;
    }));
  });

  // Formulário comercial: compõe um e-mail no aplicativo do visitante (nada é enviado pelo site)
  const form = document.getElementById('form-anuncie');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(f => {
        const valid = f.type === 'email' ? /.+@.+\..+/.test(f.value) : f.value.trim() !== '';
        f.setAttribute('aria-invalid', String(!valid));
        const err = document.getElementById(f.id + '-err');
        if (err) err.hidden = valid;
        if (!valid && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      const data = new FormData(form);
      const lines = [];
      for (const [k, v] of data.entries()) {
        if (k === 'bot-field' || !String(v).trim()) continue;
        const label = form.querySelector(`[name="${k}"]`)?.dataset.label || k;
        lines.push(`${label}: ${v}`);
      }
      const subject = `${form.dataset.subject} — ${data.get('empresa')}`;
      const href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      document.getElementById('form-status').textContent = form.dataset.sent;
      window.location.href = href;
    });
  }
})();
