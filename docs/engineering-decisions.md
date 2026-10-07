# Engineering decisions

These decisions describe the implemented Roamly application and the trade-offs behind it.

## 1. Migrate Next.js to React, Vite, and TypeScript

**Context:** The original Next.js 14.1 project rendered a static camping landing page. The new product uses browser-accessible public data and browser-local trip plans. It does not currently need server-owned data or server rendering.

**Decision:** Replace Next.js routing, layout, metadata, image components, configuration, and dependency with a Vite-built React SPA, strict TypeScript, and React Router. Retain the original photograph as a compressed JPEG and evolve the green palette into a new Roamly identity.

**Why:** A runtime server does not improve the current keyless API/local persistence workflow. React components, event handlers, controlled forms, effects, URL state, and focused providers now define the application directly. Static deployment is simpler, and no framework-specific Server/Client Component boundary obscures state ownership.

**Alternatives:** Upgrade Next.js and retain server rendering; use a React SSR framework; keep the original static landing page. Each is reasonable for a different product requirement.

**Trade-offs:** No SSR, per-route server metadata, automatic image pipeline, or server secret boundary. Initial rendering requires JavaScript, and hosts must rewrite deep links to `index.html`. We compress the retained image ourselves, lazy-load routes and flag thumbnails, and use explicit loading/error UI. Vite is a build tool, not a solution for backend needs.

**When I would reconsider it:** SEO-driven destination acquisition, rich social previews, server authentication, secret-bearing APIs, or server-owned personal data. Reconsider SSR/prerendering independently from adding a backend; they solve different problems.

## 2. Own each kind of state at its natural boundary

**Context:** Remote data, URL filters, shared saved collections, and unsaved form edits have different lifecycles. The application has a bounded country list and one local itinerary.

**Decision:** TanStack Query owns country/weather data; React Router owns submitted search, region, sorting, and page; separate Trip and Favourites Context providers own shared saved collections; React state owns editor drafts and messages. Filters and summaries are derived by pure functions.

**Why:** Each boundary has one source of truth. Query provides request deduplication, cancellation, retries, and stale-data handling. URLs support reloads/history/shareable discovery states. The providers serve genuinely shared consumers without coupling unrelated local UI. No fetching effects, synchronisation effects for derived totals, Redux, or global UI store are needed.

**Alternatives:** Fetch with effects, a single application Context, Redux, or an external store. They either recreate query lifecycle logic or add unnecessary breadth here.

**Trade-offs:** A Context collection update rerenders its consumers. Provider values are not memoised without evidence that rerender cost matters. Search applies on form submission, so keystrokes do not need a debounce or generate requests. Favourites and private trip contents are not encoded into a share URL.

**When I would reconsider it:** Many independent collaborative edits, complex undo/redo, high-frequency shared updates, expensive consumers, or nested state workflows. Profile first, then use selectors or an appropriate external store. With thousands of destinations, use server filtering/pagination instead of loading the entire catalogue.

## 3. Public APIs, runtime parsing, and explicit availability risk

**Context:** REST Countries' current documentation requires authentication for v5 and reports legacy APIs deprecated. A live request to the old root-domain endpoint returned a deprecation envelope. The public Conventus v3.1 mirror returned real country metadata and accepted browser CORS. Open-Meteo supports keyless noncommercial weather requests.

**Decision:** Use the verified public mirror with ten selected fields and the documented Open-Meteo forecast endpoint. Keep all third-party requests and response mapping in feature adapters. Treat payloads as `unknown` and validate before returning domain objects. Fetch directly without a proxy.

**Why:** No private secrets are required or exposed. Country metadata remains independent from provider-specific fields. Weather errors and unit mismatches cannot silently become plausible temperatures. Reusing country coordinates avoids hardcoded city mappings on country guides or a second geocoding service. Place guides use separately curated coordinates.

**Alternatives:** Authenticated REST Countries v5 through a backend, another licensed provider, a checked-in country snapshot, or a proxy around public APIs. A proxy alone adds infrastructure without making upstream availability better.

