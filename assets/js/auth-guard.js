(() => {
  "use strict";

  document.documentElement.classList.add("biya-auth-pending");

  const FULLSCREEN_LOCK_KEY = "BIYA_FULLSCREEN_LOCKED";
  const SHELL_ID = "biyaFullscreenShell";
  const SHELL_FRAME_ID = "biyaFullscreenShellFrame";

  const auth = window.BiyaAuth;
  const deletionGuard = window.BIYADeletionGuard;
  const loginPath = (auth && auth.config && auth.config.loginPath) || "/index.html";
  let guardRedirecting = false;
  let exitingViaButton = false;

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

  function isEmbeddedPage() {
    try {
      return window.self !== window.top;
    } catch (error) {
      return true;
    }
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

  function readFullscreenLock() {
    try {
      return window.localStorage.getItem(FULLSCREEN_LOCK_KEY) === "true";
    } catch (error) {
      return false;
    }
  }

  function setFullscreenLock(value) {
    try {
      if (value) {
        window.localStorage.setItem(FULLSCREEN_LOCK_KEY, "true");
      } else {
        window.localStorage.removeItem(FULLSCREEN_LOCK_KEY);
      }
    } catch (error) {
      // Ignore storage issues; fullscreen still works for the current page.
    }
  }

  function isInternalUrl(url) {
    try {
      const target = new URL(url, window.location.href);
      if (target.origin !== window.location.origin) return false;
      if (target.protocol !== "http:" && target.protocol !== "https:") return false;
      if (/\.(pdf|xlsx?|csv|zip|png|jpe?g|webp|gif|svg|ico)$/i.test(target.pathname)) return false;
      if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) return false;
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalizeNavigationUrl(url) {
    try {
      return new URL(url, window.location.href).href;
    } catch (error) {
      return "";
    }
  }

  function getModuleNavigationMap() {
    return [
      ["module center", "/menu-modules/dashboard.html"],
      ["account center", "/account-center/"],
      ["dashboard", window.location.pathname.includes("/modules/inventory/") ? "/modules/inventory/dashboard.html" : "/modules/cost-management/costdashboard.html"],
      ["raw material", "/modules/cost-management/rawmaterial.html"],
      ["raw master", "/modules/cost-management/rawmaterial.html"],
      ["preparation", "/modules/cost-management/preparation.html"],
      ["product hpp", "/modules/cost-management/producthpp.html"],
      ["produk hpp", "/modules/cost-management/producthpp.html"],
      ["export", "/modules/cost-management/exportcenter.html"],
      ["setting", window.location.pathname.includes("/modules/inventory/") ? "/modules/inventory/settings.html" : "/modules/cost-management/settings.html"],
      ["cost management", "/modules/cost-management/costdashboard.html"],
      ["inventory", "/modules/inventory/dashboard.html"],
      ["stock item", "/modules/inventory/stockitem.html"],
      ["stock in", "/modules/inventory/stockin.html"],
      ["stock card", "/modules/inventory/stockcard.html"],
      ["opname", "/modules/inventory/opname.html"],
      ["waste", "/modules/inventory/waste.html"],
      ["report", "/modules/inventory/report.html"],
      ["finance", "/modules/finance/dashboard-finance.html"],
      ["pos", "/modules/pos/dashboard-pos"],
      ["reservation", "/modules/reservation/dashboard-reservation.html"],
      ["reservasi", "/modules/reservation/dashboard-reservation.html"],
      ["cost intelligent", "/modules/cost-inteligent/dashboard-costinteligent"],
      ["cost inteligent", "/modules/cost-inteligent/dashboard-costinteligent"]
    ];
  }

  function getNavigationUrlFromClick(event) {
    const clicked = event.target;
    if (!clicked || typeof clicked.closest !== "function") return "";

    const anchor = clicked.closest("a[href]");
    if (anchor) {
      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref || rawHref.trim().startsWith("#")) return "";
      if (anchor.target && anchor.target !== "_self") return "";
      if (anchor.hasAttribute("download")) return "";
      return normalizeNavigationUrl(anchor.href);
    }

    const navTarget = clicked.closest("[data-biya-nav], [data-nav-url], [data-href], .item");
    if (!navTarget) return "";

    const dataUrl =
      navTarget.getAttribute("data-biya-nav") ||
      navTarget.getAttribute("data-nav-url") ||
      navTarget.getAttribute("data-href") ||
      navTarget.getAttribute("href") ||
      "";
    if (dataUrl) return normalizeNavigationUrl(dataUrl);

    const label = (navTarget.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!label) return "";

    const match = getModuleNavigationMap().find(([keyword]) => label.includes(keyword));
    return match ? normalizeNavigationUrl(match[1]) : "";
  }

  function getShellFrame() {
    return document.getElementById(SHELL_FRAME_ID);
  }

  function isShellActive() {
    return Boolean(document.getElementById(SHELL_ID));
  }

  function syncUrlWithFrame(frame) {
    try {
      const href = frame.contentWindow.location.href;
      if (!isInternalUrl(href)) return;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const next = `${new URL(href).pathname}${new URL(href).search}${new URL(href).hash}`;
      if (current !== next) {
        window.history.replaceState({ biyaFullscreenShell: true }, "", href);
      }
    } catch (error) {
      // Cross-origin pages are intentionally ignored.
    }
  }

  function ensureShell() {
    let shell = document.getElementById(SHELL_ID);
    let frame = getShellFrame();
    if (shell && frame) return frame;

    shell = document.createElement("div");
    shell.id = SHELL_ID;
    shell.className = "biya-fullscreen-shell";
    shell.setAttribute("aria-label", "BIYA fullscreen app mode");

    frame = document.createElement("iframe");
    frame.id = SHELL_FRAME_ID;
    frame.className = "biya-fullscreen-shell-frame";
    frame.setAttribute("title", "BIYA App Mode");
    frame.setAttribute("allowfullscreen", "true");
    frame.setAttribute("allow", "fullscreen");
    frame.addEventListener("load", () => syncUrlWithFrame(frame));

    shell.appendChild(frame);
    document.body.appendChild(shell);
    document.documentElement.classList.add("biya-fullscreen-shell-active");
    return frame;
  }

  function openInShell(url) {
    const targetUrl = normalizeNavigationUrl(url);
    if (!targetUrl || !isInternalUrl(targetUrl)) return false;

    const frame = ensureShell();
    if (frame.src !== targetUrl) {
      frame.src = targetUrl;
    }

    try {
      window.history.pushState({ biyaFullscreenShell: true }, "", targetUrl);
    } catch (error) {
      // URL sync is optional.
    }

    return true;
  }

  function leaveShellToCurrentPage() {
    const frame = getShellFrame();
    let targetUrl = "";
    try {
      targetUrl = frame && frame.contentWindow ? frame.contentWindow.location.href : "";
    } catch (error) {
      targetUrl = "";
    }

    if (targetUrl && isInternalUrl(targetUrl)) {
      window.location.assign(targetUrl);
      return;
    }

    const shell = document.getElementById(SHELL_ID);
    if (shell) shell.remove();
    document.documentElement.classList.remove("biya-fullscreen-shell-active");
  }

  function initShellNavigation() {
    if (isEmbeddedPage()) return;
    if (window.BIYA_FULLSCREEN_SHELL_READY) return;
    window.BIYA_FULLSCREEN_SHELL_READY = true;

    document.addEventListener(
      "click",
      (event) => {
        if (!readFullscreenLock() || !getFullscreenElement()) return;
        const targetUrl = getNavigationUrlFromClick(event);
        if (!targetUrl || !isInternalUrl(targetUrl)) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openInShell(targetUrl);
      },
      true
    );

    window.addEventListener("popstate", () => {
      if (!readFullscreenLock() || !getFullscreenElement() || !isShellActive()) return;
      openInShell(window.location.href);
    });
  }

  function initFullscreenToggle() {
    if (isEmbeddedPage()) return;
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
      button.classList.toggle("is-active", isFullscreen || readFullscreenLock());
      button.classList.remove("is-error");
      button.setAttribute(
        "aria-label",
        isFullscreen ? "Keluar dari fullscreen mode" : "Aktifkan fullscreen mode"
      );
      button.setAttribute("title", isFullscreen ? "Exit fullscreen" : "Fullscreen mode");
      if (label) label.textContent = isFullscreen || readFullscreenLock() ? "Exit" : "Fullscreen";

      if (!isFullscreen && !exitingViaButton) {
        setFullscreenLock(false);
        document.documentElement.classList.remove("biya-fullscreen-shell-active");
      }
    }

    async function toggleFullscreen() {
      button.disabled = true;
      try {
        if (getFullscreenElement()) {
          exitingViaButton = true;
          setFullscreenLock(false);
          await exitFullscreenMode();
          if (isShellActive()) {
            leaveShellToCurrentPage();
          }
        } else {
          setFullscreenLock(true);
          await requestFullscreenMode();
        }
      } catch (error) {
        console.warn("[BIYA Fullscreen] Fullscreen mode tidak bisa diaktifkan", error);
        button.classList.add("is-error");
        if (label) label.textContent = "Tidak didukung";
        window.setTimeout(updateState, 1600);
      } finally {
        exitingViaButton = false;
        button.disabled = false;
        updateState();
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
      onBodyReady(() => {
        initFullscreenToggle();
        initShellNavigation();
      });
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