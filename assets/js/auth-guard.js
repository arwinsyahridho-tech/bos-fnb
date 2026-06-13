(() => {
  "use strict";

  document.documentElement.classList.add("biya-auth-pending");

  const auth = window.BiyaAuth;
  const loginPath = (auth && auth.config && auth.config.loginPath) || "/index.html";

  function redirectToLogin(reason) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ redirect: currentPath });
    if (reason) params.set("reason", reason);
    window.location.replace(`${loginPath}?${params.toString()}`);
  }

  function revealPage() {
    document.documentElement.classList.remove("biya-auth-pending");
  }

  async function protectPage() {
    if (!auth || !auth.client) {
      redirectToLogin("config");
      return;
    }

    try {
      const session = await auth.getSession();
      if (!session) {
        redirectToLogin("auth");
        return;
      }
      window.BIYA_SESSION = session;
      window.BIYA_CURRENT_USER = session.user;
      revealPage();
    } catch (error) {
      console.error("[BIYA Auth] Pemeriksaan sesi gagal", error);
      redirectToLogin("session");
    }
  }

  if (auth && auth.client && auth.client.auth) {
    auth.client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") redirectToLogin("logout");
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.documentElement.classList.add("biya-auth-pending");
    protectPage();
  });

  protectPage();
})();
