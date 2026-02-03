(function () {
  'use strict';

  const THEME_KEY = 'mosafdar_theme';
  const EMAIL_TO = 'mosafdaralii@gmail.com';

  // ✅ Put your Formspree endpoint here (recommended)
  // Example: https://formspree.io/f/abcdwxyz
  const FORMSPREE_ENDPOINT = window.FORMSPREE_ENDPOINT || '';

  const header = document.getElementById('siteHeader');
  const toastEl = document.getElementById('toast');
  const yearEl = document.getElementById('year');

  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const themeIconMobile = document.getElementById('themeIconMobile');

  const form = document.getElementById('leadForm');

  // Run immediately (no dependency on DOMContentLoaded timing)
  init();

  function init() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    initHeaderScroll();
    initTheme();
    initFastAnchorScroll();
    initForm();
  }

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
  // Theme
  // --------------------------
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const systemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

    const initialTheme = saved || (systemLight ? 'light' : 'dark');
    setTheme(initialTheme);

    const toggleHandler = () => {
      const isLight = document.documentElement.classList.contains('theme-light');
      setTheme(isLight ? 'dark' : 'light');
    };

    if (themeToggle) themeToggle.addEventListener('click', toggleHandler);
    if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleHandler);
  }

  function setTheme(theme) {
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    localStorage.setItem(THEME_KEY, theme);

    const icon = theme === 'light' ? 'fa-sun' : 'fa-moon';
    if (themeIcon) themeIcon.className = `fa-solid ${icon}`;
    if (themeIconMobile) themeIconMobile.className = `fa-solid ${icon}`;
  }

  // --------------------------
  // Fast scroll (no lag)
  // --------------------------
  function initFastAnchorScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || !href.startsWith('#')) return;

        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();

        const headerHeight = header ? header.offsetHeight : 0;
        const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

        window.scrollTo({ top: y, behavior: 'smooth' });
        closeMobileMenu();
      });
    });
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
    } catch {
      toast('Copy failed. Please copy manually.', false);
    }
  };

  // --------------------------
  // Form (works via Formspree OR mailto fallback)
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
        toast('Please fill Name, Email and Project Details.', false);
        return;
      }

      // ✅ If Formspree endpoint exists, submit via fetch
      if (FORMSPREE_ENDPOINT) {
        try {
          const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: data
          });

          if (!res.ok) throw new Error('Formspree failed');

          toast('Request sent! I’ll reply soon.', true);
          form.reset();
          return;
        } catch {
          toast('Could not submit. Opening email fallback…', false);
        }
      }

      // Fallback to mailto (always works)
      const subject = encodeURIComponent(`Project Inquiry — ${name}${company ? ' (' + company + ')' : ''}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany/Product: ${company || '-'}\n\nWhat I need help with:\n${help}\n\n---\nSent from mosafdar.com`
      );
      window.location.href = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
      toast('Opening your email app…', true);
      form.reset();
    });
  }

  function toast(message, ok) {
    if (!toastEl) return;
    toastEl.classList.remove('hidden');
    toastEl.innerHTML = ok ? `<strong>Done.</strong> ${escapeHtml(message)}` : escapeHtml(message);
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 2800);
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
