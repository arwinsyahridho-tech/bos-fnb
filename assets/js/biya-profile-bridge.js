((global) => {
  "use strict";

  const FALLBACK = Object.freeze({
    displayName: "User BIYA",
    subtitle: "Akun BIYA"
  });

  function firstText(...values) {
    const match = values.find((value) => typeof value === "string" && value.trim());
    return match ? match.trim() : "";
  }

  function assertUserId(userId) {
    if (!userId) throw new Error("User ID tidak tersedia untuk memuat profil BIYA.");
  }

  function warnProfileRead(table, userId, error, reason) {
    const code = String((error && error.code) || "").toUpperCase();
    const details = [error && error.message, error && error.details, error && error.hint]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    let diagnosis = reason || "query gagal";

    if (code === "42P01" || details.includes("does not exist") || details.includes("schema cache")) {
      diagnosis = "tabel tidak ada atau belum tersedia di schema cache";
    } else if (code === "42501" || code === "PGRST301" || details.includes("row-level security") || details.includes("permission denied")) {
      diagnosis = "RLS ditolak untuk auth.uid() yang aktif";
    }

    console.warn(`[BIYA Profile Bridge] ${table}: ${diagnosis}. user_id=${userId}`, error || "");
  }

  async function readProfile(supabaseClient, table, columns, userId) {
    assertUserId(userId);
    if (!supabaseClient || typeof supabaseClient.from !== "function") return null;

    const { data, error } = await supabaseClient
      .from(table)
      .select(`user_id, ${columns}`)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      warnProfileRead(table, userId, error);
      return null;
    }
    if (!data) {
      warnProfileRead(table, userId, null, "data tidak ditemukan (pastikan row tersimpan untuk session.user.id)");
      return null;
    }
    if (data.user_id && data.user_id !== userId) {
      warnProfileRead(table, userId, null, `user_id tidak cocok (row=${data.user_id})`);
      return null;
    }

    return data;
  }

  async function getAccountProfile(supabaseClient, userId) {
    return readProfile(
      supabaseClient,
      "account_profiles",
      "full_name, phone, role, plan, plan_name, account_status, subscription_status, subscription_start, subscription_end",
      userId
    );
  }

  async function getBusinessProfile(supabaseClient, userId) {
    return readProfile(
      supabaseClient,
      "business_profiles",
      "business_name, business_type, owner_name, phone, email, address, city, province, description",
      userId
    );
  }

  function getDisplayAccountInfo(user, accountProfile, businessProfile) {
    const metadata = (user && user.user_metadata) || {};
    const email = firstText(user && user.email);
    const emailName = email ? email.split("@")[0] : "";
    const accountName = firstText(accountProfile && accountProfile.full_name);
    const businessName = firstText(businessProfile && businessProfile.business_name);

    return {
      displayName: firstText(
        accountName,
        metadata.full_name,
        metadata.name,
        emailName,
        FALLBACK.displayName
      ),
      subtitle: firstText(
        businessName,
        accountName,
        metadata.business_name,
        metadata.full_name,
        email,
        FALLBACK.subtitle
      ),
      businessName: firstText(
        businessName,
        accountName,
        metadata.business_name,
        metadata.full_name,
        email,
        FALLBACK.subtitle
      ),
      hasBusinessName: Boolean(businessName)
    };
  }

  global.BiyaProfileBridge = Object.freeze({
    FALLBACK,
    getAccountProfile,
    getBusinessProfile,
    getDisplayAccountInfo
  });
})(typeof window !== "undefined" ? window : globalThis);
