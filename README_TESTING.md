# 108 Counter — Animated Mala Preview

This updated project includes a working preview of the actual Expo app plus the editable source.

## See the app immediately on Windows or Mac

1. Extract `108-counter-animated.zip`.
2. Open Terminal / PowerShell in the extracted `108-counter-animated` folder.
3. Run:

```sh
node scripts/serve-preview.cjs
```

4. Open **http://localhost:8080** in Chrome, Edge, or Safari.

The ZIP includes `web-preview`, so this route does not need `npm install`, Expo, Android Studio, or Python. It does require Node.js. If `node` is not recognized, install a supported Node.js LTS release (20.19 or newer) and reopen the terminal. Do not double-click `web-preview/index.html`; serve it using the command above.

The browser uses your local storage for practice. Browser data is separate from the existing app installed on your phone. Notifications and completion-image sharing need a native phone build.

## Run and edit the source

From the same folder:

```sh
npm ci
npm run web
```

Use the local address printed by Expo. This project stays on Expo SDK 54 with compatible dependency versions. The repository's AGENTS.md asks contributors to read the SDK 56 documentation before editing; that instruction does not require an SDK upgrade.

For native development, use an Expo Go / development client compatible with SDK 54. On Android, install the matching version from https://expo.dev/go?sdkVersion=54&platform=android&device=true. The current Play Store Expo Go for SDK 57 cannot open this project. This is an Expo Go version mismatch, not a project startup failure. If your iPhone's Expo Go cannot load SDK 54, use a development build rather than upgrading Expo only to view this redesign.

## Make an Android APK for phone testing

The repository's existing EAS `preview` profile builds an APK:

