# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Doser is a Next.js 15 application for cannabis dosage calculation and session tracking. It uses Supabase for authentication and database, Dodo Payments for subscription management, Statsig for analytics, and Sentry for error monitoring. The app targets medical cannabis users who want to accurately track their consumption and dosage.

For documentation on any package or product used in this app, refer to context7 mcp.

## Development Commands

### Running the Application
```bash
npm run dev              # Start development server with Turbopack (requires .env.local)
npm run dev:tunnel       # Start dev server with ngrok tunnel (for webhook testing)
npm run build            # Build for production
npm start                # Start production server
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Run Jest in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run Playwright with UI
npm run test:e2e:headed  # Run Playwright in headed mode
```

### Linting
```bash
npm run lint             # Run ESLint
```

## Architecture

### Route Groups & Authentication

The app uses Next.js App Router with route groups:
- `(public)/` - Unauthenticated pages (landing, auth, signup, pricing)
- `(authorised)/` - Protected pages requiring authentication (dashboard, calculator, sessions, preferences, billing)
- `api/` - API routes for backend operations

**Middleware**: All routes go through middleware (middleware.ts → src/lib/supabase-middleware.ts) which handles session refresh and authentication checks.

**Route Protection**: The `(authorised)` layout uses `<ProtectedRoute>` component to enforce authentication. This checks session validity and redirects to `/auth` if not authenticated.

### State Management

**Client-Side Context Providers** (layered in src/app/layout.tsx):
1. `AuthProvider` - Manages Supabase auth state, handles sign up/in/out
2. `UserDataProvider` - Manages subscription data with sessionStorage caching (5-min TTL)
3. `StatsigProvider` - Analytics and feature flags

**Key Pattern**: UserDataProvider fetches subscription status from `/api/subscriptions/status` and caches it in sessionStorage to reduce API calls. Call `refetch()` to invalidate cache after subscription changes.

### Supabase Integration

**Three Supabase Client Types**:
1. **Browser Client** (src/lib/supabase-browser.ts) - For client components
2. **Server Client** (src/lib/supabase-server.ts → createSupabaseServerClient) - For server components/actions, respects RLS
3. **Service Client** (src/lib/supabase-server.ts → createSupabaseServiceClient) - For webhooks/admin operations, bypasses RLS

**Database Schema** (see src/lib/database.types.ts):
- `profiles` - User profile data (linked to auth.users)
- `user_subscriptions` - Subscription records with Dodo Payments IDs
- `sessions` - User vaping sessions with effects tracking
- `vaporizer_sessions` - Join table for sessions-vaporizers

**Important**: Always use the service client in webhook handlers to bypass RLS policies.

### Payment Flow (Dodo Payments)

**Key Service**: `DodoService` (src/lib/dodo-service.ts)

**Subscription Creation Flow**:
1. User selects plan on `/pricing` page
2. Frontend calls `/api/checkout` with plan_id
3. Backend creates/retrieves Dodo customer via `DodoService.getOrCreateCustomer()`
4. Creates checkout session via Dodo SDK
5. User completes payment at Dodo-hosted checkout
6. Dodo sends webhook to `/api/webhooks/dodo-payments`
7. Webhook handler calls `DodoService.handleWebhookEvent()` which updates `user_subscriptions` table
8. User redirected to `/billing/success`

**Webhook Events Handled**:
- `subscription.active` - New/renewed subscription
- `subscription.cancelled` - Cancellation
- `subscription.expired` - Expiration
- `payment.succeeded` - Successful payment
- `payment.failed` - Failed payment

**Subscription Plans** (defined in src/lib/dodo-types.ts):
- Learn: £4.99/month - Basic calculations
- Track: £9.99/month - Unlimited calculations + session tracking
- Optimize: £19.99/month - Advanced features + medical profiles

### Calculator System

**Core Logic**: src/lib/calculator.ts

The dosage calculator supports two measurement methods:
- **Chamber Method**: User specifies chamber weight and total draws
- **Capsule Method**: User specifies capsules used and draws per capsule

**Key Inputs**:
- Vaporizer type (affects efficiency calculations)
- THC/CBD percentages
- Desired dose (mg)
- Higher accuracy mode (enables detailed inhalation calculations)

