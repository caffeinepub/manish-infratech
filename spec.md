# Specification

## Summary
**Goal:** Add a multi-line item table (up to 10 rows) to the bill creation form, backend data model, and invoice print view, replacing the single base amount field with aggregated line item totals.

**Planned changes:**
- Extend the backend bill data model to store an array of line items (Sr. No., HSN Code, Product Name, item amount, item GST at 18%), with aggregated totals feeding into CGST (9%), SGST (9%), round-off, and final amount calculations.
- Update the bill creation API to accept and persist the line items array.
- Replace the single "Base Amount" field in the Add Bill form with an editable line item table (columns: Sr. No., HSN Code, Product Name, Amount ₹, GST ₹), supporting add/remove rows up to 10, auto-incremented Sr. No., and auto-computed GST per row.
- Show a live GST breakdown summary (Base Amount, CGST 9%, SGST 9%, Round-off, Final Amount) below the table that updates in real time.
- Update the invoice print view to display the line item table above the existing GST summary section.

**User-visible outcome:** Users can enter up to 10 product line items per bill with HSN codes and individual amounts, see per-item GST calculated automatically, and have the full breakdown reflected in both the bill form and the printed invoice.
