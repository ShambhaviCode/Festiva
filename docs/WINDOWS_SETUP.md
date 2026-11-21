# Running FESTIVA on Windows 11 with VS Code

A beginner's guide, from an empty computer to FESTIVA running in your browser. You need no accounts, keys or paid services: FESTIVA runs in **demo mode** with nothing configured.

> **How this guide was checked.** Every command below was run from a fresh copy of FESTIVA-FINALIST.zip on Linux with Node.js 22 (`npm ci`, build, start, tests). The commands are the same on Windows. The guide has **not** been run on a Windows 11 machine. If a step behaves differently, see [Troubleshooting](#troubleshooting).

## 1. Install the tools (once)

1. **Node.js 22 LTS.** Go to <https://nodejs.org>, download the **LTS** Windows installer (.msi) and run it with the default options. FESTIVA needs Node.js 20.9 or newer.
2. **Visual Studio Code.** Download it from <https://code.visualstudio.com> and install it. Tick **Add "Open with Code" action** when the installer offers it.
3. **Git (optional).** Needed only to save versions of your work or put it on GitHub: <https://git-scm.com/download/win>.

Check Node.js. Open **PowerShell** (press Start, type `PowerShell`, press Enter) and run:

```powershell
node --version
npm --version
```

You should see `v22.…` and `10.…` or higher. If PowerShell says `node` is not recognised, close it and open it again, or restart the computer.

## 2. Unzip FESTIVA

1. Right-click **FESTIVA-FINALIST.zip** → **Extract All…** → choose a short path such as `C:\Projects`, then press **Extract**.
2. You now have `C:\Projects\FESTIVA-FINALIST` containing `package.json`, `src`, `docs` and so on. That folder is the project; the guide calls it the FESTIVA folder.

Use a short path without OneDrive. Folders synced by OneDrive (Desktop and Documents often are) can lock files during installation.

## 3. Open it in VS Code

Right-click the `FESTIVA-FINALIST` folder → **Open with Code**, or in VS Code choose **File → Open Folder…**. If VS Code asks whether you trust the authors, choose **Yes, I trust the authors**.

Open the built-in terminal with **Terminal → New Terminal** (or <kbd>Ctrl</kbd>+<kbd>`</kbd>). It opens in the project folder and uses PowerShell.

Recommended extensions (VS Code will suggest them): **ESLint** and **Tailwind CSS IntelliSense**. They are optional.

## 4. Install and run

In the VS Code terminal:

```powershell
npm ci
npm run dev
```

- `npm ci` installs exactly the versions in `package-lock.json`. It takes a few minutes the first time and puts about 780 MB (651 packages) into `node_modules`.
- `npm run dev` starts FESTIVA. When the terminal shows `Ready`, open <http://localhost:3000>.
- To stop it, click in the terminal and press <kbd>Ctrl</kbd>+<kbd>C</kbd>, then `Y` if asked.

If `npm` is blocked with *"running scripts is disabled on this system"*, run this once, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 5. Run the production build (faster; use this for the demo)

```powershell
npm run build
npm run start
```

Open <http://localhost:3000>. The build takes one to three minutes. Use this mode to present: pages load much faster than in `npm run dev`.

## 6. Run the checks

```powershell
npm run lint
npm run typecheck
npm test
npm run db:verify
```

These need no browser and no internet. For the browser tests, install Playwright's Chromium once, then run them:

```powershell
npx playwright install chromium
npm run test:e2e
npm run test:integrations
```

`test:e2e` builds the app and starts it on port 3210 by itself; close anything already using that port. The full run takes about ten minutes. Expected results are in [TESTING.md](TESTING.md).

## 7. Turn on the sponsor services (optional)

Demo mode is enough to show every module. To connect Sarvam AI, Flagsmith and NudgeBee with your own keys, follow [SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md). In short:

```powershell
Copy-Item .env.example .env.local
code .env.local
```

Fill in the keys, save, then stop and restart `npm run start`. `.env.local` is ignored by Git and excluded from the release ZIP; never share it, paste it into chat or commit it.

To run the labelled local test doubles instead (no keys, nothing real), PowerShell sets environment variables differently from the bash examples elsewhere in the docs:

```powershell
# Terminal 1
npm run stubs

# Terminal 2 (click + in the terminal panel)
$env:FESTIVA_ADMIN_TOKEN = "demo-admin-token-0123456789abcdef"
$env:SARVAM_API_KEY = "stub-sarvam-key"
$env:SARVAM_API_URL = "http://localhost:4010"
$env:FLAGSMITH_ENVIRONMENT_KEY = "ser.stub-flagsmith-key"
$env:FLAGSMITH_API_URL = "http://localhost:4010/api/v1/"
$env:FLAGSMITH_REFRESH_SECONDS = "5"
$env:NUDGEBEE_EVENT_WEBHOOK_URL = "http://localhost:4010/api/webhooks/event"
$env:NUDGEBEE_EVENT_WEBHOOK_TOKEN = "stub-nudgebee-token"
npm run start
```

Everything those variables unlock is shown as "Local test double, not the real service" in `/admin/integrations`.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `node` or `npm` not recognised | Reopen PowerShell or VS Code; reinstall Node.js with "Add to PATH" ticked |
| "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| `EPERM` or `EBUSY` during `npm ci` | Close other VS Code windows and file explorers on the folder; move it out of OneDrive; temporarily pause antivirus scanning of the folder; run `npm ci` again |
| Port 3000 already in use | `npm run start -- -p 3001`, then open <http://localhost:3001> |
| `npm run test:e2e` cannot find a browser | `npx playwright install chromium`, or use installed Chrome: `$env:PLAYWRIGHT_CHANNEL = "chrome"` |
| `npm run test:e2e` stops with "port 3210 is already used" | Another FESTIVA test server is still running: close other terminals, or set `$env:E2E_PORT = "3211"` |
| `npm run package` fails | It needs bash and `zip`. Run it in Git Bash or WSL. You do not need it to run FESTIVA |
| Globe is blank | Your browser has WebGL turned off; FESTIVA shows a flat map instead. Enable hardware acceleration in the browser to see the globe |
| Long path errors | Unzip to `C:\Projects` rather than a deep folder |

## Where to go next

- [DEMO_3_MINUTES.md](DEMO_3_MINUTES.md): what to show judges.
- [DEPLOYMENT.md](DEPLOYMENT.md): putting it online with Vercel and Supabase (needs your accounts and your approval).
- [../README.md](../README.md): what is in the product.
