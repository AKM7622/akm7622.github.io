/**
 * TECHNICAL BLUEPRINT PORTFOLIO — INTERACTIVE ENGINE
 * Akash Majumdar (akm7622.github.io)
 * Adheres to modern-web-guidance for theme switching and accessibility
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. LIVE TELEMETRY CLOCK (Local & UTC)
  // -------------------------------------------------------------------------
  const localTimeEl = document.getElementById('telemetry-local-time');
  const utcTimeEl = document.getElementById('telemetry-utc-time');

  function updateTelemetryClock() {
    const now = new Date();
    
    // Format Local Time (HH:MM:SS)
    const localHours = String(now.getHours()).padStart(2, '0');
    const localMinutes = String(now.getMinutes()).padStart(2, '0');
    const localSeconds = String(now.getSeconds()).padStart(2, '0');
    if (localTimeEl) {
      localTimeEl.textContent = `${localHours}:${localMinutes}:${localSeconds}`;
    }

    // Format UTC Time (HH:MM:SS Z)
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    if (utcTimeEl) {
      utcTimeEl.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} Z`;
    }
  }

  updateTelemetryClock();
  setInterval(updateTelemetryClock, 1000);

  // -------------------------------------------------------------------------
  // 2. THEME CONTROLLER (Modern Web Guidance Compliant)
  // -------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeStatusText = document.getElementById('theme-status-text');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

  function getEffectiveTheme() {
    const currentMeta = metaColorScheme ? metaColorScheme.getAttribute('content') : null;
    if (currentMeta === 'dark' || currentMeta === 'light') {
      return currentMeta;
    }
    // Default is dark drafting board
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (metaColorScheme) {
      metaColorScheme.setAttribute('content', theme);
    }
    if (themeStatusText) {
      themeStatusText.textContent = theme.toUpperCase();
    }
    try {
      localStorage.setItem('cad-theme', theme);
    } catch (e) {
      // localStorage may be blocked in strict sandboxes
    }
  }

  function toggleTheme() {
    const currentTheme = getEffectiveTheme();
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
    // Initialize label
    if (themeStatusText) {
      themeStatusText.textContent = getEffectiveTheme().toUpperCase();
    }
  }

  // Cross-tab synchronization via storage event
  window.addEventListener('storage', (event) => {
    if (event.key === 'cad-theme' && (event.newValue === 'dark' || event.newValue === 'light')) {
      applyTheme(event.newValue);
    }
  });

  // -------------------------------------------------------------------------
  // 3. PROJECT CATEGORY FILTER
  // -------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active button state
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter project cards
      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.removeAttribute('data-hidden');
        } else {
          card.setAttribute('data-hidden', 'true');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // 4. COPY EMAIL TO CLIPBOARD
  // -------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const emailAddress = 'akash03082006@gmail.com';
  let copyTimeout = null;

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(emailAddress);
        } else {
          // Fallback for older contexts
          const textArea = document.createElement('textarea');
          textArea.value = emailAddress;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        if (copyFeedback) {
          copyFeedback.textContent = '[ OK: ADDRESS COPIED TO CLIPBOARD ]';
          if (copyTimeout) clearTimeout(copyTimeout);
          copyTimeout = setTimeout(() => {
            copyFeedback.textContent = '';
          }, 3000);
        }
      } catch (err) {
        if (copyFeedback) {
          copyFeedback.textContent = `[ ERR: COPY FAILED — USE DIRECT MAILTO ]`;
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. INTERACTIVE DISPATCH FORM FEEDBACK
  // -------------------------------------------------------------------------
  const dispatchForm = document.getElementById('dispatch-form');
  const formFeedback = document.getElementById('form-feedback');

  if (dispatchForm) {
    dispatchForm.addEventListener('submit', () => {
      if (formFeedback) {
        formFeedback.textContent = '[ TRANSMITTING VIA SYSTEM MAIL CLIENT... ]';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. KEYBOARD NAVIGATION SHORTCUTS
  // -------------------------------------------------------------------------
  const sectionMap = {
    '1': '#about',
    '2': '#skills',
    '3': '#projects',
    '4': '#experience',
    '5': '#contact'
  };

  document.addEventListener('keydown', (e) => {
    // Ignore if focus is in an input or textarea
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
      return;
    }

    // Toggle theme with 'T' or 't'
    if (e.key === 't' || e.key === 'T') {
      toggleTheme();
      return;
    }

    // Number keys 1-5 for section navigation
    if (sectionMap[e.key]) {
      const targetSection = document.querySelector(sectionMap[e.key]);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

})();