```sh
npm ci
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

Sign in with the Expo account that owns this project. Download the APK from the finished build and install it on your Android phone. The package remains `com.counter108.app`. Existing installed app updates require the same signing key. This package does not include a prebuilt APK and does not publish a Play Store release.

## Test on your Android phone from a Mac

Extract this updated ZIP and run inside its `108-counter-animated` folder:

```sh
npm ci
npx expo start --go --clear --port 8082
```

Close the previous Expo Go session and scan the new QR code in Expo Go. Mac and phone should be on the same Wi-Fi. If LAN discovery fails, run `npx expo start --tunnel`. Use Expo Go compatible with SDK 54. Close the older project session before scanning the updated QR code.

## Android layout corrections

The latest update addresses the physical-phone screenshots:

- Both mode labels use equal fixed-height cells, explicit foreground layering and centered text with Android font padding disabled.
- The complete mandala scales to the measured space above each counter, with a separate gap. It is no longer cropped or covered by the count card.
- Undo, Reset and History have equal fixed-height frames, measured artwork sizes, and centered icon/text rows. Text stays inside the gold edges.
- Naam Jaap has separate centered rows for TOTAL CHANTS, the number and Tap to chant. Label/number rows use explicit line heights and stay inside the card.
- The counter artwork uses measured numeric dimensions instead of percentage offsets, keeping native image placement consistent.

Validation: TypeScript, 24 unit tests and Android/web exports passed. Rendered browser checks cover seven screen sizes, both labels in each mode, full mandala bounds and separation, matching button bounds, centered label/count/tap rows, the reported three-digit count 173, eight-digit totals, and exact huge-count increment/Undo. See `preview/redesigned-counter-checks.json`. No physical Android rendering test was available here; the preview images are browser captures. Existing saved counters and other features are retained.

## Approved counter redesign

The implemented screen now uses the approved maroon/gold design with reference-derived embossed gold Om mandala artwork, bronze hanging bells, serif gold typography and textured bronze controls. Naam Jaap has a rectangular Tap to chant card; 108 Mala retains a rounded counter with 108 beads. Both share the same maroon background and artwork. The Counter tab uses a gold temple icon and History uses a bar-chart icon. Naam Jaap does not show a completed-rounds row or round-progress column. Undo, Reset and History remain fixed above the tabs. Share is available from the Naam Jaap header; Mala completion keeps its sharing card. History retains practice statistics and the existing mala-total reset action.

Naam Jaap has **no imposed count cap**. Exact decimal strings replace the previous 10-crore numeric limit; old numeric saved counts migrate automatically. Increment, Undo and round-boundary history work beyond the JavaScript safe integer range. Normal 6–8 digit totals fit the card. Totals longer than 12 digits scroll horizontally inside the numeral area, leaving the main screen and controls fixed. No count is abbreviated.

The `preview/108-counter-naam-jaap.png` screenshot and GIF use **12,345,678 as test data** to demonstrate fit. The app does not start users at that count or overwrite existing saved progress.

## Latest requested changes

All prayers now open as bundled native text without internet or source buttons.

- Added all 15 readings from your supplied file. The collection has 42 offline readings, including 27 unrelated existing readings retained unchanged.
- Retained supplied Navagraha and Durga chalisas; removed the other 37 pending Gods/Goddesses chalisas. Existing Hanuman, Ganesh, Shiva and Bajrang Baan remain.
- Added all five supplied aartis. Dhoop and Shej include every supplied line in order.
- Added Manidweepa Varnanam, Govinda Namaavali, Venkateswara Suprabhatam, Annapurna Stotram, Shiva Panchakshari Stotram, Chandrasekhara Ashtakam, Anjaneya Dandakam and Navagraha Stotram.
- Added the Stotras & Namavali category. Shiva Ashtakam now has four entries.
- Preserved original Telugu/Hindi and generated other reading scripts, including Roman text. These are chant transliterations, not meaning translations.
- Preserved the previous counter, Android animation fix, pinned Undo/Reset/History controls, and checked lunar calendar.

**Kakad note:** the supplied Kakad section repeats the Guruvaar hymn exactly. The app includes your text under both entries and does not label Kakad as a complete ceremony. Send corrected Kakad ceremony lyrics when available.

Read `CONTENT_SOURCES.md` for the complete scope and reproduction steps.

## What changed

- Rebuilt the counter screen with reference-derived gold Om mandala, hanging bells, bronze panels, press depth, spring return and gold ripple. Naam Jaap remains rectangular and 108 Mala is circular.
- Preserved the maroon/gold devotional palette and both 108 Mala and continuous Naam jaap modes.
- Added a lotus that unfolds at 108, next-round/undo controls, and native PNG completion-card sharing. Continuous jaap shares a text summary.
- Added daily goals of 1, 3, 5, or 11 malas and a practice streak. Both modes contribute when a full round is completed.
- Added an optional daily local chanting reminder, independently scheduled from festival reminders.
- Added an animation toggle; system reduced motion is respected, and ambient animation pauses off-screen/in the background.
- Made counting update immediately, independently of vibration.
- Made daily resets retain old mala history. Explicit reset/clear-history actions still remove the corresponding records after confirmation.
- Added a bundled, licensed Devanagari font so the Om symbol renders in the browser and on phones.
- Added browser support and working browser confirmations for reset and mode changes.
- Retained existing saved counts and settings through migration. Resetting the continuous count keeps its practice records; the explicit completed-mala reset clears them. Historical continuous-jaap counts did not previously record dates; they are preserved, but cannot be retroactively assigned to daily goals or streaks. New completed rounds are recorded.

These are depth and perspective effects built with Reanimated and SVG. This version does not introduce a mesh-based 3D engine, deity themes, audio, a new diya, or a marketing campaign.

## Test checklist

1. Tap several times; verify one increment per tap and smooth card depth animation.
2. Undo; verify the number goes back.
3. Reset and confirm/cancel; verify cancel keeps your count.
4. Switch to Naam jaap, count, and switch back. Each mode retains its own number.
5. Close/reopen or refresh; verify both saved counts survive.
6. Reach 108. The lotus should unfold and the daily goal should increase by one mala.
7. Undo from the completion card; verify the count returns to 107 and the daily completion is removed.
8. Tap again, then select Start next mala. The count resets to zero; history and daily completion remain.
9. In Settings, change the goal and turn animations off/on. Repeat with the device's reduced-motion setting enabled.
10. On a phone, enable Daily chanting reminder, choose a time a few minutes ahead, and verify delivery. Change the time; verify only one daily reminder remains. Disable it; festival reminders should remain.
11. On a phone, complete 108 and use Share my practice. Verify the shared PNG card.
12. In Naam Jaap, verify History opens its own records and that there is no completed-round row. On a small screen, verify Undo, Reset and History are visible immediately above the tabs without scrolling. Increase Android font/display size and repeat. The main number must remain readable.
13. With daily reset enabled, cross a local date boundary and reopen the app. Current mala counts reset while previous-day history remains.

14. Open Calendar in India mode: 19 March 2026 should show Chaitra; 17 May should show Adhika Jyeshtha; 15 June should show regular Jyeshtha; 4 October should show Bhadrapada. US noon can put a boundary on a different civil date.
15. Filter Chalisa: verify six entries. Filter Shiva Ashtakam: verify four entries. Search Sai: Guruvaar, Kakad, Dhoop and Shej should appear separately.
16. Open each supplied reading and switch Hindi, Telugu, Tamil, Kannada, Malayalam and English / Roman. Verify all lines appear in the chosen reading script. Telugu compositions retain their words in the other scripts.
17. Open Stotras & Namavali: verify seven entries, including Manidweepa Varnanam, Govinda Namaavali and Anjaneya Dandakam. Chandrasekhara appears under Shiva Ashtakam.
18. In airplane mode, reopen the app and read Dhoop through to its final line. Repeat for Shej. No source, browser or booklet button should appear.

## Validation

```sh
npm run typecheck
npm test
npx expo export --platform all --output-dir app-export
```

The implementation has passed TypeScript checking, 24 unit tests, and Android/web JavaScript bundle exports for this update. Browser interaction and layout checks are documented in `preview/requested-update-checks.json` when present. Phone notification delivery, haptic behavior, and native image sharing still need the device checks above. Bundle export is not an APK/IPA build.

## Principal source files

- `src/components/CounterScreen.tsx`: counter layout, goal/streak cards, completion modal and sharing.
- `src/components/ChantCard.tsx`: rectangular count card, exact full-count display, press depth, glow and ripple.
- `src/components/GoldMandala.tsx`: bundled gold Om artwork and maroon bell background.
- `src/components/DevotionalOrb.tsx`: circular 108 Mala counter and animated beads.
- `assets/ui/ASSETS.md`: visual asset provenance and image-generation prompts.
- `src/utils/chantCount.ts`: unlimited decimal increment, Undo, division and grouping.
- `src/components/AnimatedLotus.tsx`: animated SVG petals.
- `src/utils/counterState.ts`: pure counter transitions, saved-state migration and practice statistics.
- `src/hooks/useCounter.ts`: state, persistence and local-day refresh.
- `src/hooks/useCounterMotion.ts`: reduced motion, focus and foreground checks.
- `src/screens/SettingsScreen.tsx`, `src/types/settings.ts`: goals, reminder and motion controls.
- `src/services/notifications.ts`: independent daily practice notification.

## Android SVG animation fix

The lotus now animates standard React Native views with transform arrays. This avoids sending an SVG transform string to Android native code. If you copied the earlier source, replace `src/components/AnimatedLotus.tsx`, then restart Metro with `npx expo start --go --clear --port 8082` and reopen Expo Go.

## Large count tests

1. Check 6- and 8-digit totals on a small phone; all digits and three bottom buttons must be visible.
2. Tap and Undo across 99,999,999; the old 100,000,000 cap must no longer apply.
3. Close/reopen the app and switch modes; both counters must keep their exact values.
4. For very long totals, swipe only the number area to read the full value.
5. Turn animations off and repeat; no motion is required to count.

Automated checks cover exact decimal arithmetic against an independent bigint oracle, old-save migration, persisted 30-digit totals, increment/undo, seven viewport sizes (320×480 through tablet), full eight-digit fitting, and button placement. Physical Android performance and haptics still need device testing.
