# FOCUSLY

Aplikasi manajemen tugas dengan Focus Mode, timer Pomodoro, dan Focus Lock.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm run lint     # oxlint
```

## Focus Lock (browser extension)

Tanpa extension, Focus Lock hanya **simulasi UI** (state di dalam aplikasi). Untuk pemblokiran
website yang nyata selama sesi fokus, pasang extension MV3 di folder `extension/`:

1. Buka `chrome://extensions` (Chrome/Edge).
2. Aktifkan **Developer mode** (toggle di pojok kanan atas).
3. Klik **Load unpacked** → pilih folder `extension/` di proyek ini.
4. Muat ulang tab FOCUSLY — badge berubah menjadi **Real lock: ON** saat sesi berjalan.

Cara kerja: saat sesi fokus dimulai, web app mengirim daftar domain ke extension; extension
memasang aturan `declarativeNetRequest` sehingga website terpilih di-block (navigasi diarahkan
ke halaman blok berhitung mundur). Aturan dilepas otomatis saat sesi selesai — atau saat waktu
sesi habis, meski tab FOCUSLY ditutup.

Batasan: memblokir **website** di browser saja. Aplikasi desktop di luar browser tidak
terpengaruh (butuh native application, tahap berikutnya).

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
