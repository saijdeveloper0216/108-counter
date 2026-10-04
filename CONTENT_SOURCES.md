# Calendar and reading sources

Checked on 4 October 2026. This document describes the delivered collection and its limits.

## Lunar months

The app shows **Telugu Amanta months**, which change at the end of Amavasya. Drik Panchang also shows Purnimanta months; those names can differ on the same date. The selected day's name is evaluated at **12 noon in the selected calendar timezone**, not at sunrise. This convention is shown in the app. Festival observance dates have their own rules and are not inferred from these month ranges.

- New moon boundaries: existing Drik-derived `src/data/lunarDays.ts`, using the published Amavasya end times in IST, converted to UTC.
- Month names and Adhika flags: Drik Panchang's annual Purnima cards for 2025–2035, retained as date/name facts in `src/data/masamFullMoonNames.json`.
- Sources: https://www.drikpanchang.com/vrats/amavasyadates.html and https://www.drikpanchang.com/vrats/purnimasidates.html (select a year and location).
- Two outer boundaries, December 2024 and January 2036, were calculated with Astronomy Engine's `SearchMoonPhase(0, ...)` to enclose the supported years. They are retained as UTC instants in the generator. The terminal January 2036 Pausha name was checked on the source's 2036 Purnima page.
- Regenerate checked data: `node scripts/generate-masam-data.cjs`. This regenerates the committed facts; it does not silently scrape new years.
- Runtime coverage: **2025–2035**. Unsupported years show that coverage instead of invented month names. US local noon uses the selected timezone, including daylight saving.
- Checks include Ugadi on 19 March 2026 and 7 April 2027, Adhika Jyeshtha in May–June 2026, and Bhadrapada on 4 October 2026.

## Devotional collection — supplied edition

The app now contains **42 fully offline readings**: 6 Chalisa-section entries, 12 mantras, 13 aartis, 4 Shiva ashtakams and 7 stotras/namavali readings. No publisher page, WebView, source button or external booklet is used for prayer reading.

The user's `108-counter-lyrics-needed(1).txt` supplies **15 texts**, retained verbatim in their original script (14 Telugu, 1 Hindi/Devanagari). Every nonblank chant line, repeat, variant in brackets and numbered ceremony section is preserved. Only document headings, dash separators and the two English category labels are excluded from the chant body. The original input is retained at `assets/texts/supplied-lyrics.txt` for reproducibility.

Added or replaced:

- Navagraha Chalisa and Durga Chalisa. The other **37 pending chalisas** from the previously requested Gods/Goddesses groups are removed. Existing complete Hanuman, Ganesh, Shiva and Bajrang Baan remain.
- Durga Mata Aarti (Ambe Tu Hai Jagdambe Kali), Sai Guruvaar, Kakad, Dhoop and Shej. Dhoop contains all 230 supplied lines; Shej contains all 122 supplied lines, in order.
- Manidweepa Varnanam, Govinda Namaavali, Sri Venkateswara Suprabhatam, Sree Annapurna Stotram, Shiva Panchakshari Stotram, Chandrasekhara Ashtakam, Anjaneya Dandakam and Nava Graha Stotram.

All **27 unrelated existing readings** retain identical chant text in every reading script. The calendar and supplied readings remain as previously delivered. The counter UI was subsequently redesigned; Naam Jaap now uses exact decimal counts without a fixed cap. None of the omitted pending readings is kept as an online or coming-soon placeholder.

### Kakad input needs correction

The file's Kakad section contains **the same 19 lines as its Guruvaar section**, beginning Aarti Shri Sai Guruvar Ki. It does not supply a distinct complete Kakad ceremony. Both requested entries are retained exactly as supplied. The Kakad description identifies the supplied hymn; it does not claim to contain a complete ceremony. A corrected Kakad text can replace this entry later.

### Reading scripts

Devanagari, Hindi, English / Roman, Telugu, Tamil, Kannada and Malayalam are **reading options for the original chant words**, not semantic translations. Devanagari and Hindi use the same script. English uses IAST Roman transliteration. Converting a Telugu devotional composition into Hindi script preserves Telugu words; it does not translate their meaning into Hindi.

`canonical.json` retains each original plus its `sourceScript`. To regenerate:

```sh
node scripts/import-supplied-lyrics.cjs
node scripts/generate-prayer-scripts.cjs
```

The importer is repeatable and replaces supplied IDs, retaining unrelated originals. Sanscript produces the other scripts. Telugu combining candrabindu is normalized only for conversion; the original text is untouched. Tamil uses a nasal approximation and cannot distinguish all Sanskrit sounds. This is not a scholarly pronunciation edition. Local fonts and their OFL notices remain bundled.

Content checks compare every supplied line to the input, verify retained-reading hashes, ensure omitted IDs are absent and reject English/Telugu fragments in the wrong reading option. Native Android bundle export passes; physical device rendering still needs the user's test.

## Display assets

The counter artwork is repository-native SVG and gradients, not the generated concept screenshot. DisplaySerif is the bundled DejaVu Serif font, distributed with its full license notice at `assets/fonts/DisplaySerif-LICENSE.txt`. Devotional and the Indic reading fonts remain unchanged.
