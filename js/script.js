/* Mosafdar site JS
   - Fast smooth scroll (no lag)
   - Dark/Light mode toggle (saved)
   - Contact form submission:
       1) If NETLIFY: submits to Netlify (same form HTML)
       2) If FORM_ENDPOINT is set: submits via fetch
       3) Otherwise fallback to mailto
*/

(function () {
  'use strict';

  const THEME_KEY = 'mosafdar_theme';
  const DEFAULT_SCROLL_MS = 420; // quick, feels instant
  const EMAIL_TO = 'mosafdaralii@gmail.com';

  // Optional: set a real endpoint (Formspree / your API) later
  // Example: window.FORM_ENDPOINT = "https://formspree.io/f/xxxxxx";
  const FORM_ENDPOINT = window.FORM_ENDPOINT || '';

  // Elements
  const header = document.getElementById('siteHeader');
  const toastEl = document.getElementById('toast');
  const yearEl = document.getElementById('year');

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeIconMobile = document.getElementById('themeIconMobile');

  const form = document.getElementById('leadForm');

  // Init
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    initHeaderScroll();
    initTheme();
    initFastAnchorScroll();
    initForm();
  }

  // --------------------------
  // Header scroll effect
  // --------------------------
  function initHeaderScroll() {
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --------------------------
  // Theme toggle (dark/light)
  // --------------------------
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);

    // default to system preference if nothing saved
    let theme = saved;
    if (!theme) {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
    }

    setTheme(theme);

    const toggleHandler = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    };

    if (themeToggle) themeToggle.addEventListener('click', toggleHandler);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleHandler);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const isLight = theme === 'light';
    const iconClass = isLight ? 'fa-sun' : 'fa-moon';

    if (themeIcon) themeIcon.className = `fa-solid ${iconClass}`;
    if (themeIconMobile) themeIconMobile.className = `fa-solid ${iconClass}`;

    // small toast only on manual change could be added, but keeping silent
  }

  // --------------------------
  // Fast smooth anchor scrolling (no lag)
  // --------------------------
  function initFastAnchorScroll() {
    const links = document.querySelectorAll('a[href^="#"].nav-link, a[href^="#"]');
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || !href.startsWith('#')) return;

        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();

        const headerHeight = header ? header.offsetHeight : 0;
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 14;

        animateScrollTo(targetY, DEFAULT_SCROLL_MS);
        closeMobileMenu();
      });
    });
  }

  function animateScrollTo(targetY, durationMs) {
    const startY = window.pageYOffset;
    const diff = targetY - startY;
    const start = performance.now();

    if (Math.abs(diff) < 4) {
      window.scrollTo(0, targetY);
      return;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(t);
      window.scrollTo(0, startY + diff * eased);
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // --------------------------
  // Mobile menu
  // --------------------------
  window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      menu.classList.remove('hidden');
      menu.classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      closeMobileMenu();
    }
  };

  window.closeMobileMenu = closeMobileMenu;

  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    menu.classList.remove('show');
    setTimeout(() => {
      menu.classList.add('hidden');
      document.body.style.overflow = '';
    }, 220);
  }

  // --------------------------
  // Clipboard
  // --------------------------
  window.copyToClipboard = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied: ${text}`, true);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast(`Copied: ${text}`, true);
    }
  };

  // --------------------------
  // Form submission (enabled)
  // --------------------------
  function initForm() {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const help = (data.get('help') || '').toString().trim();

      if (!name || !email || !help) {
        toast('Please fill Name, Email, and Project Details.', false);
        return;
      }

      // 1) If a custom endpoint is set, use it
      if (FORM_ENDPOINT) {
        try {
          const payload = new URLSearchParams();
          for (const [k, v] of data.entries()) payload.append(k, v.toString());

          const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
          });

          if (!res.ok) throw new Error('Endpoint failed');
          toast('Request sent! I’ll reply soon.', true);
          form.reset();
          return;
        } catch (err) {
          toast('Could not submit to endpoint. Using email fallback…', false);
          // fall through to mailto
        }
      }

      // 2) Try Netlify form submit (works when deployed on Netlify)
      // This is safe to attempt; if not Netlify, it will fail and fallback to mailto
      try {
        const payload = new URLSearchParams();
        for (const [k, v] of data.entries()) payload.append(k, v.toString());

        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload.toString()
        });

        if (res.ok) {
          toast('Request sent! Redirecting…', true);
          setTimeout(() => window.location.href = form.getAttribute('action') || '/success.html', 700);
          form.reset();
          return;
        }
      } catch (err) {
        // ignore and fallback
      }

      // 3) Always-works fallback: mailto
      const subject = encodeURIComponent(`Project Inquiry — ${name}${company ? ' (' + company + ')' : ''}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany/Product: ${company || '-'}\n\nWhat I need help with:\n${help}\n\n---\nSent from mosafdar.com`
      );
      window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
      toast('Opening your email app…', true);
      form.reset();
    });
  }

  // --------------------------
  // Toast
  // --------------------------
  function toast(message, isSuccess) {
    if (!toastEl) return;
    toastEl.classList.remove('hidden');
    toastEl.innerHTML = isSuccess
      ? `<strong>Done.</strong> ${escapeHtml(message)}`
      : escapeHtml(message);

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 2800);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
