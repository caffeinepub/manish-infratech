# Specification

## Summary
**Goal:** Full aesthetic redesign of the Manish Infratech app with a white+blue+red theme, black body text, green success states, and fixed invoice column labels.

**Planned changes:**
- Redesign the navigation header (Layout.tsx) with a deep navy blue background, MI logo badge (red square with bold white "MI"), "MANISH INFRATECH" in white bold text, white nav links with red hover/active styling, and a red Logout button
- Apply a consistent white+blue+red theme across all pages: off-white/light gray page backgrounds, white cards with navy borders/shadows, navy primary buttons, navy table headers with white text, alternating white/light-blue-gray table rows, and navy focus rings on inputs
- Change all body text, form labels, table cell text, headings, and placeholders in content areas to black/dark gray (#1a1a1a); white text only on dark/colored backgrounds (header, navy buttons, red buttons)
- Display all success/saved confirmation messages (bill saved, edit saved, GST number saved) in green text or with a green background badge
- Fix line item column headers in AddBillForm and EditBillModal to show: "Sr. No.", "HSN Code", "Product Name", "Qty", "Unit", "Rate (₹)", "Amount (₹)" in bold dark text, with matching placeholders on each input field; apply the same headers to InvoicePrintView

**User-visible outcome:** The entire app has a polished navy/white/red aesthetic with clearly readable black text throughout, green success confirmations, and clearly labeled invoice line item columns.
