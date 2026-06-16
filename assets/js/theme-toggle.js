(function () {
  var STORAGE_KEY = 'biya-theme';
  var THEMES = { dark: true, light: true };

  function injectLightVisualFixes() {
    if (document.getElementById('biya-light-visual-fixes')) return;
    var style = document.createElement('style');
    style.id = 'biya-light-visual-fixes';
    style.textContent = `
html[data-theme="light"] {
  color-scheme: light;
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

/* Light mode only changes color tokens and surfaces. Layout, spacing, font sizes, card shape, and icons follow the dark theme. */
html[data-theme="light"] body {
  background: #f8faf6 !important;
  color: var(--text) !important;
}

html[data-theme="light"] .mobile-header {
  background: rgba(255,255,255,.94) !important;
  border-bottom-color: var(--border) !important;
  color: var(--text) !important;
}

html[data-theme="light"] .sidebar,
html[data-theme="light"] aside.sidebar,
html[data-theme="light"] div.sidebar,
html[data-theme="light"] .sidebar.open {
  background: rgba(255,255,255,.98) !important;
  border-color: var(--border) !important;
  box-shadow: 22px 0 60px rgba(16,36,63,.14) !important;
}

html[data-theme="light"] .mobile-overlay.open {
  background: rgba(16,36,63,.26) !important;
}

html[data-theme="light"] .logo,
html[data-theme="light"] .mobile-logo,
html[data-theme="light"] .item,
html[data-theme="light"] .item .biya-icon {
  color: var(--text) !important;
}

html[data-theme="light"] .logo small,
html[data-theme="light"] .mobile-logo small {
  color: var(--muted) !important;
  opacity: 1 !important;
}

html[data-theme="light"] .item:hover {
  background: var(--surface-soft) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .item.active {
  background: linear-gradient(135deg, rgba(22,160,100,.12), rgba(200,239,85,.30)) !important;
  border-color: var(--border-active) !important;
  color: var(--primary-dark) !important;
  box-shadow: var(--shadow-soft) !important;
}

html[data-theme="light"] .wrapper,
html[data-theme="light"] .main,
html[data-theme="light"] .page,
html[data-theme="light"] .page-shell,
html[data-theme="light"] .export-page {
  background: transparent !important;
  color: var(--text) !important;
}

html[data-theme="light"] .section,
html[data-theme="light"] .card,
html[data-theme="light"] .summary-box,
html[data-theme="light"] .mini-box,
html[data-theme="light"] .detail-card,
html[data-theme="light"] .menu-item,
html[data-theme="light"] .prep-item,
html[data-theme="light"] .category-block,
html[data-theme="light"] .box,
html[data-theme="light"] .alert-item,
html[data-theme="light"] .insight-item,
html[data-theme="light"] .modalBox,
html[data-theme="light"] .modal-card,
html[data-theme="light"] .section-card,
html[data-theme="light"] .panel,
html[data-theme="light"] .dashboard-hero,
html[data-theme="light"] .dashboard-section,
html[data-theme="light"] .dashboard-kpi,
html[data-theme="light"] .dashboard-health .health-score-compact,
html[data-theme="light"] .dashboard-health .health-metric,
html[data-theme="light"] .dashboard-product-card,
html[data-theme="light"] .dashboard-ranking .ranking-item,
html[data-theme="light"] .dashboard-category .mini-box,
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
}

html[data-theme="light"] :is(#ingredientTable, #editIngredientTable) td {
  background: transparent !important;
  border-color: transparent !important;
  color: var(--text) !important;
}

html[data-theme="light"] input,
html[data-theme="light"] select,
html[data-theme="light"] textarea,
html[data-theme="light"] .table-input,
html[data-theme="light"] .table-select,
html[data-theme="light"] .search-box input,
html[data-theme="light"] .chart-select,
html[data-theme="light"] input[type="file"] {
  background: #ffffff !important;
  border-color: var(--border) !important;
  color: var(--text) !important;
}

html[data-theme="light"] input::placeholder,
html[data-theme="light"] textarea::placeholder {
  color: rgba(82,103,96,.55) !important;
}

html[data-theme="light"] th,
html[data-theme="light"] thead th {
  background: var(--surface-soft) !important;
  color: var(--text) !important;
}

html[data-theme="light"] td,
html[data-theme="light"] tbody td {
  background: #ffffff !important;
  border-bottom-color: var(--border) !important;
  color: var(--text) !important;
}

html[data-theme="light"] tbody tr:hover td {
  background: var(--surface-soft) !important;
}

html[data-theme="light"] .dashboard-title,
html[data-theme="light"] .dashboard-section-title,
html[data-theme="light"] .title,
html[data-theme="light"] h1,
html[data-theme="light"] h2,
html[data-theme="light"] h3,
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
html[data-theme="light"] .summary-value,
html[data-theme="light"] .ranking-name,
html[data-theme="light"] .ranking-profit,
html[data-theme="light"] .mini-value {
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
html[data-theme="light"] .summary-title,
html[data-theme="light"] .ranking-category,
html[data-theme="light"] .mini-title {
  color: var(--muted) !important;
  opacity: 1 !important;
}

html[data-theme="light"] .ranking-category,
html[data-theme="light"] .product-category-badge,
html[data-theme="light"] .menu-badge,
html[data-theme="light"] .pill,
html[data-theme="light"] .status,
html[data-theme="light"] .snapshot-count,
html[data-theme="light"] .dashboard-category-meta,
html[data-theme="light"] .dashboard-product-label span {
  background: var(--surface-soft) !important;
  border-color: var(--border) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .ranking-margin,
html[data-theme="light"] .recipe-mobile-field.total .recipe-mobile-value,
html[data-theme="light"] .selected-recipe-field.total .selected-recipe-value,
html[data-theme="light"] .selected-recipe-total-value {
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .recipe-mobile-field.total,
html[data-theme="light"] .selected-recipe-field.total,
html[data-theme="light"] .selected-recipe-total,
html[data-theme="light"] .export-status {
  background: rgba(22,160,100,.09) !important;
  border-color: rgba(22,160,100,.22) !important;
  color: var(--primary-dark) !important;
}

html[data-theme="light"] .dashboard-product-card.worst .dashboard-product-label span,
html[data-theme="light"] .pill.red,
html[data-theme="light"] .profit-red,
html[data-theme="light"] .danger {
  background: #fee2e2 !important;
  border-color: rgba(220,38,38,.18) !important;
  color: #991b1b !important;
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
html[data-theme="light"] .selected-prep-icon,
html[data-theme="light"] .dashboard-ranking .ranking-position,
html[data-theme="light"] .summary-icon {
  background: linear-gradient(135deg, rgba(22,160,100,.14), rgba(200,239,85,.34)) !important;
  border-color: var(--border) !important;
  color: var(--primary-dark) !important;
  box-shadow: none !important;
}

html[data-theme="light"] .btn,
html[data-theme="light"] .btn-action,
html[data-theme="light"] .save-btn,
html[data-theme="light"] .add-row-btn,
html[data-theme="light"] .action,
html[data-theme="light"] .loginBtn,
html[data-theme="light"] .primary-btn,
html[data-theme="light"] .menu-toggle {
  background: linear-gradient(135deg, var(--primary), var(--accent)) !important;
  color: #ffffff !important;
}

html[data-theme="light"] .action.alt,
html[data-theme="light"] .export-card .action.alt,
html[data-theme="light"] .back-btn,
html[data-theme="light"] .btn.secondary,
html[data-theme="light"] .btn.alt {
  background: var(--surface-soft) !important;
  border-color: var(--border) !important;
  color: var(--primary-dark) !important;
  box-shadow: none !important;
}

html[data-theme="light"] .delete-btn,
html[data-theme="light"] .delete-btn-2,
html[data-theme="light"] .recipe-delete,
html[data-theme="light"] .btn-action.red {
  background: linear-gradient(145deg,#ff4b55,#df242e) !important;
  color: #ffffff !important;
  border-color: transparent !important;
}

/* Keep status badges readable in light mode without changing size or layout. */
html[data-theme="light"] .status-pill.status-green,
html[data-theme="light"] .status-green,
html[data-theme="light"] .badge.ok,
html[data-theme="light"] .status.ok,
html[data-theme="light"] .raw-status.ok {
  background: rgba(22,160,100,.13) !important;
  border: 1px solid rgba(22,160,100,.24) !important;
  color: #0b6945 !important;
  opacity: 1 !important;
  text-shadow: none !important;
}

html[data-theme="light"] .status-pill.status-yellow,
html[data-theme="light"] .status-yellow,
html[data-theme="light"] .badge.warning,
html[data-theme="light"] .status.warning {
  background: #fef3c7 !important;
  border: 1px solid rgba(217,119,6,.24) !important;
  color: #92400e !important;
  opacity: 1 !important;
  text-shadow: none !important;
}

html[data-theme="light"] .status-pill.status-red,
html[data-theme="light"] .status-red,
html[data-theme="light"] .badge.danger,
html[data-theme="light"] .status.danger {
  background: #fee2e2 !important;
  border: 1px solid rgba(220,38,38,.22) !important;
  color: #991b1b !important;
  opacity: 1 !important;
  text-shadow: none !important;
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
