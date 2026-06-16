(function () {
  var STORAGE_KEY = 'biya-theme';
  var THEMES = { dark: true, light: true };

  function injectLightVisualFixes() {
    if (document.getElementById('biya-light-visual-fixes')) return;
    var style = document.createElement('style');
    style.id = 'biya-light-visual-fixes';
    style.textContent = `
html[data-theme="light"] {
  --dashboard-border: rgba(22, 160, 100, 0.18);
  --dashboard-surface: #ffffff;
  --dashboard-soft: #edf8ee;
  --dashboard-muted: #526760;
  --export-line: rgba(22, 160, 100, 0.18);
  --export-muted: #526760;
  --export-panel: #ffffff;
  --line: rgba(22, 160, 100, 0.18);
  --line-strong: rgba(22, 160, 100, 0.36);
  --panel: #ffffff;
  --panel-deep: #edf8ee;
  --panel-soft: #edf8ee;
  --menu-input: #ffffff;
  --menu-muted: #526760;
  --muted: #526760;
}

html[data-theme="light"] body {
  background: radial-gradient(circle at 82% -8%, rgba(200,239,85,.34), transparent 28rem), radial-gradient(circle at -12% 30%, rgba(22,160,100,.13), transparent 24rem), #f8faf6 !important;
}

html[data-theme="light"] .dashboard-hero,
html[data-theme="light"] .dashboard-section,
html[data-theme="light"] .dashboard-product-card,
html[data-theme="light"] .dashboard-ranking .ranking-item,
html[data-theme="light"] .dashboard-category .mini-box,
html[data-theme="light"] .dashboard-section .notice,
html[data-theme="light"] .export-hero,
html[data-theme="light"] .export-page .section,
html[data-theme="light"] .export-card,
html[data-theme="light"] .snapshot-card,
html[data-theme="light"] .selected-section,
html[data-theme="light"] .product-photo,
html[data-theme="light"] .selling-price,
html[data-theme="light"] .metric,
html[data-theme="light"] .recipe-mobile-item,
html[data-theme="light"] .selected-prep-hero,
html[data-theme="light"] .selected-metric,
html[data-theme="light"] .selected-recipe-panel,
html[data-theme="light"] .selected-recipe-item {
  background: #ffffff !important;
  border-color: var(--border) !important;
  color: var(--text) !important;
  box-shadow: var(--shadow-soft) !important;
}

html[data-theme="light"] .dashboard-kpi,
html[data-theme="light"] .dashboard-health .health-score-compact,
html[data-theme="light"] .dashboard-health .health-metric,
html[data-theme="light"] .dashboard-alerts .alert-item,
html[data-theme="light"] .health-metric,
html[data-theme="light"] .product-mini-stat,
html[data-theme="light"] .ingredients-panel,
html[data-theme="light"] .menu-recipe-panel,
html[data-theme="light"] .recipe-row,
html[data-theme="light"] .edit-recipe-row,
html[data-theme="light"] :is(#ingredientTable, #editIngredientTable) tr,
html[data-theme="light"] .recipe-mobile-field,
html[data-theme="light"] .selected-recipe-field,
html[data-theme="light"] .restore-upload-wrap,
html[data-theme="light"] .summary-grid > .summary-box,
html[data-theme="light"] .settings-list > label {
  background: var(--surface-soft) !important;
  border-color: var(--border) !important;
  color: var(--text) !important;
  box-shadow: none !important;
}

html[data-theme="light"] .ingredients-panel,
html[data-theme="light"] .menu-recipe-panel {
  background: linear-gradient(180deg, rgba(237,248,238,.95), rgba(255,255,255,.98)) !important;
}

html[data-theme="light"] :is(#ingredientTable, #editIngredientTable) tr,
html[data-theme="light"] .recipe-row,
html[data-theme="light"] .edit-recipe-row {
  background: #ffffff !important;
  box-shadow: 0 10px 26px rgba(37,80,55,.08) !important;
}

html[data-theme="light"] :is(#ingredientTable, #editIngredientTable) td {
  background: transparent !important;
  border-color: transparent !important;
  color: var(--text) !important;
}

html[data-theme="light"] .dashboard-hero-icon,
html[data-theme="light"] .dashboard-kpi-icon,
html[data-theme="light"] .hero-icon,
html[data-theme="light"] .recipe-number,
html[data-theme="light"] .score-circle,
html[data-theme="light"] .export-hero-icon,
html[data-theme="light"] .section-heading-icon,
html[data-theme="light"] .export-card-icon,
html[data-theme="light"] .restore-upload-icon,
html[data-theme="light"] .selected-prep-icon {
  background: linear-gradient(135deg, rgba(22,160,100,.14), rgba(200,239,85,.34)) !important;
  border-color: var(--border) !important;
  color: var(--primary-dark) !important;
  box-shadow: none !important;
}

html[data-theme="light"] .dashboard-title,
html[data-theme="light"] .dashboard-section-title,
html[data-theme="light"] .health-label,
html[data-theme="light"] .metric-value,
html[data-theme="light"] .recipe-mobile-title,
html[data-theme="light"] .recipe-mobile-value,
html[data-theme="light"] .selected-recipe-value,
html[data-theme="light"] .selected-prep-name,
html[data-theme="light"] .cost-main,
html[data-theme="light"] .selling-price .cost-main,
html[data-theme="light"] .snapshot-name,
html[data-theme="light"] .snapshot-date strong,
html[data-theme="light"] .export-page .title,
html[data-theme="light"] .export-section-title,
html[data-theme="light"] .export-card h3,
html[data-theme="light"] .summary-value {
  color: var(--text) !important;
}

html[data-theme="light"] .dashboard-description,
html[data-theme="light"] .dashboard-section-description,
html[data-theme="light"] .metric-label,
html[data-theme="light"] .metric-note,
html[data-theme="light"] .recipe-mobile-label,
html[data-theme="light"] .recipe-mobile-type,
html[data-theme="light"] .selected-recipe-label,
html[data-theme="light"] .cost-label,
html[data-theme="light"] .detail-desc,
html[data-theme="light"] .export-page .sub,
html[data-theme="light"] .export-section-sub,
html[data-theme="light"] .export-card p,
html[data-theme="light"] .restore-file-name,
html[data-theme="light"] .restore-message,
html[data-theme="light"] .snapshot-date,
html[data-theme="light"] .sub,
html[data-theme="light"] .muted,
html[data-theme="light"] .small,
html[data-theme="light"] .small-note,
html[data-theme="light"] .summary-title {
  color: var(--muted) !important;
  opacity: 1 !important;
}

html[data-theme="light"] .recipe-mobile-field.total,
html[data-theme="light"] .selected-recipe-field.total,
html[data-theme="light"] .selected-recipe-total {
  background: rgba(22,160,100,.09) !important;
  border-color: rgba(22,160,100,.22) !important;
}

html[data-theme="light"] .recipe-mobile-field.total .recipe-mobile-value,
html[data-theme="light"] .selected-recipe-field.total .selected-recipe-value,
html[data-theme="light"] .selected-recipe-total-value,
html[data-theme="light"] .ranking-margin {
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .bar-track,
html[data-theme="light"] .thumb,
html[data-theme="light"] .product-compact-thumb,
html[data-theme="light"] .photo-preview,
html[data-theme="light"] .restore-upload-btn {
  background: #ffffff !important;
  border-color: var(--border) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .export-status {
  background: rgba(22,160,100,.10) !important;
  border-color: rgba(22,160,100,.22) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .snapshot-count,
html[data-theme="light"] .dashboard-category-meta,
html[data-theme="light"] .product-category-badge,
html[data-theme="light"] .dashboard-product-label span {
  background: var(--surface-soft) !important;
  border: 1px solid var(--border) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .dashboard-product-card.worst .dashboard-product-label span {
  background: #fee2e2 !important;
  border-color: rgba(220,38,38,.18) !important;
  color: #991b1b !important;
}

html[data-theme="light"] .action.alt,
html[data-theme="light"] .export-card .action.alt,
html[data-theme="light"] .back-btn {
  background: var(--surface-soft) !important;
  border: 1px solid var(--border) !important;
  color: var(--primary-dark) !important;
  box-shadow: none !important;
}

html[data-theme="light"] .sidebar.open {
  background: rgba(255,255,255,.98) !important;
  box-shadow: 22px 0 60px rgba(16,36,63,.18) !important;
}

html[data-theme="light"] .mobile-overlay.open {
  background: rgba(16,36,63,.26) !important;
}

html[data-theme="light"] .delete-btn,
html[data-theme="light"] .delete-btn-2,
html[data-theme="light"] .recipe-delete {
  background: linear-gradient(145deg,#ff4b55,#df242e) !important;
  color: #fff !important;
  border: 0 !important;
}

/* Cost Management Dashboard: stronger BIYA identity for light mode. */
html[data-theme="light"] body:has(.dashboard-stack) .main {
  background: radial-gradient(circle at 85% 4%, rgba(200,239,85,.22), transparent 22rem), radial-gradient(circle at 0 24%, rgba(22,160,100,.10), transparent 20rem) !important;
}

html[data-theme="light"] .dashboard-stack {
  gap: 20px !important;
}

html[data-theme="light"] .dashboard-hero,
html[data-theme="light"] .dashboard-section {
  position: relative !important;
  overflow: hidden !important;
  border: 1px solid rgba(22,160,100,.20) !important;
  border-radius: 26px !important;
  background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(244,251,241,.96)) !important;
  box-shadow: 0 20px 50px rgba(31,78,53,.10), inset 0 1px rgba(255,255,255,.9) !important;
}

html[data-theme="light"] .dashboard-hero::before,
html[data-theme="light"] .dashboard-section::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: 0 !important;
  height: 4px !important;
  background: linear-gradient(90deg, #0b6945 0%, #16a064 46%, #c8ef55 100%) !important;
}

html[data-theme="light"] .dashboard-hero::after {
  content: "" !important;
  position: absolute !important;
  right: -85px !important;
  top: -95px !important;
  width: 230px !important;
  height: 230px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(200,239,85,.42), rgba(22,160,100,.16) 50%, transparent 72%) !important;
  pointer-events: none !important;
}

html[data-theme="light"] .dashboard-hero-head,
html[data-theme="light"] .dashboard-section-head,
html[data-theme="light"] .dashboard-hero .dashboard-kpi-grid,
html[data-theme="light"] .dashboard-section > * {
  position: relative !important;
  z-index: 1 !important;
}

html[data-theme="light"] .dashboard-hero-icon {
  width: 64px !important;
  height: 64px !important;
  flex-basis: 64px !important;
  border-radius: 20px !important;
  background: linear-gradient(145deg, rgba(9,132,85,.12), rgba(200,239,85,.46)) !important;
  border: 1px solid rgba(22,160,100,.24) !important;
  color: #08714b !important;
  box-shadow: 0 16px 34px rgba(22,160,100,.15) !important;
}

html[data-theme="light"] .dashboard-hero-icon .biya-icon {
  width: 32px !important;
  height: 32px !important;
}

html[data-theme="light"] .dashboard-title {
  color: #10243f !important;
  letter-spacing: -.04em !important;
}

html[data-theme="light"] .dashboard-description,
html[data-theme="light"] .dashboard-section-description {
  color: #526760 !important;
}

html[data-theme="light"] .dashboard-divider {
  height: 1px !important;
  background: linear-gradient(90deg, rgba(22,160,100,.22), rgba(200,239,85,.38), rgba(22,160,100,.05)) !important;
}

html[data-theme="light"] .dashboard-kpi,
html[data-theme="light"] .dashboard-health .health-metric,
html[data-theme="light"] .dashboard-health .health-score-compact,
html[data-theme="light"] .dashboard-alerts .alert-item,
html[data-theme="light"] .dashboard-product-card,
html[data-theme="light"] .dashboard-ranking .ranking-item,
html[data-theme="light"] .dashboard-category .mini-box {
  position: relative !important;
  overflow: hidden !important;
  border: 1px solid rgba(22,160,100,.18) !important;
  background: linear-gradient(145deg, rgba(237,248,238,.92), rgba(255,255,255,.98)) !important;
  box-shadow: 0 10px 28px rgba(31,78,53,.07) !important;
}

html[data-theme="light"] .dashboard-kpi::after,
html[data-theme="light"] .dashboard-product-card::after {
  content: "" !important;
  position: absolute !important;
  right: -44px !important;
  top: -54px !important;
  width: 120px !important;
  height: 120px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(200,239,85,.34), transparent 68%) !important;
  pointer-events: none !important;
}

html[data-theme="light"] .dashboard-kpi-icon,
html[data-theme="light"] .dashboard-ranking .ranking-position {
  background: linear-gradient(145deg, #dff8dc, #c8ef55) !important;
  color: #08714b !important;
  border: 1px solid rgba(22,160,100,.18) !important;
  box-shadow: 0 8px 18px rgba(22,160,100,.12) !important;
}

html[data-theme="light"] .dashboard-kpi .summary-title,
html[data-theme="light"] .dashboard-health .metric-label,
html[data-theme="light"] .dashboard-category .mini-title {
  color: #526760 !important;
  font-weight: 700 !important;
}

html[data-theme="light"] .dashboard-kpi .summary-value,
html[data-theme="light"] .dashboard-health .metric-value,
html[data-theme="light"] .dashboard-category .mini-value,
html[data-theme="light"] .ranking-profit {
  color: #10243f !important;
}

html[data-theme="light"] .dashboard-health .score-circle {
  background: linear-gradient(145deg, rgba(22,160,100,.16), rgba(200,239,85,.56)) !important;
  color: #08714b !important;
  border-color: rgba(22,160,100,.22) !important;
  box-shadow: 0 14px 28px rgba(22,160,100,.14) !important;
}

html[data-theme="light"] .dashboard-product-label span,
html[data-theme="light"] .dashboard-category-meta {
  border-color: rgba(22,160,100,.20) !important;
  background: linear-gradient(135deg, rgba(22,160,100,.10), rgba(200,239,85,.28)) !important;
  color: #0b6945 !important;
}

html[data-theme="light"] .dashboard-product-card.worst .dashboard-product-label span {
  background: #fee2e2 !important;
  border-color: rgba(220,38,38,.20) !important;
  color: #991b1b !important;
}

/* Mobile readability layer: make labels, helper text, cards, and badges easier to read on phones. */
@media (max-width: 700px) {
  html[data-theme="light"] body { font-size: 16px !important; }

  html[data-theme="light"] .ingredients-panel,
  html[data-theme="light"] .menu-recipe-panel { padding: 18px 14px !important; }

  html[data-theme="light"] .export-hero { background: #ffffff !important; }

  html[data-theme="light"] .sub,
  html[data-theme="light"] .muted,
  html[data-theme="light"] .small,
  html[data-theme="light"] .small-note,
  html[data-theme="light"] .notice,
  html[data-theme="light"] .card-sub,
  html[data-theme="light"] .dashboard-description,
  html[data-theme="light"] .dashboard-section-description,
  html[data-theme="light"] .export-page .sub,
  html[data-theme="light"] .export-section-sub,
  html[data-theme="light"] .export-card p,
  html[data-theme="light"] .menu-card-description,
  html[data-theme="light"] .menu-list-description,
  html[data-theme="light"] .section-sub,
  html[data-theme="light"] .section-description {
    font-size: 14.5px !important;
    line-height: 1.55 !important;
    color: #526760 !important;
  }

  html[data-theme="light"] label,
  html[data-theme="light"] .filter-label,
  html[data-theme="light"] .menu-field label,
  html[data-theme="light"] .recipe-field-label,
  html[data-theme="light"] .edit-menu-field label,
  html[data-theme="light"] .summary-title,
  html[data-theme="light"] .metric-label,
  html[data-theme="light"] .recipe-mobile-label,
  html[data-theme="light"] .selected-recipe-label,
  html[data-theme="light"] .detail-label,
  html[data-theme="light"] .cost-label,
  html[data-theme="light"] .mini-title {
    font-size: 14px !important;
    line-height: 1.35 !important;
    color: #39524a !important;
    letter-spacing: 0 !important;
    opacity: 1 !important;
  }

  html[data-theme="light"] input,
  html[data-theme="light"] select,
  html[data-theme="light"] textarea,
  html[data-theme="light"] .table-input,
  html[data-theme="light"] .table-select,
  html[data-theme="light"] .search-box input,
  html[data-theme="light"] .filter-box select,
  html[data-theme="light"] .chart-select {
    min-height: 54px !important;
    font-size: 16px !important;
    line-height: 1.35 !important;
  }

  html[data-theme="light"] .title,
  html[data-theme="light"] .dashboard-title,
  html[data-theme="light"] .menu-card-title,
  html[data-theme="light"] .selected-menu-title,
  html[data-theme="light"] .product-name {
    font-size: clamp(26px, 7.2vw, 34px) !important;
    line-height: 1.16 !important;
  }

  html[data-theme="light"] h2,
  html[data-theme="light"] h3,
  html[data-theme="light"] .section-title,
  html[data-theme="light"] .section-heading-title,
  html[data-theme="light"] .dashboard-section-title,
  html[data-theme="light"] .export-section-title,
  html[data-theme="light"] .menu-section-title,
  html[data-theme="light"] .menu-list-heading,
  html[data-theme="light"] .card-title {
    font-size: 21px !important;
    line-height: 1.22 !important;
  }

  html[data-theme="light"] .summary-value,
  html[data-theme="light"] .metric-value,
  html[data-theme="light"] .recipe-mobile-value,
  html[data-theme="light"] .selected-recipe-value,
  html[data-theme="light"] .detail-value,
  html[data-theme="light"] .mini-value,
  html[data-theme="light"] .cost-main {
    font-size: 20px !important;
    line-height: 1.25 !important;
  }

  html[data-theme="light"] .dashboard-kpi .summary-value,
  html[data-theme="light"] .selling-price .cost-main,
  html[data-theme="light"] .recipe-mobile-field.total .recipe-mobile-value,
  html[data-theme="light"] .selected-recipe-total-value { font-size: 23px !important; }

  html[data-theme="light"] .pill,
  html[data-theme="light"] .badge,
  html[data-theme="light"] .status,
  html[data-theme="light"] .menu-badge,
  html[data-theme="light"] .status-pill,
  html[data-theme="light"] .recipe-count,
  html[data-theme="light"] .ingredient-count,
  html[data-theme="light"] .snapshot-count,
  html[data-theme="light"] .dashboard-category-meta,
  html[data-theme="light"] .product-category-badge,
  html[data-theme="light"] .dashboard-product-label span {
    min-height: 30px !important;
    padding: 7px 10px !important;
    font-size: 13px !important;
    line-height: 1.15 !important;
    font-weight: 750 !important;
  }

  html[data-theme="light"] .dashboard-kpi,
  html[data-theme="light"] .health-metric,
  html[data-theme="light"] .product-mini-stat,
  html[data-theme="light"] .metric,
  html[data-theme="light"] .summary-box,
  html[data-theme="light"] .recipe-mobile-field,
  html[data-theme="light"] .selected-recipe-field,
  html[data-theme="light"] .snapshot-card,
  html[data-theme="light"] .export-card { padding: 14px !important; }

  html[data-theme="light"] .ranking-name,
  html[data-theme="light"] .snapshot-name,
  html[data-theme="light"] .export-card h3,
  html[data-theme="light"] .menu-name,
  html[data-theme="light"] .recipe-mobile-title,
  html[data-theme="light"] .selected-recipe-name {
    font-size: 16px !important;
    line-height: 1.35 !important;
  }

  html[data-theme="light"] .ranking-category,
  html[data-theme="light"] .ranking-profit,
  html[data-theme="light"] .ranking-margin,
  html[data-theme="light"] .snapshot-date,
  html[data-theme="light"] .restore-file-name,
  html[data-theme="light"] .restore-message,
  html[data-theme="light"] .product-category-badge.secondary {
    font-size: 13px !important;
    line-height: 1.35 !important;
  }

  html[data-theme="light"] .dashboard-hero,
  html[data-theme="light"] .dashboard-section {
    border-radius: 24px !important;
  }

  html[data-theme="light"] .dashboard-hero-icon {
    width: 58px !important;
    height: 58px !important;
    flex-basis: 58px !important;
  }
}
`;
    document.head.appendChild(style);
  }

  function getStoredTheme() {
    try {
      var value = window.localStorage && window.localStorage.getItem(STORAGE_KEY);
      return THEMES[value] ? value : 'dark';
    } catch (error) {
      return 'dark';
    }
  }

  function setStoredTheme(theme) {
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch (error) {}
  }

  function applyTheme(theme) {
    var safeTheme = THEMES[theme] ? theme : 'dark';
    document.documentElement.dataset.theme = safeTheme;
    var themeColor = safeTheme === 'light' ? '#f8faf6' : '#04122b';
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var isLight = safeTheme === 'light';
      button.setAttribute('aria-label', 'Aktifkan ' + (isLight ? 'dark' : 'light') + ' mode');
      button.setAttribute('title', 'Theme: ' + (isLight ? 'Light' : 'Dark'));
      var icon = button.querySelector('[data-theme-icon]');
      var label = button.querySelector('[data-theme-label]');
      if (icon) icon.textContent = isLight ? '☀️' : '🌙';
      if (label) label.textContent = isLight ? 'Light' : 'Dark';
    });
  }

  function createToggle(extraClass) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle' + (extraClass ? ' ' + extraClass : '');
    button.dataset.themeToggle = 'true';
    button.innerHTML = '<span class="theme-toggle__icon" data-theme-icon aria-hidden="true"></span><span class="theme-toggle__label" data-theme-label></span>';
    button.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setStoredTheme(next);
    });
    return button;
  }

  function mountToggle() {
    if (document.querySelector('[data-theme-toggle]')) {
      applyTheme(document.documentElement.dataset.theme || getStoredTheme());
      return;
    }
    var toggle = createToggle('');
    var account = document.querySelector('.account-shortcut, .profile-shortcut, [data-portal-link="account-center"], .header-actions .button');
    var mobileMenu = document.querySelector('.mobile-header .menu-toggle, .mobile-header button:last-child');
    var headerActions = document.querySelector('.header-actions');
    var topbar = document.querySelector('.topbar');
    var mobileHeader = document.querySelector('.mobile-header');

    if (account && account.parentElement) {
      account.parentElement.insertBefore(toggle, account);
    } else if (headerActions) {
      headerActions.prepend(toggle);
    } else if (topbar) {
      topbar.appendChild(toggle);
    } else if (mobileMenu && mobileHeader) {
      mobileHeader.insertBefore(toggle, mobileMenu);
      document.body.classList.add('has-mobile-theme-toggle');
      var desktopToggle = createToggle('theme-toggle-floating');
      document.body.appendChild(desktopToggle);
    } else {
      toggle.classList.add('theme-toggle-floating');
      document.body.appendChild(toggle);
    }
    applyTheme(document.documentElement.dataset.theme || getStoredTheme());
  }

  injectLightVisualFixes();
  applyTheme(getStoredTheme());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountToggle);
  else mountToggle();
})();
