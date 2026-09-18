/* Theme, nav, reveal, filters, counters, background motion. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var set = document.documentElement.getAttribute('data-theme');
      var now = set || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = now === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var targets = document.querySelectorAll('.reveal');
  if (targets.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
      targets.forEach(function (el) { io.observe(el); });

      // Safety net: content must never be left invisible because an observer
      // callback did not arrive (deep links, restored scroll, odd viewports).
      setTimeout(function () {
        targets.forEach(function (el) { el.classList.add('is-visible'); });
      }, 2500);
    }
  }
  function revealNow(root) {
    (root || document).querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Counting stat tiles ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (reduceMotion) { el.textContent = target; return; }
      var t0 = null, dur = 1100;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------- Project filters ---------- */
  var bar = document.querySelector('[data-filter-bar]');
  if (bar) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-tags]'));
    var countEl = document.querySelector('[data-filter-count]');
    // Reused by the experience page, which counts roles and has no "All" button.
    var noun = bar.getAttribute('data-filter-noun') || 'projects';
    var fallback = bar.getAttribute('data-filter-default') || 'all';

    function apply(tag, force) {
      var shown = 0;
      items.forEach(function (item) {
        var tags = (item.getAttribute('data-tags') || '').split(/\s+/);
        var match = tag === 'all' || tags.indexOf(tag) !== -1;
        item.hidden = !match;
        if (match) {
          shown++;
          // A card hidden at load never intersected, so it would fade in from
          // nothing on the click that reveals it. Show it outright instead.
          if (force) { item.classList.add('is-visible'); revealNow(item); }
        }
      });
      if (countEl) {
        countEl.textContent = shown === items.length
          ? items.length + ' ' + noun
          : shown + ' of ' + items.length;
      }
    }

    function select(tag, push) {
      var buttons = bar.querySelectorAll('[data-filter]');
      var found = false;
      buttons.forEach(function (b) { if (b.getAttribute('data-filter') === tag) found = true; });
      if (!found) tag = fallback;
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === tag;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply(tag, push);
      if (push) {
        history.replaceState(null, '', tag === fallback
          ? window.location.pathname
          : window.location.pathname + '?filter=' + encodeURIComponent(tag));
      }
    }

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (btn) select(btn.getAttribute('data-filter'), true);
    });

    select(new URLSearchParams(window.location.search).get('filter') || fallback, false);
  }

  /* ---------- Deep links ---------- */
  function openHashTarget() {
    if (!window.location.hash) return;
    var el;
    try { el = document.querySelector(window.location.hash); } catch (e) { return; }
    if (!el) return;
    if (el.hidden) {
      var tags = (el.getAttribute('data-tags') || '').split(/\s+/);
      var btn = document.querySelector('[data-filter="all"]');
      for (var i = 0; i < tags.length && !btn; i++) {
        btn = document.querySelector('[data-filter="' + tags[i] + '"]');
      }
      if (btn) btn.click();
    }
    var d = el.querySelector('details');
    if (d) d.open = true;
    // Jumping straight to a section must not land on not-yet-revealed content.
    revealNow(el);
    revealNow(el.closest('section') || document);
    // Instant, not smooth: landing on a deep link should not animate.
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  window.addEventListener('hashchange', openHashTarget);
  if (window.location.hash) window.requestAnimationFrame(openHashTarget);

  /* ---------- Drifting pollen / data motes ---------- */
  function seedMotes() {
    var host = document.querySelector('[data-motes]');
    if (!host || reduceMotion) return;
    var kinds = ['', 'leaf', 'circuit'];
    var n = window.innerWidth < 700 ? 9 : 20;
    for (var i = 0; i < n; i++) {
      var m = document.createElement('span');
      m.className = 'mote ' + kinds[i % kinds.length];
      m.style.left = (Math.random() * 100) + '%';
      m.style.top = (Math.random() * 100) + '%';
      host.appendChild(m);
      if (window.gsap) {
        window.gsap.to(m, {
          y: -(120 + Math.random() * 260),
          x: (Math.random() - 0.5) * 140,
          opacity: 0,
          duration: 9 + Math.random() * 11,
          repeat: -1,
          delay: Math.random() * 8,
          ease: 'none',
          onRepeat: function () {
            var el = this.targets()[0];
            el.style.left = (Math.random() * 100) + '%';
            el.style.top = (70 + Math.random() * 30) + '%';
          }
        });
      }
    }
  }

  /* ---------- Robotics backdrop layout ----------
     Two edge columns, each stacked with a real gap measured from the elements
     themselves, so no two pieces of line art can ever sit on top of each other.
     Anything that will not fit the viewport is hidden rather than squeezed in. */
  function layoutRobots() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.robotics-3d-element'));
    if (!els.length) return;

    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var pad = 14;      // breathing room top and bottom
    var gap = 26;      // clears the +/-8px float with room to spare
    var bleed = 0.22;  // let each piece hang this far off the edge

    els.forEach(function (el) {
      el.style.display = '';
      if (!el.dataset.baseW) {
        el.dataset.baseW = el.offsetWidth;
        el.dataset.baseH = el.offsetHeight;
      }
    });

    // Shrink the line art on shorter viewports so more of it still fits.
    var scale = Math.min(1, Math.max(0.6, vh / 1050));

    // Alternate into a left and a right column, tallest handled first so the
    // big pieces get the space they need.
    var measured = els.map(function (el) {
      var w = Math.round(el.dataset.baseW * scale);
      var h = Math.round(el.dataset.baseH * scale);
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      return { el: el, w: w, h: h };
    }).sort(function (a, b) { return b.h - a.h; });

    var columns = [[], []];
    measured.forEach(function (item, i) { columns[i % 2].push(item); });

    function stackHeight(list) {
      var total = 0;
      list.forEach(function (it) { total += it.h; });
      return total + Math.max(0, list.length - 1) * gap;
    }

    columns.forEach(function (column, side) {
      var fits = column.slice();
      while (fits.length && stackHeight(fits) > vh - pad * 2) fits.pop();

      column.slice(fits.length).forEach(function (it) { it.el.style.display = 'none'; });
      if (!fits.length) return;

      var slack = vh - pad * 2 - stackHeight(fits);
      var y = pad + slack / 2;

      fits.forEach(function (it) {
        var x = side === 0
          ? Math.round(-it.w * bleed)
          : Math.round(vw - it.w * (1 - bleed));
        it.el.style.left = x + 'px';
        it.el.style.top = Math.round(y) + 'px';
        it.el.style.right = 'auto';
        it.el.style.bottom = 'auto';
        y += it.h + gap;
      });
    });
  }

  var relayout;
  window.addEventListener('resize', function () {
    clearTimeout(relayout);
    relayout = setTimeout(layoutRobots, 150);
  });

  /* ---------- Background motion (GSAP) ---------- */
  function initBackdrop() {
    if (!window.gsap || reduceMotion) return;
    var gsap = window.gsap;

    // Sun turns slowly behind the hero.
    var sun = document.querySelector('.sun-spin');
    if (sun) gsap.to(sun, { rotation: 360, duration: 180, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });

    // Vines breathe.
    gsap.utils.toArray('.vine').forEach(function (v, i) {
      gsap.to(v, { rotation: i % 2 ? 1.6 : -1.6, duration: 9 + i, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: i % 2 ? '100% 0%' : '0% 0%' });
    });

    seedMotes();

    if (typeof window.initRobotics3DAnimations === 'function') {
      window.initRobotics3DAnimations();
    }

    // The original script scatters these at random, so they land on each other
    // and on the copy. Lay them out deliberately instead.
    layoutRobots();

    // Gentle float on every robotics element.
    gsap.utils.toArray('.robotics-3d-element').forEach(function (el, i) {
      gsap.to(el, {
        y: (i % 2 ? 1 : -1) * 8,
        duration: 6 + i,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackdrop);
  } else {
    initBackdrop();
  }
})();
