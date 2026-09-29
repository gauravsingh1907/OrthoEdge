# OrthoEdge

OrthoEdge is a multilingual, offline-first osteoarthritis screening application for clinical intake teams. It guides a healthcare worker through patient registration, a WOMAC-style questionnaire, gait assessment, combined risk scoring, and referral. Records are saved locally first and can be synchronized with Supabase when connectivity is available.

The application is built for a signed-in clinical workflow rather than public self-service screening. Authentication is handled by Clerk, local persistence uses IndexedDB through Dexie, and the server-side sync endpoint uses Supabase.

## Features

- Clerk-protected clinician dashboard and screening routes
- Patient intake with ABHA number, demographics, measurements, consent, and visit timestamp
- Questionnaire-based WOMAC scoring for pain, stiffness, and physical function
- Gait assessment workflow with gait metrics
- Combined risk score using questionnaire and gait results
- Risk bands: `None`, `Low`, `Moderate`, and `High`
- Offline-first storage in the browser with retryable synchronization
- Stale-record protection during cloud synchronization
- Patient record list and individual record views
- Referral recommendations backed by `lib/referralData.json`
- English, Hindi, Assamese, Bengali, Bodo, Meitei, and Mizo translations
- Responsive dashboard with screening volume, risk distribution, and recent intakes

## Technology

- [Next.js](https://nextjs.org/) 16 App Router
- React 19
- [Clerk](https://clerk.com/) for authentication
- [Dexie](https://dexie.org/) for browser-side IndexedDB storage
- [Supabase](https://supabase.com/) for cloud persistence
- Tailwind CSS 4 through PostCSS
- Motion for interface animation

## Requirements

- Node.js 20 or newer
- npm
- A Clerk application
- A Supabase project with a `patients` table


## site runthrough
1. A signed-out visitor sees the landing page.
2. An authenticated worker opens the dashboard and can start a screening or browse records.
3. Patient intake creates or resets a local visit identified by the ABHA number.
4. The worker completes the questionnaire and gait test.
5. The app calculates a combined risk result and presents referral guidance.
6. The record remains in the local Dexie database until the worker triggers **Sync data**.
7. The authenticated API validates the record and upserts it into Supabase. Older local records cannot overwrite newer cloud data.



```text
combined score = round(WOMAC score * 0.4 + gait score * 0.6)
```

The resulting bands are:

| Score | Band |
| ---: | :--- |
| 0-29 | Low |
| 30-59 | Moderate |
| 60-100 |High|


The questionnaire's component scoring is implemented separately in `lib/RiskScore.js`. Changes to scoring thresholds or weights should be accompanied by focused tests and clinical review.

## Project structure

```text
app/
  page.js                 Auth-aware landing page and dashboard
  screening/              Protected screening workflow
  records/                Protected patient record views
  api/sync/               Authenticated Supabase synchronization endpoint
components/
  PatientForm.jsx         Patient intake
  Questionnaire.jsx       Questionnaire and WOMAC score
  GaitTest.jsx            Gait assessment
  Result.jsx              Risk result
  Referral.jsx            Referral guidance
  Dashboard.jsx           Authenticated dashboard
lib/
  db.js                   Dexie schema and local patient operations
  serviceSync.js          Offline-record synchronization
  combinedRisk.js         Combined risk band calculation
  RiskScore.js            Questionnaire score calculation
  referralData.json       Referral guidance data
messages/                 Translation dictionaries
public/assets/            Images and static assets
```

## Data and privacy notes

- Patient data is stored in browser IndexedDB before synchronization, so local browser storage should be treated as sensitive.
- The sync endpoint requires a valid Clerk session and derives `worker_id` from the authenticated Clerk user.
- The Supabase secret key is used only on the server.
- The API validates ABHA format, numeric fields, timestamps, consent, and request size before writing.
- This application is a screening aid, not a diagnosis. Clinical teams should validate the scoring model, referral thresholds, consent process, and data-retention policy before production use.


Set all four environment variables in the hosting provider, configure the production URL in Clerk, and verify that the production Supabase table has a unique constraint on `abha_number`. Test both the signed-in screening flow and synchronization after deployment.

