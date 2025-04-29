import { prisma } from '$lib/server/prisma';
import crypto from 'crypto';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { validateEmail } from '$lib/util/validation';
import { err, ok, AppError, type Result } from '$lib/util/error';

/**
 * Creates a new magic token for the given email and device ID.
 *
 * @param email - The email associated with the token.
 * @param deviceId - The ID of the device requesting the token.
 * @returns - An object containing the token and OTP.
 */
export async function createMagicToken(
	email: string,
	deviceId: string
): Promise<Result<{ token: string }>> {
	try {
		await invalidateAllMagicTokens(email);
	} catch {
		return err(new AppError('Error creating magic token', 'ERR_CREATE_MAGIC_TOKEN'));
	}

	if (!email || !validateEmail(email).isOk()) {
		return err(new AppError('Invalid email', 'ERR_INVALID_EMAIL'));
	}

	// generate magic token and hash for storage
	const token = crypto.randomBytes(32).toString('hex');
	const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	// Set expiration time (10 minutes from now)
	const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

	// Store the token and device ID in the database
	await prisma.magicToken.create({
		data: {
			hashedToken,
			deviceId,
			email,
			expiresAt
		}
	});

	return ok({ token });
}

/**
 * Finds a magic token by its token ID.
 *
 * @param token - The raw token to find.
 * @returns The magic token or null if not found or invalid.
 */
export async function findMagicTokenByToken(token: string) {
	const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const magicToken = await prisma.magicToken.findUnique({
		where: { hashedToken }
	});

	if (!magicToken || new Date() > magicToken.expiresAt) {
		return null;
	}

	return magicToken;
}

/**
 * Finds an active magic token for a specific email.
 *
 * @param email - The email to search for.
 * @returns The active magic token or null if none found.
 */
export async function findActiveMagicTokenByEmail(email: string) {
	return await prisma.magicToken.findFirst({
		where: {
			email,
			expiresAt: { gt: new Date() }
		}
	});
}

/**
 * Finds a magic token by email and OTP code, only returning it if it is valid and not expired.
 *
 * @param email - The email associated with the token.
 * @param otp - The raw OTP code to verify.
 * @returns The magic token or null if not found or invalid.
 */
export async function findMagicTokenByEmailAndOtp(email: string, otp: string) {
	const hashedOtp = encodeHexLowerCase(sha256(new TextEncoder().encode(otp)));
	return await prisma.magicToken.findFirst({
		where: {
			email,
			hashedOtp,
			expiresAt: { gt: new Date() }
		}
	});
}

/**
 * Marks a magic token as used.
 *
 * @param token - The token to mark as used.
 * @param hashed - True if the token is already hashed, false if raw.
 */
export async function invalidateMagicToken(token: string, hashed: boolean) {
	if (!hashed) {
		token = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	}
	await prisma.magicToken.delete({
		where: { hashedToken: token }
	});
}

/**
 * Generates a new OTP for a magic token.
 *
 * @param rawToken - The raw token to generate OTP for.
 * @returns The generated OTP.
 */
export async function generateOtp(rawToken: string): Promise<Result<string>> {
	const hashedToken = encodeHexLowerCase(sha256(new TextEncoder().encode(rawToken)));

	// Check if the token already has an OTP
	const existingToken = await prisma.magicToken.findUnique({
		where: { hashedToken }
	});

	// If the token already has an OTP hash, consider it used
	if (existingToken && existingToken.hashedOtp) {
		return err(new AppError('Token already used', 'ERR_TOKEN_ALREADY_USED'));
	}

	// generate OTP and hash for storage
	const otpValue = crypto.randomBytes(3).readUIntBE(0, 3) % 1000000;
	const otp = otpValue.toString().padStart(6, '0');
	const hashedOtp = encodeHexLowerCase(sha256(new TextEncoder().encode(otp)));

	try {
		// update magicToken in database
		await prisma.magicToken.update({
			where: { hashedToken },
			data: { hashedOtp }
		});
	} catch {
		return err(new AppError('Error generating OTP', 'ERR_GENERATE_OTP'));
	}

	return ok(otp);
}

/**
 * Invalidates all magic tokens for a given email.
 *
 * @param email - The email to invalidate tokens for.
 */
export async function invalidateAllMagicTokens(email: string) {
	await prisma.magicToken.deleteMany({
		where: {
			email
		}
	});
}
