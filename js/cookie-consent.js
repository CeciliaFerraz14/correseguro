/**
 * CookieConsent v1.0.0 - Belsué Group
 * Componente GDPR reutilizable para todos los dominios del grupo.
 *
 * USO:
 *   Antes de cargar este script, define la configuración global:
 *
 *   <script>
 *     window.CookieConsentConfig = {
 *       companyName: 'MiEmpresa',
 *       privacyPolicyUrl: '/politica-privacidad.html',
 *       cookiePolicyUrl: '/politica-cookies.html',
 *       primaryColor: '#8A0C3C',
 *       onAcceptAll: function(consent) { console.log('Aceptado', consent); },
 *       onSave: function(consent) { console.log('Guardado', consent); }
 *     };
 *   </script>
 *   <script src="/js/cookie-consent.js"></script>
 *
 * EVENTOS PERSONALIZADOS:
 *   document.addEventListener('cookieConsent:change', (e) => { ... e.detail ... });
 */
(function (window, document) {
  'use strict';

  // ─── CONFIGURACIÓN ────────────────────────────────────────────────────────
  const defaults = {
    companyName:       'Belsué',
    privacyPolicyUrl:  '/politica-privacidad.html',
    cookiePolicyUrl:   '/politica-cookies.html',
    consentVersion:    '1.0',
    storageKey:        'belsue_cookie_consent',
    expiryDays:        365,
    primaryColor:      '#8A0C3C',
    primaryDark:       '#6B092F',
    accentColor:       '#FFD700',
    position:          'bottom',   // 'bottom' | 'top'
    onAcceptAll:       null,
    onRejectAll:       null,
    onSave:            null,
  };

  const cfg = Object.assign({}, defaults, window.CookieConsentConfig || {});

  // ─── CATEGORÍAS ───────────────────────────────────────────────────────────
  const CATEGORIES = {
    necessary: {
      id:          'necessary',
      label:       'Necesarias',
      description: 'Imprescindibles para el funcionamiento del sitio web. No se pueden desactivar.',
      required:    true,
      icon:        '🛡️',
    },
    analytics: {
      id:          'analytics',
      label:       'Analíticas',
      description: 'Nos permiten medir el tráfico y el comportamiento de los usuarios para mejorar nuestros servicios (ej. Google Analytics).',
      required:    false,
      icon:        '📊',
    },
    marketing: {
      id:          'marketing',
      label:       'Marketing',
      description: 'Se utilizan para mostrar anuncios personalizados y medir la efectividad de las campañas publicitarias.',
      required:    false,
      icon:        '📣',
    },
    preferences: {
      id:          'preferences',
      label:       'Preferencias',
      description: 'Permiten recordar información que cambia el comportamiento o aspecto del sitio (idioma, región, etc.).',
      required:    false,
      icon:        '⚙️',
    },
  };

  // ─── ALMACENAMIENTO ───────────────────────────────────────────────────────
  const Storage = {
    get() {
      try {
        const raw = localStorage.getItem(cfg.storageKey);
        if (!raw) return null;
        const data = JSON.parse(raw);
        // Verificar versión y expiración
        if (data.version !== cfg.consentVersion) return null;
        if (data.expires && Date.now() > data.expires) {
          localStorage.removeItem(cfg.storageKey);
          return null;
        }
        return data;
      } catch {
        return null;
      }
    },
    save(consent) {
      const data = {
        version:   cfg.consentVersion,
        timestamp: new Date().toISOString(),
        expires:   cfg.expiryDays ? Date.now() + cfg.expiryDays * 864e5 : null,
        consent,
      };
      try {
        localStorage.setItem(cfg.storageKey, JSON.stringify(data));
      } catch { /* localStorage no disponible */ }
      return data;
    },
    clear() {
      localStorage.removeItem(cfg.storageKey);
    },
  };

  // ─── ESTADO ───────────────────────────────────────────────────────────────
  let currentConsent = null;
  let panelOpen = false;

  function buildDefaultConsent(allAccepted = false) {
    return Object.keys(CATEGORIES).reduce((acc, key) => {
      acc[key] = CATEGORIES[key].required || allAccepted;
      return acc;
    }, {});
  }

  function dispatch(consent) {
    document.dispatchEvent(new CustomEvent('cookieConsent:change', {
      bubbles: true,
      detail: { consent, timestamp: new Date().toISOString() },
    }));
  }

  // ─── CSS ──────────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cc-styles')) return;
    const p  = cfg.primaryColor;
    const pd = cfg.primaryDark;
    const ac = cfg.accentColor;

    const css = `
      /* ── Cookie Consent ── */
      #cc-wrapper * { box-sizing: border-box; font-family: inherit; }

      #cc-wrapper {
        position: fixed;
        ${cfg.position === 'top' ? 'top: 0;' : 'bottom: 0;'}
        left: 0; right: 0;
        z-index: 99999;
        display: flex;
        justify-content: center;
        padding: 12px 16px;
        pointer-events: none;
      }

      /* ── Banner ── */
      #cc-banner {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,.18);
        max-width: 860px;
        width: 100%;
        padding: 22px 28px;
        display: flex;
        align-items: center;
        gap: 20px;
        pointer-events: all;
        animation: cc-slide-in .35s cubic-bezier(.25,.8,.25,1) both;
        border-top: 4px solid ${p};
      }

      @keyframes cc-slide-in {
        from { opacity: 0; transform: translateY(${cfg.position === 'top' ? '-24px' : '24px'}); }
        to   { opacity: 1; transform: translateY(0); }
      }

      #cc-banner.cc-hide {
        animation: cc-slide-out .3s ease both;
      }

      @keyframes cc-slide-out {
        to { opacity: 0; transform: translateY(${cfg.position === 'top' ? '-24px' : '24px'}); }
      }

      #cc-icon {
        font-size: 36px;
        flex-shrink: 0;
        line-height: 1;
      }

      #cc-text { flex: 1; min-width: 0; }

      #cc-text h3 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 700;
        color: #1a1a2e;
      }

      #cc-text p {
        margin: 0;
        font-size: 13px;
        color: #555;
        line-height: 1.5;
      }

      #cc-text a {
        color: ${p};
        text-decoration: underline;
        font-weight: 600;
      }

      #cc-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .cc-btn {
        padding: 9px 18px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .3px;
        transition: all .2s;
        white-space: nowrap;
      }

      .cc-btn-primary {
        background: ${p};
        color: #fff;
      }
      .cc-btn-primary:hover { background: ${pd}; transform: translateY(-1px); }

      .cc-btn-secondary {
        background: transparent;
        color: ${p};
        border: 2px solid ${p};
      }
      .cc-btn-secondary:hover { background: ${p}; color: #fff; }

      .cc-btn-ghost {
        background: transparent;
        color: #888;
        border: 2px solid #ddd;
      }
      .cc-btn-ghost:hover { border-color: #aaa; color: #555; }

      /* ── Panel de preferencias ── */
      #cc-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.55);
        z-index: 99998;
        backdrop-filter: blur(3px);
        animation: cc-fade-in .25s ease both;
      }

      @keyframes cc-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      #cc-panel {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100000;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        width: min(620px, 94vw);
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: cc-pop-in .3s cubic-bezier(.25,.8,.25,1) both;
      }

      @keyframes cc-pop-in {
        from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
        to   { opacity: 1; transform: translate(-50%, -50%); }
      }

      #cc-panel-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
        background: ${p};
        color: #fff;
      }

      #cc-panel-header h2 { margin: 0; font-size: 17px; }
      #cc-panel-header p  { margin: 2px 0 0; font-size: 12px; opacity: .85; }

      #cc-panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 24px;
        scrollbar-width: thin;
        scrollbar-color: ${p} #f0f0f0;
      }

      .cc-category {
        border: 1px solid #e8e8e8;
        border-radius: 10px;
        padding: 14px 16px;
        margin-bottom: 12px;
        transition: border-color .2s;
      }
      .cc-category:hover { border-color: ${p}40; }

      .cc-category-header {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: default;
      }

      .cc-category-icon { font-size: 20px; }

      .cc-category-info { flex: 1; }
      .cc-category-info strong {
        font-size: 14px;
        color: #1a1a2e;
        display: block;
      }
      .cc-category-info span {
        font-size: 12px;
        color: #777;
        line-height: 1.45;
        display: block;
        margin-top: 3px;
      }

      /* Toggle switch */
      .cc-toggle {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
      }

      .cc-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }

      .cc-toggle-track {
        position: absolute;
        inset: 0;
        background: #ddd;
        border-radius: 99px;
        transition: background .2s;
        cursor: pointer;
      }

      .cc-toggle input:checked + .cc-toggle-track { background: ${p}; }
      .cc-toggle input:disabled + .cc-toggle-track { background: ${p}99; cursor: not-allowed; }

      .cc-toggle-track::after {
        content: '';
        position: absolute;
        top: 3px; left: 3px;
        width: 18px; height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: transform .2s;
        box-shadow: 0 1px 4px rgba(0,0,0,.2);
      }

      .cc-toggle input:checked + .cc-toggle-track::after { transform: translateX(20px); }

      .cc-required-badge {
        font-size: 10px;
        font-weight: 700;
        color: ${p};
        background: ${p}18;
        padding: 2px 7px;
        border-radius: 99px;
        letter-spacing: .3px;
        flex-shrink: 0;
      }

      #cc-panel-footer {
        padding: 16px 24px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
        background: #fafafa;
      }

      /* ── Floating re-open button ── */
      #cc-reopen {
        position: fixed;
        ${cfg.position === 'top' ? 'top: 12px;' : 'bottom: 12px;'}
        left: 16px;
        z-index: 99997;
        background: ${p};
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 44px; height: 44px;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0,0,0,.25);
        display: none;
        align-items: center;
        justify-content: center;
        transition: transform .2s, background .2s;
      }
      #cc-reopen:hover { background: ${pd}; transform: scale(1.1); }
      #cc-reopen[aria-label]:hover::after {
        content: attr(aria-label);
        position: absolute;
        left: 52px;
        background: #333;
        color: #fff;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
      }

      /* ── Responsive ── */
      @media (max-width: 600px) {
        #cc-banner { flex-direction: column; align-items: flex-start; padding: 18px 16px; }
        #cc-actions { width: 100%; }
        .cc-btn { flex: 1; text-align: center; }
        #cc-panel-footer { flex-direction: column; }
        #cc-panel-footer .cc-btn { width: 100%; text-align: center; }
      }

      /* Accesibilidad: foco visible */
      .cc-btn:focus-visible,
      .cc-toggle input:focus-visible + .cc-toggle-track {
        outline: 3px solid ${ac};
        outline-offset: 2px;
      }
    `;

    const style = document.createElement('style');
    style.id = 'cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─── BANNER PRINCIPAL ─────────────────────────────────────────────────────
  function createBanner() {
    const wrapper = document.createElement('div');
    wrapper.id = 'cc-wrapper';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Aviso de cookies');

    wrapper.innerHTML = `
      <div id="cc-banner" role="dialog" aria-modal="false" aria-labelledby="cc-banner-title">
        <div id="cc-icon" aria-hidden="true">🍪</div>
        <div id="cc-text">
          <h3 id="cc-banner-title">Tu privacidad nos importa</h3>
          <p>
            Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico
            y personalizar contenidos. Puedes aceptar todas, rechazar las no esenciales o
            <button class="cc-btn-link" id="cc-open-panel-banner" style="background:none;border:none;cursor:pointer;color:${cfg.primaryColor};font-weight:700;font-size:13px;padding:0;text-decoration:underline;">personalizar tu elección</button>.
            <a href="${cfg.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Política de privacidad</a>
            ${cfg.cookiePolicyUrl ? `· <a href="${cfg.cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Política de cookies</a>` : ''}
          </p>
        </div>
        <div id="cc-actions">
          <button class="cc-btn cc-btn-ghost" id="cc-reject-btn">Solo necesarias</button>
          <button class="cc-btn cc-btn-secondary" id="cc-settings-btn">Personalizar</button>
          <button class="cc-btn cc-btn-primary" id="cc-accept-btn">Aceptar todo</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    document.getElementById('cc-accept-btn').addEventListener('click', acceptAll);
    document.getElementById('cc-reject-btn').addEventListener('click', rejectAll);
    document.getElementById('cc-settings-btn').addEventListener('click', openPanel);
    document.getElementById('cc-open-panel-banner').addEventListener('click', openPanel);
  }

  // ─── PANEL DE PREFERENCIAS ────────────────────────────────────────────────
  function createPanel() {
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cc-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', closePanel);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'cc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'cc-panel-title');

    const categoriesHTML = Object.values(CATEGORIES).map(cat => `
      <div class="cc-category" id="cc-cat-${cat.id}">
        <div class="cc-category-header">
          <span class="cc-category-icon" aria-hidden="true">${cat.icon}</span>
          <div class="cc-category-info">
            <strong>${cat.label}</strong>
            <span>${cat.description}</span>
          </div>
          ${cat.required
            ? `<span class="cc-required-badge">Siempre activas</span>`
            : `<label class="cc-toggle" aria-label="Activar cookies ${cat.label}">
                <input type="checkbox" id="cc-toggle-${cat.id}" data-category="${cat.id}"
                  ${currentConsent && currentConsent[cat.id] ? 'checked' : ''}>
                <span class="cc-toggle-track"></span>
               </label>`
          }
        </div>
      </div>
    `).join('');

    panel.innerHTML = `
      <div id="cc-panel-header">
        <div style="flex:1">
          <h2 id="cc-panel-title">🍪 Preferencias de cookies</h2>
          <p>${cfg.companyName} — Gestiona qué datos compartir con nosotros</p>
        </div>
        <button id="cc-panel-close" aria-label="Cerrar panel de cookies"
          style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:4px;line-height:1;opacity:.8;transition:opacity .2s"
          onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=.8">✕</button>
      </div>
      <div id="cc-panel-body">${categoriesHTML}</div>
      <div id="cc-panel-footer">
        <button class="cc-btn cc-btn-ghost" id="cc-panel-reject">Solo necesarias</button>
        <button class="cc-btn cc-btn-secondary" id="cc-panel-save">Guardar selección</button>
        <button class="cc-btn cc-btn-primary" id="cc-panel-accept-all">Aceptar todo</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    document.getElementById('cc-panel-close').addEventListener('click', closePanel);
    document.getElementById('cc-panel-reject').addEventListener('click', () => { rejectAll(); closePanel(); });
    document.getElementById('cc-panel-accept-all').addEventListener('click', () => { acceptAll(); closePanel(); });
    document.getElementById('cc-panel-save').addEventListener('click', saveFromPanel);

    // Trampa de foco (accesibilidad)
    panel.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panelOpen) closePanel(); });

    panelOpen = true;

    // Foco al primer elemento interactivo
    requestAnimationFrame(() => {
      const firstFocusable = panel.querySelector('button, input');
      if (firstFocusable) firstFocusable.focus();
    });
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const panel = document.getElementById('cc-panel');
    if (!panel) return;
    const focusable = [...panel.querySelectorAll('button, input, a[href]')].filter(el => !el.disabled);
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ─── BOTÓN PARA REABRIR ───────────────────────────────────────────────────
  function createReopenButton() {
    if (document.getElementById('cc-reopen')) return;
    const btn = document.createElement('button');
    btn.id = 'cc-reopen';
    btn.setAttribute('aria-label', 'Gestionar cookies');
    btn.innerHTML = '🍪';
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);
  }

  // ─── ACCIONES ─────────────────────────────────────────────────────────────
  function acceptAll() {
    const consent = buildDefaultConsent(true);
    applyConsent(consent);
    if (typeof cfg.onAcceptAll === 'function') cfg.onAcceptAll(consent);
    hideBanner();
  }

  function rejectAll() {
    const consent = buildDefaultConsent(false);
    applyConsent(consent);
    if (typeof cfg.onRejectAll === 'function') cfg.onRejectAll(consent);
    hideBanner();
  }

  function saveFromPanel() {
    const consent = buildDefaultConsent(false);
    Object.keys(CATEGORIES).forEach(key => {
      if (CATEGORIES[key].required) return;
      const toggle = document.getElementById(`cc-toggle-${key}`);
      if (toggle) consent[key] = toggle.checked;
    });
    applyConsent(consent);
    if (typeof cfg.onSave === 'function') cfg.onSave(consent);
    closePanel();
    hideBanner();
  }

  function applyConsent(consent) {
    currentConsent = consent;
    Storage.save(consent);
    dispatch(consent);
  }

  function hideBanner() {
    const banner = document.getElementById('cc-banner');
    if (!banner) return;
    banner.classList.add('cc-hide');
    setTimeout(() => {
      const wrapper = document.getElementById('cc-wrapper');
      if (wrapper) wrapper.remove();
      showReopenButton();
    }, 320);
  }

  function showReopenButton() {
    const btn = document.getElementById('cc-reopen');
    if (btn) btn.style.display = 'flex';
  }

  function openPanel() {
    if (panelOpen) return;
    // Sincronizar checkboxes con el consentimiento actual
    createPanel();
  }

  function closePanel() {
    panelOpen = false;
    const overlay = document.getElementById('cc-overlay');
    const panel   = document.getElementById('cc-panel');
    if (overlay) overlay.remove();
    if (panel)   panel.remove();
  }

  // ─── API PÚBLICA ──────────────────────────────────────────────────────────
  window.CookieConsent = {
    /**
     * Devuelve el consentimiento actual o null si no se ha decidido.
     */
    getConsent() {
      return currentConsent ? { ...currentConsent } : null;
    },
    /**
     * Comprueba si una categoría está aceptada.
     * @param {string} category - 'necessary' | 'analytics' | 'marketing' | 'preferences'
     */
    hasConsent(category) {
      return currentConsent ? !!currentConsent[category] : false;
    },
    /**
     * Abre el panel de preferencias desde código externo.
     */
    openPreferences() {
      openPanel();
    },
    /**
     * Resetea el consentimiento (útil para tests o botón en footer).
     */
    reset() {
      Storage.clear();
      currentConsent = null;
      closePanel();
      if (document.getElementById('cc-wrapper')) return;
      createBanner();
      const btn = document.getElementById('cc-reopen');
      if (btn) btn.style.display = 'none';
    },
  };

  // ─── INICIALIZACIÓN ───────────────────────────────────────────────────────
  function init() {
    injectStyles();

    const saved = Storage.get();

    if (saved) {
      currentConsent = saved.consent;
      dispatch(currentConsent);
      createReopenButton();
      showReopenButton();
    } else {
      createBanner();
      createReopenButton();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
