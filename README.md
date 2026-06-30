# Mitch Meeting-Timer — Microsoft Teams App

A multi-mode timer app for Microsoft Teams meetings — **countdown**, **stopwatch**,
and **pomodoro** — that opens in the **meeting side panel** (and the meeting chat /
details tabs) so you can keep track of time during a call. Built with React,
Fluent UI v9, and the Teams JavaScript SDK.

> Timer state is local to each viewer (not synced in real time across
> participants) but is preserved if the side panel reloads. See
> [Roadmap / known limitations](#roadmap--known-limitations).

## Features

| Mode          | Description                                                                                                                                                                                                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Countdown** | Set hours, minutes, seconds. Start, pause, resume, reset. On finish: a flashing ring, a "Time's up!" message, a chime, and a confetti burst — the chime and confetti both repeat 3× so they aren't missed. Sound and confetti are independently toggleable (remembered between sessions). |
| **Stopwatch** | Start, stop, lap tracking. Lap list with split and total times; the fastest and slowest laps are highlighted.                                                                                                                                                                             |
| **Pomodoro**  | Configurable work, break, and **long-break** intervals plus how often the long break occurs (default 25 / 5 / 15 min, long break every 4 sessions). Auto-cycles between focus, break, and long-break phases with a session counter, and plays a short alert chime on each phase change.   |

### Teams integration

- Runs as a **meeting side panel** tab — click the Apps button during a meeting to open it.
- Also works in the meeting chat tab and pre-meeting details tab.
- Implements the **configurable-tab configuration flow** — the config page enables the
  **Save** button and sets the tab content URL.
- Matches the active **Teams theme** (light / dark / high contrast) via Fluent UI's
  `FluentProvider` themes, and updates live when the user switches theme.
- **Accessible**: ARIA tab list, screen-reader announcements for timer state changes,
  and respects `prefers-reduced-motion`.
- Built with [TeamsJS v2](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/using-teams-client-library)
  (`@microsoft/teams-js`).

## Tech stack

- **React 18** + **TypeScript**
- **Fluent UI v9** (`@fluentui/react-components`) for UI components and Teams theming
- **Vite** for bundling
- **Express** + **helmet** for serving the production build with security headers
- **TeamsJS v2** for Microsoft Teams SDK integration
- **Vitest** + **Testing Library** for unit and component tests
- **ESLint** + **Prettier** for linting and formatting

## Prerequisites

- [Node.js](https://nodejs.org) 20+ (see `.nvmrc`; run `nvm use`)
- A **Microsoft 365 Developer Program** account (free sandbox tenant)
  — [Join here](https://developer.microsoft.com/microsoft-365/dev-program)
- A tunneling tool for local development:
  - [Dev Tunnels](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/overview)
    (`devtunnel`) — built into Windows / installable via `winget` or `brew`
  - Or [ngrok](https://ngrok.com/)

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/mitchelljfranklin/meetings-timer.git
cd meetings-timer
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

This starts Vite's dev server at `http://localhost:5173`. You can preview the timer UI
in your browser to verify it works, but the Teams tab integration requires a
publicly reachable URL (see next step).

### 3. Expose your local server

Teams requires your app to be served over HTTPS from a public URL. Use a dev tunnel:

**Dev Tunnels** (recommended):

```bash
devtunnel host -p 5173 --allow-anonymous
```

**ngrok**:

```bash
ngrok http 5173
```

Copy the HTTPS URL you get (e.g., `https://abc123.devtunnels.ms` or `https://xyz.ngrok-free.app`).

### 4. Package the manifest

Set your tunnel URL as the base URL, then build and package:

```bash
BASE_URL=https://abc123.devtunnels.ms npm run package
```

This generates `meetings-timer.zip` in the project root.

> The app's manifest `id` is a fixed GUID baked into `manifest/manifest.json`.
> Keep it stable — it must be identical everywhere the app is installed. Only the
> `BASE_URL` (and derived domain) is injected at package time.

### 5. Sideload to Teams

1. Open Microsoft Teams.
2. Go to **Apps** (bottom-left).
3. Click **Manage your apps** → **Upload an app** → **Upload a customised app**.
4. Select the `meetings-timer.zip` file.
5. Click **Add**.

Alternatively, upload via **Teams Admin Center** → **Teams apps** → **Manage apps** → **Upload new app** for your organization.

### 6. Use in a meeting

1. Start or join a Teams meeting.
2. Click the **Apps** button in the meeting toolbar.
3. Find **Meeting Timer** and click to open it in the side panel.
4. Select your timer mode and start tracking time.

## Development

Common scripts (see [CONTRIBUTING.md](CONTRIBUTING.md) for the full list and the
pull-request workflow):

| Script              | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Vite dev server for UI preview.      |
| `npm test`          | Run the Vitest unit/component suite. |
| `npm run lint`      | Lint with ESLint.                    |
| `npm run format`    | Format with Prettier.                |
| `npm run typecheck` | Type-check with `tsc`.               |
| `npm run build`     | Production build.                    |
| `npm run package`   | Build + produce the sideload `.zip`. |

CI (GitHub Actions) runs format-check, lint, type-check, tests, build, and
`npm audit` on every push and pull request.

## Production deployment

For production use, deploy the app to a hosting service:

### Build

```bash
npm run build
```

### Serve

```bash
npm run serve
```

This starts the Express server on port 3000 serving the built files from `dist/`.
The server uses **helmet** to apply security headers (HSTS, `nosniff`,
`Referrer-Policy`) and a Content-Security-Policy whose `frame-ancestors` allow
embedding in Teams (`X-Frame-Options` is intentionally not set so Teams can frame
the app).

### Deploy to Azure (example)

```bash
# Install Azure CLI and login
az login

# Create a web app
az webapp up --name meetings-timer --runtime "NODE:20-lts" --sku F1

# Configure the web app to serve the app
az webapp config set --name meetings-timer --startup-file "npm run serve"
```

After deployment, update `BASE_URL` with your production URL, re-package the manifest,
and upload the updated package.

### Before publishing to a store

Dev tunnels / ngrok are fine for **sideloaded testing only** — they're temporary and
not suitable for org-wide or multi-org distribution. Before submitting to your org's
(or another org's) Teams app store:

- **Host on a stable HTTPS domain.** Other tenants load _your_ hosted URL, so it must
  stay reachable. Set `BASE_URL` to that domain before packaging.
- **Fill in the `developer` block** in `manifest/manifest.json` — replace the
  `PLACEHOLDER` name and the `websiteUrl`, `privacyUrl`, and `termsOfUseUrl`
  (`https://www.example.com/...`) with real, reachable URLs. These are required for
  store validation.
- **Replace the placeholder icons** (`manifest/color.png`, `manifest/outline.png`)
  with your own branded artwork. The outline icon must be transparent with a white glyph.
- The app implements **no SSO**, so the manifest intentionally omits `webApplicationInfo`.
  Add it back only if you register a (multi-tenant) Microsoft Entra ID app for SSO.

## Project structure

```
meetings-timer/
├── index.html                   # Vite HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite + Vitest config
├── eslint.config.js             # ESLint (flat) config
├── .prettierrc                  # Prettier config
├── .editorconfig
├── .nvmrc                       # Node version (20)
├── server.ts                    # Express + helmet production server
├── .env.example                 # Environment variable reference
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
├── .github/
│   ├── workflows/ci.yml         # Lint, type-check, test, build, audit
│   ├── dependabot.yml
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── manifest/
│   ├── manifest.json            # Teams app manifest (v1.19)
│   ├── color.png                # 192×192 app icon
│   └── outline.png              # 32×32 transparent outline icon
├── scripts/
│   ├── generate-icons.js        # Generates the clock-glyph PNG icons
│   └── package-manifest.js      # Builds the sideloadable .zip (cross-platform)
└── src/
    ├── main.tsx                 # React entry point (wraps App in ErrorBoundary)
    ├── App.tsx                  # TeamsJS init, FluentProvider theming, tab config
    ├── index.css                # Minimal layout / reset (theming via Fluent)
    ├── types.ts                 # Shared types (TimerMode, Lap)
    ├── theme.ts                 # Maps the Teams theme name to a Fluent theme
    ├── components/
    │   ├── TimerTabs.tsx        # Mode switcher (Fluent TabList)
    │   ├── TimerDisplay.tsx     # SVG circular progress ring (Fluent tokens)
    │   ├── Countdown.tsx        # Countdown timer UI
    │   ├── Stopwatch.tsx        # Stopwatch with lap tracking UI
    │   ├── Pomodoro.tsx         # Pomodoro work/break cycle UI
    │   ├── ConfigView.tsx       # Tab configuration page (settings frame)
    │   ├── ErrorBoundary.tsx    # Top-level error fallback
    │   └── Celebration.tsx      # Confetti overlay shown when a countdown ends
    ├── hooks/
    │   ├── useCountdown.ts      # Countdown timer logic
    │   ├── useStopwatch.ts      # Stopwatch logic with laps
    │   ├── usePomodoro.ts       # Pomodoro cycle logic
    │   ├── useAnnouncer.tsx     # Screen-reader live-region helper
    │   └── usePreferences.ts    # Persisted sound + confetti toggles
    ├── utils/
    │   ├── format.ts            # Time formatting helpers
    │   ├── persist.ts           # sessionStorage load/save helpers
    │   └── sound.ts             # Web Audio "time's up" chime
    └── test/
        └── setup.ts             # Vitest setup (jsdom polyfills, jest-dom)

# Unit and component tests live alongside their source as *.test.ts(x).
```

## App manifest

The manifest (`manifest/manifest.json`) targets manifest version **1.19** and
declares the app as a **configurable tab** available in:

- `meetingSidePanel` — in-meeting side panel (primary target)
- `meetingChatTab` — meeting chat header
- `meetingDetailsTab` — pre/post meeting details

The app uses the `groupchat` scope, which makes it available in private meetings,
group calls, and one-on-one calls.

Because it's a configurable tab, the app serves a small **configuration page** (the
`settings` frame) that registers a save handler and sets the tab's content URL, so the
**Save** button works when the tab is added.

The manifest also includes the required `developer` block (name + website / privacy /
terms URLs) and a fixed app `id` (GUID). Fill in the developer placeholders before
publishing — see [Before publishing to a store](#before-publishing-to-a-store).

## Customizing icons

Run the icon generator to (re)create the default clock-glyph PNG icons:

```bash
npm run generate-icons
```

Replace `manifest/color.png` (192×192) and `manifest/outline.png` (32×32, transparent
with a white glyph) with your own branded icons before publishing.

## Roadmap / known limitations

- **No real-time sync.** Each participant's timer runs locally — starting a countdown in
  the side panel does not start it for everyone. A shared, presenter-controlled timer
  (e.g. via the Microsoft Live Share SDK) is a potential future enhancement; it was
  deferred because the current Live Share React stack pulls in Fluid 1.x dependencies
  with known security advisories.
- **No SSO.** The app stores no credentials and the manifest omits `webApplicationInfo`.
- **In-meeting behavior** is best verified by sideloading into a real Teams meeting; the
  browser preview (`npm run dev`) renders the UI but not the meeting context.

## License

[MIT](LICENSE)
