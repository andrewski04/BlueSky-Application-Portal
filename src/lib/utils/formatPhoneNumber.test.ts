import { describe, it, expect } from 'vitest';
import { formatPhoneNumber } from './formatPhoneNumber';

describe('formatPhoneNumber', () => {
	describe('valid phone numbers', () => {
		it('should format 10-digit phone numbers correctly', () => {
			expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
			expect(formatPhoneNumber('9876543210')).toBe('(987) 654-3210');
		});

		it('should format 11-digit phone numbers with country code correctly', () => {
			expect(formatPhoneNumber('11234567890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('15551234567')).toBe('(555) 123-4567');
		});

		it('should format phone numbers with existing formatting', () => {
			expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890');
		});

		it('should format phone numbers with mixed separators', () => {
			expect(formatPhoneNumber('123-456.7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123.456-7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123 456-7890')).toBe('(123) 456-7890');
		});

		it('should format phone numbers with extra spaces', () => {
			expect(formatPhoneNumber('  123  456  7890  ')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123   456   7890')).toBe('(123) 456-7890');
		});
	});

	describe('with country code option', () => {
		it('should include country code when includeCountryCode is true and code exists', () => {
			expect(formatPhoneNumber('11234567890', true)).toBe('+1 (123) 456-7890');
			expect(formatPhoneNumber('15551234567', true)).toBe('+1 (555) 123-4567');
		});

		it('should not include country code when includeCountryCode is true but no code exists', () => {
			expect(formatPhoneNumber('1234567890', true)).toBe('(123) 456-7890');
			expect(formatPhoneNumber('5551234567', true)).toBe('(555) 123-4567');
		});

		it('should not include country code when includeCountryCode is false', () => {
			expect(formatPhoneNumber('11234567890', false)).toBe('(123) 456-7890');
			expect(formatPhoneNumber('1234567890', false)).toBe('(123) 456-7890');
		});

		it('should not include country code by default', () => {
			expect(formatPhoneNumber('11234567890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
		});
	});

	describe('invalid phone numbers', () => {
		it('should return null for phone numbers that are too short', () => {
			expect(formatPhoneNumber('123')).toBeNull();
			expect(formatPhoneNumber('12345')).toBeNull();
			expect(formatPhoneNumber('123456789')).toBeNull();
		});

		it('should return null for phone numbers that are too long', () => {
			expect(formatPhoneNumber('123456789012')).toBeNull();
			expect(formatPhoneNumber('1234567890123')).toBeNull();
		});

		it('should return null for phone numbers with invalid characters', () => {
			// The function strips non-digits, so these should still work if they have enough digits
			expect(formatPhoneNumber('123abc7890')).toBeNull(); // Not enough digits after stripping
			expect(formatPhoneNumber('123-456-789a')).toBeNull(); // Strips 'a', leaving only 9 digits
			expect(formatPhoneNumber('123@456#7890')).toBe('(123) 456-7890'); // Strips '@' and '#', leaving 10 digits
		});

		it('should return null for empty strings', () => {
			expect(formatPhoneNumber('')).toBeNull();
			expect(formatPhoneNumber('   ')).toBeNull();
		});

		it('should return null for non-string inputs', () => {
			// The function expects string input
			expect(formatPhoneNumber(null as any)).toBeNull();
			expect(formatPhoneNumber(undefined as any)).toBeNull();
		});
	});

	describe('edge cases', () => {
		it('should handle phone numbers with leading zeros', () => {
			expect(formatPhoneNumber('0123456789')).toBe('(012) 345-6789');
			expect(formatPhoneNumber('0012345678')).toBe('(001) 234-5678');
		});

		it('should handle phone numbers with all zeros', () => {
			expect(formatPhoneNumber('0000000000')).toBe('(000) 000-0000');
		});

		it('should handle phone numbers with all nines', () => {
			expect(formatPhoneNumber('9999999999')).toBe('(999) 999-9999');
		});

		it('should handle phone numbers with repeated digits', () => {
			expect(formatPhoneNumber('1111111111')).toBe('(111) 111-1111');
			expect(formatPhoneNumber('1231231234')).toBe('(123) 123-1234');
		});
	});

	describe('input cleaning', () => {
		it('should remove all non-digit characters', () => {
			expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123/456/7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123\\456\\7890')).toBe('(123) 456-7890');
		});

		it('should handle phone numbers with letters and symbols', () => {
			expect(formatPhoneNumber('123ABC456DEF7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123!@#456$%^7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123-ABC-456-DEF-7890')).toBe('(123) 456-7890');
		});

		it('should normalize multiple spaces and separators', () => {
			expect(formatPhoneNumber('123  456  7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123---456---7890')).toBe('(123) 456-7890');
			expect(formatPhoneNumber('123...456...7890')).toBe('(123) 456-7890');
		});
	});

	describe('real-world examples', () => {
		it('should format common US phone number formats', () => {
			expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
			expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
			expect(formatPhoneNumber('555.123.4567')).toBe('(555) 123-4567');
			expect(formatPhoneNumber('555 123 4567')).toBe('(555) 123-4567');
		});

		it('should handle phone numbers from different sources', () => {
			expect(formatPhoneNumber('+1 555-123-4567')).toBe('(555) 123-4567');
			expect(formatPhoneNumber('1-555-123-4567')).toBe('(555) 123-4567');
			// These have extra text that gets stripped, so they may not format correctly
			expect(formatPhoneNumber('555.123.4567 ext 123')).toBeNull(); // Too many non-digits
			expect(formatPhoneNumber('555-123-4567 x123')).toBeNull(); // Too many non-digits
		});
	});
});
