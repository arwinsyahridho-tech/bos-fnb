(() => {
  "use strict";

  const auth = window.BiyaAuth;
  const deletionGuard = window.BIYADeletionGuard;
  const profileBridge = window.BiyaProfileBridge;
  const states = {
    loading: document.getElementById("loadingState"),
    signedOut: document.getElementById("signedOutState"),
    demo: document.getElementById("demoState"),
    account: document.getElementById("accountState")
  };
  const demoStateKeys = [
    "biya_demo", "biya_demo_mode", "biya_is_demo", "demoMode",
    "demo_mode", "isDemo", "is_demo"
  ];

  function showState(name) {
    Object.entries(states).forEach(([key, element]) => {
      element.hidden = key !== name;
    });
    document.querySelector(".account-card").setAttribute("aria-busy", String(name === "loading"));
  }

  function text(value, fallback = "Belum dilengkapi") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function isDemoSession(session) {
    const email = text(session && session.user && session.user.email, "").toLowerCase();
    const demoEmail = text(auth && auth.config && auth.config.demoEmail, "").toLowerCase();
    return Boolean(email && demoEmail && email === demoEmail);
  }

  function clearDemoState() {
    [window.localStorage, window.sessionStorage].forEach((storage) => {
      demoStateKeys.forEach((key) => storage.removeItem(key));
    });
  }

  function setBusy(button, busy, label) {
    if (!button.dataset.label) button.dataset.label = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.label;
  }

  async function signOutToLogin(button, redirectTo) {
    setBusy(button, true, "Mengakhiri session…");
    try {
      clearDemoState();
      await auth.signOut({ redirectTo });
    } catch (error) {
      document.getElementById("accountStatus").textContent =
        auth.friendlyAuthError(error, "Session belum berhasil diakhiri. Silakan coba lagi.");
      setBusy(button, false);
    }
  }

  function renderAccount(session, accountProfile, businessProfile) {
    const user = session.user;
    const display = profileBridge.getDisplayAccountInfo(user, accountProfile, businessProfile);
    const location = [businessProfile && businessProfile.city, businessProfile && businessProfile.province]
      .filter((value) => typeof value === "string" && value.trim())
      .join(", ");

    document.getElementById("displayName").textContent = display.displayName;
    document.getElementById("accountEmail").textContent = text(user.email, "Email tidak tersedia");
    document.getElementById("accountAvatar").textContent = display.displayName.charAt(0).toUpperCase() || "B";
    document.getElementById("fullName").textContent = text(accountProfile && accountProfile.full_name);
    document.getElementById("phone").textContent = text(accountProfile && accountProfile.phone);
    document.getElementById("businessName").textContent = text(businessProfile && businessProfile.business_name);
    document.getElementById("businessType").textContent = text(businessProfile && businessProfile.business_type);
    document.getElementById("ownerName").textContent = text(businessProfile && businessProfile.owner_name);
    document.getElementById("businessLocation").textContent = text(location);
    showState("account");
  }

  async function initialize() {
    if (!auth || !auth.client || !deletionGuard || !profileBridge) {
      showState("signedOut");
      return;
    }

    let session;
    try {
      session = await auth.getSession();
    } catch (error) {
      console.error("[BIYA Account Center] Session gagal dibaca", error);
      showState("signedOut");
      return;
    }
    if (!session || !session.user) {
      showState("signedOut");
      return;
    }

    try {
      const blocked = await deletionGuard.blockAndSignOutIfNeeded(auth.client, session.user.id);
      if (blocked) {
        window.location.replace("/index.html?reason=deletion");
        return;
      }
    } catch (error) {
      console.error("[BIYA Account Center] Status akun gagal diverifikasi", error);
      deletionGuard.storeNotice(deletionGuard.VERIFICATION_NOTICE);
      try {
        await auth.signOut({ redirectTo: "/index.html?reason=verification" });
      } catch (_) {
        window.location.replace("/index.html?reason=verification");
      }
      return;
    }

    if (isDemoSession(session)) {
      document.getElementById("demoEmail").textContent = text(session.user.email, auth.config.demoEmail);
      showState("demo");
      return;
    }

    const [accountResult, businessResult] = await Promise.allSettled([
      profileBridge.getAccountProfile(auth.client, session.user.id),
      profileBridge.getBusinessProfile(auth.client, session.user.id)
    ]);
    renderAccount(
      session,
      accountResult.status === "fulfilled" ? accountResult.value : null,
      businessResult.status === "fulfilled" ? businessResult.value : null
    );
  }

  document.getElementById("switchAccountButton").addEventListener("click", (event) => {
    signOutToLogin(event.currentTarget, "/index.html?reason=logout");
  });
  document.getElementById("logoutButton").addEventListener("click", (event) => {
    signOutToLogin(event.currentTarget, "/index.html?reason=logout");
  });
  document.getElementById("exitDemoButton").addEventListener("click", async (event) => {
    setBusy(event.currentTarget, true, "Keluar dari demo…");
    clearDemoState();
    try {
      await auth.signOut({ redirectTo: "/index.html" });
    } catch (error) {
      console.error("[BIYA Account Center] Gagal keluar dari demo", error);
      window.location.replace("/index.html");
    }
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
  });
  initialize();
})();
