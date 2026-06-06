# Publish 108 Counter on Google Play

Follow these steps in order. Your app package is `com.counter108.app`.

## Step 1 — Host the privacy policy (required)

1. Push this repo to GitHub (if not already).
2. Enable **GitHub Pages** for the repo:
   - Repository → **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` → folder **`/docs`**
   - Save
3. After a minute, your policy URL will be:
   ```
   https://YOUR_GITHUB_USERNAME.github.io/108-counter/privacy-policy.html
   ```
4. Edit `docs/privacy-policy.html` — set your real support email in the Contact section.
5. Put the same URL and email in `app.json`:
   ```json
   "extra": {
     "privacyPolicyUrl": "https://YOUR_GITHUB_USERNAME.github.io/108-counter/privacy-policy.html",
     "supportEmail": "you@yourdomain.com"
   }
   ```

## Step 2 — Production Android build (AAB)

```bash
cd ~/Projects/108-counter
npm install
npx eas-cli login
npx eas build --platform android --profile production
```

- First build: EAS will ask to create an Android keystore — choose **Yes, let EAS manage**.
- When finished, download the `.aab` from the Expo dashboard or use:
  ```bash
  npx eas build:list
  ```

## Step 3 — Create the app in Play Console

1. Open [Google Play Console](https://play.google.com/console).
2. **Create app** → name **108 Counter**.
3. Default language: English.
4. App or game: **App**. Free.

## Step 4 — Store listing (copy-paste)

**Short description** (max 80 characters):

```
108-bead mala counter, naam jaap, shlokas & Hindu festival calendar.
```

**Full description**:

```
108 Counter supports your daily sadhana with a calm, respectful design rooted in Hindu tradition.

MALA & NAAM JAAP
• Count one full mala of 108 with bead ring and completion celebration
• Switch to continuous naam jaap mode for open-ended chanting (up to 5 million)
• Undo, reset, haptic feedback, and mala history

SHLOKAS
• Sacred verses with meanings in multiple languages
• Browse by category and read at your own pace

CALENDAR
• Hindu festivals and lunar masams
• India (IST) and USA calendar views
• Optional reminders one day before festivals

SETTINGS
• Vibration intensity for each count
• Counting mode: 108 Mala or Naam jaap
• Share feedback to help us improve

Festival dates can vary by temple and locality. State tags note where observance is especially common.

No account required. Your counter data stays on your device.
```

**Category:** Lifestyle (or Books & Reference)

**Contact email:** same as `supportEmail` in app.json

**Privacy policy URL:** your hosted `privacy-policy.html` URL

**Screenshots:** capture at least 2 phone screens — Counter tab and Shlokas or Calendar (1080×1920 or similar)

**Feature graphic:** 1024×500 PNG/JPEG (optional for first internal test; required for production)

## Step 5 — Data safety form (Play Console)

Answer honestly based on the app today:

| Question | Answer |
|----------|--------|
| Collect or share user data? | **Yes** (minimal — see below) |
| Data encrypted in transit | **N/A** or No (no server sync) |
| Data types | **App activity** or **Other** → counter/settings stored locally |
| Purpose | App functionality |
| Optional? | User can use app without feedback form |
| Shared with third parties | **No** (except if user opens Google Form voluntarily) |
| Analytics | **No** |
| Ads | **No** |
| Account required | **No** |
| Delete data | User can reset in app or uninstall |

Notifications: declare **optional** device permissions for reminders (local only).

## Step 6 — Upload to Internal testing first

1. Play Console → **Testing** → **Internal testing** → Create release.
2. Upload the `.aab` from EAS.
3. Add release notes: `Initial release — mala counter, naam jaap, shlokas, festival calendar.`
4. Add yourself as tester (email list) and open the opt-in link on your Pixel.
5. Install and verify: counter modes, calendar, reminders, privacy link in Settings.

## Step 7 — Content rating & policies

Complete in Play Console:

- **Content rating** questionnaire (no violence, no user-generated public content → low rating)
- **Target audience** — likely 13+ or general
- **News app, COVID, government** — No where not applicable
- **Ads** — No

## Step 8 — Promote to Production

When internal testing looks good:

1. **Production** → Create release → same or newer AAB.
2. Submit for review (first review can take a few days).

Optional — submit from CLI after service account setup:

```bash
# Place JSON key at ./google-play-service-account.json (never commit)
npx eas submit --platform android --profile production
```

## Checklist before Production

- [ ] Privacy policy URL live and opens in browser
- [ ] `supportEmail` and Play Console contact email match
- [ ] Tested on real Android device from Play internal link
- [ ] Counter, jaap mode, shlokas, calendar, settings all work
- [ ] Festival reminders permission flow tested
- [ ] Version `1.0.0` / `versionCode` 1 in `app.json`

## After launch

- Bump `version` in `app.json` and rebuild for updates (`eas build` with `autoIncrement` handles `versionCode`).
- Reply to Play reviews and feedback form submissions.
