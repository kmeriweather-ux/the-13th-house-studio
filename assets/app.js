// The 13th House Studio — form handler
(function() {
  'use strict';

  const ENDPOINTS = {
    'newsletter':  'https://build.twin.so/triggers/3991219e-f0f3-466b-81e2-9fb0ba800501/webhook',
    'book-notify': 'https://build.twin.so/triggers/eb3ba779-9755-44b2-b6c9-e2b177c51916/webhook',
    'contact':     'https://build.twin.so/triggers/762230a4-5eab-4015-bd1e-9883947a3ab2/webhook'
  };

  function isValidEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  }

  function showStatus(form, msg, isError) {
    const el = form.querySelector('.form-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    el.classList.toggle('error', !!isError);
  }

  async function submitForm(form) {
    const source = form.getAttribute('data-source');
    const endpoint = ENDPOINTS[source];
    if (!endpoint) return;

    const emailEl = form.querySelector('input[type="email"]');
    const nameEl = form.querySelector('input[name="name"]');
    const messageEl = form.querySelector('textarea[name="message"]');

    const email = emailEl ? emailEl.value.trim() : '';
    if (!isValidEmail(email)) {
      showStatus(form, 'Please enter a valid email address.', true);
      emailEl && emailEl.focus();
      return;
    }

    const payload = {
      email: email,
      source: source,
      name: nameEl ? nameEl.value.trim() : '',
      message: messageEl ? messageEl.value.trim() : '',
      referrer: document.referrer || '',
      user_agent: navigator.userAgent || '',
      page: location.pathname + location.search,
      submitted_at: new Date().toISOString()
    };

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.dataset.orig = btn.textContent; btn.textContent = 'Sending…'; }

    try {
      // Fire-and-forget (no-cors because build.twin.so only allows builder.twin.so origin)
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
      const msg = source === 'contact'
        ? 'Thank you. Your message has arrived.'
        : (source === 'book-notify'
          ? 'You are on the list. The Awakening Edition will find you.'
          : 'Welcome. You are on the list.');
      showStatus(form, msg, false);
      form.reset();
    } catch (err) {
      showStatus(form, 'Something interrupted the send. Please try again shortly.', true);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btn.dataset.orig || 'Submit'; }
    }
  }

  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.classList.contains('capture-form')) return;
    e.preventDefault();
    submitForm(form);
  });

  // Mobile nav toggle
  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
      });
    }
  });
})();
