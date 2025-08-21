# BlueSky Application Portal

The BlueSky Application Portal is a fully functional form builder & submission manager tailored towards the needs of the [BlueSky TN Institute](https://www.blueskytn.com/). This project was built over 8 months for classes Software Engineering I & II (CSCI 4250 & 4350).

This project was built on Node.js with SvelteKit, Prisma ORM (PostgreSQL), and S3 file storage on the backend. The frontend was designed and built from scratch leveraging TailwindCSS. Authentication was custom implemented following the Lucia Auth guide, with passwordless authentication (using magic email links) and role-based authorization.

## Features

- **Admin Features**
  - Fully customizable draft forms
  - Custom form color schemes
  - Question types: text, paragraph, multiple choice, dropdown, checkbox, file upload, date, number, multiple choice grid, and checkbox grid
  - Configurable answer validation (required, min/max length, etc.)
  - Drag & drop question and section ordering
  - Published form open and due date
  - Submission groups for cohort/group organization
  - Bulk/single submission PDF export
  - Collaborative submission reviews and comments
  - User announcement system
- **User Features**
  - Responses save real time while editing
  - User can leave and resume form at any time
  - Users can view previous submission responses
  - Real-time input validation shows invalid responses
- **Developer Features**
  - One command development environment setup script for Windows and Linux.
  - All external dependencies run in Docker, with premade Docker Compose configuration.
  - Generate test data script creates dummy users, forms, submissions, etc. for easy testing.
  - Standalone documentation site provides guides on setup, project architecture, debugging and more.
  - Vitest unit tests with 90% code coverage

## Images

**Admin Overview Dashboard**
![Dashboard](/docs/static/img/dashboard.png)

**Form Editor**
![Editor](/docs/static/img/editor.png)

**User Form View**
![Form](/docs/static/img/form.png)

**Submissions Page**
![Submissions](/docs/static/img/submissions.png)

# Setup Environment

### Installing External Dependencies

Install [Node.js](https://nodejs.org/en/download/)\
Install [VSCode](https://code.visualstudio.com/) \
Install [Docker](https://docs.docker.com/desktop/setup/install/windows-install/)

### Run the Setup Script

The setup batch script will handle installing Node dependencies, starting Docker containers, setting environment variables, initializing the database, and installing VSCode extensions.

Simply run this after cloning the repository:

- **Windows**: `./setup.bat`
- **Linux**: `./setup.sh` (Untested on MacOS)

Read [Manual Environment Setup](docs/docs/getting-started/dev-env-setup.md) for the manual steps if you are having issues or read [Setup Script](docs/docs/getting-started/setup-script.md) for more info.

### Start Dev Server

To start the SvelteKit dev server, enter the following command while in the project root directory.

```bash
# Run dev server and open page in browser
npm run dev -- --open
```

### Start Documentation Server

The documentation, powered by Docusaurus, runs locally and can be starting using the following command:

```bash
npm run docs
```

You can then access it at "http://localhost:3000/".

The documentation contains a lot of information about the structure of the project and other useful resources to help get you started. It also contains automatically generated API documentation from TypeScript, allowing you to quickly navigate the codebase.

All content for the documentation is location in `./docs/docs` as plain Markdown files.

### Development Links

- Development server: http://localhost:5173 (`npm run dev`)
- Docs: http://localhost:3000 (`npm run docs`)
- pgAdmin: http://localhost:5050 (email: admin@example.com, password: admin)
- MailDev: http://localhost:8080
