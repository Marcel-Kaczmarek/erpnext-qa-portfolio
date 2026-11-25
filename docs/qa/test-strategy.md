# Test Strategy

## 1. Purpose and scope

This strategy governs automated functional testing of **ERPNext's core Order-to-Cash flow** (Customer → Item → Quotation → Sales Order → Sales Invoice) plus supporting modules (Employee, Contact, Address, authentication, global search), exercised through both the **desk UI** and the **Frappe REST API**.

The System Under Test (SUT) is a local ERPNext v16.60.0 instance, provisioned via [`frappe_docker`](https://github.com/frappe/frappe_docker)'s `pwd.yml` single-compose demo setup — either on a developer machine or fresh inside CI.

**Out of scope** (see [Known Limitations](../../README.md#known-limitations)): Procurement / Procure-to-Pay, Manufacturing, Projects, Assets, and HR/Payroll beyond the core `Employee` doctype (HRMS is a separate app incompatible with this ERPNext version — see below).

## 2. Test levels

| Level | Tool | What it proves |
|---|---|---|
| UI / end-to-end | Playwright (Chromium), Page Object Model | The desk UI genuinely produces correct, submittable documents — the thing a user experiences. |
| API / service | Playwright `APIRequestContext` | The Frappe REST layer enforces the same business rules independent of the UI, and is safe to automate against directly (e.g. for data setup, CI, other integrations). |

Both levels test the **same business rules from two different entry points** — this is deliberate: a bug that only shows up in one layer (e.g. a UI-only validation, or an API-only permission gap) is exactly the kind of gap single-layer testing misses.

## 3. What "pass" means

A test passes only when it exercises the real application through its real interface (`page.click`, `page.fill`, an actual HTTP request) and asserts on an outcome that could only be true if the feature actually works — not on cosmetic text that would also be true for unrelated input. (One such weak assertion was found and corrected during this project; see [Exploratory Testing Report](exploratory-testing-report.md), finding EXP-01.)

## 4. Test data strategy

- **Automated suite**: every test generates its own uniquely-named data (`fixtures/testData.ts` — timestamp + random suffix) so runs are independent and repeatable without manual cleanup, and safe to run concurrently against a shared instance.
- **Documentation screenshots**: a separate one-off script (`scripts/capture-screenshots.js`) populates realistic, readable business data (e.g. "Contoso Retail Ltd", "LAPTOP-DELL-XPS15") specifically for the screenshots in this README — this data is not part of the automated assertions.

## 5. Environment strategy

- **Local**: `frappe_docker`'s `pwd.yml` gives a disposable, reproducible ERPNext instance in one command.
- **CI**: the GitHub Actions workflow (`.github/workflows/tests.yml`) clones `frappe_docker` fresh and boots the same stack per run — no shared state between runs, no pre-existing credentials (session-login auth is used instead of a static API key, since a fresh site has none).
- A brand-new site lands on ERPNext's one-time Setup Wizard; `tests/ui/auth.setup.ts` detects and completes it automatically before any functional test runs.

## 6. Risk-based prioritization

See [Risk Assessment](risk-assessment.md) for the full matrix. In summary: the Order-to-Cash chain (Quotation → Sales Order → Sales Invoice) carries the highest business risk (it is the system's financial core) and receives the deepest coverage — full UI + API CRUD + negative cases + the only true end-to-end multi-document flow in the suite.

## 7. Tooling rationale

| Choice | Why |
|---|---|
| Playwright + TypeScript | Auto-waiting, first-class API testing support in the same tool as UI testing, strong trace/debugging story, actively maintained, in-demand in the market. |
| Page Object Model (`BaseFormPage`) | ERPNext's desk UI reuses the same form/grid interaction pattern across doctypes; one base class means new doctype coverage is a thin subclass, not new low-level DOM handling. |
| Session-login API auth | A static API key/secret would not exist on a freshly created CI site; `/api/method/login` works identically against any fresh instance. |
| GitHub Actions | Self-contained, free for public repos, directly demonstrates CI literacy without external dependencies. |

## 8. Entry / exit criteria

- **Entry**: SUT responds on `/api/method/ping`; `auth.setup.ts` completes (login + Setup Wizard if needed).
- **Exit**: all 35 tests green in the HTML report; no `TODO`/`.skip()` left in committed specs without a documented reason in this repo's known-limitations section.
