# Specification

## Summary
**Goal:** Fix the print layout so only invoice content appears when printing, and ensure bills are synced across all devices via the shared ICP canister stable storage.

**Planned changes:**
- Add `@media print` CSS rules to the global stylesheet to hide the navigation header (navy bar with MI logo, nav links, logout button) and all screen-only UI elements (action buttons, sidebars, filter controls) during printing
- Ensure the printed invoice shows only: MI logo, company name, buyer party name, party GST number, invoice number, bill date, line items table, and GST summary
- Audit and fix `useActor.ts` so the backend canister actor is created with anonymous identity, instantiated once, cached, and reused across all sessions
- Verify the frontend Candid/IDL interface exactly matches all backend method signatures in `main.mo`; fix any mismatches or stale imports
- Show a loading spinner while the actor initializes, and an error message if initialization fails
- Confirm `main.mo` uses stable variables for bills and party profiles with correct `preupgrade`/`postupgrade` hooks so all data survives upgrades and is globally accessible from any device

**User-visible outcome:** Printed invoices no longer show the navigation header — only the professional invoice content appears. Bills created on one device are visible on all other devices without manual refresh.
