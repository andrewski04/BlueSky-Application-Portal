---
sidebar_position: 2
---

# Manual Environment Setup

> **NOTE:** I recommend running the [setup script](./setup-script) to automatically handle the following steps. If you are not using Windows or have any issues, then follow the steps below.

## Install VSCode Extensions

> You should be prompted to install these extensions when opening the workspace for the first time. Otherwise, navigate to extensions with the workpace open and search for `@recommended`.

Install the following VSCode extensions:

- Svelte for VSCode
- Svelte Intellisense
- Svelte 3 Snippets
- Tailwind CSS Intellisense
- Prettier
- ESLint
- Prisma
- npm Intellisense

Restart VSCode to ensure extensions run.

## Running External Dependencies

External dependencies such as PostgreSQL and pgAdmin will be ran in Docker containers to create a standard environment and remove the need for manual installation.

These containers can be started by executing `docker compose up -d` in the project directory and will continue running in the background. You can open the VSCode.

> If Docker throws an error, ensure you restarted your computer after installation and start Docker Desktop to run the Docker Engine.

To stop running services, run `docker-compose down` in project directory.

## Prepare Environment

Run `npm install` in project directory command to install Node dependencies.

Copy `.env.example` and rename copy to `.env` (be sure not to delete the example file). Change environmental variables as needed.

## Migrate the Database

This will update the database schema and generate the Prisma client, which is used to make type-safe queries to the database.

This will need to be reran after any changes are made or pulled from Git.

For more info on migrations, see the [database documentation](../core-concepts/database.md).

```
npx prisma migrate dev
```

## Start the Development Server

Read [accessing development servers](./access-dev-servers.md) for more info.
