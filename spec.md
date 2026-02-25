# Specification

## Summary
**Goal:** Enhance the Manish Infratech billing app with GST display on invoices, editable bill dates, 30 line items per bill, CSV report downloads, and autocomplete suggestions for party and product names.

**Planned changes:**
- Display the party's GST number in the invoice header (InvoicePrintView) beneath the party name as "GST No: <value>"; omit if not stored
- Add a Bill Date field to AddBillForm and EditBillModal, defaulting to today's date, editable, stored as Unix timestamp in nanoseconds; show bill date in BillResultsTable, CompanyReportPage, and InvoicePrintView
- Increase the maximum line item rows per bill from 10 to 30 in AddBillForm, EditBillModal, and backend; disable "Add Row" button at 30 rows
- Add a "Download Report" button on SummaryPage that exports all bills (filtered by active date range) as a CSV with columns: Invoice No., Party Name, GST No., Bill Date, Base Amount, CGST, SGST, Round-off, Final Amount, Amount Paid, Pending Amount
- Add a "Download Report" button on CompanyReportPage that exports the current party's bills (filtered by active date range) as a CSV with party name and GST number as a header block
- Implement autocomplete dropdown for the Party Name field in AddBillForm and EditBillModal, sourced from unique party names stored in the backend
- Implement autocomplete dropdown for Product Name cells in line item rows in AddBillForm and EditBillModal, sourced from unique product names across all existing bill line items

**User-visible outcome:** Users can see party GST numbers on printed invoices, pick or edit bill dates, add up to 30 line items per bill, download CSV reports from both the summary and company report pages, and get autocomplete suggestions when typing party or product names.
