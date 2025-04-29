# BlueSky Application Portal

This project is a prototype for a new BlueSky Application Portal for prospective students to register.

## Stack

- SvelteKit
- NodeJS
- Tailwind CSS
- Prisma ORM
- PostgreSQL

# Setup Environment

### Installing External Dependencies

Install [Node.js](https://nodejs.org/en/download/)\
Install [VSCode](https://code.visualstudio.com/) \
Install [Docker](https://docs.docker.com/desktop/setup/install/windows-install/)

> **Note:** After installing Docker, ensure that you restart your computer and open Docker Desktop to start the Docker Engine for the first time. After that, it will run on startup by default.

### Run the Setup Script

The setup batch script will handle installing Node dependencies, starting Docker containers, setting environment variables, initializing the database, and installing VSCode extensions.

Simply run this after cloning the repository: `./setup.bat`

Read [Manual Environment Setup](docs/docs/getting-started/dev-env-setup.md) for the manual steps if you are having issues or read [Setup Script](docs/docs/getting-started/setup-script.md) for more info.

### Start Dev Server

To start the SvelteKit dev server, enter the following command while in the project root directory.

```bash
# Run dev server and open page in browser
npm run dev -- --open
```

The dev server will automatically rebuild the project and reload the page when a change is saved.

### Start Documentations Server

> After setting up your development environment, I **highly recommend** reading the complete documentation.

The documentation, powered by Docusaurus, runs locally and can be starting using the following command:

```bash
npm run docs
```

You can then access it at "http://localhost:3000/".

You can also access and edit the Markdown files directly at `./docs/docs`, sorted into different sections. Note that the `api` section is auto-generated from the codebase and should not be edited manually.

The documentation contains a lot of information about the structure of the project and other useful resources to help get you started. It also contains automatically generated API documentation from TypeScript, allowing you to quickly navigate the codebase.

### Development Links

- Development server: http://localhost:5173 (`npm run dev`)
- Docs: http://localhost:3000 (`npm run docs`)
- pgAdmin: http://localhost:5050 (email: admin@example.com, password: admin)
- MailDev: http://localhost:8080
