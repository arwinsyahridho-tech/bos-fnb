(function () {
  var STORAGE_KEY = 'biya-theme';
  var THEMES = { dark: true, light: true };

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

  applyTheme(getStoredTheme());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountToggle);
  else mountToggle();
})();
