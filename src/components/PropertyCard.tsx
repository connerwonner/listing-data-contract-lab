import type { Property } from "../contract/validator";
import { formatNumber, formatPrice, propertyTypeLabel, statusLabel } from "../lib/format";

interface Props { property: Property; selected: boolean; onSelect: (id: string) => void }

export function PropertyCard({ property: p, selected, onSelect }: Props) {
  return (
    <button type="button" className={`card${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={() => onSelect(p.property_id)}>
      <span className={`status status-${p.listing_status}`}>{statusLabel(p.listing_status)}</span>
      <span className="price">{formatPrice(p.price)}</span>
      <span className="facts">
        {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bd`} · {p.bathrooms} ba · {formatNumber(p.square_feet)} sq ft
      </span>
      <span className="addr">{p.street_address}{p.unit ? `, ${p.unit}` : ""}</span>
      <span className="muted">{p.city}, {p.state} {p.zip_code} · {propertyTypeLabel(p.property_type)}</span>
    </button>
  );
}
