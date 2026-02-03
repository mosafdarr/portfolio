document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header scroll effect
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth anchor scrolling + close mobile menu
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header ? header.offsetHeight : 0;
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

      window.scrollTo({ top: y, behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  // Form handling: mailto fallback (no backend)
  const form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const company = (data.get('company') || '').toString().trim();
      const help = (data.get('help') || '').toString().trim();

      if (!name || !email || !help) {
        toast('Please fill in Name, Email, and the Project Details.');
        return;
      }

      const subject = encodeURIComponent(`Project Inquiry — ${name}${company ? ' (' + company + ')' : ''}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCompany/Product: ${company || '-'}\n\nWhat I need help with:\n${help}\n\n---\nSent from mosafdar.com`
      );

      // Opens user's email client
      window.location.href = `mailto:mosafdaralii@gmail.com?subject=${subject}&body=${body}`;

      toast('Opening your email app… If it doesn’t open, copy the email address above.', true);
      form.reset();
    });
  }
});

// Mobile menu functions must be global (used inline)
window.toggleMobileMenu = function () {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');

  if (isHidden) {
    menu.classList.remove('hidden');
    menu.classList.add('show');
    document.body.style.overflow = 'hidden';
  } else {
    window.closeMobileMenu();
  }
};

window.closeMobileMenu = function () {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;

  menu.classList.remove('show');
  setTimeout(() => {
    menu.classList.add('hidden');
    document.body.style.overflow = '';
  }, 250);
};

window.copyToClipboard = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`Copied: ${text}`, true);
  } catch (e) {
    // Fallback
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

function toast(message, isSuccess = false) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.classList.remove('hidden');
  el.innerHTML = isSuccess
    ? `<strong>Done.</strong> ${escapeHtml(message)}`
    : `${escapeHtml(message)}`;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.add('hidden');
  }, 3200);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
