# DEFECT-001 — Scheduler container crash-loops after a failed `bench get-app`, breaking background indexing

**Status**: Real defect found and fixed during this project (not illustrative). Root-caused, fixed, and verified in the same session.

| Field | Value |
|---|---|
| **Environment** | `frappe_docker` `pwd.yml`, ERPNext v16.60.0, Frappe v16.60.2, Windows 11 + Docker Desktop (WSL2) |
| **Severity** | High — silently breaks all scheduled/background jobs (global search indexing, email queue flush, etc.) with no user-facing error |
| **Priority** | P2 (environment-specific; does not affect a clean install) |
| **Reproduction rate** | 100% (every `scheduler` container restart, until fixed) |

## Summary

Attempting to install the separate **HRMS** app (`bench get-app hrms && bench --site frontend install-app hrms`) on this stack failed partway through, because the current HRMS release requires Frappe/ERPNext **v17+** and this stack runs **v16.60.0**:

```
Installed frappe-dependency 'frappe' version '16.60.2' does not satisfy required version '>=17.0.0-dev,<18.0.0'.
...
ModuleNotFoundError: No module named 'erpnext.accounts.doctype.sales_invoice.services'
```

`install-app` correctly refused to register `hrms` as an installed app on the site (`sites/apps.txt` stayed `frappe`/`erpnext` only) — but `bench get-app` had already cloned the app's source into `apps/hrms` on the bench. The `scheduler` container's startup routine (`bench`'s `get_app_commands`, which enumerates **every app present in the bench**, not just the ones installed on a site, to load their CLI command modules) then crashed on every restart:

```
File ".../bench_helper.py", line 138, in get_app_commands
    app_command_module = importlib.import_module(f"{app}.commands")
ModuleNotFoundError: No module named 'hrms'
```

## Impact

- The `scheduler` container is what periodically runs Frappe's background/cron jobs, including the job that flushes new/changed documents into the `__global_search` index table.
- With the scheduler broken, **global search never found newly created records** — confirmed by direct SQL (`SELECT * FROM __global_search`) showing only documents indexed from before the HRMS attempt, and by the REST API (`frappe.utils.global_search.search`) returning zero results for records that definitely existed.
- No error was visible anywhere in the application UI — this is a **silent** failure, which is exactly why it's worth documenting: a tester relying only on the desk UI would see "no results found" and might assume global search itself was the broken feature, when the real cause was an orphaned app file from an unrelated, already-abandoned operation.

## Steps to reproduce

1. `bench get-app hrms` (succeeds — only clones the repo).
2. `bench --site <site> install-app hrms` (fails with a dependency/import error, as above).
3. Restart (or newly start) any container that runs the Frappe scheduler.
4. Observe `ModuleNotFoundError: No module named 'hrms'` in its logs.
5. Create any document (e.g. a new `Customer`) and search for it via global search — not found, even after several minutes.

## Expected result

A `bench get-app` that is never followed by a successful `install-app` should not affect any other site's background processing.

## Actual result

The scheduler container fails its startup command-discovery step for **every** bench command (not just scheduler-specific ones), because it unconditionally imports a `.commands` module for every app directory present under `apps/`, regardless of per-site installation state.

## Fix applied

```sh
bench remove-app hrms          # moves apps/hrms to archived/, cleans apps.txt
docker compose restart scheduler
```

After the fix, a freshly created `Customer` was confirmed indexed and searchable within ~60 seconds (verified by polling `__global_search` directly), matching normal scheduler cadence.

## Evidence

- `sites/apps.txt` before fix: `frappe\nerpnext\nhrms`; after fix: `frappe\nerpnext`.
- `SELECT COUNT(*) FROM __global_search WHERE name = '<test customer>'` — `0` at +20s/+40s, `1` at +60s, measured after the fix.
- `tests/ui/specs/global-search.spec.ts` encodes the ~60s real-world indexing latency as a documented retry loop rather than a fixed wait (see comment in that file).

## Related test

`tests/ui/specs/global-search.spec.ts` — initially failed intermittently while this defect was present; the test itself was also hardened in parallel (see [Exploratory Testing Report](../qa/exploratory-testing-report.md), finding EXP-01) to assert on the real search API response rather than an echoed input value, so it would have correctly caught this defect once the assertion was watertight. The final test design also accounts for the separate, legitimate 15-minute indexing cadence (EXP-09) by querying an already-indexed record instead of one it just created.
