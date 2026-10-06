# Roamly implementation plan

Repository inspection: the original Next.js 14.1 application consisted of a static landing page, seven presentation components, Tailwind utilities, and tutorial marketing assets. No remote data, application state, tests, or interactive routes existed. Historical commits `6aeb2ef` and `733c1a8` are retained.

1. Replace Next.js with React, Vite, strict TypeScript, React Router, and lint/test tooling. Preserve the original landscape hero asset and green visual direction.
2. Establish validated country/weather adapters and TanStack Query caching. Add discovery with URL search, region, sorting, pagination, and a favourites route.
3. Add destination details and independently recoverable weather. Implement trip/favourites state with a small versioned browser repository and focused providers.
4. Verify mappings, persistence, dates, filters, and browser journeys. Document real trade-offs, API limitations, static hosting, and validation results.

The explicit migration request supersedes the attached brief's Next.js implementation requirements. New features are introduced through new commits; no historical changes or pushes.
