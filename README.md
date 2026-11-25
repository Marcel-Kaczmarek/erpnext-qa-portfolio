<div align="center">

# ERPNext QA Automation Portfolio

**Playwright + TypeScript UI and API test automation for ERPNext's Order-to-Cash workflow**

[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![ERPNext](https://img.shields.io/badge/ERPNext-v16.60.0-0089D6)](https://github.com/frappe/erpnext)
[![CI](https://github.com/Marcel-Kaczmarek/erpnext-qa-portfolio/actions/workflows/tests.yml/badge.svg)](https://github.com/Marcel-Kaczmarek/erpnext-qa-portfolio/actions/workflows/tests.yml)
![Tests](https://img.shields.io/badge/tests-35%2F35%20passing-brightgreen)

</div>

---

## Test execution statistics

| Metric | Value |
|---|---|
| **Total tests** | 35 |
| **Passed** | 35 |
| **Failed** | 0 |
| **Skipped** | 0 |
| **Duration** | ~2.4 minutes |
| **UI tests** (Page Object Model) | 10 |
| **API tests** (`APIRequestContext`) | 25 |

Full breakdown: [Test Execution Summary](docs/qa/test-execution-summary.md) · [Test Case Matrix](docs/qa/test-case-matrix.md)

![All 35 tests passing](docs/screenshots/automation/html-report-overview.png)

---

## Application screenshots

Real screenshots of the local ERPNext instance under test (not stock images), 1440×900, populated with realistic synthetic data via [`scripts/capture-screenshots.js`](scripts/capture-screenshots.js).

<table>
<tr>
<td width="50%"><img src="docs/screenshots/application/01-dashboard.png" width="100%"/><br/><sub><b>Dashboard</b> — ERPNext home workspace</sub></td>
<td width="50%"><img src="docs/screenshots/application/02-sales-workspace.png" width="100%"/><br/><sub><b>Sales workspace</b> — Selling module</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/03-customer-creation.png" width="100%"/><br/><sub><b>Customer creation</b> — new Customer form</sub></td>
<td width="50%"><img src="docs/screenshots/application/04-customer-list.png" width="100%"/><br/><sub><b>Customer list view</b></sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/05-item-creation.png" width="100%"/><br/><sub><b>Item creation</b> — new Item form</sub></td>
<td width="50%"><img src="docs/screenshots/application/06-item-list.png" width="100%"/><br/><sub><b>Item list view</b></sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/07-quotation-creation.png" width="100%"/><br/><sub><b>Quotation creation</b> — line item + customer</sub></td>
<td width="50%"><img src="docs/screenshots/application/08-quotation-submitted.png" width="100%"/><br/><sub><b>Quotation submitted</b></sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/09-sales-order-creation.png" width="100%"/><br/><sub><b>Sales Order</b> — mapped from Quotation</sub></td>
<td width="50%"><img src="docs/screenshots/application/10-sales-order-submitted.png" width="100%"/><br/><sub><b>Sales Order submitted</b></sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/11-sales-invoice-creation.png" width="100%"/><br/><sub><b>Sales Invoice</b> — mapped from Sales Order</sub></td>
<td width="50%"><img src="docs/screenshots/application/12-sales-invoice-submitted.png" width="100%"/><br/><sub><b>Sales Invoice submitted</b> — matching grand total</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/13-employee-creation.png" width="100%"/><br/><sub><b>Employee creation</b></sub></td>
<td width="50%"><img src="docs/screenshots/application/14-employee-list.png" width="100%"/><br/><sub><b>Employee list view</b></sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/application/15-global-search.png" width="100%"/><br/><sub><b>Global search</b> — finds an indexed Customer</sub></td>
<td width="50%"><img src="docs/screenshots/application/16-form-validation-error.png" width="100%"/><br/><sub><b>Form validation</b> — "Missing Fields" dialog</sub></td>
</tr>
</table>

---

## Business domain and project objectives

[ERPNext](https://github.com/frappe/erpnext) is an open-source ERP built on the [Frappe](https://github.com/frappe/frappe) framework. This project automates ERPNext's **Order-to-Cash** flow — the path from a prospective sale to recognized revenue — plus the master data it depends on.

**Scope note, stated plainly**: this project covers **Sales / Order-to-Cash** (Customer → Item → Quotation → Sales Order → Sales Invoice), not **Procurement / Procure-to-Pay** (Purchase Order → Purchase Receipt → Purchase Invoice, Supplier management). Order-to-Cash was chosen because it is ERPNext's most universally recognizable business flow and exercises the richest set of UI patterns (multi-step document conversion, child tables, submit/cancel workflow) in a single, coherent chain. Procurement automation following the same Page Object Model is a natural next extension — see [Future Improvements](#known-limitations-and-future-improvements).

**Objectives of this project**:
- Demonstrate functional test automation competency across both the **desk UI** and the **REST API** of a real, non-trivial application — not a toy to-do app.
- Demonstrate the **investigative** side of QA: several real defects and environment issues in this document were found by treating unexpected test behavior as something to diagnose, not paper over (see [Exploratory Testing Report](docs/qa/exploratory-testing-report.md)).
- Produce professional-grade QA documentation (strategy, plan, traceability, risk assessment) alongside the code, the way a QA engineer would on a real project.

---

## Business workflow diagram

```mermaid
flowchart LR
    C["Customer\ncreated"] --> I["Item\ncreated"]
    I --> Q["Quotation\ncreate + submit"]
    Q -->|"Create ▸ Sales Order"| SO["Sales Order\ncreate + submit"]
    SO -->|"Create ▸ Sales Invoice"| SI["Sales Invoice\ncreate + submit"]
    SI --> T{"Grand totals match\nacross SO → SI?"}
    T -->|yes| PASS["sales-flow.spec.ts passes"]
```

---

## Test automation architecture

```mermaid
flowchart TB
    DEV["Developer machine"] -->|npx playwright test| RUNNER
    GHA["GitHub Actions"] -->|npx playwright test| RUNNER

    subgraph RUNNER["Playwright Test Runner"]
        UI["UI Test Suite\nPage Object Model"]
        API["API Test Suite\nAPIRequestContext"]
    end

    RUNNER --> SUT["ERPNext (SUT)\nhttp://localhost:8080"]
    SUT --> DB[("MariaDB")]
    SUT --> REDIS[("Redis cache + queue")]

    RUNNER --> REPORT["Playwright HTML Report\nplaywright-report/"]
```

<details>
<summary>Page Object Model class hierarchy</summary>

```mermaid
flowchart TB
    Base["BaseFormPage\nfillText / fillLink / fillDate\nsave / submit / cancel\nfillChildField / createFrom"]
    Base --> Login["LoginPage"]
    Base --> Customer["CustomerPage"]
    Base --> Item["ItemPage"]
    Base --> Quotation["QuotationPage"]
    Base --> SalesOrder["SalesOrderPage"]
    Base --> SalesInvoice["SalesInvoicePage"]
    Base --> Employee["EmployeePage"]

    Specs["tests/ui/specs/*.spec.ts"] --> Login
    Specs --> Customer
    Specs --> Item
    Specs --> Quotation
    Specs --> SalesOrder
    Specs --> SalesInvoice
    Specs --> Employee
```

</details>

<details>
<summary>Docker test environment (frappe_docker <code>pwd.yml</code>) and authentication/session flow</summary>

See [docs/diagrams/architecture.md](docs/diagrams/architecture.md) for these two diagrams in full, plus every diagram in this README collected in one place.

</details>

---

## UI automation demonstration

Every doctype-specific page object (`CustomerPage`, `QuotationPage`, `SalesOrderPage`, …) extends one `BaseFormPage` that encapsulates the interaction patterns this ERPNext version's desk UI actually uses — discovered by investigation, not assumed (see [Exploratory Testing Report](docs/qa/exploratory-testing-report.md), EXP-04):

```ts
// tests/ui/pages/BaseFormPage.ts (excerpt)
async save() {
  await this.dismissToasts();
  await this.page.keyboard.press("Control+S");
  await expect(this.page.locator(".es-toast__message").filter({ hasText: "Saved" }).first())
    .toBeVisible({ timeout: 10_000 });
}

async submit() {
  await this.page.locator("button:visible", { hasText: "Submit" }).first().click();
  await this.page.click("div.modal.show button:has-text('Yes')");
  // Status text varies by doctype ("Open", "To Bill", ...); the reliable
  // signal is the toolbar swapping "Submit" for "Cancel".
  await expect(this.page.locator("button:visible", { hasText: "Cancel" }).first())
    .toBeVisible({ timeout: 10_000 });
}
```

The flagship end-to-end test chains five documents through real UI interactions and asserts the financial total survives the whole conversion:

```ts
// tests/ui/specs/sales-flow.spec.ts (excerpt)
await new CustomerPage(page).createCustomer(customerName);
await new ItemPage(page).createItem(itemCode);

const quotation = new QuotationPage(page);
await quotation.createQuotation(customerName, itemCode, qty);
await quotation.createSalesOrder();

const salesOrder = new SalesOrderPage(page);
await salesOrder.submitOrder();
const orderTotal = await salesOrder.getGrandTotal();

await salesOrder.createSalesInvoice();
const invoice = new SalesInvoicePage(page);
await invoice.submitInvoice();

expect(await invoice.getGrandTotal()).toBe(orderTotal);
```

---

## REST API testing demonstration

```mermaid
sequenceDiagram
    participant Test as API spec
    participant Helper as apiClient.ts
    participant API as Frappe REST API

    Test->>Helper: createApiContext()
    Helper->>API: POST /api/method/login (usr, pwd)
    API-->>Helper: Set-Cookie: sid=...
    Helper-->>Test: APIRequestContext (session cookie attached)
    Test->>API: POST/GET/PUT/DELETE /api/resource/<Doctype>
    API-->>Test: JSON (data / exception)
    Test->>Test: assert status code + response body
```

```ts
// tests/api/specs/sales-order.api.spec.ts (excerpt)
test("rejects a sales order with no items", async () => {
  const resp = await api.post(resourceUrl("Sales Order"), {
    data: { customer: customerName, delivery_date: futureDate(7), items: [] },
  });
  expect(resp.status()).toBeGreaterThanOrEqual(400);
});
```

Session-login auth (`/api/method/login`) is used instead of a static API key/secret, since a freshly provisioned CI site has no pre-existing key — see [`apiClient.ts`](tests/api/helpers/apiClient.ts).

---

## Test coverage matrix

| Business module | UI | API |
|---|:---:|:---:|
| Authentication / Login | ✅ | — |
| Customer | ✅ | ✅ |
| Item | ✅ | ✅ |
| Quotation | ✅ | ✅ |
| Sales Order | ✅ | ✅ |
| Sales Invoice | ✅ | ✅ |
| Employee | ✅ | ✅ |
| Contact | — | ✅ |
| Address | — | ✅ |
| Global Search | ✅ | — |
| Generic list-query (filter/paginate/sort) | — | ✅ |
| Leave Application / Attendance | — | — *(HRMS app — see [Known Limitations](#known-limitations-and-future-improvements))* |
| Procurement (Purchase Order/Invoice) | — | — *(out of scope — see [Business Domain](#business-domain-and-project-objectives))* |

Full matrix with notes: [docs/qa/feature-coverage-matrix.md](docs/qa/feature-coverage-matrix.md). Requirements-level traceability: [docs/qa/requirements-traceability-matrix.md](docs/qa/requirements-traceability-matrix.md).

---

## Playwright and Allure reports

<table>
<tr>
<td width="50%"><img src="docs/screenshots/automation/html-report-overview.png" width="100%"/><br/><sub><b>Playwright HTML report</b> — full run, 35/35 passing</sub></td>
<td width="50%"><img src="docs/screenshots/automation/html-report-sales-flow-steps.png" width="100%"/><br/><sub><b>Step-by-step execution</b> — flagship sales-flow test</sub></td>
</tr>
</table>

### Allure report

![Allure report overview — 35 test cases, 100% passed](docs/screenshots/automation/allure-report.png)

Allure is wired in alongside the HTML reporter (not replacing it) via `allure-playwright` in `playwright.config.ts`; `npm run allure:generate && npm run allure:open` regenerates and opens it locally. `allure-results/` and `allure-report/` are gitignored (generated artifacts, not committed).

### Trace Viewer

Every test retains a full Playwright trace on failure (`trace: "retain-on-failure"`); the flagship test's trace was additionally captured on a passing run for this screenshot (`--trace on`), showing the real application alongside the action list, locator, and network activity:

![Playwright Trace Viewer](docs/screenshots/automation/trace-viewer.png)

```sh
npx playwright show-trace test-results/<test-folder>/trace.zip
```

---

## CI/CD pipeline

```mermaid
flowchart TB
    Trigger["push / pull_request / workflow_dispatch"] --> Checkout["Checkout erpnext-qa-portfolio"]
    Checkout --> Clone["git clone frappe_docker (depth 1)"]
    Clone --> Up["docker compose -f pwd.yml up -d"]
    Up --> Wait["Poll /api/method/ping\nuntil ERPNext responds"]
    Wait --> Node["Set up Node.js 20"]
    Node --> Install["npm ci"]
    Install --> Browsers["npx playwright install --with-deps chromium"]
    Browsers --> Env["Write .env\n(BASE_URL, ADMIN_USER, ADMIN_PASSWORD)"]
    Env --> Run["npx playwright test"]
    Run --> Upload["Upload playwright-report/\nas build artifact"]
    Upload --> Down["docker compose down\n(always, even on failure)"]
```

The workflow (`.github/workflows/tests.yml`) is fully self-contained — it provisions its own ERPNext instance from scratch every run, with no external dependencies or pre-existing credentials. The CI badge at the top of this README reflects the actual latest run **once this repository has been pushed and the workflow has executed at least once** — it cannot show real status before that, and this README does not claim otherwise.

---

## Test strategy and QA documentation

| Document | Covers |
|---|---|
| [Test Strategy](docs/qa/test-strategy.md) | Scope, test levels, tooling rationale, entry/exit criteria |
| [Test Plan](docs/qa/test-plan.md) | In/out of scope, approach, environment, schedule |
| [Test Case Matrix](docs/qa/test-case-matrix.md) | All 35 tests, by ID, file, type, priority |
| [Requirements Traceability Matrix](docs/qa/requirements-traceability-matrix.md) | Every test mapped to the business requirement it verifies |
| [Feature Coverage Matrix](docs/qa/feature-coverage-matrix.md) | Module-by-module UI/API coverage |
| [Risk Assessment](docs/qa/risk-assessment.md) | Likelihood × impact for the flows this suite protects |
| [Exploratory Testing Report](docs/qa/exploratory-testing-report.md) | What was investigated beyond the scripted tests, and why |
| [Test Execution Summary](docs/qa/test-execution-summary.md) | The latest real run's numbers |
| [DEFECT-001](docs/bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md) | Real defect: scheduler container crash-loop from an orphaned app, breaking background indexing |
| [DEFECT-002](docs/bug-reports/DEFECT-002-rate-reset-on-document-conversion.md) | Real defect: Quotation→Sales Order→Sales Invoice can zero out a manually entered rate |

Both defect reports are genuine findings from building this project, Jira-style (environment, severity, priority, repro steps, expected/actual, evidence) — not illustrative placeholders.

---

## Project directory structure

```
erpnext-qa-portfolio/
├── .github/workflows/tests.yml       # Self-contained CI pipeline
├── docs/
│   ├── bug-reports/                  # Real defect reports found during this project
│   ├── diagrams/architecture.md      # All Mermaid diagrams, source of truth
│   ├── qa/                           # Test strategy, plan, matrices, risk, exploratory report
│   └── screenshots/
│       ├── application/              # Real ERPNext screenshots (16)
│       └── automation/               # Report / trace viewer screenshots
├── fixtures/testData.ts              # Unique-name and ISO-date generators
├── scripts/capture-screenshots.js    # One-off: populates realistic data, captures README screenshots
├── tests/
│   ├── ui/
│   │   ├── pages/                    # Page Object Model (BaseFormPage + 7 doctype pages)
│   │   ├── specs/                    # 10 UI test specs
│   │   └── auth.setup.ts             # Logs in once; completes Setup Wizard on a fresh site
│   └── api/
│       ├── helpers/apiClient.ts      # Session-login API client
│       └── specs/                    # 25 API test specs
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

---

## Installation and execution instructions

### 1. Start the System Under Test (ERPNext)

```sh
git clone https://github.com/frappe/frappe_docker
cd frappe_docker
docker compose -f pwd.yml up -d
```

Wait for the `create-site` container to finish (a few minutes on first run — it installs the full ERPNext schema), then confirm `http://localhost:8080` loads. A brand-new site lands on ERPNext's Setup Wizard; `tests/ui/auth.setup.ts` detects and completes it automatically.

### 2. Run the tests

```sh
npm install
npx playwright install chromium
cp .env.example .env   # defaults already match the SUT above
npx playwright test
npx playwright show-report
```

Run one suite with `npm run test:ui` or `npm run test:api`. Run with a visible browser via `npm run test:headed`.

### 3. (Optional) Generate the Allure report

```sh
npx playwright test          # populates allure-results/ (reporter is already configured)
npm run allure:generate      # writes allure-report/
npm run allure:open
```

---

## Engineering decisions

- **Why Page Object Model**: ERPNext's desk UI reuses the same form/grid interaction pattern across doctypes (`BaseFormPage`), so new doctype coverage is a thin subclass, not new low-level DOM handling.
- **Why session-login for API auth**: a static API key/secret would not exist on a freshly created CI site; `/api/method/login` works identically against any fresh instance.
- **Selectors target this version's real desk UI**: `/desk` (not `/app`), toast notifications (`.es-toast__message`) rather than status pills, ARIA roles (`role="option"`, `role="menuitem"`) rather than Bootstrap dropdown classes, flat `input[data-fieldname]` grid cells rather than nested ones, and keystroke-driven (`pressSequentially`) link-field search rather than `.fill()`. All discovered empirically — see [Exploratory Testing Report](docs/qa/exploratory-testing-report.md).
- **Dates**: fixtures generate ISO (`YYYY-MM-DD`) since that's what the REST API expects; `BaseFormPage.fillDate` converts to this site's display format (`DD-MM-YYYY`) before typing into a UI field.
- **Global search test** asserts on the actual `frappe.utils.global_search.search` network response, not rendered DOM text, and queries an already-indexed record rather than one just created — both decisions trace directly to real findings (EXP-01, EXP-09) documented in the exploratory report.
- **Negative tests assert real behavior, not assumptions**: e.g. duplicate Customer names are auto-suffixed (not rejected) — the test was written to match the actual rule, not a plausible-sounding guess.

---

## Known limitations and future improvements

### Known limitations

- **HR flow is Employee-only.** Leave Application and Attendance live in ERPNext's separate **HRMS** app, which requires Frappe/ERPNext **v17+**. This stack runs v16.60.0; installing HRMS was attempted and fails with a module-import error (`erpnext.accounts.doctype.sales_invoice.services` doesn't exist in v16). Restoring full HR coverage needs an ERPNext v17 + HRMS stack.
- **Procurement / Procure-to-Pay is out of scope** for this pass (see [Business Domain](#business-domain-and-project-objectives)).
- **Role-based permission testing is not covered** — only the `Administrator` role is exercised (flagged as RISK-04 in the [Risk Assessment](docs/qa/risk-assessment.md), not silently omitted).
- **Browser coverage is Chromium only.**
- **Global search freshness is not asserted** for newly-created records — the index is flushed by a 15-minute cron with no faster path available over HTTP (EXP-09); the test verifies search correctness against already-indexed data instead.

### Future improvements

Roughly in priority order for extending this toward a production-style QA practice:

1. **Role-based authorization testing** — verify permission boundaries for non-Administrator roles (Sales User, Sales Manager, Guest), not just that Administrator can do everything.
2. **Procurement (Procure-to-Pay) flow** — Supplier → Purchase Order → Purchase Receipt → Purchase Invoice, mirroring the existing Sales POM pattern.
3. **Security testing** — expand beyond the current unauthenticated-request checks into deliberate permission-boundary and input-validation probing.
4. **Performance testing** — a k6 (or Playwright-based) load test against the REST API endpoints already covered functionally here.
5. **Database consistency checks** — assert financial totals/stock levels directly in MariaDB match what the UI/API report, catching discrepancies neither layer would show alone.
6. **Cross-browser testing** — extend the existing Chromium projects to Firefox/WebKit.
7. **AI-assisted testing** — exploratory test-case generation or visual regression review as a complementary (not replacement) technique.

---

## Upstream attribution

This project tests, but does not modify or redistribute, [ERPNext](https://github.com/frappe/erpnext) and [Frappe](https://github.com/frappe/frappe) (both GPLv3 / MIT-family licensed by The Frappe Foundation), run locally via [frappe_docker](https://github.com/frappe/frappe_docker)'s `pwd.yml` demo setup. All screenshots are of a local, disposable instance with synthetic data — no production ERPNext/Frappe systems, services, or data are involved.
