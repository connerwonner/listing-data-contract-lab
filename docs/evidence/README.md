# Evidence checklist

| Evidence | Where | Status |
|---|---|---|
| JSON Schemas | `schemas/` | ✅ In repo |
| Validator | `src/contract/validator.ts`, `scripts/validate.ts` | ✅ In repo |
| Seed JSON | `data/seed/` | ✅ In repo (synthetic) |
| Tests (1 valid + 9 invalid fixtures) | `tests/` | ✅ 26 tests passing |
| Schema decision record | `docs/adr/001-data-contract.md` | ✅ In repo |
| Sample validator output | `docs/validation/*.txt` | ✅ Real output of the commands shown |
| AI collaboration log | `docs/ai-collaboration-log.md` | ⚠️ Simulated, replace with your real transcripts |
| Raw AI Studio responses | `data/generated/` | ⚠️ Simulated, replace with your real exports |
| **AI Studio prompt/export screenshot** | `docs/evidence/ai-studio-export.png` | ❌ **You need to take this** (needs your AI Studio session) |
| UI screenshot for the README | `docs/evidence/ui.png` | ❌ Take after `npm run dev` |

## Taking the screenshots

1. Run the prompt from `docs/ai-studio-prompt.md` in AI Studio with the schema attached.
2. Crop out your account name, email, avatar, and any API key. Use only the fictional source notes.
3. Save as `docs/evidence/ai-studio-export.png`, commit.
4. Run `npm run dev`, choose **AI Studio run 001 (has errors)** in the data source menu so the screenshot shows both valid cards and the "hidden listings" panel. Save as `docs/evidence/ui.png`.
5. Add `![UI](docs/evidence/ui.png)` under the title of `README.md`.

_Reviewed and submitted by connerwonner on 2026-10-29._
