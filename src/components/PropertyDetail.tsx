import type { Property } from "../contract/validator";
import { amenityLabel, formatNumber, formatPrice, fullAddress, propertyTypeLabel, statusLabel } from "../lib/format";
import { SponsorPicker } from "./SponsorPicker";
import { VoiceResponse } from "./VoiceResponse";

export function PropertyDetail({ property: p }: { property: Property }) {
  return (
    <article className="detail">
      <p className="muted">{statusLabel(p.listing_status)} · {propertyTypeLabel(p.property_type)}{p.year_built ? ` · Built ${p.year_built}` : ""}</p>
      <h2>{fullAddress(p)}</h2>
      <p className="price price-lg">{formatPrice(p.price)}</p>
      <dl className="specs">
        <div><dt>Bedrooms</dt><dd>{p.bedrooms === 0 ? "Studio" : p.bedrooms}</dd></div>
        <div><dt>Bathrooms</dt><dd>{p.bathrooms}</dd></div>
        <div><dt>Interior</dt><dd>{formatNumber(p.square_feet)} sq ft</dd></div>
        <div><dt>$ / sq ft</dt><dd>{formatNumber(Math.round(p.price / p.square_feet))}</dd></div>
      </dl>
      {p.description && <p>{p.description}</p>}
      <h3>Amenities</h3>
      {p.amenities.length ? <ul className="chips">{p.amenities.map((a) => <li key={a}>{amenityLabel(a)}</li>)}</ul> : <p className="muted">None listed.</p>}
      <SponsorPicker key={p.property_id} property={p} />
      <VoiceResponse property={p} />
    </article>
  );
}