**Outputs**:
- Recommended dose
- Inhalations needed
- Capsules/chambers needed
- Confidence level (0-100)
- Warnings array

**Vaporizer Data**: src/data/vapes contains device-specific parameters (efficiency, chamber capacity, etc.)

### Session Tracking

**Service**: src/lib/sessionService.ts

Sessions capture:
- Vaporizer used
- Material (strain name)
- THC/CBD content
- Number of inhalations
- Effects experienced (energy, mood, creativity, etc.)
- Medical benefits
- Timestamp

**UI Components**:
- src/components/sessions/ - Session cards, filters, grids
- src/app/(authorised)/sessions/page.tsx - Main sessions page

### Styling & UI

**Stack**: Tailwind CSS v4 + shadcn/ui components

**Custom Theme** (tailwind.config.ts):
- Custom color palette under `doser.*` (green accent, dark backgrounds)
- Custom animations and shadows
- Dark mode enabled via `class` strategy

**Component Library**: src/components/ui/ contains shadcn components (Button, Card, Dialog, etc.)

**Installation**: Use `npx shadcn@latest add <component>` to add new shadcn components

### Error Handling & Monitoring

**Sentry Integration** (sentry.*.config.ts):
- Client-side errors (sentry.client.config.ts)
- Server-side errors (sentry.server.config.ts)
- Edge runtime errors (sentry.edge.config.ts)

**Error Logger**: src/lib/error-logger.ts provides `logError()`, `logWarning()`, `logInfo()` helpers that integrate with Sentry

**Pattern**: Wrap webhook/API handlers with Sentry spans for distributed tracing

### Environment Variables

**Required Variables** (checked by verify-env.js):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_ENVIRONMENT` (test_mode | live_mode)
- `DODO_PAYMENTS_WEBHOOK_KEY`
- `NEXT_PUBLIC_APP_URL` (used for redirects)
- `UPSTASH_REDIS_REST_URL` (rate limiting)
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY` (emails)
- `NEXT_PUBLIC_STATSIG_CLIENT_KEY`
- `SENTRY_*` variables for error tracking

**Dev Server**: The `npm run dev` script runs `verify-env.js` first to validate environment setup

### Development Workflow

**Webhook Testing**: Use `npm run dev:tunnel` which starts ngrok tunnel for webhook testing. Update `DEV_WEBHOOK_URL` in .env.local and configure in Dodo Payments dashboard.

**Database Migrations**: SQL migration files are in the root directory with naming pattern `*.sql`. Apply via Supabase dashboard or CLI.

**Testing Patterns**:
- Unit tests in `__tests__` directories colocated with source
- E2E tests in `tests/e2e/`
- Use Testing Library for React component tests
- Playwright for E2E browser tests

**Type Safety**: Database types are generated in src/lib/database.types.ts - regenerate when schema changes

## Important Patterns

### When Creating New API Routes
1. Use appropriate Supabase client (server for RLS, service for admin)
2. Implement rate limiting via src/lib/rate-limit.ts
3. Add Sentry error tracking
4. Return consistent JSON responses with error handling

### When Modifying Subscription Logic
1. Update both webhook handler and DodoService
2. Test with ngrok tunnel + Dodo test webhooks
3. Verify user_subscriptions table updates correctly
4. Invalidate UserDataProvider cache if needed (call refetch())

### When Adding New UI Components
1. Prefer shadcn components over custom implementations
2. Use `doser.*` theme colors for consistency
3. Support both mobile and desktop viewports
4. Add loading states and error boundaries

### When Working with Authentication
1. Server components: Use createSupabaseServerClient()
2. Client components: Use useAuth() hook
3. Check session validity before protected operations
4. Handle email verification flow (see src/app/(public)/auth/verified/)

## Key Files Reference

- **Auth**: src/context/AuthContext.tsx, src/components/auth/ProtectedRoute.tsx
- **Subscriptions**: src/lib/dodo-service.ts, src/app/api/webhooks/dodo-payments/route.ts
- **Calculator**: src/lib/calculator.ts, src/app/(authorised)/calculator/page.tsx
- **Sessions**: src/lib/sessionService.ts, src/app/(authorised)/sessions/page.tsx
- **Database Types**: src/lib/database.types.ts
- **Middleware**: middleware.ts → src/lib/supabase-middleware.ts
