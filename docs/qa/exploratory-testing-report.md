# Exploratory Testing Report

Session-style notes from building this suite against a real, previously-unexplored (to this project) ERPNext instance. Unlike the scripted test cases, these are the findings that came from *investigating* unexpected behavior rather than confirming expected behavior — which is the actual point of exploratory testing.

## Session charter

**Mission**: Get a Playwright suite working against this ERPNext instance's desk UI and REST API, and note anything along the way that looks like a real defect, a misleading test, or a non-obvious application behavior worth documenting.

**Duration**: Across the full build-out of this project.

**Environment**: ERPNext v16.60.0 / Frappe v16.60.2, `frappe_docker` `pwd.yml`, Windows 11 + Docker Desktop (WSL2).

## Findings

### EXP-01 — A passing test wasn't actually testing the feature (Medium)

The original global-search test typed a unique customer name into the Ctrl+K quick-palette and asserted that text was visible on the page. It passed — but the quick palette *always* echoes the typed query back in a literal "Search for `<query>`" suggestion row, regardless of whether any real document matches it. The assertion would have passed for a string that matched nothing at all.

**Why this matters**: a test that can't fail for the right reason provides false confidence. Investigating it properly (clicking through to the real Global Search results rather than trusting the echoed text) immediately surfaced [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md), a genuine environment defect the weak version of the test had been silently passing over.

Getting a *reliably passing* replacement took three iterations, each correcting a different wrong assumption:

1. Assert on a DOM text match in the results view — broke the first time the matched element was off-screen inside a virtualized/hidden list row (22 matching-but-hidden elements, same bolded text, in one run).
2. Assert on a freshly-created record being searchable within a generous retry window — ran into EXP-09 (15-minute indexing cadence) and failed non-deterministically depending on exactly when in that cycle the test happened to run.
3. **Final design**: query an already-existing Customer via the REST API (decoupling the test from indexing latency entirely), then assert on the actual `frappe.utils.global_search.search` **network response** (`page.waitForResponse`) rather than on any rendered DOM text. This is both faster (~3s vs. tens of seconds of retrying) and immune to UI rendering fragility.

### EXP-02 — Background scheduler crash-looping, breaking global search (High — filed as DEFECT-001)

See [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md) for full detail. Found *because* EXP-01 was investigated properly instead of trusting the original weak assertion.

### EXP-09 — Global search indexing is flushed by a 15-minute cron, not on save (Medium — shaped the final test design)

`frappe.utils.global_search.update_global_search()` runs synchronously on every document save, but it only pushes into a Redis list (`global_search_queue`) — the actual `__global_search` SQL table (what the search API reads) is only updated by `frappe.utils.global_search.sync_global_search()`, scheduled every 15 minutes (`frappe/hooks.py`, `scheduler_events["cron"]["0/15 * * * *"]`). There is no `@frappe.whitelist()`-exposed method to force an earlier flush — `rebuild_for_doctype()` exists but is server-console-only (confirmed via `bench execute`, which worked, versus the REST API, which correctly returned 403 "not whitelisted").

**Consequence for testing**: a record created by a test is not reliably searchable for up to 15 minutes — a fundamentally different problem from a few seconds of eventual-consistency lag, and not something a retry loop can practically wait out in an automated suite. The test was redesigned around this constraint (see EXP-01, iteration 3) rather than fighting it with longer timeouts.

### EXP-03 — Manually entered rate reset to zero across document conversion (Medium — filed as DEFECT-002)

See [DEFECT-002](../bug-reports/DEFECT-002-rate-reset-on-document-conversion.md).

### EXP-04 — This ERPNext version's desk UI differs substantially from older/documented conventions (informational, but shaped the whole Page Object Model)

Several things that are commonly assumed about the Frappe desk UI turned out not to hold on this version:

| Assumption | Actual behavior found |
|---|---|
| Desk lives at `/app/...` | Lives at `/desk/...` |
| Save/submit confirmation is a status-pill badge (`.indicator-pill`) | A bottom-right toast (`.es-toast__message`) |
| Submitted-document status text is literally "Submitted" | Varies by doctype ("Open" for Quotation, etc.) — the reliable signal is the toolbar swapping its "Submit" action for "Cancel" |
| Link-field autocomplete uses `.awesomplete li` | Uses `[role="option"]` (ARIA), and genuinely requires real keystroke events (`pressSequentially`) — `.fill()` sets the value without triggering the live-search listener |
| Dropdown menus ("Create ▾") are Bootstrap `.dropdown-menu` | ARIA `role="menu"` / `role="menuitem"` |
| Grid/child-table cells nest an `<input>` inside the same element that carries `data-fieldname` | The display div and the editable `<input>` are siblings sharing the same `data-fieldname`, not parent/child |
| A plain `.click()` reliably activates a grid cell for editing | True, but CSS `:last-child` is **not** "last among all matches of a selector" — it's "last child of its own immediate parent" — so `.grid-row:last-child` matched a hidden template row's inner cell, not the real data row |

### EXP-05 — Gender is a Link field, not a Select (Low)

Assumed (reasonably, for a small fixed set of options) that Employee's `gender` field would be a native `<select>`. It's a Link to a `Gender` doctype instead — same interaction pattern as a Customer/Item lookup, not a dropdown.

### EXP-06 — API date format differs from UI display format (Medium — real risk of silent data corruption if missed)

The REST API expects ISO dates (`YYYY-MM-DD`); the desk UI displays and expects `DD-MM-YYYY` for this site's locale. A fixture generating one format and reused blindly against the other surface produces either a `MySQLdb.OperationalError: Incorrect date value` (API) or a wrong, silently-accepted date later in the business flow (UI) — worth calling out because it's exactly the kind of mismatch that wouldn't be caught by a test that only exercises one layer.

### EXP-07 — Quantity landed as 1 instead of the intended 5 in a generated screenshot (Low, cosmetic)

While generating documentation screenshots (not an assertion-bearing test), typing a Quantity into a Quotation's item grid immediately after selecting the Customer occasionally produced `1` instead of the typed `5` — plausibly because selecting a Customer triggers an async price-list/currency re-render that can race with an immediately-following grid edit. Not pursued further since it didn't affect any automated assertion (the real tests fill quantity using a stable, already-settled row state), but noted here as a timing characteristic worth being aware of if a future test types directly into a grid cell milliseconds after a customer-change.

### EXP-08 — Duplicate Customer names are auto-suffixed, not rejected (Low — corrected a wrong test assumption)

Assumed (based on Item's strict unique `item_code`) that a duplicate Customer name would also be rejected. It isn't — ERPNext silently creates `<name> - 1`. The original negative test was rewritten to assert the real (auto-suffix) behavior instead of forcing an incorrect expectation (`validation.spec.ts`, "auto-suffixes a second customer...").

## Takeaway

Every "high-value" finding in this list came from treating an unexpected result as something to investigate rather than something to work around with a longer timeout or a looser selector. The one exception — EXP-07 — was *not* investigated further specifically because it didn't threaten any real assertion; knowing which anomalies are worth chasing is as much a part of this as chasing them.
