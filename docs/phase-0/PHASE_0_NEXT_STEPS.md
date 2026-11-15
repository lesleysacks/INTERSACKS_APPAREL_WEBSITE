# InterSacks Apparel — Phase 0 Next Steps

This roadmap records follow-up work, not implementation authorization. No roadmap feature is implemented by this documentation change. Do not replace the existing React/Vite architecture or alter current product/artwork assets as part of these steps.

## Priority 0 — Baseline confidence

1. In a local clone, fetch and verify the feature branch, inspect `git status --short`, and preserve any pre-existing work.
2. Run the asset audit and review its generated diff before accepting any generated inventory changes.
3. Run `npm ci`, `npm test`, and `npm run build`; capture exact output and resolve any issue in a separately scoped proposal.
4. Manually run `ACCEPTANCE_TESTS.md` on supported mobile/desktop viewports; check keyboard-only navigation, screen-reader semantics, focus visibility, contrast, and actual image/network failures.
5. Reconcile catalogue and asset references; human-review all possible visual duplicates. No automated removal, rename, or replacement of source artwork.

## Critical bugs and correctness

- Resolve only reproducible failures found by the above checks, with focused tests and a reviewed, isolated change.
- Ensure product catalogue image paths and all build-time references resolve on case-sensitive hosting.
- Confirm quantity, cart totals, and WhatsApp message details remain consistent; browser state and displayed prices are not authoritative records.
- Verify the Pages workflow behavior without triggering deployment; deployment remains manual and outside Phase 0.

## Security improvements (backend-dependent)

Before accepting design/order submissions, architect and threat-model a real backend. Requirements include:

- Server-side validation of product, variant, size, quantity, pricing, and submitted data; never trust browser-calculated totals.
- Rate limiting, request throttling, bot protection, spam prevention, and abuse monitoring.
- Input sanitisation and safe output handling.
- Artwork file type and size validation, content inspection where appropriate, upload isolation, and access-controlled storage.
- Duplicate submission prevention/idempotency and secure administrator authentication/authorization.
- Audit logs for submissions, approval decisions, admin actions, and payment/order state changes.
- Secure secret handling, transport/storage controls, retention policy, and operational alerting.

These controls require server-side enforcement and operational infrastructure. A fake frontend-only validation, CAPTCHA appearance, or hidden admin link is not a security implementation.

## UX improvements

- Validate current mobile navigation, responsive layouts, empty/error states, and checkout handoff with manual acceptance testing.
- Review descriptive alt text, keyboard focus/order, status announcements, labels, tap target sizes, contrast, and reduced-motion behavior with actual assistive technology.
- Improve visible order expectations and the approval/payment sequence only after business and backend flows are defined.

## Product customizer improvements

Current code supports selecting garment, colour, size, compatible artwork, placement, quantity, preview, and client-side price before adding to the browser cart. Before extending the customizer, document production constraints and approve a backend architecture.

Business decisions to preserve for future design:

1. The customer designs and previews their product.
2. The customer submits the design for approval.
3. InterSacks receives a notification when an approval request is submitted.
4. The administrator receives the design and order details.
5. Artwork uploads are managed by the administrator.
6. Payment occurs only after approval.
7. Audit the architecture before implementation.

Future work must define authoritative product/pricing validation, submission lifecycle, approval/revision states, notifications, order persistence, and upload ownership. Do not implement this flow in the static frontend alone.

## Performance improvements

- Measure the built site before proposing optimization. Inspect generated AVIF/WebP variants, image payload sizes, font fetch behavior, and largest-contentful paint using reproducible tooling.
- Confirm that builds work with expected network availability; the font helper may fetch Google Fonts when vendored files/stamp do not match.
- Preserve originals and compare display derivatives for visual quality before any change.

## Future ecommerce functionality (not in this baseline)

Potential later phases may evaluate secure approval/order persistence, administrator-managed artwork, stock/inventory, payment after approval, customer accounts or order history, email/notification delivery, and supplier integrations. These require business requirements, privacy/security review, backend design, and explicit approval. They are not current features and must not be added as part of Phase 0.
