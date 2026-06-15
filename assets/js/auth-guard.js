(() => {
  "use strict";

  document.documentElement.classList.add("biya-auth-pending");

  const auth = window.BiyaAuth;
  const deletionGuard = window.BIYADeletionGuard;
  const loginPath = (auth && auth.config && auth.config.loginPath) || "/index.html";
  let guardRedirecting = false;

  function redirectToLogin(reason) {
    if (guardRedirecting) return;
    guardRedirecting = true;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ redirect: currentPath });
    if (reason) params.set("reason", reason);
    window.location.replace(`${loginPath}?${params.toString()}`);
  }

  function revealPage() {
    document.documentElement.classList.remove("biya-auth-pending");
  }

  function onBodyReady(callback) {
    if (document.body) {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFullscreenMode() {
    const target = document.documentElement;
    const request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (!request) return Promise.reject(new Error("Fullscreen API is not supported"));
    return request.call(target);
  }

  function exitFullscreenMode() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return Promise.resolve();
    return exit.call(document);
  }

  function initFullscreenToggle() {
    if (document.getElementById("biyaFullscreenToggle")) return;

    const target = document.documentElement;
    const canFullscreen = Boolean(target.requestFullscreen || target.webkitRequestFullscreen);
    if (!canFullscreen) return;

    const button = document.createElement("button");
    button.id = "biyaFullscreenToggle";
    button.className = "biya-fullscreen-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Aktifkan fullscreen mode");
    button.setAttribute("title", "Fullscreen mode");
    button.innerHTML = `
      <span class="biya-fullscreen-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
          <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
          <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
          <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
        </svg>
      </span>
      <span class="biya-fullscreen-label">Fullscreen</span>
    `;

    const label = button.querySelector(".biya-fullscreen-label");

    function updateState() {
      const isFullscreen = Boolean(getFullscreenElement());
      button.classList.toggle("is-active", isFullscreen);
      button.classList.remove("is-error");
      button.setAttribute(
        "aria-label",
        isFullscreen ? "Keluar dari fullscreen mode" : "Aktifkan fullscreen mode"
      );
      button.setAttribute("title", isFullscreen ? "Exit fullscreen" : "Fullscreen mode");
      if (label) label.textContent = isFullscreen ? "Exit" : "Fullscreen";
    }

    async function toggleFullscreen() {
      button.disabled = true;
      try {
        if (getFullscreenElement()) {
          await exitFullscreenMode();
        } else {
          await requestFullscreenMode();
        }
      } catch (error) {
        console.warn("[BIYA Fullscreen] Fullscreen mode tidak bisa diaktifkan", error);
        button.classList.add("is-error");
        if (label) label.textContent = "Tidak didukung";
        window.setTimeout(updateState, 1600);
      } finally {
        button.disabled = false;
      }
    }

    button.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateState);
    document.addEventListener("webkitfullscreenchange", updateState);
    document.body.appendChild(button);
    updateState();
  }

  async function protectPage() {
    if (!auth || !auth.client || !deletionGuard) {
      redirectToLogin("config");
      return;
    }

    try {
      const session = await auth.getSession();
      if (!session) {
        redirectToLogin("auth");
        return;
      }
      const activeRequest = await deletionGuard.blockAndSignOutIfNeeded(auth.client, session.user.id);
      if (activeRequest) {
        redirectToLogin("deletion");
        return;
      }
      window.BIYA_SESSION = session;
      window.BIYA_CURRENT_USER = session.user;
      revealPage();
      onBodyReady(initFullscreenToggle);
      return session;
    } catch (error) {
      console.error("[BIYA Deletion Guard] Pemeriksaan sesi atau status penghapusan gagal", error);
      deletionGuard.storeNotice(deletionGuard.VERIFICATION_NOTICE);
      try {
        await auth.client.auth.signOut();
      } catch (signOutError) {
        console.error("[BIYA Deletion Guard] Gagal mengakhiri sesi setelah verifikasi gagal", signOutError);
      }
      redirectToLogin("verification");
    }
  }

  if (auth && auth.client && auth.client.auth) {
    auth.client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !guardRedirecting) redirectToLogin("logout");
    });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    document.documentElement.classList.add("biya-auth-pending");
    protectPage();
  });

  window.BIYA_AUTH_GUARD_READY = protectPage();
})();