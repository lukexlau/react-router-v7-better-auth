# React Router v7 with Better auth.

This template features React Router v7, Better auth, Drizzle ORM, and D1, designed for deployment on Cloudflare Workers.

## 🔐 Authentication Features

This template implements a complete authentication system using Better Auth with the following features:

- 📧 **Email and Password Authentication** - Secure login with email and password
- 🔑 **Password Recovery** - Forgot password and reset password functionality
- 🔄 **Social Login** - Sign in with Google and GitHub accounts
- 👤 **Session Management** - Secure session handling with Cloudflare KV storage
- 🗑️ **Account Management** - Including account deletion functionality
- 👑 **Admin Panel** - Complete admin dashboard with user management, role-based access control

## ⭐ Core Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 [TailwindCSS](https://tailwindcss.com/) and [Shadcn](https://ui.shadcn.com/) for UI styling
- 🔑 [Better Auth](https://better-auth.com/) for authentication
- 🌧️ [Drizzle ORM](https://orm.drizzle.team/) for database
- 🛢️ Cloudflare D1 for database
- 📁 Cloudflare KV for caching
- 📖 [React Router docs](https://reactrouter.com/)

## Demo

Here's a preview of the app:

<div style="display: flex;">
  <img src="./.assets/login.jpeg" width="45%" />
  <img src="./.assets/settings.jpeg" width="45%" />
</div>

For more demo images, check the **.assets** directory.

## Links

React Router v7 Authentication Demo Series:
- [React Router v7 Cloudflare workers template](https://github.com/foxlau/react-router-v7-cloudflare-workers) - React Router v7 Cloudflare workers template.
- [React Router v7 with Remix Auth](https://github.com/foxlau/react-router-v7-remix-auth) - Multi-strategy authentication demo using Remix Auth
- [React Router v7 with Vite+](https://github.com/lukexlau/react-router-vite-plus) - React Router 7 + Vite+ full-stack template — Hono SSR, Drizzle/SQLite, Better Auth, Paraglide i18n.

## Getting Started

### Installation

Install the dependencies:

```bash
git clone https://github.com/foxlau/react-router-v7-better-auth.git
pnpm install
```

### Development

Run an initial database migration:

```bash
cp .env.example .env
cp wrangler.jsonc.example wrangler.jsonc
pnpm db:migrate:local
pnpm db:seed:local
```

If you modify the Drizzle ORM schema, please run `pnpm db:generate` first. If you need to delete the generated SQL migrations, execute `pnpm db:drop` and select the SQL migration you wish to remove.

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

#### Default Users (from seed)

After running `pnpm db:seed:local`, you can use the following default user to sign in:

- **Admin User**: `admin@example.com` / `admin@8899`

#### Troubleshooting

If you encounter errors after pulling updates from GitHub, try cleaning the cache and dependencies:

```bash
# Clean build cache and restart
rm -rf .wrangler .react-router node_modules/.vite
pnpm dev

# If the above doesn't work, clean all dependencies and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Database Commands

- `pnpm db:generate` - Generate new database migration files
- `pnpm db:migrate:local` - Apply migrations to local database
- `pnpm db:migrate:remote` - Apply migrations to production database
- `pnpm db:drop` - Remove generated SQL migrations (interactive)
- `pnpm db:seed:local` - Seed local database with initial data from `drizzle/seed/seed.ts`
- `pnpm db:seed:remote` - Seed production database with initial data from `drizzle/seed/seed.sql`
- `pnpm db:studio` - Open Drizzle Studio to view and manage database
- `pnpm db:reset:local` - Reset local database (drop and recreate)
- `pnpm db:delete:local` - Delete local database files

### Authentication Commands

- `pnpm auth:secret` - Generate a new Better Auth secret key. Use this when setting up authentication for the first time or when rotating secrets. The generated secret should be added to your `.dev.vars` file as `BETTER_AUTH_SECRET`.
- `pnpm auth:generate` - Generate Better Auth database schema from your auth configuration. This command reads `app/services/auth/auth.server.ts` and generates the corresponding schema file at `drizzle/schema/auth.ts`. Run this after modifying your Better Auth configuration.

### Other Useful Commands

- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run Biome linter to check code quality
- `pnpm check:fix` - Run Biome linter and auto-fix issues
- `pnpm format` - Format code with Biome
- `pnpm preview` - Preview production build locally

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

Deployment is done using the Wrangler CLI.

Use the following commands to create the D1 database and KV cache for Better Auth sessions. Remember to replace the `db` and `kv` configurations in the `wrangler.toml` file with the data generated by these commands:

```bash
npx wrangler d1 create rr7-better-auth
npx wrangler kv namespace create APP_KV
```

To deploy directly to production:

```sh
pnpm db:migrate:remote
pnpm deploy
```

To deploy a preview URL:

```sh
pnpm deploy:version
```

You can then promote a version to production after verification or roll it out progressively.

```sh
pnpm deploy:promote
```

## Questions

If you have any questions, please open an issue.
