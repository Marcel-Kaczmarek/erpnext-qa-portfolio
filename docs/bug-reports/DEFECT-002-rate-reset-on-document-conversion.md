# DEFECT-002 — Manually entered item rate is reset to 0 when converting Quotation → Sales Order → Sales Invoice, if the item has no Item Price

**Status**: Real defect found during this project (not illustrative). Reproduced once with clear evidence; workaround applied in the portfolio's own data-setup rather than filed upstream (this is a documentation/portfolio project against vanilla ERPNext, not a fork of it).

| Field | Value |
|---|---|
| **Environment** | ERPNext v16.60.0, Quotation → Sales Order → Sales Invoice via the desk UI "Create" mapping |
| **Severity** | Medium — produces a financially incorrect document (zero-value invoice) with no warning |
| **Priority** | P3 (has a simple workaround: set the item's Standard Selling Rate) |
| **Reproduction rate** | 100% under the conditions below, on the one occasion tested |

## Summary

A Quotation item was given a manually-typed `rate` (1899) for an Item that had **no Standard Selling Rate / Item Price record**. The rate carried through correctly into the Sales Order (`rate: 1899`), but after converting that Sales Order into a Sales Invoice via "Create → Sales Invoice", the invoice's item row showed:

```json
"rate": 0.0,
"amount": 0.0,
"base_amount": 0.0
```

— despite `qty: 5` and the source Sales Order correctly carrying `rate: 1899`. The invoice's `grand_total` was `0.00`.

## Steps to reproduce

1. Create an Item with no Standard Selling Rate (`standard_rate: 0`) and no `Item Price` record.
2. Create a Quotation for any Customer, add the item, manually type a `rate` (not inherited from any price list).
3. Save and Submit the Quotation.
4. "Create → Sales Order" from the Quotation. Save and Submit. Rate is still correct at this point.
5. "Create → Sales Invoice" from the Sales Order.
6. Observe the invoice's item row rate/amount.

## Expected result

A rate that was valid and explicitly carried on the source Sales Order should be preserved when mapping to a Sales Invoice — the user already confirmed that price when they submitted the Sales Order.

## Actual result

The Sales Invoice's rate is recalculated from the Item's price list rate (which is `0`, since none exists), silently producing a zero-value invoice instead of either preserving the Sales Order's rate or raising a validation error.

## Workaround used in this project

`scripts/capture-screenshots.js` (used only to generate README screenshots, not part of the automated test assertions) sets a real `Standard Selling Rate` on the item at creation time, which avoids triggering this path entirely and produces consistent, non-zero totals across Quotation → Sales Order → Sales Invoice.

## Evidence

- Sales Invoice `ACC-SINV-2026-00007`, item row: `"item_code":"LAPTOP-DELL-XPS15","qty":5.0,"rate":0.0,"amount":0.0`, document `"grand_total":0.0`.
- The same item/quantity on the source Sales Order (`SAL-ORD-2026-00013`) carried `rate: 1899` prior to the Sales Invoice conversion.

## Note on scope

This was observed once, on this specific ERPNext version, while generating documentation assets for this project — it is reported here as an honest exploratory-testing finding, not as a verified, triaged upstream ERPNext bug (that would require reproducing against a clean, unmodified instance and checking the ERPNext issue tracker for existing reports of the same `get_mapped_doc` price-recalculation behavior).
