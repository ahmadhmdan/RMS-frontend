# Reusability Improvement Plan

## Current findings

The codebase has repeated page-level implementation patterns that can be extracted into shared modules to reduce maintenance effort and improve consistency.

### 1) Duplicated invoice item autocomplete logic
- Multiple invoice create pages define a local `ItemAutocomplete` component with nearly identical keyboard-navigation behavior.
- A shared version already exists in `src/core/components/invoices/ItemAutocomplete.tsx`, so local copies increase drift risk.

### 2) Repeated create-invoice page scaffolding
- Invoice create pages in modules like purchase, return, goods, transfer, manufacturing, waste, and consumption repeat the same structure:
  - Formik setup
  - discount calculations
  - keyboard row navigation
  - line-items table rendering
- This is a strong candidate for a `BaseInvoiceForm`-driven architecture using per-module configuration objects.

### 3) Repeated validation schemas and value transformers
- Many modules recreate similar `Yup` schemas and payload transformation logic.
- Shared schema fragments and payload mappers can centralize business rules.

### 4) Repeated list-page table/filter boilerplate
- Multiple modules have similar list pages using table + filters + pagination + action buttons.
- Standardizing this into a reusable `EntityListPage` pattern can speed up new module creation.

## Proposed phased approach

### Phase 1 (quick wins)
1. Replace all local invoice page `ItemAutocomplete` definitions with the shared component.
2. Add common types for invoice line item and invoice form values under `src/core/types/invoice.ts`.
3. Extract shared utility functions:
   - `calculateInvoiceSubtotal`
   - `calculateDiscountAmounts`
   - `buildInvoicePayload`

### Phase 2 (module-level reuse)
1. Introduce a configurable `CreateInvoicePage` wrapper around `BaseInvoiceForm`:
   - accepts API handlers (`fetchInvoiceNo`, `createInvoice`)
   - accepts module-specific feature flags (supplier required, expiry date shown, etc.)
   - accepts invoice type metadata
2. Move shared keyboard navigation/row focus logic into a custom hook (`useInvoiceRowNavigation`).

### Phase 3 (platform-level reuse)
1. Build a generic `EntityCrudModule` pattern:
   - list page template
   - create/edit form template
   - details page template
2. Standardize module folder contracts (pages/hooks/services/components + index exports).
3. Add architecture docs and examples for creating new modules with minimal boilerplate.

## Expected impact
- Fewer duplicated bugs across invoice modules.
- Faster feature rollout because shared components are updated once.
- Cleaner onboarding for developers creating new modules/pages.
- Lower code volume in page components and better testability of isolated shared logic.
