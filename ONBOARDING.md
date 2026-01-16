# 🚀 Onboarding Guide

Welcome to the team! This document is designed to help you understand the architecture, core concepts, and development workflows of this portfolio monorepo.

> [!NOTE]
> This guide complements the [README.md](./README.md). Make sure you've completed the "Getting Started" steps there first.

## 🏗️ Architecture Overview

This project is a **monorepo** managed by Bun workspaces. It follows a clear separation of concerns between applications and shared packages.

### Directory Structure

```mermaid
graph TD
    Root[Monorepo Root] --> Apps
    Root --> Packages

    subgraph Apps
        Web[apps/web] -->|Main Portfolio| Port3000(Port 3000)
        Dash[apps/dashboard] -->|Admin Panel| Port3002(Port 3002)
    end

    subgraph Packages
        API[@acme/api] -->|tRPC Router| Apps
        DB[@acme/db] -->|Drizzle ORM| API
        Auth[@acme/auth] -->|Better Auth| API
        UI[@acme/ui] -->|Shadcn UI| Apps
    end
```

- **`apps/`**: Deployable applications.
    - `web`: The public-facing portfolio site (TanStack Start).
    - `dashboard`: The protected admin interface.
- **`packages/`**: Shared libraries used by apps.
    - `@acme/api`: The tRPC backend logic. All API procedures live here.
    - `@acme/db`: Database schema and connection logic.
    - `@acme/ui`: Shared UI components (based on shadcn/ui).
    - `@acme/auth`: Authentication configuration.


## 🛠️ Core Tech Stack Deep Dive

### 1. TanStack Start & Router
We use **TanStack Start** for full-stack React capabilities.
- **Routing**: File-based routing in `app/routes`.
- **Data Loading**: We use `loader` functions for server-side data fetching before rendering.
- **Server Functions**: We use `createScope` and server functions for backend logic that doesn't need a full API endpoint.

### 2. tRPC (Type-Safe API)
Most client-server communication happens via **tRPC**.
- **Routers**: Defined in `packages/api/src/router/`.
- **Calling**: `const { data } = trpc.post.all.useQuery();`
- **Output Validation**: Responses are inferred, ensuring type safety from DB to UI.

### 3. Drizzle ORM & PostgreSQL
We use **Drizzle ORM** with a PostgreSQL database (Neon).
- **Schema**: Defined in `packages/db/src/schema/`.
- **Migrations**: We use `drizzle-kit` to push schema changes.
- **Access**: `db.select().from(schema.users)...`

### 4. Styling (Tailwind v4)
We use the latest **Tailwind CSS v4**.
- **Configuration**: `packages/config/tailwind`.
- **UI Kit**: `packages/ui` contains reusable components like Buttons, Dialogs, etc.

## 🧑‍💻 Development Workflows

### How to: Add a New Feature
1. **Database**: If you need new data, update `packages/db/src/schema/`.
   ```bash
   bun db:push
   ```
2. **API**: Create a new tRPC procedure in `packages/api/src/router/`.
   ```typescript
   export const newRouter = createTRPCRouter({
     hello: publicProcedure.query(() => "world"),
   });
   ```
3. **UI**: Build components in `packages/ui` if reusable, or directly in `apps/`.
4. **Page**: Add a new route in `apps/web/app/routes/`.

### How to: work with Database
- **Push Schema**: `bun db:push` (Apply changes to DB)
- **View Data**: `bun db:studio` (Open web interface to view/edit data)

### How to: Authentication
- We use **Better Auth** with GitHub OAuth.
- To protect a route or procedure:
  ```typescript
  protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  })
  ```

## 🐛 Troubleshooting

### React Compiler
We use the experimental React Compiler. If you see weird behavior:
- Check if you are breaking [React Rules](https://react.dev/reference/rules).
- You can opt-out a component with `"use no memo";` at the top of the file.

### Environment Variables
Make sure all apps have the necessary `.env` variables.
- `apps/web` and `apps/dashboard` need access to `DATABASE_URL` and Auth secrets.
