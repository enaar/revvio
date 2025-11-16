# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js SaaS starter template with authentication, Stripe payments, and team management. Built with Next.js 15 (canary), React 19, TypeScript, Drizzle ORM, and PostgreSQL.

## Development Commands

### Initial Setup
```bash
pnpm install                # Install dependencies
pnpm db:setup              # Create .env file (interactive)
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed database with test user (test@test.com / admin123)
```

### Development
```bash
pnpm dev                   # Start dev server with Turbopack
pnpm build                 # Build for production
pnpm start                 # Start production server
```

### Database Operations
```bash
pnpm db:generate           # Generate Drizzle migrations
pnpm db:migrate            # Apply migrations
pnpm db:studio             # Open Drizzle Studio GUI
```

### Stripe Local Testing
```bash
stripe login              # Login to Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Listen for webhooks
```

## Architecture

### Authentication & Authorization

**Session Management**
- JWT-based sessions stored in HTTP-only cookies (24-hour expiry)
- Session tokens signed with `AUTH_SECRET` using jose library
- Automatic session renewal on GET requests via global middleware (`middleware.ts:18-33`)
- Session functions in `lib/auth/session.ts`: `getSession()`, `setSession()`, `verifyToken()`

**Route Protection**
- Global middleware protects all `/dashboard/*` routes (`middleware.ts:5,10-14`)
- Unauthenticated users redirected to `/sign-in`
- User data fetched via `getUser()` from `lib/db/queries.ts:7-37`

**Server Action Middleware**
Three middleware patterns for Server Actions in `lib/auth/middleware.ts`:
1. `validatedAction` - Validates Zod schema only
2. `validatedActionWithUser` - Validates schema + ensures authenticated user
3. `withTeam` - Ensures user has team membership

### Database Schema

**Core Tables** (`lib/db/schema.ts`)
- `users` - User accounts with soft delete support (deletedAt)
- `teams` - Team entities with Stripe integration fields
- `teamMembers` - Many-to-many join table (users ↔ teams) with roles
- `activityLogs` - Audit trail for user actions
- `invitations` - Pending team invitations

**Revvio Tables** (`lib/db/schema.ts`)
- `businessProfiles` - Business information with review platform URLs (Google, Facebook, Yelp) and onboarding status
- `customers` - Customer contact information linked to businesses
- `reviewRequests` - Review request campaigns with tracking and status (pending/sent/failed/clicked/reviewed)
- `subscriptions` - User subscription plans with usage tracking and monthly limits

**Relationships**
- Users can belong to multiple teams via `teamMembers`
- Each team has multiple members with roles (owner/member)
- Activity logs track all user actions per team
- Users can have multiple business profiles and subscriptions
- Business profiles have multiple customers and review requests
- Customers can have multiple review requests
- Review requests track engagement status (sent → clicked → reviewed)
- Drizzle relations defined at bottom of schema file

**Key Queries** (`lib/db/queries.ts`)
- `getUser()` - Gets current authenticated user from session cookie
- `getTeamForUser()` - Fetches user's team with all members (uses Drizzle relational queries)
- `getActivityLogs()` - Returns last 10 activity logs for current user
- `getBusinessProfile()` - Fetches business profile for current authenticated user

### Stripe Integration

**Payment Flow**
1. User clicks pricing tier → `createCheckoutSession()` called
2. Redirects to Stripe Checkout with 14-day trial
3. On success, redirects to `/api/stripe/checkout?session_id={id}`
4. Webhook updates team subscription data

**Webhook Handling** (`app/api/stripe/webhook/route.ts`)
- Listens for `customer.subscription.updated` and `customer.subscription.deleted`
- Verifies webhook signature with `STRIPE_WEBHOOK_SECRET`
- Updates team subscription status via `handleSubscriptionChange()`

**Customer Portal** (`lib/payments/stripe.ts:49-115`)
- Dynamically creates or reuses Billing Portal configuration
- Allows users to update subscription, payment method, or cancel

### App Structure

**Route Groups**
- `app/(login)/*` - Public auth pages (sign-in, sign-up)
- `app/(dashboard)/*` - Protected dashboard pages
- `app/(dashboard)/onboarding/*` - Multi-step onboarding flow for new businesses
- `app/(dashboard)/settings/business/*` - Business profile settings page
- `app/api/*` - API routes for Stripe and data endpoints

**Server Actions Pattern**
- All mutations use Server Actions (marked with `'use server'`)
- Actions in `app/(login)/actions.ts` handle auth, account, and team operations
- Actions in `app/(dashboard)/onboarding/actions.ts` handle business profile creation
- Each action logs activity via `logActivity()` helper function
- Actions return `ActionState` type with error/success messages

