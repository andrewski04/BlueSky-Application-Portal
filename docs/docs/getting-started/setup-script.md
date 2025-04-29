---
sidebar_position: 1
---

# Setup Script

The setup batch script will handle installing Node dependencies, starting Docker containers, setting environment variables, initializing the database, and installing VSCode extensions.

Simply run this after cloning the repository and installing Docker, Node, and VSCode: `./setup.bat`

Read [Development Environment Setup](./dev-env-setup.md) for the manual steps if you are having issues or want more details.

After running the script, read [accessing development servers](./access-dev-servers.md) for next steps.

### Post-Setup Usage

> **WARNING:** By default, this script will **overwrite environment variables** and **reset the Docker containers**. **THIS WILL CLEAR THE DATABASE!** Use the flags to prevent this.

If you are having issues with the environment or running the development server, running this script can fix many issues.

It also be ran after pulling/making changes to the Docker containers or database schema. Note that some database migrations may require the database to be reset.

### Flags

The setup script has the following flags:

- `--docker-keep`/`-d`: Keep the Docker containers running.
- `--env-keep`/`-e`: Keep the environment variables.
- `--skip-extensions`/`-s`: Skip installing/checking VSCode extensions.

These flags **must** be set separately (e.g. `./setup.bat -d -e -s`)
