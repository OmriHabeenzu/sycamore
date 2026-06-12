# Sycamore — SACCO Management Platform

## What We're Building
A multi-tenant SACCO (Savings and Credit Cooperative Organization) management platform.
Working name: **Sycamore** (final name TBD by team).
Built by Stalwart Zambia — other SACCOs subscribe to use it, Stalwart also runs their own SACCO on it.

## Business Context
- Moved away from loan management due to heavy BoZ compliance/regulation on money lending in Zambia
- SACCOs are governed by the Cooperatives Act — less regulatory burden
- Most SACCOs in Zambia still use Excel or nothing — huge market gap
- Reference: carecoop.org for feature inspiration

## Folder Structure
```
c:\laragon\www\lms\          ← Laravel backend (already installed)
c:\laragon\www\lms\frontend\ ← React + Vite frontend (not set up yet)
```

## Tech Stack
- **Backend:** Laravel (PHP) — routing, models, migrations, multi-tenancy
- **Frontend:** React + Vite + Tailwind — JavaScript (not TypeScript)
- **Database:** MySQL/MariaDB — single DB, all tenants separated by `company_id`
- **Node.js:** `/c/laragon/bin/nodejs/node-v22/node.exe`
- **PHP:** `/c/laragon/bin/php/php-8.3.26-Win32-vs16-x64/php.exe`

## Multi-Tenancy Model
- Each SACCO = one tenant with their own `company_id`
- All tenant data in the same database, filtered by `company_id`
- Stalwart has a **super-admin** account with cross-tenant view
- Super admin can: onboard SACCOs, manage subscriptions, view all revenue, suspend tenants

## How a SACCO Works (core logic to build around)
- Members save regularly (weekly/monthly contributions)
- Members borrow from the pooled savings at low interest
- Interest earned goes back to members as dividends at year end
- Member-owned — one member, one vote
- Governed by elected officials (chairman, treasurer, secretary)

## Core Features to Build
### Member Management
- Member registration (personal details, next of kin, documents)
- Member shares/contributions tracking
- Member savings accounts
- Member statements

### Savings & Contributions
- Record regular savings per member
- Track share capital contributions
- Savings account balance per member
- Withdrawal requests

### Internal Lending (from the pool)
- Loan application by members
- Approval workflow
- Loan disbursement recording
- Repayment schedule generation (flat rate + reducing balance)
- Repayment collection tracking
- Overdue tracking and penalties

### Financials
- Income statement
- Balance sheet
- Dividends calculation at year end
- Collections sheet
- Portfolio report

### Governance
- Board member roles (chairman, treasurer, secretary)
- Meeting minutes recording
- Voting/resolutions (future)

### Subscription & Super Admin
- Tiered pricing per SACCO (based on member count or flat fee)
- Super admin dashboard across all tenants
- Billing and subscription management
- Tenant onboarding

## Extra Features (beyond basic SACCO software)
- SMS reminders for loan repayments and savings due
- Mobile-friendly view for field officers
- WhatsApp notifications
- Exportable PDF reports
- Custom branding per SACCO (logo, colors)
- Mobile money integration (MTN/Airtel) for contributions and repayments

## Frontend Setup (not done yet)
Run these commands to set up the frontend:
```bash
cd c:\laragon\www\lms
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios recharts lucide-react
npx tailwindcss init -p
```

## Developer Notes
- User is familiar with React + Vite + Tailwind (from Stalwart project)
- User is new to Laravel — explain Laravel concepts clearly when needed
- **Build the database schema first and get approval before writing any feature code**
- Keep responses concise — user prefers short, direct answers
- Design should be clean and modern — custom UI, not copying any existing system's look