**Onboarding Flow** (`app/(dashboard)/onboarding/page.tsx`)
- 3-step wizard for new business setup using React Hook Form and Zod validation
- Step 1: Basic business information (name, phone, email)
- Step 2: Review platform links (Google required, Facebook/Yelp optional) with tooltips and help modals
- Step 3: Success page with next actions
- Form submission calls POST `/api/business/profile` endpoint
- Toast notifications (via Sonner) for success/error feedback
- localStorage persistence for form data (auto-save and restore)
- Validation schemas in `lib/validations/business.ts`
- Uses shadcn/ui components: Card, Input, Label, Progress, Tooltip, Dialog, Button
- Reusable `ReviewLinkHelpModal` component with platform-specific instructions
- Server actions in `app/(dashboard)/onboarding/actions.ts`:
  - `createBusinessProfile()` - Creates new business profile (legacy)
  - `updateBusinessProfile()` - Updates existing business profile (legacy)
- New users automatically redirected to `/onboarding` after sign-up
- Dashboard layout includes `OnboardingCheck` component that redirects to onboarding if profile missing
- Toaster component added to dashboard layout for toast notifications

**Business Settings Page** (`app/(dashboard)/settings/business/page.tsx`)
- Single-page form for editing existing business profile (unlike multi-step onboarding)
- Fetches existing profile via GET `/api/business/profile` on page load
- Shows loading skeleton while fetching data
- Pre-populates all form fields with existing business data
- Uses React Hook Form with same validation schema from `lib/validations/business.ts`
- Form sections:
  - Basic Information: business name, phone, email (all required)
  - Review Platform Links: Google (required), Facebook (optional), Yelp (optional)
- Features:
  - Unsaved changes detection and warning banner
  - Browser beforeunload warning if navigating away with unsaved changes
  - "Save Changes" button (disabled if no changes made)
  - "Cancel" button to discard changes and reset form
  - Displays "Last updated X time ago" using date-fns library
  - Inline validation errors
  - Toast notifications for success/error feedback
  - Loading states during submission
- Updates profile via POST `/api/business/profile` (same endpoint as onboarding)
- Reuses `ReviewLinkHelpModal` component for platform-specific instructions
- Responsive design for mobile and desktop
- Error handling for network errors, 404 (redirects to onboarding), and validation errors

**Data Fetching**
- Uses SWR for client-side data fetching with SSR fallback
- Initial data preloaded in root layout via SWRConfig fallback (`app/layout.tsx:30-37`)
- API routes provide fresh data:
  - `/api/user` - Current user data
  - `/api/team` - Team data with members
  - `/api/business-profile` - Business profile data (GET only, legacy)
  - `/api/business/profile` - Full business profile CRUD (GET, POST)

### Activity Logging

All user actions are logged to `activityLogs` table via `logActivity()` helper in `app/(login)/actions.ts:29-45`. Tracked events include:
- Authentication: SIGN_UP, SIGN_IN, SIGN_OUT
- Account: UPDATE_PASSWORD, DELETE_ACCOUNT, UPDATE_ACCOUNT
- Teams: CREATE_TEAM, REMOVE_TEAM_MEMBER, INVITE_TEAM_MEMBER, ACCEPT_INVITATION

### Key Patterns

**Soft Deletes**
- Users are soft-deleted with timestamp and email mangling
- Query filters include `isNull(users.deletedAt)` check
- See `deleteAccount` action in `app/(login)/actions.ts:295-339`

**Form Validation**
- Zod schemas define validation rules
- Server Actions use middleware to validate before execution
- Errors returned in ActionState format

**TypeScript Path Aliases**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Use for all imports: `@/lib/db/queries`, `@/components/ui/button`, etc.

## Environment Variables

Required variables (see `.env.example`):

**Database**
- `POSTGRES_URL` - PostgreSQL connection string

**Authentication**
- `AUTH_SECRET` - JWT signing secret (generate with `openssl rand -base64 32`)

**Stripe**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Application**
- `BASE_URL` - Application URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_APP_URL` - Public-facing URL for tracking links

**Twilio (SMS)**
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number for sending SMS

**SendGrid (Email)**
- `SENDGRID_API_KEY` - SendGrid API key
- `SENDGRID_FROM_EMAIL` - Sender email address

**Configuration Management**
- All environment variables are validated at runtime using Zod in `lib/config.ts`
- Import validated config: `import { config } from '@/lib/config'`
- Application fails fast on startup if required variables are missing or invalid

## Next.js Configuration

Experimental features enabled in `next.config.ts`:
- `ppr: true` - Partial Prerendering
- `clientSegmentCache: true` - Client-side segment caching
- `nodeMiddleware: true` - Node.js middleware support

Development uses Turbopack for faster builds.

Always update Claude.MD after a change has been made
