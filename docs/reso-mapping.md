# Extension: RESO concept mapping

> **This is a conceptual mapping for learning purposes. This project is not RESO certified and makes no compliance claim.** Verify every field name and lookup value against the current [RESO Data Dictionary](https://www.reso.org/data-dictionary/) before relying on it.

| This contract | Closest RESO Data Dictionary concept | Notes |
|---|---|---|
| `property_id` | `ListingKey` / `ListingId` | `ListingKey` is the system key, `ListingId` the public MLS number. Our ID is a lab-only key |
| `street_address` + `unit` | `StreetNumber`, `StreetName`, `UnitNumber` (or `UnparsedAddress`) | We keep the street unparsed to stay simple |
| `city` | `City` | |
| `state` | `StateOrProvince` | |
| `zip_code` | `PostalCode` | RESO also has `PostalCodePlus4` |
| `price` | `ListPrice` | |
| `bedrooms` | `BedroomsTotal` | |
| `bathrooms` (e.g. 2.5) | `BathroomsFull` (2) + `BathroomsHalf` (1), `BathroomsTotalInteger` | Split on mapping |
| `square_feet` | `LivingArea` (with `LivingAreaUnits`) | |
| `year_built` | `YearBuilt` | |
| `property_type` | `PropertyType` + `PropertySubType` | e.g. `single_family` → Residential / Single Family Residence; `condo` → Condominium; `townhouse` → Townhouse; `multi_family` → Residential Income |
| `listing_status` | `StandardStatus` | `coming_soon` → Coming Soon, `pending` → Pending, `sold` → Closed, `active` → Active |
| `description` | `PublicRemarks` | |
| `amenities[]` | `InteriorFeatures`, `ExteriorFeatures`, `PoolFeatures`, `ParkingFeatures`, `CommunityFeatures` | One enum here, many RESO fields. Mapping needs a per-value target field |
| Sponsor, PropertySponsor | *(no RESO equivalent)* | Product-specific concepts, not listing data |

Not modeled here: agent and office (`ListAgentKey`, `ListOfficeKey`), media, open houses, lot size, taxes, HOA.
