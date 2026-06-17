# MAD client — Component architecture & deployment

`martinize-db-client` is the React/TypeScript front-end of the [MAD web platform](https://mad.ens-lyon.fr/) ([cite](https://www.biorxiv.org/content/10.64898/2026.01.23.700524v1)). It was bootstrapped with Create React App (`react-scripts` 4) and uses Material-UI, NGL (molecular viewer), Three.js, D3 and socket.io.

The entry point of the application is `src/components/Router/index.tsx`. It defines the client-side routing and acts as the wiring hub between every page-level component and the authentication/loading layer. This document describes that routing module and then explains how to run and build the project.

---

## 1. Components in `src/components/Router`

The `Router` directory contains a single file, `index.tsx`. It exports two routing components and a set of private loader functions that gate each route behind the login/loading layer.

### Router structure at a glance

```
RouterCmpt (default export)          ← top-level <BrowserRouter>
 ├─ public routes  → Login, CreateAccount, LostPassword, ChangePassword,
 │                    Builder, MembraneBuilder, PolymerBuilder, Tutorial
 └─ /…/* routes    → LoadDrawer → ApplicationDrawer
                         └─ DrawerContentRouter (nested <Switch>)
                              → Explore, Molecule, ForceField, MySubmissions,
                                MyHistory, Contact, Citation, Settings,
                                Users, Moderation, Stashed, Tutorial
```

Two routing tiers are used:

- **`RouterCmpt`** — the outer router. It maps top-level URLs and decides whether a page is rendered standalone (login, builders) or inside the application shell.
- **`DrawerContentRouter`** — the inner router. It renders the page body *inside* the persistent `ApplicationDrawer` (navigation bar + layout), so the navigation chrome stays mounted across in-app navigation.

### Loader functions and the authentication layer

Every route is wrapped by a small `Load*` function (e.g. `LoadDrawer`, `LoadMartinizeBuilder`). These functions delegate to the login-gating components imported from `../LoginWaiter/LoginWaiter`:

- **`WaitForLoginFinish`** — renders the target once the login resolution has *finished*, regardless of the resulting role (used for most public/shared pages).
- **`WaitForLogged`** — requires an authenticated user (used for `Settings`).
- **`WaitForAdminLogged`** — requires an administrator/curator (used for `Users` and `Moderation`).
- **`WaitForDevLogged`** — requires a developer-level account (referenced for developer-only flows such as the polymer generator).

Each wrapper receives a `wait` array of promises from the global `Settings` singleton — typically `Settings.login_promise` (token verification) and `Settings.martinize_variables_promise` (server-side configuration). While these promises are pending, a preloader is shown; on rejection an error page is shown; on success the role is matched against `renderWhen` before the page is rendered.

---

The subsections below describe the page-level components referenced by the Router. Each lives under `src/components/<Name>`.

### `Router` — `RouterCmpt`
Top-level `<BrowserRouter>` + `<Switch>`. Redirects `/` to `/explore`, declares all public routes, funnels every in-app URL through `LoadDrawer`, and falls back to `NotFound` for unmatched paths.

### `Router` — `DrawerContentRouter`
Exported nested `<Switch>` rendered inside the application drawer. Resolves the in-app page (Explore, Molecule, ForceField, etc.) while the surrounding navigation shell remains mounted. Unmatched in-app paths render `InnerNotFound`.

### `ApplicationBar` — `ApplicationDrawer`
The application shell (top/side navigation drawer and layout). It hosts `DrawerContentRouter` as its content area, so it is the common parent of every authenticated in-app page. Reached through the `LoadDrawer` loader.

### `LoginWaiter`
Authentication/loading gate (see above). Provides `WaitForLoginFinish`, `WaitForLogged`, `WaitForAdminLogged` and `WaitForDevLogged`. Resolves the `wait` promises, maps the resolved `Settings.logged` status (`Admin` / `Curator` / `Dev` / `None`) to an allowed state, and renders the target component, a preloader, an error, or a "not allowed" view accordingly.

### `Explore`
Default landing page (`/explore`). Browse/search interface over the molecule database.

### `Molecule` — `MoleculePage`
Detail page for a single molecule, route `/molecule/:alias` (and `/group/:alias`). Shows molecule metadata, files and the NGL 3D viewer.

### `Builder` — `MartinizeBuilder`
The Martinize coarse-graining builder, routes `/builder` and `/builder/:id`. Standalone (not inside the drawer) and gated by `WaitForLoginFinish`.

### `Builder` — `MembraneBuilder`
Membrane construction tool, route `/membrane_builder`. Standalone, same loading gate as the Martinize builder.

### `Polymer` — `PolymerBuilder`
Polymer generator, route `/polymer`. Loaded via `LoadPolymerGenerator`; a developer-only gate (`WaitForDevLogged`) is wired in as a commented alternative to the general login wait.

### `ForceField`
Force-field browser/management page, route `/force_fields`. Rendered inside the application drawer.

### `MySubmissions`
List of the current user's submitted molecules, route `/submissions`.

### `MyHistory`
The user's job/activity history, route `/history`.

### `Moderation` — `Moderation`
Curator/admin moderation queue, route `/moderation`. Gated by `WaitForAdminLogged`.

### `Moderation` — `StashedMolecule`
Single stashed (pending-moderation) molecule view, route `/stashed/:id`.

### `Settings` — `SettingsPage`
User settings page, route `/settings`. Requires an authenticated user (`WaitForLogged`).

### `Users`
User administration page, route `/users`. Requires admin (`WaitForAdminLogged`).

### `Contact` — `ContactPage`
Contact page, route `/contact`.

### `Citation` — `CitationPage`
Citation/bibliography page, route `/citation`. Backed by the bibliography downloaded into the global `Settings`.

### `Tutorial`
Tutorial pages, route `/tutorials`. Rendered both as a standalone top-level route and inside the drawer. Its static assets live under `public/tutorial`.

### `pages/Login` — `Login`
Login form, route `/login`. Standalone, wrapped in `WaitForLoginFinish`.

### `pages/CreateAccount` — `CreateAccount`
Account-creation form, route `/create_account`.

### `pages/LostPassword` — `LostPassword`
Password-recovery request form, route `/lost_password`.

### `pages/ChangePassword` — `ChangePassword`
Password-change form, route `/change_password`.

### `pages/NotFound` — `NotFound` / `InnerNotFound`
404 pages. `NotFound` is the top-level fallback in `RouterCmpt`; `InnerNotFound` is the fallback inside `DrawerContentRouter` (keeps the navigation shell visible).

### Supporting module — `Settings` (`src/Settings.ts`)
Not a route target, but the Router depends on it heavily. A global singleton that holds the auth token (persisted in `localStorage`), the login status (`LoginStatus` enum), the downloaded server settings and bibliography, and exposes the `login_promise` / `martinize_variables_promise` consumed by every `LoginWaiter`.

---

## 2. Deploying for development or build

### Prerequisites

- **Node.js** with npm (the project pins `react-scripts` 4; a recent Node requires the OpenSSL legacy provider, which the scripts already set via `NODE_OPTIONS=--openssl-legacy-provider`).
- Install dependencies:

  ```bash
  npm install
  ```

### NGL type declarations (required before building)

The build needs the TypeScript declarations of NGL inside `node_modules/@mmsb/ngl`. A cached copy is provided in `utils/declarations`:

```bash
# Use the cached declarations bundled in this repo
cp -R utils/declarations node_modules/@mmsb/ngl
```

Or regenerate them from source:

```bash
cd ..
git clone https://github.com/alkihis/ngl.git
cd ngl
npm i && npm run dts
cp -R declarations ../client/node_modules/@mmsb/ngl
cd ../client
```

### Development server

```bash
npm start
```

What the `start` script does (see `package.json`):

- sets `NODE_OPTIONS=--openssl-legacy-provider` (OpenSSL compatibility for the old webpack toolchain);
- injects the current git short hash as `REACT_APP_GIT_HASH` via `scripts/git-hash.sh` (reads `.git` directly, so it works even where `git` is not installed; prints `dev` as a fallback);
- serves on **port 3001** (`PORT=3001`) with hot reload.

API calls are proxied to the back-end through the CRA `proxy` setting in `package.json` (`"proxy": "http://web:80"`), which targets the `web` service (e.g. the Docker Compose back-end). Open the printed local URL in the browser; edits trigger an automatic reload.

### Production build

```bash
npm run build
```

The `build` script sets the same OpenSSL flag and git-hash injection, disables debug output (`REACT_APP_DEBUG=false`), and runs `react-scripts build`. Output goes to the **`build/`** folder: a minified, hash-named static bundle with `index.html` as the entry point. Copy the contents of `build/` to any static web server to deploy the site.

### Tooling notes

- **`config-overrides.js`** + `customize-cra` (`useBabelRc`) let CRA honour the project `.babelrc`, which enables the optional-chaining and nullish-coalescing Babel plugins.
- **`tsconfig.json`** targets `esnext`, uses the new JSX runtime (`"jsx": "react-jsx"`), `strict` mode, and `noEmit` (type-checking only — emission is handled by `react-scripts`).
- **`scripts/git-hash.sh`** stamps each build with the source revision, surfaced in the app through `REACT_APP_GIT_HASH`.
- Other CRA scripts: `npm test` (interactive test runner) and `npm run eject` (one-way ejection of the CRA configuration — avoid unless necessary).
```
