# Test Plan

## 1. Objective

Verify, through automated UI and API tests, that ERPNext's core Order-to-Cash flow and its supporting master data (Customer, Item, Contact, Address, Employee) behave correctly end-to-end on a local `frappe_docker` instance, and that the suite itself is reliable enough to run unattended in CI.

## 2. Scope

### In scope
- Authentication (valid/invalid login, session reuse across tests, one-time Setup Wizard handling for a fresh site).
- Customer: create (UI + API), list, validation (missing name), duplicate-name behavior, API CRUD.
- Item: create (UI + API), list, validation (missing item code), duplicate item_code rejection, API CRUD.
- Quotation: create with a line item, submit, validation (no items rejected), API create + filtered list query.
- Sales Order: create from Quotation, submit, cancel, API create + negative cases (no items, non-existent customer).
- Sales Invoice: create from Sales Order, submit, API create + negative case (no customer).
- Employee: create (UI + API), list, API negative case (missing date of birth).
- Contact / Address: API CRUD only (not part of the UI flows exercised).
- Global search: finds a just-created record (see [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md) for a real environment issue this surfaced).
- Generic REST list-query behavior (`like` filter, `limit_page_length`, `order_by`) against Customer as a representative doctype.

### Out of scope
- Procurement / Procure-to-Pay (Purchase Order, Purchase Invoice, Supplier).
- Manufacturing, Projects, Assets, Quality modules.
- HR/Payroll beyond core `Employee` (Leave Application, Attendance — see [Known Limitations](../../README.md#known-limitations)).
- Performance/load testing, accessibility testing, visual regression testing, cross-browser testing (Chromium only — see Future Improvements).
- Role-based permission testing beyond the Administrator role (see Risk Assessment, RISK-04).

## 3. Test items

The 35 automated specs under `tests/ui/specs/*.spec.ts` and `tests/api/specs/*.spec.ts` (see [Test Case Matrix](test-case-matrix.md) for the full list) plus the `tests/ui/auth.setup.ts` precondition.

## 4. Approach

Each test is independent (unique generated data via `fixtures/testData.ts`), so the suite can run in any order on a shared instance without manual cleanup. UI tests share one authenticated browser context (Playwright project dependency: `setup` → `chromium`); the `login.spec.ts` suite deliberately runs unauthenticated, since it tests the login flow itself.

## 5. Environment requirements

- ERPNext v16.60.0 via `frappe_docker`'s `pwd.yml`, reachable at `http://localhost:8080`.
- Node.js 20+, Playwright with Chromium installed (`npx playwright install chromium`).
- No pre-existing data required — a brand-new site is handled automatically (Setup Wizard).

## 6. Schedule

Run on every push/PR via GitHub Actions (self-contained — provisions its own ERPNext instance per run) and on demand locally during development.

## 7. Deliverables

- Playwright HTML report (`playwright-report/`, published as a CI artifact).
- This QA documentation set.
- Any defect reports raised during execution (`docs/bug-reports/`).

## 8. Exit criteria

All 35 tests passing; no unexplained skips; the [Test Execution Summary](test-execution-summary.md) reflects the latest real run.
