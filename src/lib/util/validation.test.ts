import { describe, it, expect } from 'vitest';
import { validateEmail } from '$lib/util/validation';
import { AppError } from '$lib/util/error';

describe('Validation Utilities', () => {
	describe('validateEmail', () => {
		it('should return ok for valid emails', () => {
			const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@example.org'];

			validEmails.forEach((email) => {
				const result = validateEmail(email);
				expect(result.isOk()).toBe(true);
			});
		});

		it('should return error for invalid emails', () => {
			const invalidEmails = [
				'',
				'plainaddress',
				'@missingusername.com',
				'user@.com',
				'user@domain'
			];

			invalidEmails.forEach((email) => {
				const result = validateEmail(email);
				expect(result.isOk()).toBe(false);
				if (result.isErr()) {
					expect(result.error).toBeInstanceOf(AppError);
				}
			});
		});
	});
});
