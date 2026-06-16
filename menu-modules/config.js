(() => {
  "use strict";

  const existingConfig = window.BIYA_PORTAL_CONFIG || {};

  window.BIYA_PORTAL_CONFIG = Object.freeze({
    ...existingConfig,
    COST_MANAGEMENT_URL:
      existingConfig.COST_MANAGEMENT_URL ||
      window.BIYA_COST_MANAGEMENT_URL ||
      "/modules/cost-management/costdashboard.html",
    INVENTORY_URL:
      existingConfig.INVENTORY_URL ||
      window.BIYA_INVENTORY_URL ||
      "/modules/inventory/dashboard.html",
    ACCOUNT_CENTER_URL:
      existingConfig.ACCOUNT_CENTER_URL ||
      window.BIYA_ACCOUNT_CENTER_URL ||
      "/account-center/"
  });

  function updateModuleCenterBrandCopy() {
    const brandName = document.querySelector(".topbar .brand-name");
    const brandTagline = document.querySelector(".topbar .brand-tagline");

    if (brandName) brandName.textContent = "BOS";
    if (brandTagline) brandTagline.textContent = "Biya Operating Sistem";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateModuleCenterBrandCopy);
  } else {
    updateModuleCenterBrandCopy();
  }
})();
