(() => {
  "use strict";

  const existing = window.BIYA_AUTH_CONFIG || {};
  const defaultSupabaseUrl = "https://pkjmkjyylgzjvhcreucc.supabase.co";
  const runtimeSupabaseUrl = existing.supabaseUrl || window.BIYA_SUPABASE_URL || "";
  const runtimeSupabaseAnonKey = existing.supabaseAnonKey || window.BIYA_SUPABASE_ANON_KEY || "";

  window.BIYA_AUTH_CONFIG = Object.freeze({
    supabaseUrl: runtimeSupabaseUrl || defaultSupabaseUrl,
    supabaseAnonKey: runtimeSupabaseAnonKey || "sb_publishable_Tq4d0o3PIAd_zh11uJa2uQ_M_zPIYFX",
    expectedSupabaseProjectRef: existing.expectedSupabaseProjectRef || "pkjmkjyylgzjvhcreucc",
    supabaseConfigSource: runtimeSupabaseUrl || runtimeSupabaseAnonKey ? "runtime override" : "biya-config.js default",
    loginPath: existing.loginPath || "/index.html",
    dashboardPath: existing.dashboardPath || "/menu-modules/dashboard.html",
    demoEmail: existing.demoEmail || window.BIYA_DEMO_EMAIL || "demo@biya.id",
    demoPassword: existing.demoPassword || window.BIYA_DEMO_PASSWORD || "BIYA-Demo-2026!"
  });
})();
