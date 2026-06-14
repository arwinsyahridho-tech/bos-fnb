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
  const modal = document.getElementById("confirmModal");
  const modalCard = modal.querySelector(".modal-card");
  const modalConfirmButton = document.getElementById("modalConfirmButton");
  let currentSession = null;
  let currentAccountProfile = null;
  let currentBusinessProfile = null;
  let modalAction = null;
  let lastFocusedElement = null;

  function showState(name) {
    Object.entries(states).forEach(([key, element]) => {
      element.hidden = key !== name;
    });
    document.getElementById("stateCard").hidden = name === "account";
    document.getElementById("stateCard").setAttribute("aria-busy", String(name === "loading"));
    document.getElementById("headerSwitchAccountButton").hidden = name !== "account";
  }

  function text(value, fallback = "Belum dilengkapi") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function firstText(...values) {
    return text(values.find((value) => typeof value === "string" && value.trim()), "");
  }

  function isDemoSession(session) {
    const email = text(session && session.user && session.user.email, "").toLowerCase();
    const demoEmail = text(auth && auth.config && auth.config.demoEmail, "").toLowerCase();
    const metadata = (session && session.user && session.user.user_metadata) || {};
    return Boolean(
      (email && demoEmail && email === demoEmail) ||
      metadata.is_demo === true || metadata.demo === true ||
      demoStateKeys.some((key) => localStorage.getItem(key) === "true" || sessionStorage.getItem(key) === "true")
    );
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

  function setStatus(element, message, type = "") {
    element.textContent = message;
    element.classList.toggle("is-success", type === "success");
    element.classList.toggle("is-error", type === "error");
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return text(String(value), "—");
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
  }

  function openModal({ title, description, confirmLabel, danger = false, action }) {
    lastFocusedElement = document.activeElement;
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDescription").textContent = description;
    modalConfirmButton.textContent = confirmLabel;
    modalConfirmButton.dataset.label = confirmLabel;
    modalConfirmButton.className = `button ${danger ? "button-danger" : "button-primary"}`;
    modalAction = action;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => modalCard.focus());
  }

  function closeModal() {
    if (modalConfirmButton.disabled) return;
    modal.hidden = true;
    modalAction = null;
    document.body.classList.remove("modal-open");
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  async function signOutToLogin(button, redirectTo) {
    setBusy(button, true, "Mengakhiri session…");
    try {
      clearDemoState();
      await auth.signOut({ redirectTo });
    } catch (error) {
      setStatus(document.getElementById("accountStatus"), auth.friendlyAuthError(error, "Session belum berhasil diakhiri. Silakan coba lagi."), "error");
      setBusy(button, false);
      closeModal();
    }
  }

  function confirmSignOut(mode) {
    const isSwitch = mode === "switch";
    openModal({
      title: isSwitch ? "Ganti akun BIYA?" : "Keluar dari akun?",
      description: isSwitch
        ? "Session akun ini akan diakhiri. Anda dapat masuk kembali menggunakan akun BIYA lainnya."
        : "Anda perlu login kembali untuk membuka Module Center dan modul BIYA.",
      confirmLabel: isSwitch ? "Ya, Ganti Akun" : "Ya, Keluar Akun",
      danger: !isSwitch,
      action: (button) => signOutToLogin(button, "/index.html?reason=logout")
    });
  }

  function metadataFallback(user) {
    const metadata = (user && user.user_metadata) || {};
    return {
      account: {
        full_name: firstText(metadata.full_name, metadata.name),
        phone: firstText(metadata.phone, metadata.phone_number),
        role: firstText(metadata.role, "Owner"),
        plan: firstText(metadata.plan, metadata.plan_name, "Free Plan"),
        account_status: firstText(metadata.account_status, "Active"),
        subscription_status: firstText(metadata.subscription_status, "Active"),
        subscription_start: metadata.subscription_start || metadata.subscription_started_at || "",
        subscription_end: metadata.subscription_end || metadata.subscription_ends_at || ""
      },
      business: {
        business_name: firstText(metadata.business_name, metadata.company_name),
        business_type: firstText(metadata.business_type), owner_name: firstText(metadata.owner_name, metadata.full_name, metadata.name),
        phone: firstText(metadata.business_phone, metadata.phone), email: firstText(metadata.business_email),
        address: firstText(metadata.business_address, metadata.address), city: firstText(metadata.city),
        province: firstText(metadata.province), description: firstText(metadata.business_description, metadata.description)
      }
    };
  }

  function mergeProfile(primary, fallback) {
    return Object.fromEntries(Object.keys(fallback).map((key) => [key, firstText(primary && primary[key], fallback[key])]));
  }

  function renderAccount(session, accountProfile, businessProfile) {
    const user = session.user;
    const display = profileBridge.getDisplayAccountInfo(user, accountProfile, businessProfile);
    const plan = firstText(accountProfile.plan_name, accountProfile.plan, "Free Plan");
    const accountStatus = firstText(accountProfile.account_status, "Active");
    const subscriptionStatus = firstText(accountProfile.subscription_status, "Active");

    document.getElementById("overviewName").textContent = display.displayName;
    document.getElementById("overviewEmail").textContent = text(user.email, "Email tidak tersedia");
    document.getElementById("overviewBusiness").textContent = text(businessProfile.business_name);
    document.getElementById("overviewPlan").textContent = plan;
    document.getElementById("overviewAccountStatus").textContent = accountStatus;
    document.getElementById("accountAvatar").textContent = display.displayName.charAt(0).toUpperCase() || "B";
    document.getElementById("overviewStatusBadge").textContent = accountStatus.toUpperCase();

    document.getElementById("profileFullName").value = firstText(accountProfile.full_name, display.displayName);
    document.getElementById("profileEmail").value = text(user.email, "");
    document.getElementById("profilePhone").value = firstText(accountProfile.phone);
    document.getElementById("profileRole").value = firstText(accountProfile.role, "Owner");

    const businessFields = {
      businessName: "business_name", businessType: "business_type", businessOwner: "owner_name",
      businessPhone: "phone", businessEmail: "email", businessAddress: "address", businessCity: "city",
      businessProvince: "province", businessDescription: "description"
    };
    Object.entries(businessFields).forEach(([id, key]) => { document.getElementById(id).value = firstText(businessProfile[key]); });

    document.getElementById("subscriptionPlan").textContent = plan;
    document.getElementById("subscriptionStatus").textContent = subscriptionStatus;
    document.getElementById("subscriptionStart").textContent = formatDate(accountProfile.subscription_start);
    document.getElementById("subscriptionEnd").textContent = formatDate(accountProfile.subscription_end);
    document.getElementById("planBadge").textContent = plan.toUpperCase();
    document.getElementById("subscriptionBadge").textContent = subscriptionStatus.toUpperCase();
    document.getElementById("securityEmail").textContent = text(user.email, "Email tidak tersedia");
    showState("account");
  }

  async function initialize() {
    if (!auth || !auth.client || !deletionGuard || !profileBridge) {
      showState("signedOut");
      return;
    }

    try {
      currentSession = await auth.getSession();
    } catch (error) {
      console.error("[BIYA Account Center] Session gagal dibaca", error);
      showState("signedOut");
      return;
    }
    if (!currentSession || !currentSession.user) {
      showState("signedOut");
      return;
    }

    try {
      const blocked = await deletionGuard.blockAndSignOutIfNeeded(auth.client, currentSession.user.id);
      if (blocked) {
        window.location.replace("/index.html?reason=deletion");
        return;
      }
    } catch (error) {
      console.error("[BIYA Account Center] Status akun gagal diverifikasi", error);
      deletionGuard.storeNotice(deletionGuard.VERIFICATION_NOTICE);
      try { await auth.signOut({ redirectTo: "/index.html?reason=verification" }); }
      catch (_) { window.location.replace("/index.html?reason=verification"); }
      return;
    }

    if (isDemoSession(currentSession)) {
      document.getElementById("demoEmail").textContent = text(currentSession.user.email, auth.config.demoEmail);
      showState("demo");
      return;
    }

    const fallback = metadataFallback(currentSession.user);
    const [accountResult, businessResult] = await Promise.allSettled([
      profileBridge.getAccountProfile(auth.client, currentSession.user.id),
      profileBridge.getBusinessProfile(auth.client, currentSession.user.id)
    ]);
    currentAccountProfile = mergeProfile(accountResult.status === "fulfilled" ? accountResult.value : null, fallback.account);
    currentBusinessProfile = mergeProfile(businessResult.status === "fulfilled" ? businessResult.value : null, fallback.business);
    renderAccount(currentSession, currentAccountProfile, currentBusinessProfile);
  }

  async function saveRecord(table, values, statusElement, button, successMessage) {
    if (!currentSession || !currentSession.user) return;
    setBusy(button, true, "Menyimpan…");
    setStatus(statusElement, "");
    const payload = { user_id: currentSession.user.id, ...values };
    try {
      const { error } = await auth.client.from(table).upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      setStatus(statusElement, successMessage, "success");
    } catch (error) {
      console.warn(`[BIYA Account Center] ${table} belum dapat disimpan`, error);
      setStatus(statusElement, "Data tetap ditampilkan dari profil akun, tetapi tabel penyimpanan belum tersedia atau belum dapat diakses.", "error");
    } finally {
      setBusy(button, false);
    }
  }

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== selected; });
    });
  });

  document.getElementById("profileForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const values = {
      full_name: document.getElementById("profileFullName").value.trim(),
      phone: document.getElementById("profilePhone").value.trim(),
      role: document.getElementById("profileRole").value.trim()
    };
    await saveRecord("account_profiles", values, document.getElementById("profileStatus"), button, "Profile berhasil disimpan.");
    currentAccountProfile = { ...currentAccountProfile, ...values };
    renderAccount(currentSession, currentAccountProfile, currentBusinessProfile);
  });

  document.getElementById("businessForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    await saveRecord("business_profiles", values, document.getElementById("businessStatus"), button, "Data bisnis berhasil disimpan.");
    currentBusinessProfile = { ...currentBusinessProfile, ...values };
    renderAccount(currentSession, currentAccountProfile, currentBusinessProfile);
  });

  document.getElementById("headerSwitchAccountButton").addEventListener("click", () => confirmSignOut("switch"));
  document.getElementById("securityLogoutButton").addEventListener("click", () => confirmSignOut("logout"));
  document.getElementById("logoutButton").addEventListener("click", () => confirmSignOut("logout"));

  document.getElementById("exitDemoButton").addEventListener("click", () => {
    openModal({
      title: "Keluar dari mode demo?",
      description: "Session dan seluruh penanda demo akan dibersihkan agar Anda dapat login menggunakan akun BIYA.",
      confirmLabel: "Keluar Demo & Login",
      action: async (button) => {
        setBusy(button, true, "Keluar dari demo…");
        clearDemoState();
        try { await auth.signOut({ redirectTo: "/index.html" }); }
        catch (error) { console.error("[BIYA Account Center] Gagal keluar dari demo", error); window.location.replace("/index.html"); }
      }
    });
  });

  document.getElementById("changePasswordButton").addEventListener("click", async (event) => {
    const email = currentSession && currentSession.user && currentSession.user.email;
    if (!email) return;
    setBusy(event.currentTarget, true, "Mengirim…");
    try {
      const { error } = await auth.client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/index.html` });
      if (error) throw error;
      setStatus(document.getElementById("securityStatus"), "Link perubahan password telah dikirim ke email login Anda.", "success");
    } catch (error) {
      setStatus(document.getElementById("securityStatus"), auth.friendlyAuthError(error, "Link perubahan password belum dapat dikirim."), "error");
    } finally { setBusy(event.currentTarget, false); }
  });

  document.getElementById("deleteAccountButton").addEventListener("click", () => {
    openModal({
      title: "Hapus akun BIYA?",
      description: "Fitur penghapusan mandiri masih disiapkan. Tindakan ini tidak akan menghapus akun atau mengganggu session Anda.",
      confirmLabel: "Saya Mengerti",
      danger: true,
      action: () => {
        closeModal();
        setStatus(document.getElementById("accountStatus"), "Permintaan penghapusan belum dikirim. Hubungi admin BIYA untuk bantuan penghapusan akun.", "error");
      }
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((element) => element.addEventListener("click", closeModal));
  modalConfirmButton.addEventListener("click", () => { if (modalAction) modalAction(modalConfirmButton); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
  window.addEventListener("pageshow", (event) => { if (event.persisted) window.location.reload(); });
  initialize();
})();
