---
sidebar_position: 10
---

# Project Structure

This serves as a reference for the structure of the project, how code is organized, and how different parts of the project interact with each other.

The `/docs` directory is not covered here as it is covered in the [Documentation](./documentation.md) page.

## `/src` Directory

The `src` directory contains the core logic of the application, including backend libraries and frontend pages.

### `src/lib`

Contains libraries that can be used across the project. In general, logic should be implemented into libraries unless it's tightly coupled to a specific page.
When importing libraries, the shorthand `$lib/*path_from_lib*` can be used, rather than the full path to the library.

- `src/lib/components` - Contains reusable components that can be used across the project, organized by the type of component.
- `src/lib/server` - Libraries in server can only be called from server routes (e.g. +page.server.ts) and will NEVER run on the client side. This handles logic such as authentication or database queries.
- `src/lib/utils` - Contains general utilities used across client and server logic, such as logging, error handling, and input validation.

### `src/routes`

Contains all of the endpoint routes (including front-end pages, back-end page logic, and API endpoints) based on the file route.
For example, when connecting to `example.com/admin/dashboard`, the page being loaded is located at `src/routes/admin/dashboard/+page.svelte`.

> **Tip:** Right click on a route directory and select 'SvelteKit Files' to create an endpoint with boilerplate code.

Svelte endpoints are files beginning with `+`. The primary ones are:

- `+page.svelte` - Front-end page containing HTML, styling, and Svelte templating features. All logic on this page will run on the client, so data from the backend can be passed from the `+page.server.ts`.

- `+page.server.ts` - Holds page logic that will only be ran on the server. It contains the `PageServerLoad` function, which is is primarily used to send data to the page to be rendered. This runs before the page is sent to the client, so it can also be used to check user authentication or redirect the user. It also contains form actions, which provides an easier way to handle form submissions or API requests without dedicated endpoints.

- `+layout.*` - Behave similarly to their `+page` counterparts, but apply to the entire route, including nested routes.

- `+server.ts` - Contains server-only logic without a client page, typically used for writing custom API endpoints. Form actions are typically preferred, but these are useful for logic shared across pages or endpoints that are meant to be accessible from outside the website.

For more details, I recommend reading SvelteKits documentation on Routing (and all other SvelteKit Core Concepts)

## `/static`

The static directory contains any files that should be directly accessible (primarily pictures or icons for the website).
An image at `/static/picture/example.png` will be located at `example.com/picture/example.png`

## `/prisma`

This contains the Prisma schema, which declares how data is structured in the database and in TypeScript types, and Prisma migrations, which contain SQL scripts to create or update the schemas in the actual database.

For more details, read the [Database](./database.md) page.

## `.env`

The `.env` files includes environmental variables (such as the database URL & credentials) for local development.
The `.env.example` contains working defaults and is copied to `.env` when running the setup script.

## Other

Other directories and files are not covered here as they primarily contain configuration files that we will rarely need to modify during development.
