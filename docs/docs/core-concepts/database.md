# Database

## Prisma

Prisma is an object relational mapper, meaning it lets us interact with the database using TypeScript objects rather than writing queries. This ensures type-safety and will avoid many errors and vulnerabilities with unsafe queries.

Prisma Schemas are similar to SQL Schemas but will generate both the database tables as well as the type-safe client object we will use in our program. They can be found in the `prisma` folder.

## Migrations

After making/pulling schema changes, `migrate` to update:

> **NOTE:** Run these after any schema changes are made or pulled from Git.

```bash
# If asked for a name, name it something identifiable, similar to a Git commit message.
npx prisma migrate dev
```

> **NOTE:** If migration fails, run `docker compose down -v` and restart the containers. **THIS WILL RESET ALL DATA IN THE DATABASE.**

If the Prisma client isn't working (missing object attributes, etc.), use `npx prisma generate` to manually generate the client, though this should run automatically with the above `migrate` command.

## pgAdmin

pgAdmin, which runs alongside PostgreSQL in a Docker container, provides useful tools to manage the database.
It can be accessed in a browser at http://localhost:5050 using the email "admin@example.com" and password "admin".

Once signed in, under "Servers" select PostgreSQL and enter password "devpassword". You can now manually edit the database.
