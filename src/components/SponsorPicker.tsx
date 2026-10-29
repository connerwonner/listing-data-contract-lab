import { useState } from "react";
import type { Property } from "../contract/validator";
import { categoryLabel } from "../lib/format";

export function SponsorPicker({ property }: { property: Property }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const sponsors = [...property.local_sponsors].sort((a, b) => a.placement_rank - b.placement_rank);

  if (sponsors.length === 0) return <p className="muted">No local partners are listed for this home yet.</p>;
  const picked = sponsors.find((s) => s.sponsor_id === chosen);

  return (
    <fieldset className="sponsors">
      <legend>Local partners for {property.zip_code}</legend>
      {sponsors.map((s) => (
        <label key={s.sponsor_id} className="sponsor">
          <input type="radio" name={`sponsor-${property.property_id}`} checked={chosen === s.sponsor_id} onChange={() => setChosen(s.sponsor_id)} />
          <span><strong>{s.name}</strong><span className="muted"> {categoryLabel(s.category)}</span></span>
        </label>
      ))}
      <p role="status" className="muted">{picked ? `Intro request ready for ${picked.name}.` : "Choose a partner to request an intro."}</p>
    </fieldset>
  );
}
