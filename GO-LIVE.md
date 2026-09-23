# Go-live checklist — Smart Renovation Laravel CMS

Use alongside the Next.js handover notes in `../smart/GO-LIVE.md`.

## Before cutover

1. Point production `.env` to **MySQL** (`DB_CONNECTION=mysql`).
2. Set `APP_URL=https://smartrenovation.ae`, `APP_ENV=production`, `APP_DEBUG=false`.
3. Raise PHP limits: `upload_max_filesize=64M`, `post_max_size=64M`, `memory_limit=512M`.
4. Prefer **Imagick**; GD is the fallback already enabled on many hosts.
5. Run `php artisan migrate --force --seed` (change admin password immediately).
6. `php artisan storage:link`
7. Run a supervised queue worker: `php artisan queue:work --tries=3` (or Horizon later).
8. Import content:
   - `php artisan smart:import-projects --with-images`
   - `php artisan smart:import-services --with-images`
   - `php artisan smart:import-articles --with-images`
9. Import / verify `redirects` for old WordPress URLs (admin → Redirects).
10. Confirm Settings: WhatsApp, phone, GTM, GA4.
11. `npm run build` and deploy `public/build`.
12. SSL + DNS cutover; crawl old sitemap for 301/308 success.
13. Submit new `https://smartrenovation.ae/sitemap.xml` in Search Console.

## Security baselines

- Auth login routes: Breeze throttle defaults.
- Contact form: `throttle:10,1`.
- Admin writes: `throttle:60,1`.
- FormRequests only; policies + Spatie permissions.
- Never expose raw permission arrays to Inertia — use computed `can` props.

## Ops

- Backups: MySQL + `storage/app`.
- Monitor `failed_jobs`.
- Serve **card/large** conversions publicly; keep originals for re-processing only.
