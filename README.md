# Expert POS (Web)

Enterprise-grade point of sale experience with multi-role security, written with Next.js 14, TypeScript, Tailwind CSS, and Zustand. It models real-world cashier and administrator workflows while enforcing precise permissions, audit logging, and session tracking.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the dashboard. The application ships with seeded operator accounts:

| Username       | Password        | Role        | Notes                                                      |
|----------------|-----------------|-------------|------------------------------------------------------------|
| supervisor     | supervisor@123  | Super User  | Full control. Cannot be deleted or restricted.             |
| amy.admin      | admin@123       | Admin       | Manages roles, users, catalog, and sales.                  |
| nick.normal    | normal@123      | Normal User | Operational oversight without destructive permissions.     |
| cora.cashier   | cashier@123     | Cashier     | Point-of-sale only. Cannot edit catalog or void sales.     |

## Features

- **Role-based Access Control** — Super User, Admin, Normal User, and Cashier roles with configurable permissions, secured via strict guardrails in the state layer.
- **Secure Authentication Flows** — Login and logout generate traced sessions with timestamps for compliance-grade auditing.
- **Transaction Attribution** — Every sale or purchase captures the operator username and ISO timestamp.
- **Admin Console** — Manage users, assign roles, and customize permissions. Super Users cannot be removed or downgraded.
- **Catalog Safeguards** — Cashier mode blocks product edits and sale deletions. Admins handle catalog and pricing supervision.
- **Inventory & Purchasing** — Stock visibility, product lifecycle management, and purchase logging with responsible user tracking.
- **Reporting Suite** — Real-time revenue, spending, and profit analytics with drill-down details.
- **Comprehensive Audit Trail** — Chronological feed of privileged actions and authentication events.
- **State Management** — Centralized, persisted state via Zustand with clean architectural boundaries and DI-style services.
- **Testing** — Vitest coverage validates critical role and permission rules to prevent regressions.

## Scripts

- `npm run dev` — Start the development server.
- `npm run build` — Production build with type checks and linting.
- `npm start` — Run the compiled production server.
- `npm run test` — Execute Vitest unit tests.
- `npm run lint` — Run ESLint static analysis (invoked during the build).

## Architecture

- **Next.js App Router** for routing and server boundaries.
- **Zustand** for the application store, seeded with realistic catalog data, users, and roles.
- **Tailwind CSS** styling for responsive, maintainable UI.
- **Modular Services & Hooks** delivering MVVM-style separation between state, view models, and presentation components.

Deploy-ready for Vercel via `npm run build` followed by `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c4e44f4d`.
