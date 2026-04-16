/* nav-mobile.js — Shared off-canvas side-drawer navigation */
(function () {
  'use strict';

  var hamburger = document.getElementById('navHamburger');
  var sidebar   = document.getElementById('navSidebar');
  var overlay   = document.getElementById('navOverlay');
  var closeBtn  = document.getElementById('navSidebarClose');

  if (!hamburger || !sidebar || !overlay) return;

  /* ── Open ──────────────────────────────────────────────── */
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    sidebar.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      closeBtn.focus();
    } else {
      var firstLink = sidebar.querySelector('a');
      if (firstLink) firstLink.focus();
    }
  }

  /* ── Close ─────────────────────────────────────────────── */
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    sidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  /* ── Hamburger toggle ──────────────────────────────────── */
  hamburger.addEventListener('click', function () {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  /* ── Backdrop + close button ───────────────────────────── */
  overlay.addEventListener('click', closeSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  /* ── Escape key ────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  /* ── Focus trap inside sidebar ─────────────────────────── */
  sidebar.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(
      sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ── Close sidebar when a nav link is clicked ──────────── */
  sidebar.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeSidebar();
    });
  });

  /* ── Re-show nav-links on resize above breakpoint ─────── */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
}());
