import { useMemo, useState } from "react";
import { parseListings } from "./contract/validator";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyDetail } from "./components/PropertyDetail";
import { RejectedListings } from "./components/RejectedListings";
import seed from "../data/seed/properties.json";
import run1 from "../data/generated/ai-studio-run-001.raw.json";
import run2 from "../data/generated/ai-studio-run-002.raw.json";

const SOURCES = {
  seed: { label: "Seed data", data: seed as unknown },
  run2: { label: "AI Studio run 002 (fixed)", data: run2 as unknown },
  run1: { label: "AI Studio run 001 (has errors)", data: run1 as unknown },
} as const;
type SourceKey = keyof typeof SOURCES;

export default function App() {
  const [source, setSource] = useState<SourceKey>("seed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The UI only ever sees `valid`. Everything else is reported, not rendered.
  const { valid, rejected } = useMemo(() => parseListings(SOURCES[source].data), [source]);
  const selected = valid.find((p) => p.property_id === selectedId) ?? valid[0] ?? null;

  return (
    <div className="shell">
      <header className="top">
        <div>
          <h1>Listings, validated</h1>
          <p className="muted">Every record below passed the JSON Schema contract. All data is synthetic.</p>
        </div>
        <label className="source">
          <span>Data source</span>
          <select value={source} onChange={(e) => { setSource(e.target.value as SourceKey); setSelectedId(null); }}>
            {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
      </header>
      <RejectedListings rejected={rejected} />
      {valid.length === 0 ? (
        <p className="empty">No valid listings to show. Pick another data source.</p>
      ) : (
        <main className="layout">
          <nav className="list" aria-label="Listings">
            {valid.map((p) => <PropertyCard key={p.property_id} property={p} selected={selected?.property_id === p.property_id} onSelect={setSelectedId} />)}
          </nav>
          {selected && <PropertyDetail property={selected} />}
        </main>
      )}
    </div>
  );
}
