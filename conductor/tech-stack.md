# Technology Stack: Spendless

## Frontend
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Framework:** [React v19](https://react.dev/)
- **UI Library:** [Ionic Framework v8](https://ionicframework.com/docs/) (React-specific components)
- **State Management:** [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
- **Routing:** [React Router v5](https://v5.reactrouter.com/)
- **Form Management:** [React Hook Form](https://react-hook-form.com/)
- **Styling:**
  - [Styled-components](https://styled-components.com/)
  - [Emotion](https://emotion.sh/docs/introduction)
  - Vanilla CSS for global positioning and layout.
- **Charts:** [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://react-chartjs-2.js.org/)

## Mobile & PWA
- **Mobile Bridging:** [Capacitor v7](https://capacitorjs.com/) (Supporting iOS and Android)
- **PWA:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) for offline capabilities and installation prompts.

## Backend & Infrastructure
- **BaaS:** [Firebase](https://firebase.google.com/)
  - **Authentication:** For user sign-up and sign-in.
  - **Firestore:** NoSQL database for expense, wallet, and period data.
  - **Cloud Functions:** For server-side logic (e.g., Stripe integration).
  - **Hosting:** For the PWA version.
  - **Storage:** For user-related media.
- **Payments:** [Stripe](https://stripe.com/) (using `@stripe/stripe-js`)
- **Monitoring:** [Sentry](https://sentry.io/) (Error tracking and performance monitoring)

## Tooling & Quality
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Linting & Formatting:** [Biome](https://biomejs.dev/)
- **Testing:**
  - **Unit Testing:** [Vitest](https://vitest.dev/)
  - **Component Testing:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - **E2E Testing:** [Cypress](https://www.cypress.io/)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) for automated deployments to Firebase Hosting.
- **Localization:** [i18next](https://www.i18next.com/) with [react-i18next](https://react.i18next.com/)