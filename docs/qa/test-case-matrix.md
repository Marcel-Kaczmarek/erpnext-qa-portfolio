# Test Case Matrix

35 automated tests (1 setup precondition + 34 functional), auto-generated from the live suite via `npx playwright test --list` (not hand-maintained, so it cannot silently drift from the real test files).

| ID | File | Test | Type | Priority |
|---|---|---|---|---|
| TC-00 | `ui/auth.setup.ts` | Authenticate as Administrator (precondition, not a functional test) | Setup | Critical |
| TC-01 | `ui/specs/login.spec.ts` | Logs in with valid credentials | UI | Critical |
| TC-02 | `ui/specs/login.spec.ts` | Rejects invalid credentials | UI | High |
| TC-03 | `ui/specs/customer.spec.ts` | Creates a new customer and finds it in the list view | UI | Critical |
| TC-04 | `ui/specs/item.spec.ts` | Creates a new item and finds it in the list view | UI | Critical |
| TC-05 | `ui/specs/sales-flow.spec.ts` | Quotation converts through to a Sales Invoice with matching totals | UI (E2E) | Critical |
| TC-06 | `ui/specs/sales-flow.spec.ts` | A submitted Sales Order can be cancelled | UI | High |
| TC-07 | `ui/specs/validation.spec.ts` | Rejects a customer saved without a name | UI | High |
| TC-08 | `ui/specs/validation.spec.ts` | Rejects an item saved without an item code | UI | High |
| TC-09 | `ui/specs/validation.spec.ts` | Auto-suffixes a second customer created with a duplicate name | UI | Medium |
| TC-10 | `ui/specs/validation.spec.ts` | Rejects a second item created with a duplicate item code | UI | High |
| TC-11 | `ui/specs/validation.spec.ts` | Rejects a Quotation submitted with no line items | UI | High |
| TC-12 | `ui/specs/hr-flow.spec.ts` | Creates an employee and finds it in the list view | UI | Medium |
| TC-13 | `ui/specs/global-search.spec.ts` | Global search finds an existing customer by name | UI | Medium |
| TC-14 | `api/specs/customer.api.spec.ts` | Creates, reads, updates, and deletes a customer | API | Critical |
| TC-15 | `api/specs/customer.api.spec.ts` | Rejects a customer created without the required customer_name field | API | High |
| TC-16 | `api/specs/customer.api.spec.ts` | Rejects requests with no session | API | High |
| TC-17 | `api/specs/item.api.spec.ts` | Creates, reads, updates, and deletes an item | API | Critical |
| TC-18 | `api/specs/item.api.spec.ts` | Rejects an item created without the required item_group field | API | High |
| TC-19 | `api/specs/quotation.api.spec.ts` | Creates a quotation for a customer with one line item | API | Critical |
| TC-20 | `api/specs/quotation.api.spec.ts` | Lists quotations filtered by party_name | API | Medium |
| TC-21 | `api/specs/sales-order.api.spec.ts` | Creates a sales order with one line item and reads it back | API | Critical |
| TC-22 | `api/specs/sales-order.api.spec.ts` | Rejects a sales order with no items | API | High |
| TC-23 | `api/specs/sales-order.api.spec.ts` | Rejects a sales order for a non-existent customer | API | High |
| TC-24 | `api/specs/sales-invoice.api.spec.ts` | Creates a sales invoice directly and verifies the grand total | API | Critical |
| TC-25 | `api/specs/sales-invoice.api.spec.ts` | Rejects a sales invoice created without a customer | API | High |
| TC-26 | `api/specs/employee.api.spec.ts` | Creates, reads, updates, and deletes an employee | API | High |
| TC-27 | `api/specs/employee.api.spec.ts` | Rejects an employee created without a date of birth | API | Medium |
| TC-28 | `api/specs/contact.api.spec.ts` | Creates, reads, updates, and deletes a contact linked to a customer | API | Medium |
| TC-29 | `api/specs/contact.api.spec.ts` | Returns 404 for a non-existent contact | API | Low |
| TC-30 | `api/specs/address.api.spec.ts` | Creates, reads, updates, and deletes an address linked to a customer | API | Medium |
| TC-31 | `api/specs/address.api.spec.ts` | Rejects an address created without a country | API | Low |
| TC-32 | `api/specs/list-query.api.spec.ts` | Filters by a name prefix using a 'like' operator | API | Medium |
| TC-33 | `api/specs/list-query.api.spec.ts` | Respects the limit_page_length parameter | API | Low |
| TC-34 | `api/specs/list-query.api.spec.ts` | Orders results by creation descending | API | Low |

Priority reflects business risk (see [Risk Assessment](risk-assessment.md)), not implementation difficulty — e.g. the end-to-end sales flow (TC-05) is Critical because it is the project's core financial workflow; a pagination parameter check (TC-33) is Low because it is a generic REST capability, not a business rule.
