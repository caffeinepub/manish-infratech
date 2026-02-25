# Specification

## Summary
**Goal:** Improve the invoice print view by removing paid/pending fields and enhancing its visual polish, and redesign the login screen with a more professional appearance.

**Planned changes:**
- Remove the "Amount Paid" and "Pending Amount" rows from the `InvoicePrintView` print layout, keeping only the Final Amount and its amount-in-words line in the GST summary section.
- Improve the visual design of `InvoicePrintView`: better spacing, typography hierarchy, and overall professional appearance while preserving the existing red-and-white color theme, header band, MI logo, and all structural content.
- Redesign `SimpleLoginScreen` with a polished card layout featuring the MI logo and "MANISH INFRATECH" branding prominently, well-spaced username/PIN fields, and a branded login button — with no changes to authentication logic, credentials, or session management.

**User-visible outcome:** The printed invoice no longer shows paid/pending amounts and looks more refined, and the login screen presents a cleaner, more professional branded interface.
