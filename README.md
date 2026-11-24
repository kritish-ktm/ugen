# Ugen

A Danish-first calendar and daily toolkit built around ISO week numbers. Ugen uses Next.js App Router, strict TypeScript, Tailwind CSS, Framer Motion, date-fns and a textured paper theme. Currency history uses an interactive line chart, and the week summary shows dates, holidays and reminders.

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

News shows headlines and publisher-supplied RSS thumbnails with links to the original pages. Forecasts use DMI HARMONIE. Rates use Frankfurter’s ECB-backed v1 API. The school-break tint covers the published Copenhagen advisory dates from June 2026 to August 2028. Schools may use different dates. Name-day labels follow the historical Danish almanac data from Dansk Kalender API. Timed notifications run while the app is open, with browser permission.

- [Frankfurter v1](https://frankfurter.dev/v1/)
- [DMI Frie Data](https://www.dmi.dk/friedata/dokumentation/forecast-data-edr-api)
- [Rejseplan official link documentation](https://labs.rejseplan.dk/hc/en-us/articles/21950431101085-Intelligente-links-til-rejseplan-dk)
- [Danish almanac data](https://www.kalendarium.dk/)
- [Copenhagen advisory school calendar](https://www.kk.dk/borger/dagtilbud-og-skole/skole-og-fritid/vejledende-ferieplan-for-skoleaaret-i-koebenhavns-kommune)
- [Ministry of Justice flag guidance](https://www.retsinformation.dk/eli/retsinfo/2024/10155)

## Verify the five steps

| Step | What to try |
| --- | --- |
| 1 · Shell and paper theme | Open the calendar on desktop and mobile. Check the navigation, light and dark paper palettes, and reduced motion. |
| 2 · Kalender | Jump to week 53 of 2026 and open 1 January 2027. Check the week-year in the day sheet, switch calendar views, and save a dated reminder. |
| 3 · Valuta | Pick a currency, try the keypad and swap, use the keyboard to scrub the history, and reload after going offline. |
| 4 · Nyheder, Rejse and Mere | Advance a story and filter the headline feed. Search for a route and inspect the prefilled official link or live journeys. Change the forecast city, language and theme. |
| 5 · PWA and quality | Use a production build. Load once online, reload offline, navigate to More, and open the planner. |

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts the built app on port 3100 and uses deterministic fixtures for provider UI flows. It checks keyboard interaction, reminder and preferences persistence, the PWA shell and axe WCAG A/AA rules. Set `UGEN_CHROME_PATH` to use an existing Chromium executable, or `UGEN_TEST_URL` to test a running production instance.
