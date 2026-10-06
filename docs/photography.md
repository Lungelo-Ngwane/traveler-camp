# Destination photography

Roamly uses a manually curated, locally hosted photo collection. No photography API, browser credential, runtime CDN dependency, random-image endpoint, or backend was introduced. Photographs were selected from verified Pexels photo pages and downloaded under the [Pexels licence](https://www.pexels.com/license/) on 6 October 2026. It permits free personal/commercial use and modification, without required attribution; Roamly still credits each photographer with a link to the photo page. Images are not resold or represented as Roamly's own photography.

| Place     | Photographer              | Source photo                                                                                                      | Local asset prefix |
| --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------ |
| Cape Town | Zak H                     | [Cape Town coastline](https://www.pexels.com/photo/scenic-cape-town-coastline-with-table-mountain-view-33641515/) | `cape-town`        |
| Tokyo     | Sachith Ravishka Kodikara | [Tokyo Tower at twilight](https://www.pexels.com/photo/tokyo-tower-over-buildings-in-city-19035816/)              | `tokyo`            |
| Bali      | Сергей Сергеев            | [Balinese lakeside temple](https://www.pexels.com/photo/enchanting-bali-temple-amidst-lush-greenery-35160281/)    | `bali`             |
| Paris     | Diego F. Parra            | [Paris and the Eiffel Tower](https://www.pexels.com/photo/paris-cityscape-with-eiffel-tower-15452269/)            | `paris`            |
| Lisbon    | Mo Eid                    | [Lisbon skyline](https://www.pexels.com/photo/cityscape-of-lisbon-17887579/)                                      | `lisbon`           |
| Zanzibar  | Taryn Elliott             | [Palm-lined Zanzibar shore](https://www.pexels.com/photo/palm-trees-on-the-beach-shore-5993367/)                  | `zanzibar`         |

Each photo has compressed 480 px and 960 px wide JPEG copies in `public/destinations/`. Browsers select the appropriate variant using `srcset` and `sizes`. The card reserves a 16:10 frame, uses lazy loading and async decoding, and crops with CSS `object-fit: cover`; the Tokyo crop has an explicit focal position. The place detail uses the same assets. Photograph failure or an absent mapping renders a labelled CSS landscape illustration, never a flag hero or a broken image. Country guides use compact text/metadata rows without a photographic hero; a photo of a single place is not misrepresented as a photograph of its entire country.

The `Destination` model is an editorial place record with its own slug, name, locality, approximate coordinates, and optional photograph. `countryCode` joins it to separate REST Countries reference metadata. Six places are featured as a handpicked collection, not a popularity ranking or a list inferred from every country. Names, descriptions, localities, and coordinates are curated application content; coordinates are approximate discovery locations, not addresses or geocoded results. No new remote destination-data API was introduced.

Existing favourites and itineraries remain country-based and keep their storage schema. Place hearts save the associated country, with an explicit accessible name/tooltip; the country catalogue and place guide explain this scope. Place guides show weather near the curated place coordinates, while existing country guides retain country-coordinate weather. Expanding to multiple saved places in one country would require a deliberate persistence migration, rather than silently reinterpreting old saved country codes.

## Why not a photography API?

The [Pexels API](https://www.pexels.com/api/documentation/) requires authorization. The [Unsplash API](https://unsplash.com/documentation) adds access keys, API hotlinking/download tracking rules, and API-specific attribution requirements. Those workflows offer little value for a fixed, six-place editorial collection. Local assets have predictable availability and no runtime quota; the cost is manual curation and a larger static deployment. A growing catalogue could adopt a managed/licensed media library with secure ingestion and explicit rights metadata later.
