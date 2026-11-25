# Requirements Traceability Matrix

ERPNext is an existing open-source application, not a custom product built from a requirements spec — there is no requirements document to trace to in the usual sense. This matrix instead traces each automated test back to the **implicit business requirement it verifies** (the behavior a stakeholder would reasonably expect of an Order-to-Cash ERP), which is the realistic situation for QA work on an existing/COTS/open-source system.

| Req ID | Requirement | Verified by |
|---|---|---|
| REQ-01 | A user must authenticate before accessing business data; invalid credentials must be rejected with a clear error. | TC-01, TC-02 |
| REQ-02 | A Customer master record can be created, found in search/listing, and updated via both the desk UI and the REST API. | TC-03, TC-09, TC-13, TC-14, TC-16 |
| REQ-03 | Customer creation must reject a missing name (UI validation message; API structured error). | TC-07, TC-15 |
| REQ-04 | An Item master record can be created with a required classification (Item Group) and found in listing, via both UI and API. | TC-04, TC-17 |
| REQ-05 | Item creation must reject a missing item code / item group, and item codes must be unique. | TC-08, TC-10, TC-18 |
| REQ-06 | A Quotation can be raised for a Customer with one or more priced line items, and must require at least one item before it can be submitted. | TC-05, TC-11, TC-19 |
| REQ-07 | A Quotation can be filtered/listed by the Customer it was raised for. | TC-20 |
| REQ-08 | A Sales Order can be generated from a submitted Quotation, carrying the same items/quantities, and can be submitted or cancelled. | TC-05, TC-06, TC-21 |
| REQ-09 | A Sales Order must reject being created with no items, or for a non-existent Customer. | TC-22, TC-23 |
| REQ-10 | A Sales Invoice can be generated from a submitted Sales Order (or created directly via API) with a correct, matching grand total. | TC-05, TC-24 |
| REQ-11 | A Sales Invoice must reject being created without a Customer. | TC-25 |
| REQ-12 | An Employee master record can be created and found in listing, via both UI and API, with required fields (date of birth) enforced. | TC-12, TC-26, TC-27 |
| REQ-13 | Contact and Address records can be created, read, updated, and deleted via the API, linked to a Customer. | TC-28, TC-29, TC-30, TC-31 |
| REQ-14 | An existing record can be located through the application's global search. (Freshness of newly-created records is bound by a 15-minute background indexing cron — see EXP-09 — and is intentionally not asserted on a test-suite timescale.) | TC-13 (investigating this also exposed [DEFECT-001](../bug-reports/DEFECT-001-scheduler-crash-from-orphaned-app.md)) |
| REQ-15 | The REST API's generic list endpoint supports text filtering, page-size limiting, and sort ordering. | TC-32, TC-33, TC-34 |
| REQ-16 | Unauthenticated API requests to protected resources must be rejected. | TC-16 |

Every requirement maps to at least one test; every test maps to at least one requirement (no orphaned tests, no untested requirements within the stated [scope](test-plan.md#2-scope)).
