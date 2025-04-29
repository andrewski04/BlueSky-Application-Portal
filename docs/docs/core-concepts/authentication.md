# Authentication

## Authentication Flow

1. **Login Request:** The user visits `/auth/login` and enters their email address.

2. **Magic Link:** The server generates a magic link with a token and sends it to the user's email address.

3. **Email Verification:** The user is redirected to `/auth/check-email` where they're informed to check their email. This page also provides an optional one-time password form for authentication.

4. **Magic Link Usage:**

   - **Same Device:** If the user opens the magic link on the same device where they initiated the login, they are automatically authenticated.
   - **Different Device:** If opened on a different device, the user is presented with a one-time password which they can enter on the check email page.

5. **Authentication Completion:** Once authenticated, the user receives a session token cookie and gets redirected.

## Authentication Methods

### Email (Magic Link)

By default, authentication will use email to send a "magic link" to sign in. When opened on the same device, the magic link will automatically sign the user in. If opened on a different device, the user will be given a one-time password to sign in.

In development, you can view any sent emails from MailDev by navigating to http://localhost:8080. Ensure that external dependencies (Docker containers) are running.

### OAuth

OAuth (such as Google & Microsoft SSO) will be implemented in the future since it requires a key from the provider. It should be relatively easy to implement on top of the existing authentication system.
