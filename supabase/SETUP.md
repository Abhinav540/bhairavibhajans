# Bhairavi Bhajans — Setup Guide

The site uses Supabase (PostgreSQL) for programs, availability, enquiries/CRM,
WhatsApp click tracking, visitor analytics, and admin authentication, plus
Cloudinary for program image uploads. This guide covers both.

## 1. Create a Supabase project

1. Go to https://supabase.com and create a project (free tier is fine).
2. From the project Dashboard note your **Project URL** and **API keys**
   (Project Settings → API):
   - `Project URL` (e.g. `https://xxxx.supabase.co`)
   - `anon` public key (safe to expose in the browser)
   - `service_role` key (SECRET — server only, never in the browser)

## 2. Set environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role secret key>

# Optional: restrict admin access to a single email.
# Leave BLANK to allow any authenticated user to manage the dashboard.
ADMIN_ALLOWED_EMAIL=you@example.com
```

Rules:

- `NEXT_PUBLIC_*` variables are exposed to the browser by design (anon key is not secret).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and must **never** be
  used in client components. It is only used by server route handlers
  (`lib/supabase/admin.ts`).
- Never commit `.env.local`.

## 3. Run the database schema

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of [`supabase/schema.sql`](./schema.sql) and run it.

This creates:

| Table             | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `programs`        | Upcoming/booked programs and events                  |
| `availability`    | Explicitly available / blocked dates                 |
| `enquiries`       | Website booking enquiries (CRM pipeline)             |
| `whatsapp_clicks` | "Book Now / WhatsApp" click tracking                 |
| `visitor_events`  | Page-view analytics (custom, no 3rd party needed)    |
| `admin_users`     | Used to authorize which authenticated users are admins |

It also enables Row Level Security: public users can read programs/availability
and insert enquiries/clicks/page-views; only admins can manage and read them.

## 4. Create your admin user

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**.
   Enter your email + password. This is your admin login.
2. Grant admin rights — run this in the SQL Editor (replace the email):

   ```sql
   insert into public.admin_users (email) values ('you@example.com');
   ```

3. Login at `/admin/login` and you are in.

> Tip: set `ADMIN_ALLOWED_EMAIL` in `.env.local` to your email so your account is
> treated as admin immediately, even before inserting into `admin_users`.

## 5. Image uploads with Cloudinary

The "Add Image" button in the program form uploads from your computer/phone to
Cloudinary (not Supabase Storage), signed server-side so the secret never touches
the browser.

1. Create a free account at https://cloudinary.com.
2. Dashboard → **Settings** → **Upload** → note your **Cloud name**, **API key**
   and **API secret**.
3. Add them to `.env.local`:

   ```env
   CLOUDINARY_CLOUD_NAME=<your cloud name>
   CLOUDINARY_API_KEY=<your api key>
   CLOUDINARY_API_SECRET=<your api secret>
   ```

4. Restart the dev server. Uploads are stored under the `programs/` folder in
   your Cloudinary Media Library; the returned URL is saved on the program.

## 6. Verify

- `/programs` — public list + calendar; dates you mark reserved/blocked show up.
- `/booking` — public enquiry form saves rows to `enquiries`.
- `/admin` — sidebar with Dashboard, Programs, Calendar, CRM, Analytics,
  WhatsApp, Settings.
- Public pages without auth keep working (RLS allows public reads/writes only to
  the public tables; the service-role key handles everything else server-side).

## 7. Deployment (Vercel)

1. Push the repo to GitHub and import into Vercel, or run `vercel deploy`.
2. Project → Settings → Environment Variables: add the Supabase variables,
   `ADMIN_ALLOWED_EMAIL`, and the three `CLOUDINARY_*` variables.
3. Redeploy. The build runs TypeScript checks automatically.
4. (Optional) Enable **Web Analytics** in the Vercel dashboard — it sets
   `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` for you.

## Troubleshooting

- `supabaseUrl is required` at runtime → `.env.local` not set / not reloaded. Restart `npm run dev`.
- `new row violates row-level security policy` → the schema/policies were not run, or a server call is using the anon client on an admin-only table.
- Admin login fails → user exists in Auth but no `admin_users` row and `ADMIN_ALLOWED_EMAIL` is blank.
- Cards/charts show only zeros → tables are empty (expected until real traffic); check `whatsapp_clicks`, `visitor_events`, `enquiries` have rows.