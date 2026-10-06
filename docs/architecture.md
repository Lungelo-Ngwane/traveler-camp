# Application architecture

Roamly uses a feature-oriented React architecture. This keeps behaviour close to the feature that owns it while separating application setup, domain types and reusable infrastructure. The size of this app does not justify dependency injection containers, a global store, or layers of forwarding modules.

## Boundaries

- **app** composes the router, shared providers, layout and global styling. Only this layer decides which feature owns a route. The entry point mounts React; it does not define business behaviour.
- **features** own user journeys, feature-specific data adapters, persistence schemas and UI. Countries own reference metadata; destinations own the editorial travel collection. Weather has independent loading and failure handling. Trip and favourites each own a small shared Context and repository.
- **domain** contains plain TypeScript types, without React or browser infrastructure. A country is reference metadata, a destination is a curated place, and a trip stop is a saved planning record.
- **shared** contains domain-independent HTTP, date, persistence and feedback utilities. It cannot import features, app composition or domain types.

ESLint enforces the shared/domain boundaries and prevents features from importing app composition. Feature-to-feature dependencies are explicit: destination cards use favourite actions, country guides use weather and trip actions, and the shortlist reuses discovery presentation. These collaborations do not warrant an event bus or duplicated components. Shared code should not become a catch-all business layer.

## State and data flow

Remote metadata and weather use TanStack Query. Their adapters validate unknown external responses; query keys and cache policies stay with the API owner. Filtering and pagination are pure functions separate from network access. URL parameters remain the source of truth for discovery filters.

Only favourites and saved trips use Context because multiple routes and navigation need those collections. Draft forms and carousel controls use component state. Derived values are computed rather than copied into effects.

Feature repositories validate their own saved schemas and use a generic injected storage port. Existing version-1 storage keys and envelopes are preserved, so this refactor does not reset saved plans. The React repository hook handles storage events and session warnings; presentation never accesses localStorage directly. Date validation is independent of storage.

## Placement and maintenance

Keep tests beside the code they verify. Shared fixtures and browser journeys belong in tests/. Put production images in public/, attribution in docs/photography.md, and engineering decisions in docs/. Build and test output is generated and ignored.

Use descriptive route and provider filenames. Prefer direct imports over barrel files, which can hide dependencies or accidentally pull eager code into lazy routes. Create new subfolders when a feature grows enough to need them, rather than giving every small feature an identical empty scaffold. Keep the cohesive visual system in app/styles.css for now; split feature styles when independent ownership makes that useful.

No dependencies, API endpoints, routing behaviour or rendering strategy changed during this structural refactor. The Next.js-to-Vite trade-off remains documented in engineering-decisions.md.
