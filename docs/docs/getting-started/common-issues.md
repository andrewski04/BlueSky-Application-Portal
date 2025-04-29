---
sidebar_position: 4
---

# Debugging & Common Issues

- If you are getting odd linting errors (such as `./$types` not found) either run `npm run check` or start the dev server. If this doesn't work, try restarting VSCode.

- If the dev or docs server says a port is already in use, stop any Node.js proccesses in Task Manager. This can happen if you close VSCode while the servers are still running.

- If you receive Prisma database errors, run `npx prisma migrate dev` to synchronize the client and DB. If this doesn't work, run `./setup.bat` as the migration may require the database to be reset.
