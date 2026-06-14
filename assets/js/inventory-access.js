(() => {
  "use strict";

  const INVENTORY_ALLOWED_EMAIL = "arwinsyahridho@gmail.com";
  const LOGIN_PATH = "/index.html";
  const MODULE_CENTER_PATH = "/menu-modules/dashboard.html";
  const ACCESS_MESSAGE = "Akses modul Inventory masih terbatas.";
  let loginRedirectStarted = false;

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
    if (loginRedirectStarted) return;
    loginRedirectStarted = true;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ redirect: currentPath, reason: "auth" });
    window.location.replace(`${LOGIN_PATH}?${params.toString()}`);
  }

  async function requireInventoryAccess(options = {}) {
    console.log("[Inventory] Opening module");
    let user;
    try {
      user = await getCurrentUser();
    } catch (error) {
      console.error("[Inventory] Session check failed", error);
      if (typeof options.onError === "function") options.onError(error);
      return null;
    }
    console.log("[Inventory] User session:", user);
    if (!user) {
      redirectToLogin();
      return null;
    }
    const email = normalizeEmail(user.email);
    console.log("[Inventory] User email:", email);
    if (isInventoryAllowed(user)) {
      console.log("[Inventory] Access granted");
      return user;
    }

    console.log("[Inventory] Access denied");
    if (typeof options.onDenied === "function") options.onDenied(user);
    return null;
  }

  window.BIYAInventoryAccess = Object.freeze({
    ACCESS_MESSAGE,
    ALLOWED_EMAIL: INVENTORY_ALLOWED_EMAIL,
    LOGIN_PATH,
    MODULE_CENTER_PATH,
    getCurrentUser,
    isInventoryAllowed,
    requireInventoryAccess
  });
})();
