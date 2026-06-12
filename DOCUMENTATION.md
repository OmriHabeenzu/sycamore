# Sycamore System — Complete Documentation

**Prepared for:** Stalwart Services Limited internal handover  
**System:** Sycamore Agricultural Services Cooperative Management Platform  
**Last updated:** June 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Folder Structure](#2-folder-structure)
3. [Tech Stack](#3-tech-stack)
4. [Local Development Setup](#4-local-development-setup)
5. [How the System Works](#5-how-the-system-works)
6. [Admin Dashboard — Feature Guide](#6-admin-dashboard--feature-guide)
7. [Public Website — Feature Guide](#7-public-website--feature-guide)
8. [API Reference Summary](#8-api-reference-summary)
9. [Database Overview](#9-database-overview)
10. [Deployment Guide](#10-deployment-guide)
11. [What Is Complete](#11-what-is-complete)
12. [What Is Remaining](#12-what-is-remaining)
13. [Known Issues & Notes](#13-known-issues--notes)

---

## 1. System Overview

Sycamore is a digital management platform for **Sycamore Agricultural Services Cooperative** — a real SACCO (Savings and Credit Cooperative Organization) based in Zambia, managed by **Stalwart Services Limited**.

The system has three parts:

| Part | Purpose | URL (local) |
|------|---------|-------------|
| **Laravel API** | Backend — all business logic and database | `http://localhost/lms/lms/public/api` |
| **Admin Dashboard** | Staff interface — manage members, loans, savings, reports | `http://localhost:5173` |
| **Public Website** | Member-facing — information + membership application | `http://localhost:5174` |

### Core Concept — How a SACCO Works

- Members save a fixed amount every month (contributions)
- All member savings form a shared pool
- Members borrow from this pool at low interest rates
- Interest earned stays in the cooperative
- At year end, profits are distributed as dividends proportional to each member's savings
- The cooperative is member-owned — one member, one vote

---

## 2. Folder Structure

```
c:\laragon\www\lms\
│
├── lms\                        ← Laravel backend (PHP)
│   ├── app\
│   │   ├── Http\Controllers\Api\   ← All API controllers (20 controllers)
│   │   ├── Models\                 ← Eloquent models (26 models)
│   │   └── Services\              ← Business logic services
│   ├── database\
│   │   ├── migrations\            ← 19 migration files
│   │   └── seeders\
│   ├── routes\
│   │   └── api.php                ← All API routes
│   ├── config\
│   ├── .env                       ← Local environment config
│   ├── Dockerfile                 ← For Railway/Render deployment
│   ├── railway.json               ← Railway deployment config
│   └── render.yaml                ← Render deployment config
│
├── frontend\                   ← Admin Dashboard (React + Vite)
│   └── src\
│       ├── pages\                 ← All dashboard pages
│       ├── components\            ← Reusable components
│       ├── store\                 ← Redux state management
│       └── api\                   ← Axios API client
│
├── website\                    ← Public Website (React + Vite)
│   ├── src\
│   │   ├── pages\                 ← Home, About, Products, Membership, News, Contact
│   │   ├── components\            ← Navbar, Footer, WhatsApp button
│   │   ├── layouts\               ← PublicLayout wrapper
│   │   └── api\                   ← Axios client (points to Laravel API)
│   ├── dist\                      ← Built/deployable website files
│   ├── .env                       ← VITE_API_URL config
│   └── start.bat                  ← Start website dev server
│
├── start.bat                   ← Starts ALL three services at once
└── DOCUMENTATION.md            ← This file
```

---

## 3. Tech Stack

### Backend (Laravel)
- **PHP** 8.3 — `C:\laragon\bin\php\php-8.3.26-Win32-vs16-x64\php.exe`
- **Laravel** 11 — routing, models, migrations, API
- **Laravel Sanctum** — API token authentication
- **MySQL/MariaDB** — database (local: `lms` database, root user, no password)
- **Africa's Talking** — SMS integration (configured but not active)

### Frontend (Admin Dashboard & Website)
- **React 19** — UI framework
- **Vite 8** — build tool
- **Tailwind CSS 3** — utility-first styling
- **React Router v7** — client-side routing
- **Axios** — HTTP requests to the API
- **Lucide React** — icons
- **Recharts** — charts on the dashboard

### Node.js
- Version 22 — `C:\nvm4w\nodejs\node.exe`

---

## 4. Local Development Setup

### Prerequisites
- Laragon running (provides PHP + MySQL)
- Node.js v22 installed
- `lms` database created in MySQL

### Quick Start (All Three Services)

Double-click `c:\laragon\www\lms\start.bat`

This will:
1. Run any pending database migrations automatically
2. Open the Laravel API server in a terminal window
3. Open the Admin Dashboard dev server
4. Open the Website dev server

### Manual Start (Individual Services)

**Laravel API:**
```bash
cd c:\laragon\www\lms\lms
php artisan serve --port=8000
```

**Admin Dashboard:**
```bash
cd c:\laragon\www\lms\frontend
npm run dev
# Runs on http://localhost:5173
```

**Public Website:**
```bash
cd c:\laragon\www\lms\website
npm run dev
# Runs on http://localhost:5174
```

### First-Time Setup

```bash
# 1. Install Laravel dependencies
cd c:\laragon\www\lms\lms
composer install

# 2. Run all migrations
php artisan migrate

# 3. Install frontend dependencies
cd c:\laragon\www\lms\frontend
npm install

# 4. Install website dependencies
cd c:\laragon\www\lms\website
npm install
```

### Environment Files

**Backend** (`lms/lms/.env`):
```
DB_DATABASE=lms
DB_USERNAME=root
DB_PASSWORD=       ← empty for Laragon default
APP_KEY=base64:d/mYhjMZWT2iA4ukYv3pEEnlu4VkfUKxT4DuIQBOQVc=
```

**Website** (`lms/website/.env`):
```
VITE_API_URL=http://localhost/lms/lms/public/api
```

**Admin Dashboard** (`lms/frontend/.env` or similar) — check for `VITE_API_URL`

---

## 5. How the System Works

### Multi-Tenancy
Every record in the database has a `company_id`. This allows multiple SACCOs to use the same database without seeing each other's data. Currently only Sycamore (company_id = 1) exists. The super-admin (Stalwart Services Limited) can see all tenants.

### Authentication Flow
1. Staff log in at the admin dashboard with email + password
2. Laravel Sanctum issues an API token
3. All subsequent requests include the token in the `Authorization: Bearer` header
4. Each request is scoped to the logged-in user's `company_id`

### Member Lifecycle
```
Website Application (pending) → Admin Reviews → Active Member
     ↓
  Contributes Monthly (Contributions)
     ↓
  Builds Savings Balance
     ↓
  Eligible for Loans
     ↓
  Receives Dividends at Year End
```

### Loan Lifecycle
```
Applied → Approved → Disbursed → Active → [Repayments] → Completed
                  ↘ Rejected
                                        ↘ Overdue / Written Off
```

Loan features:
- **Two interest methods:** Flat Rate or Reducing Balance
- **Repayment frequencies:** Daily, Weekly, Biweekly, Monthly, Quarterly
- **Automatic schedule generation** on disbursement
- **Top-up** — add more principal to active loan
- **Restructure** — modify terms of an active loan
- **Write-off** — mark irrecoverable loans
- **Overdue tracking** — automatic `is_overdue` flag

### Savings Accounts
Each member has a savings account separate from their contributions. Accounts support deposits, withdrawals, and interest posting.

### Contributions vs Savings
- **Contributions** — regular monthly payments (the SACCO savings commitment)
- **Savings Accounts** — a separate general savings account per member
- Both count towards the member's financial profile

### Dividends
At year end, the admin calculates dividends based on:
- Total cooperative profit
- Each member's contribution/savings proportion
The dividend can then be approved and distributed.

---

## 6. Admin Dashboard — Feature Guide

Login URL: `http://localhost:5173`

### Members (Borrowers)
- **List** — search by name, phone; filter by status
- **Add member** — personal details, employment, photo
- **Member detail** — full profile with tabs for loans, savings, shares, contributions, documents
- **Member statement** — printable financial statement
- **Documents** — upload NRC copy, pay slips, etc.
- **Next of kin** — stored per member

### Loan Products
Define the templates for loans:
- Name, default interest rate, method (flat/reducing)
- Min/max amount, min/max term
- Default fees and charges

### Loans
- **Create loan** — select member, product, enter terms, preview schedule before submitting
- **Approve/Reject** — workflow step before disbursement
- **Disburse** — confirm actual payment out; schedule is generated
- **Record repayment** — enter amount received; receipt generated
- **View schedule** — full amortization table
- **Loan statement** — printable
- **Top-up** — add to existing loan
- **Restructure** — change terms
- **Write-off** — mark as uncollectable
- **Guarantors** — link other members as guarantors
- **Collateral** — record assets pledged
- **Charges** — add processing fees, penalties, etc.

### Savings
- Open savings account per member
- Deposit / Withdraw
- Post interest
- View transaction history

### Member Shares
- Record share purchases
- View total share capital per member and overall summary

### Contributions
- Record monthly contributions per member
- View contribution schedule
- Delete incorrect entries

### Repayments
- Company-wide repayments list
- View individual repayment details

### Expenses
- Record cooperative operating expenses
- Used in income statement calculation

### Groups
- Create member groups (e.g. group loans)
- Add/remove members from groups

### Reports
| Report | What it shows |
|--------|--------------|
| Collections Sheet | All repayments in a period |
| Portfolio Report | Active loans summary |
| Aging Analysis | Overdue loans by days overdue |
| Officer Performance | Repayments by loan officer |
| Income Statement | Revenue vs expenses |
| Balance Sheet | Assets, liabilities, equity |

### Dividends
- Calculate dividends for a financial year
- Review per-member allocation
- Approve and mark as distributed

### Governance
- **Board members** — record elected officials (chairman, treasurer, secretary, etc.)
- **Meeting minutes** — record and store minutes of board/general meetings

### Settings
- **Company settings** — update SACCO name, logo, contact info
- **Users** — add staff accounts, set roles, reset passwords
- **SMS logs** — view all SMS messages sent by the system

### Super Admin (Stalwart Services Limited only)
- Overview of all tenants
- Add new SACCO tenants
- Suspend / activate tenants
- Edit tenant details

---

## 7. Public Website — Feature Guide

URL: `http://localhost:5174` (dev) or Netlify URL (preview)

### Pages

| Page | Path | Key Content |
|------|------|-------------|
| Home | `/` | Hero, stats, product overview, 5-step join process, values, CTA |
| About | `/about` | Who we are, mission/vision, milestones, governance structure |
| Products | `/products` | Savings accounts, loan types, farm investment, benevolent fund |
| Membership | `/membership` | Benefits, 5-stage process, **membership application form** |
| News | `/news` | Updates and announcements (static for now) |
| Contact | `/contact` | Contact info + contact form |

### Membership Application Form
When a visitor submits the form on `/membership`:
1. Data is sent to `POST /api/public/membership-applications` (no login required)
2. A **pending** Borrower record is created in the database
3. The admin sees this in the dashboard under Members, filtered by status = pending
4. Staff then follow up, conduct orientation, and activate the member

**Fields collected:**
- Full name, NRC number, phone, email (optional)
- Occupation, monthly savings commitment
- Next of kin (name, phone, relationship)
- Referring member's name
- Additional notes

### Design System
- **Primary color:** Bush green (`#265c3c` dark, `#2d7249` medium)
- **Accent color:** Earthy amber (`#d4841f`)
- **Fonts:** Montserrat (headings) + Inter (body)
- **Logo:** SVG file at `website/public/logo.svg`

---

## 8. API Reference Summary

Base URL: `/api`

### Public (No Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/login` | Staff login |
| POST | `/public/membership-applications` | Submit membership application from website |

### Protected (Requires Bearer Token)
| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/logout`, `GET /auth/me` |
| Dashboard | `GET /dashboard` |
| Members | `GET/POST /borrowers`, `GET/PUT/DELETE /borrowers/{id}` |
| Loans | Full CRUD + `/approve`, `/reject`, `/disburse`, `/top-up`, `/restructure`, `/write-off` |
| Loan Products | Full CRUD `/loan-products` |
| Repayments | `GET /repayments`, `GET/POST /loans/{id}/repayments` |
| Savings | `GET/POST /savings`, deposit, withdraw, post-interest |
| Shares | `GET/POST /members/{id}/shares`, `/summary` |
| Contributions | `GET/POST /contributions`, per-member view, schedules |
| Expenses | Full CRUD `/expenses` |
| Groups | Full CRUD `/groups` + member add/remove |
| Guarantors | Per-loan CRUD |
| Collateral | Per-loan CRUD |
| Documents | Per-borrower and per-loan upload/download/delete |
| Charges | Per-loan charges, mark-paid |
| Dividends | Calculate, store, approve, distribute |
| Governance | Board members, meeting minutes |
| Reports | 6 report endpoints under `/reports/*` |
| Settings | Company, users, SMS logs |
| Super Admin | Tenant management under `/admin/*` |

---

## 9. Database Overview

Database name: `lms` (MySQL local) / PostgreSQL (production)

### Key Tables

| Table | Purpose |
|-------|---------|
| `companies` | SACCO tenants — each is one cooperative |
| `users` | Staff accounts — linked to a company |
| `borrowers` | Members — the people who save and borrow |
| `next_of_kin` | Emergency contacts per member |
| `loan_products` | Loan templates/configuration |
| `loans` | Individual loan records |
| `loan_schedules` | Repayment schedule per loan (auto-generated) |
| `repayments` | Actual payments received |
| `loan_charges` | Fees and penalties on loans |
| `guarantors` | Members guaranteeing other members' loans |
| `collateral` | Assets pledged against loans |
| `savings_accounts` | Savings account per member |
| `savings_transactions` | Deposits/withdrawals on savings |
| `member_shares` | Share capital per member |
| `share_transactions` | Share purchase history |
| `contributions` | Monthly contribution records |
| `contribution_schedules` | Expected monthly contribution per member |
| `expenses` | Cooperative operating expenses |
| `groups` | Member groups |
| `group_members` | Pivot — members in groups |
| `dividends` | Year-end dividend declarations |
| `dividend_allocations` | Per-member dividend amounts |
| `board_members` | Governance — elected officials |
| `meeting_minutes` | Governance — meeting records |
| `documents` | Uploaded files (polymorphic — for borrowers and loans) |
| `sms_logs` | SMS messages sent |
| `activity_logs` | Audit trail of system actions |
| `personal_access_tokens` | Sanctum auth tokens |

### Important Migration Notes
- Migration `000019` adds `status`, `occupation`, `referred_by`, `notes`, `monthly_savings_commitment` to the `borrowers` table
- **This migration must be run** (`php artisan migrate`) before the membership application form on the website will work correctly

---

## 10. Deployment Guide

### Current Deployment (Preview)
- **Website:** Deployed to Netlify (drag dist folder to netlify.com/drop)
- **API:** Local only
- **Admin Dashboard:** Local only

### Full Production Deployment

#### Step 1 — Push to GitHub
```bash
cd c:\laragon\www\lms
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/sycamore.git
git push -u origin main
```

#### Step 2 — Deploy API to Railway
1. Go to railway.app → New Project → Deploy from GitHub repo
2. Select the `lms/lms` subfolder as the root
3. Railway auto-detects the Dockerfile
4. Add a PostgreSQL plugin in Railway
5. Set these environment variables in Railway:
   ```
   APP_ENV=production
   APP_KEY=base64:d/mYhjMZWT2iA4ukYv3pEEnlu4VkfUKxT4DuIQBOQVc=
   APP_DEBUG=false
   DB_CONNECTION=pgsql
   DB_HOST=[Railway provides this]
   DB_PORT=5432
   DB_DATABASE=[Railway provides this]
   DB_USERNAME=[Railway provides this]
   DB_PASSWORD=[Railway provides this]
   ```
6. Railway will deploy and give you a URL like `https://sycamore-api.railway.app`

#### Step 3 — Deploy Website to Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Set root directory to `website`
3. Set environment variable: `VITE_API_URL=https://sycamore-api.railway.app/api`
4. Deploy — Vercel gives you a URL like `https://sycamore.vercel.app`

#### Step 4 — Deploy Admin Dashboard to Vercel
1. New Vercel project → same repo
2. Set root directory to `frontend`
3. Set `VITE_API_URL=https://sycamore-api.railway.app/api`
4. Deploy

#### Step 5 — Run Migrations on Production
In Railway dashboard → open the deployed service shell:
```bash
php artisan migrate --force
php artisan db:seed  # if seeders are ready
```

---

## 11. What Is Complete

### Backend (Laravel API) ✅
- Authentication with tokens (login, logout, user profile)
- Multi-tenancy (all data scoped by company_id)
- Full member management (CRUD + documents + next of kin)
- Loan products configuration
- Complete loan lifecycle (apply → approve → disburse → repay → complete)
- Loan schedule generation (flat rate + reducing balance)
- Repayment recording and tracking
- Overdue loan detection
- Top-up, restructure, write-off
- Guarantors and collateral
- Savings accounts (deposit, withdraw, interest posting)
- Member shares and share transactions
- Monthly contributions and contribution schedules
- Expenses tracking
- Member groups
- Loan charges and penalties
- Document uploads (for members and loans)
- 6 financial reports
- Dividend calculation, approval, and distribution
- Governance (board members + meeting minutes)
- SMS log storage
- Activity logging
- Super admin (tenant management)
- Company and user settings
- Public membership application endpoint (unauthenticated)

### Admin Dashboard (React) ✅
- Login page with token auth
- Dashboard with live stats and charts
- All member pages (list, form, detail, statement)
- Contribution and share panels per member
- Loan pages (list, form, detail, statement)
- Repayment form and receipt
- Loan top-up, restructure forms
- Guarantors, collateral, charges panels
- Document upload/view per member and loan
- Loan products pages
- Savings pages (list, form, detail, deposit/withdraw)
- Repayments list
- Expenses pages
- Groups pages
- All 6 report pages
- Dividends page
- Governance page
- Super admin page
- Settings (company + users)

### Public Website ✅
- All 6 pages fully built
- Bush green + earthy amber design system
- Responsive (mobile + desktop)
- Membership application form connected to API
- SVG logo file

---

## 12. What Is Remaining

### High Priority

| Item | Description | Effort |
|------|-------------|--------|
| **Run migration 000019** | Adds `status`, `occupation`, `referred_by` etc. to borrowers. Required for membership form to work. `php artisan migrate` | 2 min |
| **Replace website placeholders** | Phone numbers, email, social media links, real photos | 1–2 hrs |
| **Create first admin user** | Need a seeder or manual DB insert for the first login account | 30 min |
| **Production deployment** | Deploy full stack (API on Railway, frontends on Vercel) | 2–4 hrs |
| **Custom domain** | Purchase and configure domain (e.g. sycamorecoop.zm) | 1 hr |

### Medium Priority

| Item | Description | Effort |
|------|-------------|--------|
| **SMS sending** | Africa's Talking is configured (`AT_*` in `.env`) but no sending logic is built. Models and logs exist. Need service to send actual SMS for reminders, repayment alerts | 1–2 days |
| **WhatsApp notifications** | Planned but not built. Could use Twilio WhatsApp or Africa's Talking | 2–3 days |
| **PDF report export** | Reports display in browser but can't be downloaded as PDF. Add a library like dompdf (backend) or react-pdf (frontend) | 1–2 days |
| **Pending member approval flow** | Website form creates `pending` borrowers — admin needs a clear UI flow to review, contact, and activate them | 1 day |
| **Loan officer assignment** | Field exists in the database and form but no dedicated loan officer management screen | 1 day |

### Lower Priority / Future

| Item | Description | Effort |
|------|-------------|--------|
| **Member portal** | Logged-in view for members to see their own savings, loans, statements. Separate frontend or role-based extension | 1–2 weeks |
| **Mobile money integration** | MTN/Airtel Zambia for contributions and repayments. Requires vendor API access | 1–2 weeks |
| **Custom branding per tenant** | Logo and color customization per SACCO (super admin feature) | 3–5 days |
| **News CMS** | News page on website is static. Could connect to a simple admin endpoint for creating news posts | 1–2 days |
| **Push notifications** | Browser/app notifications for overdue loans, contribution reminders | 2–3 days |
| **Audit trail UI** | Activity logs are stored in the database but there's no UI to view them | 1 day |
| **Mobile app / PWA** | Field officer mobile-friendly view | 2–4 weeks |

---

## 13. Known Issues & Notes

### Important Before Going Live
1. **Change the APP_KEY** in production — the key in this repo should not be used in production. Run `php artisan key:generate` on the production server.
2. **Set APP_DEBUG=false** in production — never expose debug errors to the public.
3. **Database backup** — set up automated backups before any members are onboarded.
4. **The `company_id = 1` hardcode** in `PublicController.php` — this assumes Sycamore is always company 1. This is fine for a single-tenant setup but must be updated if more SACCOs are added.

### Architecture Notes
- All API endpoints (except login and public membership) require a valid Sanctum token
- CORS is configured to allow all origins (`*`) — restrict this to known domains in production
- The `borrower_no` for website-submitted applications is auto-generated as `PEND-XXXXXX` and should be updated by staff when the member is activated
- The dashboard uses `DATE_FORMAT` (MySQL syntax) — must be updated to `TO_CHAR` if switching to PostgreSQL

### Passwords & Secrets
- Local MySQL: root, no password
- APP_KEY is in `.env` — do not share publicly or commit to GitHub without using environment secrets
- Africa's Talking API key is in `.env` — add real credentials when SMS is activated

---

*This documentation was prepared at the time of handover. For questions, contact Stalwart Services Limited.*
