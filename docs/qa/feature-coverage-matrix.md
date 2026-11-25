# Feature Coverage Matrix

Rows are business modules/doctypes actually exercised by the automated suite. "✅" means asserted automatically; "—" means not covered (either out of scope, or covered manually/exploratorily only — noted).

| Business module | UI automation | API automation | Notes |
|---|:---:|:---:|---|
| Authentication / Login | ✅ | — (session-login used as the auth *mechanism* for all API tests, not tested as a feature itself beyond [DEFECT-free] success/failure UI cases) | `login.spec.ts` |
| Customer | ✅ | ✅ | CRUD, validation, duplicate-name behavior (UI), list filter/pagination (API) |
| Item | ✅ | ✅ | CRUD, validation, duplicate item_code rejection |
| Quotation | ✅ | ✅ | Create + submit (UI), create + filtered list (API); "no line items" validation (UI) |
| Sales Order | ✅ | ✅ | Create-from-Quotation, submit, cancel (UI); create + negative cases (API) |
| Sales Invoice | ✅ | ✅ | Create-from-Sales-Order, submit (UI); create + negative case (API) |
| Employee | ✅ | ✅ | Create + list (UI); CRUD + negative case (API) |
| Leave Application | — | — | Requires the separate HRMS app (incompatible with this stack's ERPNext v16 — see README Known Limitations) |
| Attendance | — | — | Same as above |
| Contact | — | ✅ | API only; no dedicated UI flow in this suite |
| Address | — | ✅ | API only; no dedicated UI flow in this suite |
| Global Search | ✅ | — | Also surfaced a real environment defect — see [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md) |
| Generic list-query (filters/pagination/sort) | — | ✅ | Demonstrated against Customer as a representative doctype |
| Procurement (Purchase Order/Invoice, Supplier) | — | — | Out of scope for this portfolio (see README) |
| Manufacturing / Projects / Assets / Quality | — | — | Out of scope |

## Coverage by test type

| Type | Count |
|---|---|
| UI (Playwright + Page Object Model) | 10 |
| API (Playwright `APIRequestContext`) | 25 |
| **Total** | **35** |

See [Test Case Matrix](test-case-matrix.md) for the full per-test breakdown and [Test Execution Summary](test-execution-summary.md) for the latest real run's results.
