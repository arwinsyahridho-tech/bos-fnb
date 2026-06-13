const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("halaman login menyediakan login, register, demo, status, dan password toggle", () => {
  const source = read("index.html");
  assert.match(source, /id="loginForm"/);
  assert.match(source, /id="registerForm"/);
  assert.match(source, /id="demoButton"/);
  assert.match(source, /id="loginStatus"/);
  assert.match(source, /id="registerStatus"/);
  assert.equal((source.match(/data-password-toggle=/g) || []).length, 3);
  assert.match(source, /Phase 1 Development - BIYA Operating System/);
});

test("auth helper memakai API Supabase resmi dan metadata pendaftaran", () => {
  const source = read("assets/js/biya-auth.js");
  assert.match(source, /auth\.signInWithPassword/);
  assert.match(source, /auth\.signUp/);
  assert.match(source, /auth\.signOut/);
  assert.match(source, /auth\.getSession/);
  assert.match(source, /business_name: cleanName/);
  assert.match(source, /target\.origin !== window\.location\.origin/);
});

test("validasi credential menangani kosong dan format email", () => {
  const code = read("assets/js/biya-auth.js");
  const context = {
    window: {
      BIYA_AUTH_CONFIG: { dashboardPath: "/menu-modules/dashboard.html" },
      location: { origin: "https://biya.test" }
    },
    URL
  };
  vm.runInNewContext(code, context);
  const validate = context.window.BiyaAuth.validateCredentials;
  assert.equal(validate("", "secret"), "Email wajib diisi.");
  assert.equal(validate("invalid", "secret"), "Format email belum valid.");
  assert.equal(validate("user@example.com", ""), "Password wajib diisi.");
  assert.equal(validate("user@example.com", "secret"), "");
});

test("seluruh halaman internal memasang auth guard sebelum body", () => {
  const candidates = [
    "menu-modules/dashboard.html",
    ...fs.readdirSync(path.join(root, "modules/cost-management"))
      .filter((name) => name.endsWith(".html"))
      .map((name) => `modules/cost-management/${name}`),
    "modules/cost-inteligent/dashboard-costinteligent",
    "modules/finance/dashboard-finance.html",
    "modules/inventory/dashboard-inventory.html",
    "modules/pos/dashboard-pos"
  ];

  for (const file of candidates) {
    const source = read(file);
    const guardPosition = source.indexOf('/assets/js/auth-guard.js');
    const bodyPosition = source.indexOf("<body");
    assert.ok(guardPosition >= 0, `${file} belum memasang auth guard`);
    assert.ok(bodyPosition < 0 || guardPosition < bodyPosition, `${file} memuat guard setelah body`);
  }
});

test("demo login menggunakan credential konfigurasi dan pesan kegagalan yang jelas", () => {
  const source = read("assets/js/login-page.js");
  assert.match(source, /demoEmail, demoPassword/);
  assert.match(source, /auth\.signIn\(demoEmail, demoPassword\)/);
  assert.match(source, /Akun demo belum dibuat di Supabase atau password demo tidak sesuai\. Silakan buat akun demo di Supabase Auth\./);
  assert.match(source, /setButtonLoading\(demoButton, true, "Menyiapkan demo…"\)/);
  assert.match(source, /setButtonLoading\(demoButton, false\)/);
});

test("credential demo default terpusat di konfigurasi auth", () => {
  const code = read("assets/js/biya-config.js");
  const context = { window: {} };
  vm.runInNewContext(code, context);

  assert.equal(context.window.BIYA_AUTH_CONFIG.demoEmail, "demo@biya.id");
  assert.equal(context.window.BIYA_AUTH_CONFIG.demoPassword, "BIYA-Demo-2026!");
  assert.ok(Object.isFrozen(context.window.BIYA_AUTH_CONFIG));
});

test("signIn meneruskan credential ke Supabase Auth tanpa bypass", async () => {
  let submittedCredentials;
  const client = {
    auth: {
      async signInWithPassword(credentials) {
        submittedCredentials = credentials;
        return { data: { session: { access_token: "test-token" } }, error: null };
      }
    }
  };
  const code = read("assets/js/biya-auth.js");
  const context = {
    window: {
      BIYA_AUTH_CONFIG: { dashboardPath: "/menu-modules/dashboard.html" },
      biyaSupabase: client,
      location: { origin: "https://biya.test", replace() {} }
    },
    URL
  };
  vm.runInNewContext(code, context);

  const result = await context.window.BiyaAuth.signIn(" demo@biya.id ", "BIYA-Demo-2026!");
  assert.equal(submittedCredentials.email, "demo@biya.id");
  assert.equal(submittedCredentials.password, "BIYA-Demo-2026!");
  assert.equal(result.session.access_token, "test-token");
});

test("klik Demo Login menjaga loading state dan menampilkan error Supabase yang jelas", async () => {
  let demoClick;
  let submittedCredentials;
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      const value = {
        id,
        className: "",
        dataset: {},
        disabled: false,
        hidden: false,
        textContent: "",
        value: "",
        addEventListener(type, handler) {
          if (id === "demoButton" && type === "click") demoClick = handler;
        },
        classList: { toggle() {} },
        focus() {},
        querySelector(selector) {
          if (selector !== "[data-button-label]") return null;
          if (!this.label) this.label = { textContent: id === "demoButton" ? "Demo Login" : "Button" };
          return this.label;
        },
        reset() {}
      };
      elements.set(id, value);
    }
    return elements.get(id);
  };
  const auth = {
    client: {},
    config: { demoEmail: "demo@biya.id", demoPassword: "BIYA-Demo-2026!" },
    friendlyAuthError: () => "Auth gagal",
    getSession: async () => null,
    safeRedirectTarget: () => "/menu-modules/dashboard.html",
    signIn: async (email, password) => {
      submittedCredentials = { email, password };
      throw new Error("Invalid login credentials");
    },
    validateCredentials: () => ""
  };
  const context = {
    console: { error() {} },
    document: {
      getElementById: element,
      querySelectorAll: () => [],
      title: ""
    },
    requestAnimationFrame: (callback) => callback(),
    URLSearchParams,
    window: {
      BiyaAuth: auth,
      history: { replaceState() {} },
      location: {
        hash: "",
        origin: "https://biya.test",
        pathname: "/index.html",
        replace() {},
        search: ""
      }
    }
  };

  vm.runInNewContext(read("assets/js/login-page.js"), context);
  assert.equal(typeof demoClick, "function");
  await demoClick();

  assert.deepEqual(submittedCredentials, {
    email: "demo@biya.id",
    password: "BIYA-Demo-2026!"
  });
  assert.equal(
    element("loginStatus").textContent,
    "Akun demo belum dibuat di Supabase atau password demo tidak sesuai. Silakan buat akun demo di Supabase Auth."
  );
  assert.equal(element("demoButton").disabled, false);
  assert.equal(element("demoButton").label.textContent, "Demo Login");
});
