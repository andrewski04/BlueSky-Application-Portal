import nodemailer from 'nodemailer';
import { validateEmail } from '$lib/util/validation';
import { err, ok, AppError, type Result } from '$lib/util/error';

/**
 * Nodemailer transporter configured using environment variables.
 */
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST,
	port: Number(process.env.EMAIL_SERVER_PORT), // Convert string to number
	secure: false, // Set to `true` for TLS, `false` for local/dev
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD
	},
	tls: {
		rejectUnauthorized: false // Allow self-signed certificates (useful for local testing)
	}
});

/**
 * Sends a magic link to the user's email.
 *
 * @param email - The email address to send the link to.
 * @param token - The magic token.
 * @param baseUrl - The base URL for the magic link. (e.g. http://localhost:5173)
 */
export async function sendMagicLink(
	email: string,
	token: string,
	baseUrl: string
): Promise<Result<void>> {
	if (!email || !validateEmail(email).isOk()) {
		return err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'));
	}

	const magicLink = `${baseUrl}/auth/magic-link?token=${token}`;

	await transporter.sendMail({
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Your Login Link',
		html: `<p>Click the link below to log in, this will expire in 10 minutes:</p>
		       <a href="${magicLink}">Login</a>`
	});
	return ok(undefined);
}

export default transporter;
