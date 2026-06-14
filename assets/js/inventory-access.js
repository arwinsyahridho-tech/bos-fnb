(() => {
  "use strict";

  const INVENTORY_ALLOWED_EMAIL = "arwinsyahridho@gmail.com";
  const LOGIN_PATH = "/index.html";
  const MODULE_CENTER_PATH = "/menu-modules/dashboard.html";
  const ACCESS_MESSAGE = "Akses modul Inventory masih terbatas.";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  async function getCurrentUser() {
    const auth = window.BiyaAuth;
    if (!auth || !auth.client || !auth.client.auth) return null;

    const guardedSession = window.BIYA_AUTH_GUARD_READY
      ? await window.BIYA_AUTH_GUARD_READY
      : await auth.getSession();
    if (!guardedSession || !guardedSession.user) return null;

    const { data, error } = await auth.client.auth.getUser();
    if (!error && data && data.user && data.user.id === guardedSession.user.id) {
      return data.user;
    }
    return guardedSession.user;
  }

  function isInventoryAllowed(user) {
    return Boolean(user && normalizeEmail(user.email) === INVENTORY_ALLOWED_EMAIL);
  }

  function redirectToLogin() {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ redirect: currentPath, reason: "auth" });
    window.location.replace(`${LOGIN_PATH}?${params.toString()}`);
  }

  async function requireInventoryAccess(options = {}) {
    const user = await getCurrentUser();
    if (!user) {
      redirectToLogin();
      return null;
    }
    if (isInventoryAllowed(user)) return user;

    if (options.showMessage !== false) {
      window.sessionStorage.setItem("biya_inventory_notice", ACCESS_MESSAGE);
    }
    window.location.replace(options.redirectTo || MODULE_CENTER_PATH);
    return null;
  }

  window.BIYAInventoryAccess = Object.freeze({
    ACCESS_MESSAGE,
    ALLOWED_EMAIL: INVENTORY_ALLOWED_EMAIL,
    getCurrentUser,
    isInventoryAllowed,
    requireInventoryAccess
  });
})();
