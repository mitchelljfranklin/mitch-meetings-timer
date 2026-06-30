# MitchMeeting Timer — Microsoft Teams App

A multi-mode timer app for Microsoft Teams meetings. Runs in the **meeting side panel**
so every participant can see the active timer during a call or meeting.

## Features

| Mode | Description |
|------|-------------|
| **Countdown** | Set hours, minutes, seconds. Start, pause, resume, reset. Visual progress ring with flashing alert when time runs out. |
| **Stopwatch** | Start, stop, lap tracking. Lap list with split and total times. |
| **Pomodoro** | Configurable work/break intervals (default 25 min / 5 min). Auto-cycles between focus and break phases with session counter. |

### Teams integration

- Runs as a **meeting side panel** tab — click the Apps button during a meeting to open it.
- Also works in the meeting chat tab and pre-meeting details tab.
- Detects and respects Teams theme (light / dark / high contrast).
- Built with [TeamsJS v2](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/using-teams-client-library)
  (`@microsoft/teams-js`).

## Tech stack

- **React 18** + **TypeScript**
- **Vite** for bundling
- **Express** for serving the production build
- **TeamsJS v2** for Microsoft Teams SDK integration
- **CSS custom properties** for Teams theme support

## Prerequisites

- [Node.js](https://nodejs.org) 18+
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

- **Host on a stable HTTPS domain.** Other tenants load *your* hosted URL, so it must
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
├── index.html                  # Vite HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts                   # Express server for production
├── .env.example                # Environment variable reference
├── manifest/
│   ├── manifest.json           # Teams app manifest (v1.16)
│   ├── color.png               # 192×192 app icon
│   └── outline.png             # 32×32 outline icon
├── scripts/
│   ├── generate-icons.js       # Generates placeholder PNG icons
│   └── package-manifest.js     # Builds the sideloadable .zip package
└── src/
    ├── main.tsx                # React entry point
    ├── App.tsx                 # Main app — TeamsJS init, theme handling
    ├── index.css               # Global styles (Teams theme aware)
    ├── components/
    │   ├── TimerTabs.tsx       # Mode switcher (countdown / stopwatch / pomodoro)
    │   ├── TimerDisplay.tsx    # SVG circular progress ring
    │   ├── Countdown.tsx       # Countdown timer UI
    │   ├── Stopwatch.tsx       # Stopwatch with lap tracking UI
    │   └── Pomodoro.tsx        # Pomodoro work/break cycle UI
    └── hooks/
        ├── useCountdown.ts     # Countdown timer logic
        ├── useStopwatch.ts     # Stopwatch logic with laps
        └── usePomodoro.ts      # Pomodoro cycle logic
```

## App manifest

The manifest (`manifest/manifest.json`) targets manifest version **1.19** and
declares the app as a **configurable tab** available in:

- `meetingSidePanel` — in-meeting side panel (primary target)
- `meetingChatTab` — meeting chat header
- `meetingDetailsTab` — pre/post meeting details

The app uses the `groupchat` scope, which makes it available in private meetings,
group calls, and one-on-one calls.

## Customizing icons

Run the icon generator to create placeholder PNG icons:

```bash
npm run generate-icons
```

Replace `manifest/color.png` (192×192) and `manifest/outline.png` (32×32)
with your own branded icons before publishing.

## License

MIT
