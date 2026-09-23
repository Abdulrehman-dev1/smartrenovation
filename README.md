# Smart Renovation CMS

Laravel 13 + Inertia React (TypeScript) CMS for smartrenovation.ae.

## Stack

- Laravel 13, Breeze (Inertia React TS)
- Spatie Permission (RBAC)
- Spatie Media Library (queued image conversions)
- MySQL or SQLite, Redis optional
- Vite + React + Tailwind + Sonner toasts

## Setup

1. Copy env and install dependencies:

```bash
cp .env.example .env
composer install
npm install --legacy-peer-deps
php artisan key:generate
```

2. Configure database (MySQL recommended for production):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartrenovation
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
MEDIA_DISK=public
QUEUE_CONVERSIONS_BY_DEFAULT=true
```

3. Migrate, seed, link storage:

```bash
php artisan migrate --seed
php artisan storage:link
```

Default admin user:

- Email: `admin@smartrenovation.ae`
- Password: `password`
- Role: `super-admin`

4. PHP upload / image requirements:

- Set `upload_max_filesize=64M` and `post_max_size=64M` in `php.ini`
- Enable **Imagick** (preferred) or **GD** for Spatie Media Library conversions

5. Run queue worker (required for thumb/card/large conversions):

```bash
php artisan queue:work
```

6. Frontend:

```bash
npm run dev
# or
npm run build
```

7. App:

```bash
php artisan serve
```

Admin: `/admin` · Public site: `/`

## Import legacy JSON content

Content lives in `../smart/content/*.json` relative to this app:

```bash
php artisan smart:import-projects --with-images
php artisan smart:import-services --with-images
php artisan smart:import-articles --with-images
php artisan queue:work   # required so thumb/card/large conversions finish
```

Omit `--with-images` for metadata-only import. See `GO-LIVE.md` for production cutover.

## Permissions

Modules use `{module}.{viewAny|view|create|edit|delete}` permissions, enforced via Policies and FormRequests. Roles: `super-admin`, `editor`.

## Tests

```bash
php artisan test
```
