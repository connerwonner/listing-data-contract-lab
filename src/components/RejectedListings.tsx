import type { RejectedRecord } from "../contract/validator";

/** Invalid records never reach a card. This panel says what was dropped and why. */
export function RejectedListings({ rejected }: { rejected: RejectedRecord[] }) {
  if (rejected.length === 0) return null;
  return (
    <section className="rejected" role="alert">
      <h3>{rejected.length} {rejected.length === 1 ? "listing was" : "listings were"} hidden</h3>
      <p className="muted">These records broke the data contract, so they were not shown. Fix the source data and reload.</p>
      <ul>
        {rejected.map((r) => (
          <li key={r.index}>
            <strong>{r.id ?? `Record #${r.index + 1}`}</strong>
            <ul>{r.issues.map((i, k) => <li key={k}><code>{i.path}</code> {i.message} <span className="muted">({i.keyword})</span></li>)}</ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
