import { describe, it, expect } from 'vitest';
import { ok, err, AppError } from '$lib/util/error';

describe('Error Utilities', () => {
	describe('ok Result type', () => {
		it('should create a successful Ok result', () => {
			const result = ok('test data');

			expect(result.isOk()).toBe(true);
			expect(result.isErr()).toBe(false);
			expect(result.value).toBe('test data');
			// @ts-expect-error 'Error' is not supposed to be on type 'Ok'
			expect(result.error).toBeUndefined();
			expect(result.unwrap()).toBe('test data');
		});
	});

	describe('err Result type', () => {
		it('should create an error Err result', () => {
			const error = new AppError('Test error', 'TEST_ERROR');
			const result = err(error);

			expect(result.isOk()).toBe(false);
			expect(result.isErr()).toBe(true);
			// @ts-expect-error 'Value' is not expected to be on type 'Err'
			expect(result.value).toBeUndefined();
			expect(result.error).toBe(error);
			expect(result.error?.message).toBe('Test error');
			expect(result.error?.code).toBe('TEST_ERROR');
			expect(() => result.unwrapErr()).toThrowError();
		});
	});

	describe('AppError class', () => {
		it('should create an error with message and code', () => {
			const error = new AppError('Test error', 'TEST_ERROR', 500);

			expect(error).toBeInstanceOf(Error);
			expect(error.statusCode).toBe(500);
			expect(error.message).toBe('Test error');
			expect(error.code).toBe('TEST_ERROR');
			expect(error.toString()).toBe('TEST_ERROR (500): Test error');
		});
	});

	describe('AppError class unkown error', () => {
		it('should create an error with message and code', () => {
			const error = new AppError('Test error');

			expect(error).toBeInstanceOf(Error);
			expect(error.statusCode).toBe(500);
			expect(error.message).toBe('Test error');
			expect(error.code).toBe('ERR_UNKNOWN');
			expect(error.toString()).toBe('ERR_UNKNOWN (500): Test error');
		});
	});
});
