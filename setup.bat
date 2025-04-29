@echo off
setlocal enabledelayedexpansion

REM Initialize flags
set REMOVE_DOCKER=1
set COPY_ENV=1
set SKIP_EXTENSIONS=0

REM Parse command line arguments
:parse_args 
if "%~1"=="" goto :end_parse_args

if /i "%~1"=="--docker-keep" set REMOVE_DOCKER=0
if /i "%~1"=="-d" set REMOVE_DOCKER=0

if /i "%~1"=="--env-keep" set COPY_ENV=0
if /i "%~1"=="-e" set COPY_ENV=0

if /i "%~1"=="--skip-extensions" set SKIP_EXTENSIONS=1
if /i "%~1"=="-s" set SKIP_EXTENSIONS=1

shift
goto :parse_args
:end_parse_args

echo Checking prerequisites...

REM Check if VS Code is installed
call code --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Visual Studio Code is not installed or not in PATH.
    exit /b 1
)

REM Check if Docker is running
call docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop first.
    exit /b 1
)

REM Check if Node.js is installed
call node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    exit /b 1
)

REM Copy env file (if flag set)
if %COPY_ENV%==1 (
    echo.
    echo Setting up environment...
    copy .env.example .env
    if %errorlevel% neq 0 (
        echo Failed to copy .env file
        exit /b 1
    )
) else (
    echo.
    echo Skipping .env file setup
)

REM Install dependencies
echo.
echo Installing npm packages...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install npm packages
    exit /b 1
)

REM Remove docker volumes (if flag set)
if %REMOVE_DOCKER%==1 (
    echo.
    echo Resetting Docker volumes...
    call docker-compose down -v
) else (
    echo.
    echo Skipping Docker volume reset
)


REM Start Docker services
echo.
echo Starting Docker services...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo Failed to start Docker services
    exit /b 1
)

REM Wait for PostgreSQL to be ready
echo.
echo Waiting for PostgreSQL to start...
:loop
timeout /t 3 /nobreak > nul
call docker exec -i postgres pg_isready -U postgres
if %errorlevel% neq 0 (
    goto loop
)
echo.
echo PostgreSQL is ready!


REM Run Prisma migrations
echo.
echo Setting up database...
call npx prisma migrate dev
if %errorlevel% neq 0 (
    echo Failed to run Prisma migrations
    exit /b 1
)

REM Install recommended VSCode extensions (if flag set)
if %SKIP_EXTENSIONS%==1 (
    echo.
    echo Skipping VSCode extensions installation
) else (
    echo.
    echo Installing VSCode extensions...
    call code --install-extension svelte.svelte-vscode
    call code --install-extension ardenivanov.svelte-intellisense
    call code --install-extension fivethree.vscode-svelte-snippets
    call code --install-extension bradlc.vscode-tailwindcss
    call code --install-extension esbenp.prettier-vscode
    call code --install-extension dbaeumer.vscode-eslint
    call code --install-extension prisma.prisma
    call code --install-extension christian-kohler.npm-intellisense
)

call npm run check
if %errorlevel% neq 0 (
    echo npm check failed, try running the dev server (non-fatal issue)
)

echo.
echo.
echo Setup complete! 
echo.
echo Domains:
echo - Development server: http://localhost:5173 (start server first)
echo - pgAdmin: http://localhost:5050 (email: admin@example.com, password: admin)
echo - MailDev: http://localhost:8080
echo - Docs: http://localhost:3000
echo.
echo Run `npm run docs` to start the docs server
echo Run `npm run dev` to start the dev server