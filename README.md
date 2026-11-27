# Ugen

A Danish-first calendar and daily toolkit built around ISO week numbers. Ugen uses Next.js App Router, strict TypeScript, Tailwind CSS, Framer Motion, date-fns and a translucent glass theme with Danish red accents. Currency history uses an interactive line chart, and the week summary shows dates, holidays and reminders.

The travel page has illustrated S-train, InterCity and city-bus animations above the planner, with a pause control and a stationary reduced-motion view. Special-day details and selected calendar cards can show relevant Wikipedia illustrations through Kalendarium’s documented API. Photo credits, licence and source links appear beside each image; unavailable images leave the date information intact.

## Run locally

Use Node.js 22.18 or newer and npm.

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To try installation and offline behavior, stop the development server and use a production build. Service workers are enabled in production, and hosted instances need HTTPS.

```powershell
npm run build
npm start
```

Open the app online once and wait for the service worker to install. From **Mere**, select **Installér app**. Browsers that manage installation themselves use their own menu or **Add to Home Screen**. The calendar, planner, settings, and reminders are usable offline. The app retains previously fetched rates, headlines, and forecasts in IndexedDB. The exchange-rate chart carries the last published rate across dates without an ECB fixing and labels those points. It shows daily ECB reference rates, checks for updates every five minutes while visible, and offers a manual refresh.

## Optional providers

Place provider settings in `.env.local` and restart the Next.js server.

| Variable | Purpose |
| --- | --- |
| `REJSEPLANEN_API_KEY` | Server-only Rejseplan API 2.0 access ID. When it is absent, the journey form opens an official search with the requested route, date and time filled in. The built-in example uses fictional departures. |
| `REJSEPLANEN_API_URL` | Optional provider base URL if your Rejseplan access agreement supplies a different host. |
| `TV2_RSS_URL` | Authorized RSS endpoint for TV 2 headlines. The app links directly to TV 2 when its feed is unavailable. |

News shows headlines with publisher-supplied RSS images, then tries the original article’s Open Graph or Twitter preview. Missing or blocked images become labeled publisher covers. The preview endpoint only requests allowlisted Danish publisher hosts, validates redirects, limits response size and time, and caches results. Photos load lazily in the browser.

Select a week or use **Gå til uge**, then **Del uge** to copy a link such as `/?year=2026&week=53`. Invalid week links fall back to today with a message. The calendar explains Danish week-number usage and shows curated events for the selected week, with an area filter. The events list is a selection, rather than a comprehensive event feed.

**Shops → Ugens indkøb** searches public eTilbudsavis listings separately for Netto, REMA 1000, Lidl, 365discount, føtex, Bilka, SuperBrugsen and MENY. Submit any product or brand, then refine by product type, store or words. A coverage table distinguishes matching offers, empty searches and unavailable sources for all eight chains. Member/app prices are excluded by default. Compare per litre, kilo, item or package; uncertain unit prices sort last and cannot win a unit-price comparison. Package prices do not compare quantities. Expiry sorting has no cheapest label. Exact stated name/description or GTIN matches can be compared separately across stores, excluding mixed variants and ambiguous prices. Coverage is a partial index of advertised offers, not all products or every Danish supermarket, and missing prices never imply a store is more expensive. Official retailer leaflets remain linked below.

Offer sources are fetched server-side in bounded batches with time and size limits and a 30-minute cache. The page refreshes while visible every 30 minutes; no background service or API key is needed. Source layout changes produce per-store unavailable notices. Only Danish DKK offers with current explicit validity dates are accepted; undated catalogue prices, foreign retailers, expired and future offers are excluded. Cached offers are checked against the current instant and Copenhagen date again before display. Source links contain no affiliate parameters; no publisher advertising scripts are loaded.

**Mere → Ud i byen** searches dated events by range, city, type and Sunday markets. It combines curated events, researched 2026 Sunday-market seasons, and public concert links from VEGA’s programme (hourly source cache). Kayak Lucia parades are listed on **13 December 2026**, with source links and Copenhagen/Aarhus times. Seasonal rules respect summer closures and do not invent 2027 dates. A market guide provides year-round discovery links, including winter pauses. Recurring listings indicate that the organiser’s calendar should be checked for exceptions. Event coverage is a selection, not a nationwide live feed.

The directory, market guide and favourites work offline. Cached event/offer data can be viewed offline; current retailer prices, ticket status and external sites require internet access.

The desktop sidebar includes Events, Markets, Shops, Jobs and Housing alongside News, Currency and Travel. A full **Menu** button is available in the website header on desktop and phones, with five familiar bottom tabs retained on small screens. **Shops** links directly to supermarkets and offers. **Markets** opens a dedicated market-only explorer. **Jobs** lists 10 recruitment companies; **Housing** lists five rental providers and five property-sales services. Both directories have search, device-local favourites, official links and an explicit alphabetical, unpaid selection policy. Ugen adds no advertisements, affiliate parameters or paid placements; linked sites manage their own content and terms. Links were reviewed on 27 November 2026, and live job/property inventory remains with the providers.

Forecasts use DMI HARMONIE. Rates use Frankfurter’s ECB-backed v1 API. The school-break tint covers the published Copenhagen advisory dates from June 2026 to August 2028. Schools may use different dates. Name-day labels follow the historical Danish almanac data from Dansk Kalender API. Timed notifications run while the app is open, with browser permission.

- [Frankfurter v1](https://frankfurter.dev/v1/)
- [DMI Frie Data](https://www.dmi.dk/friedata/dokumentation/forecast-data-edr-api)
- [Rejseplan official link documentation](https://labs.rejseplan.dk/hc/en-us/articles/21950431101085-Intelligente-links-til-rejseplan-dk)
- [Danish almanac data](https://www.kalendarium.dk/)
- [Copenhagen advisory school calendar](https://www.kk.dk/borger/dagtilbud-og-skole/skole-og-fritid/vejledende-ferieplan-for-skoleaaret-i-koebenhavns-kommune)
- [Ministry of Justice flag guidance](https://www.retsinformation.dk/eli/retsinfo/2024/10155)

## Verify the five steps

| Step | What to try |
| --- | --- |
| 1 · Shell and glass theme | Open the calendar on desktop and mobile. Check the translucent navigation, light and dark palettes, and reduced motion. |
| 2 · Kalender | Jump to week 53 of 2026 and open 1 January 2027. Share the week, reload, use Back, and try an invalid link. Check week-filtered events, the week explanation, and a dated reminder. |
| 3 · Valuta | Pick a currency, try the keypad and swap, use the keyboard to scrub the history, and reload after going offline. |
| 4 · Nyheder, Rejse and Mere | Filter headlines and check image recovery. Try a route and its official search link. Open supermarket offers, search, and save a favourite. Change the forecast city, language and theme. |
| 5 · PWA and quality | Use a production build. Load once online, reload offline, navigate to More, and open the planner. |

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the built app on port 3100 and uses deterministic fixtures for provider UI flows. It checks keyboard interaction, reminder and preferences persistence, the PWA shell and axe WCAG A/AA rules. Set `UGEN_CHROME_PATH` to use an existing Chromium executable, or `UGEN_TEST_URL` to test a running production instance.
