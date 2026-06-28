(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RawMaterialDeletionGuard = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const RAW_MATERIAL_USAGE_RPC = "get_raw_material_usage";
  const REFERENCE_WARNING =
    "Bahan baku tidak dapat dihapus karena masih digunakan pada resep Preparation atau Menu.";

  function normalizeNames(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(Boolean).map(String);
  }

  async function checkReferences({ client, rawMaterialId }) {
    if (!client) throw new Error("Supabase client tidak tersedia.");
    if (rawMaterialId === null || rawMaterialId === undefined || rawMaterialId === "") {
      throw new Error("ID Raw Material tidak tersedia.");
    }

    const { data, error } = await client.rpc(RAW_MATERIAL_USAGE_RPC, {
      p_raw_material_id: rawMaterialId,
    });

    if (error) {
      const wrappedError = new Error(
        error.message || `RPC ${RAW_MATERIAL_USAGE_RPC} gagal.`,
      );
      Object.assign(wrappedError, error, {
        referenceCheckContext: RAW_MATERIAL_USAGE_RPC,
      });
      throw wrappedError;
    }

    const usage = Array.isArray(data) ? data[0] : data;
    if (!usage) {
      const emptyResultError = new Error(
        `RPC ${RAW_MATERIAL_USAGE_RPC} tidak mengembalikan hasil.`,
      );
      emptyResultError.code = "RPC_EMPTY_RESULT";
      emptyResultError.referenceCheckContext = RAW_MATERIAL_USAGE_RPC;
      throw emptyResultError;
    }

    const preparationCount = Number(usage.preparation_count) || 0;
    const menuCount = Number(usage.menu_count) || 0;
    const usedInPreparation = Boolean(usage.used_in_preparation);
    const usedInMenu = Boolean(usage.used_in_menu);

    return {
      isReferenced:
        usedInPreparation || usedInMenu || preparationCount > 0 || menuCount > 0,
      usedInPreparation,
      usedInMenu,
      preparationCount,
      menuCount,
      preparationNames: normalizeNames(usage.preparation_names),
      menuNames: normalizeNames(usage.menu_names),
    };
  }

  function formatReferenceWarning() {
    return REFERENCE_WARNING;
  }

  function getReferenceCheckFailureType(error) {
    const message = `${error?.message || ""} ${error?.details || ""} ${
      error?.hint || ""
    }`.toLowerCase();
    const code = String(error?.code || "").toUpperCase();
    const status = Number(error?.status || 0);

    if (
      code === "PGRST202" ||
      status === 404 ||
      message.includes(`could not find the function public.${RAW_MATERIAL_USAGE_RPC}`) ||
      message.includes(`function public.${RAW_MATERIAL_USAGE_RPC}`) ||
      message.includes(`${RAW_MATERIAL_USAGE_RPC}(`) && message.includes("does not exist")
    ) {
      return "rpc_missing";
    }

    if (
      code === "42501" ||
      status === 401 ||
      status === 403 ||
      message.includes("permission denied") ||
      message.includes("not authorized") ||
      message.includes("insufficient privilege")
    ) {
      return "permission_denied";
    }

    return "unknown";
  }

  function getReferenceCheckFailureAlert(error) {
    const type = getReferenceCheckFailureType(error);
    if (type === "rpc_missing") {
      return `Function ${RAW_MATERIAL_USAGE_RPC} belum dibuat di Supabase.`;
    }
    if (type === "permission_denied") {
      return "Role authenticated belum diberi izin execute RPC.";
    }
    return "Pengecekan penggunaan bahan baku gagal atau Supabase tidak dapat diakses. Penghapusan dibatalkan.";
  }

  function isDatabaseReferenceError(error) {
    const message =
      `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
    return (
      error?.code === "23503" ||
      message.includes("raw material masih digunakan") ||
      message.includes("foreign key constraint")
    );
  }

  return {
    RAW_MATERIAL_USAGE_RPC,
    REFERENCE_WARNING,
    checkReferences,
    formatReferenceWarning,
    getReferenceCheckFailureType,
    getReferenceCheckFailureAlert,
    isDatabaseReferenceError,
  };
});
