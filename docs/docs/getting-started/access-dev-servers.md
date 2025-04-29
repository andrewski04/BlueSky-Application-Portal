---
sidebar_position: 3
---

# Development Servers

## Starting Development Servers

After either running the [setup script](./setup-script.md) or [manually setting up the environment](./dev-env-setup.md), you can use the following commands to start the development server or documentation server:

```bash
# Start the SvelteKit dev server
npm run dev

# Start the documentation server
npm run docs
```

Note that Docker containers will need to be started after the host is restarted:

```bash
# Start Docker containers
docker compose up -d
```

## Accessing Development Servers

> **Note:** Services requiring authentication will use email `admin@example.com` and password `admin` by default.

- Development server: http://localhost:5173
- Docs: http://localhost:3000
- pgAdmin: http://localhost:5050
- MailDev: http://localhost:8080
