#!/usr/bin/env bash
set -e

# Initialize flags
docker_remove=1
env_copy=1
skip_extensions=0

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --docker-keep|-d)
      docker_remove=0
      ;;
    --env-keep|-e)
      env_copy=0
      ;;
    --skip-extensions|-s)
      skip_extensions=1
      ;;
  esac
  shift
done

echo "Checking prerequisites..."

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
  echo "Visual Studio Code is not installed or not in PATH."
  exit 1
fi

# Check if Docker is running
if ! sudo docker info &> /dev/null; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Node.js is not installed. Please install Node.js first."
  exit 1
fi

# Copy env file (if flag set)
if [[ $env_copy -eq 1 ]]; then
  echo
  echo "Setting up environment..."
  cp .env.example .env || { echo "Failed to copy .env file"; exit 1; }
else
  echo
  echo "Skipping .env file setup"
fi

# Install dependencies
echo
echo "Installing npm packages..."
npm install || { echo "Failed to install npm packages"; exit 1; }

# Remove docker volumes (if flag set)
if [[ $docker_remove -eq 1 ]]; then
  echo
  echo "Resetting Docker volumes..."
  sudo docker compose down -v
else
  echo
  echo "Skipping Docker volume reset"
fi

# Start Docker services
echo
echo "Starting Docker services..."
sudo docker compose up -d || { echo "Failed to start Docker services"; exit 1; }

# Wait for PostgreSQL to be ready
echo
echo "Waiting for PostgreSQL to start..."
while ! sudo docker exec -i postgres pg_isready -U postgres &> /dev/null; do
  sleep 3
done
echo "PostgreSQL is ready!"

# Run Prisma migrations
echo
echo "Setting up database..."
npx prisma migrate dev || { echo "Failed to run Prisma migrations"; exit 1; }

# Install recommended VSCode extensions (if flag set)
if [[ $skip_extensions -eq 1 ]]; then
  echo
  echo "Skipping VSCode extensions installation"
else
  echo
  echo "Installing VSCode extensions..."
  code --install-extension svelte.svelte-vscode
  code --install-extension ardenivanov.svelte-intellisense
  code --install-extension fivethree.vscode-svelte-snippets
  code --install-extension bradlc.vscode-tailwindcss
  code --install-extension esbenp.prettier-vscode
  code --install-extension dbaeumer.vscode-eslint
  code --install-extension prisma.prisma
  code --install-extension christian-kohler.npm-intellisense
fi

npm run check || echo "npm check failed, try running the dev server (non-fatal issue)"

echo

echo "Setup complete!"
echo

echo "Domains:"
echo "- Development server: http://localhost:5173 (start server first)"
echo "- pgAdmin: http://localhost:5050 (email: admin@example.com, password: admin)"
echo "- MailDev: http://localhost:8080"
echo "- Docs: http://localhost:3000"
echo
echo "Run \`npm run docs\` to start the docs server"
echo "Run \`npm run dev\` to start the dev server" 