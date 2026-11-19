/* Ami Home Care — site behaviour
 * Loaded with "async" and built on event delegation, so the menu, forms and buttons
 * work as soon as this file runs, without waiting for slower third-party scripts.
 *
 * Settings you may change:
 *   ANALYTICS_ID  Google Analytics 4 ID (for example "G-ABC123XYZ"). Leave empty for no
 *                 analytics. When set, a cookie banner asks visitors before anything loads.
 */
(function () {
  'use strict';

  var ANALYTICS_ID = '';
  var DEMO = !!window.AMI_DEMO; // true only in the online preview, where forms cannot send
  var PHONE = '020 3026 3706';
  var EMAIL = 'info@amihomecare.com';
  var START = Date.now();
  var doc = document;
  var root = doc.documentElement;
  var script = doc.currentScript;
  var BASE = script && script.src ? script.src : location.href;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  root.classList.add('js');

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }
  function byId(id) { return doc.getElementById(id); }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function iconSvg(name) {
    return '<svg class="icon" width="20" height="20" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  }

  /* 1. Header shadow when the page is scrolled ------------------------------ */
  function onScroll() {
    var hdr = byId('site-header');
    if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* 2. Mobile menu ----------------------------------------------------------- */
  function setMenu(open) {
    var btn = byId('menu-toggle');
    var drawer = byId('drawer');
    if (!btn || !drawer) return;
    drawer.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  function menuIsOpen() {
    var btn = byId('menu-toggle');
    return !!btn && btn.getAttribute('aria-expanded') === 'true';
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuIsOpen()) {
      setMenu(false);
      byId('menu-toggle').focus();
    }
  });
  if (window.matchMedia) {
    var wide = window.matchMedia('(min-width: 1021px)');
    var closeIfWide = function (e) { if (e.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', closeIfWide);
    else if (wide.addListener) wide.addListener(closeIfWide);
  }

  /* 3. Click handling (delegated) -------------------------------------------- */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    if (t.closest('#menu-toggle')) { setMenu(!menuIsOpen()); return; }
    if (t.closest('#drawer a')) { setMenu(false); }

    var copyBtn = t.closest('[data-copy]');
    if (copyBtn) { copyText(copyBtn); return; }

    var applyBtn = t.closest('[data-role]');
    if (applyBtn) {
      var roleSelect = byId('a-role');
      if (roleSelect) roleSelect.value = applyBtn.getAttribute('data-role');
    }

    var preview = t.closest('[data-preview]');
    if (preview) { openPreview(preview); return; }
    if (t.closest('#viewer-close')) { closePreview(); return; }

    var consentBtn = t.closest('[data-consent]');
    if (consentBtn) { saveConsent(consentBtn.getAttribute('data-consent')); return; }
    if (t.closest('[data-cookie-settings]')) { showCookieBanner(true); }
  });

  function copyText(btn) {
    var text = btn.getAttribute('data-copy');
    var label = btn.querySelector('span');
    var done = function () {
      if (!label) return;
      var old = label.textContent;
      label.textContent = 'Copied';
      setTimeout(function () { label.textContent = old; }, 1600);
    };
    var selectFallback = function () {
      var target = btn.previousElementSibling;
      if (!target) return;
      var range = doc.createRange();
      range.selectNodeContents(target);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    try {
      navigator.clipboard.writeText(text).then(done, selectFallback);
    } catch (err) {
      selectFallback();
    }
  }

  /* 4. Forms: validation and sending ----------------------------------------- */
  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var RE_PHONE = /^(\+44|0)\d{9,10}$/;
  var RE_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

  function value(form, name) {
    var el = form.elements[name];
    return el && typeof el.value === 'string' ? el.value.trim() : '';
  }
  function setError(el, message) {
    if (!el) return;
    var field = el.closest('.field');
    var err = field ? field.querySelector('.err') : null;
    if (field) field.classList.toggle('has-error', !!message);
    if (err) err.textContent = message || '';
    if (message) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  // Works out an error message (or '') for each field. Nothing is shown here.
  function findProblems(form) {
    var isApplication = form.getAttribute('data-form') === 'application';
    var els = form.elements;
    var found = [];
    var add = function (el, message) { if (el) found.push({ el: el, message: message }); };
    var name = value(form, 'name');
    var email = value(form, 'email');
    var phone = value(form, 'phone');
    var phoneDigits = phone.replace(/[^\d+]/g, '');
    var methodEl = form.querySelector('input[name="method"]:checked');
    var method = methodEl ? methodEl.value : '';

    add(els.name, name.length >= 2 ? '' : 'Enter your full name.');

    var phoneMsg = '';
    var emailMsg = '';
    if (phone && !RE_PHONE.test(phoneDigits)) phoneMsg = 'Enter a UK phone number, like 020 3026 3706 or 07700 900123.';
    if (email && !RE_EMAIL.test(email)) emailMsg = 'Enter an email address in the correct format, like name@example.com.';
    if (isApplication) {
      if (!phone) phoneMsg = 'Enter your phone number.';
      if (!email) emailMsg = 'Enter your email address.';
    } else {
      if (!phone && !email) phoneMsg = 'Enter a phone number or an email address so we can reply.';
      if (method === 'email' && !email) emailMsg = emailMsg || 'You chose email, so please enter your email address.';
      if (method === 'phone' && !phone) phoneMsg = phoneMsg || 'You chose phone, so please enter your phone number.';
    }
    add(els.phone, phoneMsg);
    add(els.email, emailMsg);
    if (els.postcode) {
      var postcode = value(form, 'postcode');
      add(els.postcode, postcode && !RE_POSTCODE.test(postcode) ? 'Enter a full UK postcode, like TW7 6EL.' : '');
    }
    if (isApplication) add(els.role, value(form, 'role') ? '' : 'Choose the role you are applying for.');
    add(els.consent, els.consent && els.consent.checked ? '' : 'Tick the box so we can use your details to reply.');
    return found;
  }

  // On submit: show every error and return the fields with problems, in page order.
  function validate(form) {
    var problems = [];
    findProblems(form).forEach(function (p) {
      setError(p.el, p.message);
      if (p.message) problems.push(p.el);
    });
    problems.sort(function (a, b) {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return problems;
  }

  function showStatus(form, type, title, text, focus) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    var role = type === 'error' ? 'alert' : 'status';
    var icon = type === 'ok' ? 'check' : (type === 'error' ? 'alert' : 'info');
    box.innerHTML = '<div class="alert alert--' + type + '" role="' + role + '">' + iconSvg(icon) +
      '<div><strong>' + esc(title) + '</strong>' + (text ? esc(text) : '') + '</div></div>';
    if (focus) box.focus();
  }
  function clearStatus(form) {
    var box = form.querySelector('.form-status');
    if (box) box.innerHTML = '';
  }

  // While someone corrects the form, remove each error as soon as it is fixed.
  // New errors only appear when the form is sent, so nothing jumps around under the pointer.
  function clearFixed(e) {
    var form = e.target && e.target.form;
    if (!form || !form.hasAttribute('data-form') || !form.querySelector('.has-error')) return;
    findProblems(form).forEach(function (p) {
      if (!p.message && p.el.getAttribute('aria-invalid')) setError(p.el, '');
    });
    if (!form.querySelector('.has-error')) clearStatus(form);
  }
  doc.addEventListener('input', clearFixed);
  doc.addEventListener('change', clearFixed);

  doc.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.hasAttribute || !form.hasAttribute('data-form')) return;
    e.preventDefault();
    if (form.getAttribute('data-busy')) return; // stops double submissions

    var problems = validate(form);
    var what = form.getAttribute('data-form') === 'application' ? 'application' : 'enquiry';
    if (problems.length) {
      showStatus(form, 'error', problems.length === 1 ? 'There is a problem with 1 field.' : 'There are problems with ' + problems.length + ' fields.',
        ' Please check the highlighted ' + (problems.length === 1 ? 'field' : 'fields') + ' and try again.', false);
      problems[0].focus();
      return;
    }
    if (DEMO) {
      showStatus(form, 'info', 'This is a website preview, so nothing has been sent.',
        ' On the live website this form sends your ' + what + ' to our team. To contact us now, call ' + PHONE + ' or email ' + EMAIL + '.', true);
      return;
    }

    var button = form.querySelector('[type="submit"]');
    var buttonHtml = button ? button.innerHTML : '';
    form.setAttribute('data-busy', '1');
    if (button) { button.disabled = true; button.textContent = 'Sending…'; }
    clearStatus(form);

    var data = new FormData(form);
    data.set('elapsed', String(Math.round((Date.now() - START) / 1000)));
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;

    fetch(form.getAttribute('action') || 'send.php', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: false }; });
      })
      .then(function (res) {
        if (res && res.ok) {
          form.reset();
          all('.has-error', form).forEach(function (f) { f.classList.remove('has-error'); });
          all('[aria-invalid]', form).forEach(function (f) { f.removeAttribute('aria-invalid'); });
          all('.err', form).forEach(function (f) { f.textContent = ''; });
          showStatus(form, 'ok', 'Thank you. Your ' + what + ' has been sent.',
            what === 'application'
              ? ' We will be in touch about your application.'
              : " We'll be in touch soon. If your need is urgent, please call " + PHONE + '.', true);
        } else {
          var failure = new Error((res && res.message) || '');
          failure.fromServer = true;
          throw failure;
        }
      })
      .catch(function (err) {
        var detail = err && err.fromServer && err.message
          ? ' ' + err.message
          : ' Please try again, or call ' + PHONE + ' or email ' + EMAIL + '.';
        showStatus(form, 'error', 'Sorry, your ' + what + ' could not be sent.', detail, true);
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        form.removeAttribute('data-busy');
        if (button) { button.disabled = false; button.innerHTML = buttonHtml; }
      });
  });

  /* 5. Contact page: pre-select the service from links like contact.html?care=live-in-care */
  ready(function () {
    var select = byId('care-type');
    if (!select || select.value) return;
    var care = new URLSearchParams(location.search).get('care');
    if (!care) return;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === care) { select.value = care; break; }
    }
  });

  /* 6. Policies page: preview a PDF on the page (loaded only when asked) ------ */
  var pdfLib = null;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = doc.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      doc.head.appendChild(s);
    });
  }
  function loadPdfLib() {
    if (pdfLib) return pdfLib;
    if (DEMO) {
      var cdn = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
      pdfLib = loadScript(cdn + 'pdf.min.js')
        .then(function () { return loadScript(cdn + 'pdf.worker.min.js'); })
        .then(function () { return window.pdfjsLib; });
    } else {
      pdfLib = import(new URL('vendor/pdf.min.js', BASE).href).then(function (lib) {
        lib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.js', BASE).href;
        return lib;
      });
    }
    pdfLib.catch(function () { pdfLib = null; });
    return pdfLib;
  }

  var currentDoc = null;
  function openPreview(btn) {
    var viewer = byId('viewer');
    var box = byId('viewer-box');
    if (!viewer || !box) return;
    var file = btn.getAttribute('data-preview');
    var title = btn.getAttribute('data-title') || 'Document';
    all('.doc').forEach(function (d) { d.classList.toggle('is-active', d.contains(btn)); });
    byId('viewer-title').textContent = title;
    byId('viewer-open').setAttribute('href', file);
    viewer.hidden = false;
    viewer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    viewer.focus({ preventScroll: true });
    if (currentDoc === file) return;
    currentDoc = file;
    byId('viewer-pages').textContent = '';
    box.innerHTML = '<p class="viewer__message">Loading the document…</p>';

    loadPdfLib()
      .then(function (lib) {
        return fetch(file).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.arrayBuffer();
        }).then(function (buf) { return lib.getDocument({ data: buf }).promise; });
      })
      .then(function (pdf) {
        if (currentDoc !== file) return;
        box.innerHTML = '';
        byId('viewer-pages').textContent = pdf.numPages + (pdf.numPages === 1 ? ' page' : ' pages');
        var width = Math.min(box.clientWidth - 40, 900);
        var chain = Promise.resolve();
        for (var n = 1; n <= pdf.numPages; n++) {
          (function (n) {
            chain = chain.then(function () { return pdf.getPage(n); }).then(function (page) {
              if (currentDoc !== file) return null;
              var base = page.getViewport({ scale: 1 });
              var ratio = Math.min(window.devicePixelRatio || 1, 2);
              var vp = page.getViewport({ scale: (width / base.width) * ratio });
              var canvas = doc.createElement('canvas');
              canvas.width = vp.width;
              canvas.height = vp.height;
              canvas.style.width = width + 'px';
              canvas.setAttribute('role', 'img');
              canvas.setAttribute('aria-label', title + ', page ' + n + ' of ' + pdf.numPages + '. Use Open PDF to read the text.');
              box.appendChild(canvas);
              return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
            });
          })(n);
        }
        return chain;
      })
      .catch(function () {
        currentDoc = null;
        box.innerHTML = '<p class="viewer__message">The preview could not be shown in this browser. Please use Open PDF instead.</p>';
      });
  }
  function closePreview() {
    var viewer = byId('viewer');
    if (!viewer) return;
    viewer.hidden = true;
    all('.doc').forEach(function (d) { d.classList.remove('is-active'); });
    var opener = doc.querySelector('[data-preview="' + currentDoc + '"]');
    if (opener) opener.focus();
  }

  /* 7. Analytics consent (only active when ANALYTICS_ID is set) --------------- */
  var CONSENT_KEY = 'ami-analytics-consent';
  function readConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function loadAnalytics() {
    if (!ANALYTICS_ID || window.__amiAnalytics) return;
    window.__amiAnalytics = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ANALYTICS_ID));
  }
  function showCookieBanner(focus) {
    var bar = byId('cookie');
    if (!bar || !ANALYTICS_ID) return;
    bar.hidden = false;
    if (focus) { var b = bar.querySelector('[data-consent]'); if (b) b.focus(); }
  }
  function saveConsent(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) { /* storage blocked: ask again next time */ }
    var bar = byId('cookie');
    if (bar) bar.hidden = true;
    if (choice === 'accepted') loadAnalytics();
  }
  ready(function () {
    if (!ANALYTICS_ID) return;
    all('.js-cookie-settings').forEach(function (el) { el.hidden = false; });
    var saved = readConsent();
    if (saved === 'accepted') loadAnalytics();
    else if (!saved) showCookieBanner(false);
  });

  /* 8. Gentle reveal of content further down the page ------------------------ */
  ready(function () {
    var year = String(new Date().getFullYear());
    all('.js-year').forEach(function (el) { if (el.textContent !== year) el.textContent = year; });
    onScroll();
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    all('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('will-reveal');
        io.observe(el);
      }
    });
  });
})();

/* If the official CQC widget is blocked or fails to load, collapse its empty column. */
(function () {
  var box = document.querySelector('.cqc__official');
  if (!box) return;
  function check() {
    var shown = Array.prototype.some.call(box.children, function (el) {
      return el.tagName !== 'SCRIPT' && el.getBoundingClientRect().height > 0;
    });
    if (!shown) box.parentNode.classList.add('cqc--solo');
  }
  var run = function () { setTimeout(check, 5000); };
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
})();
