import { describe, it, expect } from 'vitest';
import {
	colorSchemeOptions,
	getColorSchemeColor,
	getColorSchemeClassName,
	getColorSchemeLabel
} from './colorScheme';
import type { ColorScheme } from '@prisma/client';

describe('ColorScheme Utilities', () => {
	describe('colorSchemeOptions', () => {
		it('should contain all expected color schemes', () => {
			const expectedSchemes: ColorScheme[] = [
				'BLUE',
				'GREEN',
				'PURPLE',
				'RED',
				'TEAL',
				'ORANGE',
				'PINK',
				'INDIGO',
				'CYAN',
				'EMERALD',
				'AMBER',
				'ROSE',
				'VIOLET',
				'SLATE'
			];

			expectedSchemes.forEach((scheme) => {
				const option = colorSchemeOptions.find((opt) => opt.value === scheme);
				expect(option).toBeDefined();
				expect(option?.value).toBe(scheme);
			});
		});

		it('should have valid color values for all schemes', () => {
			colorSchemeOptions.forEach((option) => {
				if (option.value) {
					expect(option.color).toMatch(/^#[0-9a-fA-F]{6}$/);
					expect(option.className).toMatch(/^application-section-header-[a-z]+$/);
					expect(option.label).toBeTruthy();
				}
			});
		});
	});

	describe('getColorSchemeColor', () => {
		it('should return correct color for valid schemes', () => {
			expect(getColorSchemeColor('BLUE')).toBe('#3b82f6');
			expect(getColorSchemeColor('GREEN')).toBe('#22c55e');
			expect(getColorSchemeColor('RED')).toBe('#ef4444');
		});

		it('should return default color for null scheme', () => {
			expect(getColorSchemeColor(null)).toBe('#6b7280');
		});

		it('should return default color for unknown scheme', () => {
			expect(getColorSchemeColor('UNKNOWN' as ColorScheme)).toBe('#6b7280');
		});

		it('should handle all valid color schemes', () => {
			const validSchemes: ColorScheme[] = [
				'BLUE',
				'GREEN',
				'PURPLE',
				'RED',
				'TEAL',
				'ORANGE',
				'PINK',
				'INDIGO',
				'CYAN',
				'EMERALD',
				'AMBER',
				'ROSE',
				'VIOLET',
				'SLATE'
			];

			validSchemes.forEach((scheme) => {
				const color = getColorSchemeColor(scheme);
				expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
				expect(color).not.toBe('#6b7280'); // Should not be default
			});
		});
	});

	describe('getColorSchemeClassName', () => {
		it('should return correct class name for valid schemes', () => {
			expect(getColorSchemeClassName('BLUE')).toBe('application-section-header-blue');
			expect(getColorSchemeClassName('GREEN')).toBe('application-section-header-green');
			expect(getColorSchemeClassName('RED')).toBe('application-section-header-red');
		});

		it('should return default class name for null scheme', () => {
			expect(getColorSchemeClassName(null)).toBe('application-section-header-slate');
		});

		it('should return default class name for unknown scheme', () => {
			expect(getColorSchemeClassName('UNKNOWN' as ColorScheme)).toBe(
				'application-section-header-slate'
			);
		});

		it('should handle all valid color schemes', () => {
			const validSchemes: ColorScheme[] = [
				'BLUE',
				'GREEN',
				'PURPLE',
				'RED',
				'TEAL',
				'ORANGE',
				'PINK',
				'INDIGO',
				'CYAN',
				'EMERALD',
				'AMBER',
				'ROSE',
				'VIOLET',
				'SLATE'
			];

			validSchemes.forEach((scheme) => {
				const className = getColorSchemeClassName(scheme);
				expect(className).toMatch(/^application-section-header-[a-z]+$/);
				// Note: SLATE is a valid scheme, so it should not be considered default
				if (scheme !== 'SLATE') {
					expect(className).not.toBe('application-section-header-slate');
				}
			});
		});
	});

	describe('getColorSchemeLabel', () => {
		it('should return correct label for valid schemes', () => {
			expect(getColorSchemeLabel('BLUE')).toBe('Blue');
			expect(getColorSchemeLabel('GREEN')).toBe('Green');
			expect(getColorSchemeLabel('RED')).toBe('Red');
		});

		it('should return default label for null scheme', () => {
			expect(getColorSchemeLabel(null)).toBe('No Color');
		});

		it('should return default label for unknown scheme', () => {
			expect(getColorSchemeLabel('UNKNOWN' as ColorScheme)).toBe('No Color');
		});

		it('should handle all valid color schemes', () => {
			const validSchemes: ColorScheme[] = [
				'BLUE',
				'GREEN',
				'PURPLE',
				'RED',
				'TEAL',
				'ORANGE',
				'PINK',
				'INDIGO',
				'CYAN',
				'EMERALD',
				'AMBER',
				'ROSE',
				'VIOLET',
				'SLATE'
			];

			validSchemes.forEach((scheme) => {
				const label = getColorSchemeLabel(scheme);
				expect(label).toBeTruthy();
				expect(label).not.toBe('No Color'); // Should not be default
			});
		});
	});

	describe('Integration', () => {
		it('should have consistent data across all functions for each scheme', () => {
			colorSchemeOptions.forEach((option) => {
				if (option.value) {
					expect(getColorSchemeColor(option.value)).toBe(option.color);
					expect(getColorSchemeClassName(option.value)).toBe(option.className);
					expect(getColorSchemeLabel(option.value)).toBe(option.label);
				}
			});
		});

		it('should handle edge cases gracefully', () => {
			// Test with undefined
			expect(getColorSchemeColor(undefined as any)).toBe('#6b7280');
			expect(getColorSchemeClassName(undefined as any)).toBe('application-section-header-slate');
			expect(getColorSchemeLabel(undefined as any)).toBe('No Color');

			// Test with empty string
			expect(getColorSchemeColor('' as ColorScheme)).toBe('#6b7280');
			expect(getColorSchemeClassName('' as ColorScheme)).toBe('application-section-header-slate');
			expect(getColorSchemeLabel('' as ColorScheme)).toBe('No Color');
		});
	});
});
