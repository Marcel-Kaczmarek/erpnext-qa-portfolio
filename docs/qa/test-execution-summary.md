# Test Execution Summary

**This is a real, latest execution record — regenerate this file (and the numbers in the README) whenever the suite changes, rather than editing the numbers by hand.**

| | |
|---|---|
| **Date** | 2026-11-25 |
| **Environment** | ERPNext v16.60.0 / Frappe v16.60.2, local `frappe_docker` `pwd.yml` (Windows 11, Docker Desktop/WSL2) |
| **Command** | `npx playwright test` |
| **Total tests** | 35 |
| **Passed** | 35 |
| **Failed** | 0 |
| **Skipped** | 0 |
| **Flaky** | 0 (see note below on one test that *was* flaky during development) |
| **Total duration** | 2.4 minutes |

## Breakdown by project

| Project | Tests | Role |
|---|---|---|
| `setup` | 1 | Authenticates once, saves storage state (precondition, not a functional test) |
| `unauthenticated` | 2 | `login.spec.ts` only — deliberately runs without the shared storage state |
| `chromium` | 32 | All other UI + API specs, reusing the authenticated session |

## Breakdown by suite

| Suite | Tests | Slowest test |
|---|---|---|
| UI (`tests/ui/specs`) | 10 | `sales-flow.spec.ts` — "quotation converts through to a sales invoice with matching totals" (28.9s — the only true multi-document end-to-end test) |
| API (`tests/api/specs`) | 25 | `employee.api.spec.ts` CRUD (4.1s) |

## Notes on reliability

`global-search.spec.ts` was flaky/failing during development — not because of randomness, but because of two real, now-understood causes documented in [Exploratory Testing Report](exploratory-testing-report.md) (EXP-01, EXP-09) and [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md): a crash-looping scheduler container, and a 15-minute search-indexing cron. The final design (query an already-indexed record, assert on the network response) has since passed consistently across multiple consecutive runs.

## How to reproduce this run

```sh
git clone https://github.com/frappe/frappe_docker
cd frappe_docker && docker compose -f pwd.yml up -d
# wait for create-site to finish, then:
cd ../erpnext-qa-portfolio
npm install && npx playwright install chromium
npx playwright test
npx playwright show-report
```