**Trade-offs:** The mirror lacks a promised SLA and published numeric quota, and either API can fail. Countries/territories are reference guides, distinct from the curated place recommendations. Unusable country rows are dropped while valid ones remain; a wholly unusable response fails. Optional fields display as missing, unsafe flag URLs are omitted, and weather is model output at country coordinates rather than a capital forecast. Open-Meteo free usage has noncommercial and rate-limit restrictions, with attribution visible in the UI.

**When I would reconsider it:** Commercial deployment, provider instability, guaranteed freshness, official travel advice, city forecasts, or a provider that needs secrets. Add a secure server boundary only for real server responsibilities, including secret storage, rate limiting, and abuse controls.

**Sources checked:** [REST Countries versions](https://restcountries.com/docs/countries/api-versions), [mirror documentation](https://restcountries.conventus.de/), [Open-Meteo API](https://open-meteo.com/en/docs), [Open-Meteo terms](https://open-meteo.com/en/pricing). Live GET/CORS and weather browser rendering were verified on 6 October 2026.

## 4. Separate country and weather cache lifetimes

**Context:** Country metadata changes slowly; weather changes frequently. Users visit several routes that need the same country collection. Fetching weather for every discovery card would waste requests.

**Decision:** Share a single country query with 24-hour freshness and inactive retention. Weather queries are keyed by coordinate pair, fresh for ten minutes, retained for thirty minutes, and enabled only when coordinates are available on the detail route. Both have one retry and a 15-second fetch timeout. The query signal cancels abandoned requests.

**Why:** Country routes avoid duplicate requests while weather retains a suitably shorter lifespan. Search works locally over the bounded catalogue. Browser focus/reconnect can refresh stale active queries. Independent query states prevent a weather outage from removing metadata.

**Alternatives:** No caching, persistent query storage, full weather prefetching, interval polling, or one combined country/weather query. These add requests, stale-data ambiguity, or unnecessary failure coupling.

**Trade-offs:** Freshness is an in-memory client policy, not a guarantee of upstream data freshness; browser HTTP caching follows upstream headers. No persistent/offline API cache or periodic weather polling is provided. A cold detail load must first obtain country coordinates, then request weather. Previously cached query data can remain visible during failed background refreshes, with an explicit notice.

**When I would reconsider it:** Offline use, a large server-paginated catalogue, long-running live weather monitoring, or a stronger SLA. Measure usage and upstream policy before changing TTLs or adding polling.

## 5. Versioned local repositories for trips and favourites

**Context:** Plans are personal, locally scoped, and do not require accounts or collaboration. Storage can be denied, full, corrupted, or left at an older schema.

**Decision:** Put `getItem`/`setItem` behind `createRepository`, with separate keys, version-one envelopes, and runtime parsers. React lazily reads once per provider initialisation. User actions save; storage events reload saved collections across tabs. Read failures return an empty usable session and a warning without overwriting stored data.

**Why:** Presentation components never call localStorage. The storage port is easy to test and can be replaced. Reads do not cause StrictMode side effects, and local state still works if saving fails. There is no SSR hydration boundary in this SPA; providers initialise directly in the browser.

**Alternatives:** Scattered localStorage calls, IndexedDB, a global persistence effect, or authenticated backend persistence. They are either less reliable or require capabilities beyond this simple text itinerary.

**Trade-offs:** Browser-local, unencrypted data is not a backup and has no cross-device sync. Concurrent tabs use last-writer-wins; saved collections refresh, but open editors preserve their own drafts. A destination appears once per trip. Notes save explicitly and unsaved drafts disappear on route unmount. LocalStorage is synchronous, which is acceptable for these small collections.

**When I would reconsider it:** Large documents, offline structured data, multiple trips, attachments, authenticated users, or collaboration. Use IndexedDB for larger offline data; for accounts, keep the UI/domain boundary and introduce a remote repository/query mutation flow with authorisation, server validation, and conflict semantics. Do not merely move a localStorage call into a fetch.

## 6. Test behaviour at boundaries and through the production app

**Context:** Upstream failures, stale URLs, date errors, and storage failures are more likely to break the product than static markup differences.

**Decision:** Vitest tests adapters, URL filtering, persistence, date calculations, and favourite interactions. Testing Library drives labelled form interaction. Playwright runs critical journeys against the built Vite app in desktop/mobile Chromium, intercepts public API requests with test-only fixtures, and runs axe WCAG checks on discovery and planning. Live upstream checks are separate from the deterministic suite. A single validation script and Linux CI workflow compose checks.

**Why:** Deterministic fixtures make failure and recovery reproducible without tying CI to today's weather or mirror uptime. Domain tests catch malformed external and stored data. Production-build browser tests exercise routing, chunk loading, persistence, and accessible controls together.

**Alternatives:** Snapshots, coverage targets, live-only E2E, or unit tests alone. None offers sufficient confidence in these boundary behaviours.

**Trade-offs:** Chromium viewport coverage is not real-device or multi-engine coverage. Automated axe checks do not prove full accessibility.

**When I would reconsider it:** Broader browser/device audience, multilingual layouts, richer keyboard patterns, or commercial service requirements. Add WebKit/Firefox, manual screen-reader review, contract monitoring, and service-level checks according to risk.

## 7. Keep performance work proportionate

**Context:** The country catalogue is small, the old repository carried several megabytes of unused tutorial assets, and the new product is primarily forms and metadata.

**Decision:** Remove unused marketing assets/dependencies, convert the retained 1.1 MB PNG to a 158 KB JPEG, use system fonts, lazy route modules, lazy flag thumbnails, twelve-card pagination, and simple CSS. Keep date calculations and filtering straightforward without indiscriminate memoisation.

**Why:** Reducing bytes and rendered nodes gives concrete benefits before adding clever abstractions. No third-party font request blocks the page. The application ships no fabricated reviews or download claims. Curated destination photo sources are documented in decision 8.

**Alternatives:** A design-system dependency, remote photo catalogue, manual vendor splitting, pervasive memoisation, or full list virtualisation.

**Trade-offs:** SPA runtime libraries contribute an approximately 109 KB gzip entry bundle plus route chunks. Native image loading lacks automatic format negotiation. The original flag/CSS cards have since been replaced by the place photography strategy in decision 8, including responsive image variants; country reference guides retain small flags.

**When I would reconsider it:** Measured interaction bottlenecks, slower-network requirements, a large catalogue, or a curated licensed photo library. Consider additional image formats, carefully selected prefetching, server pagination, and targeted memoisation based on profiling.

## 8. Lead discovery with places, keep countries as reference

**Context:** Flag heroes and oversized ISO codes made discovery resemble a directory. REST Countries provides geographic reference records, not a curated travel recommendation catalogue.

**Decision:** Add a separate editorial `Destination` model and six named places joined to countries by `countryCode`. Lead the page with photograph-led place cards, URL-backed place/country search, region controls, and an expandable, compact country reference catalogue. Add `/places/:destinationSlug` guides while preserving existing country routes, saved favourites, and trip storage. Use locally served, licensed Pexels photography and an intentional CSS landscape fallback.

**Why:** Place names and photographs make exploration concrete without pretending every country record is a destination recommendation. Country metadata still supports planning. Local media avoids API credentials, runtime availability/quotas, and an unnecessary backend. Image rights, credits, sizing, and the curation process are documented in [photography](photography.md).

**Alternatives:** Live stock-photo search, country flags as hero fallback, randomly assigned landscape URLs, or replacing saved country identifiers with place slugs. These introduce rights/availability ambiguity, the wrong visual hierarchy, or incompatible persistence changes.

**Trade-offs:** The editorial catalogue is deliberately small and manually maintained. Country sorting applies to reference guides, not editorial order. Existing hearts and trips remain country-based; labels and place guides explicitly explain that scope. Curated places and local images remain discoverable during a country API outage, but detailed country metadata still requires the existing service. Card weather is omitted to avoid a request per card or presenting country-coordinate weather as local. Place guides request weather at approximate place coordinates.

**When I would reconsider it:** A larger city catalogue, multiple stops/favourites in the same country, editorial workflows, or richer local recommendations. Introduce versioned place persistence and managed media ingestion when those product requirements justify them; retain old country records with explicit migration semantics.
