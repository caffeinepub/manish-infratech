# Specification

## Summary
**Goal:** Add party/buyer GST number and address fields to the Manish Infratech billing app, persisting them on bill records and displaying them in the add/edit bill forms, invoice print view, and summary/search tables — while preserving the full Version 24 UI exactly.

**Planned changes:**
- Restore the complete Version 24 UI (layout, color scheme, logo, all pages and components) without any alterations
- Add `partyGstNumber` and `partyAddress` fields to the backend Bill data model with backward compatibility (default to empty strings)
- Update `addBill` and `editBill` backend functions to accept and store the two new fields
- Add "Party GST Number" and "Party Address" input fields to the AddBillForm and EditBillModal, auto-filled when a party is selected
- Display a "Bill To" section in InvoicePrintView showing party name, GST number (labeled "GST No:"), and address, visible on screen and when printing
- Show party GST number in the SummaryPage bills table, SearchBillsPage results table, and PartySummaryPage

**User-visible outcome:** Users can record a buyer's GST number and address on each bill, see them auto-fill when selecting a known party, view them on printed/PDF invoices in a "Bill To" section, and see the party GST number listed in summary and search views.
