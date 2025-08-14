import { describe, it, expect } from 'vitest';
import { QuestionTypeMap } from './QuestionTypeMap';

describe('QuestionTypeMap', () => {
	describe('structure and content', () => {
		it('should contain all expected question types', () => {
			const expectedTypes = [
				'TEXT',
				'PARAGRAPH',
				'MULTIPLE_CHOICE',
				'DROPDOWN',
				'CHECKBOX',
				'FILE_UPLOAD',
				'DATE',
				'NUMBER',
				'MULTIPLE_CHOICE_GRID',
				'CHECKBOX_GRID'
			];

			expectedTypes.forEach((type) => {
				expect(QuestionTypeMap).toHaveProperty(type);
			});
		});

		it('should have string values for all types', () => {
			Object.values(QuestionTypeMap).forEach((value) => {
				expect(typeof value).toBe('string');
				expect(value.length).toBeGreaterThan(0);
			});
		});

		it('should have descriptive labels', () => {
			expect(QuestionTypeMap.TEXT).toBe('Short Text Response');
			expect(QuestionTypeMap.PARAGRAPH).toBe('Paragraph Response');
			expect(QuestionTypeMap.MULTIPLE_CHOICE).toBe('Multiple Choice Question');
			expect(QuestionTypeMap.DROPDOWN).toBe('Dropdown Question');
			expect(QuestionTypeMap.CHECKBOX).toBe('Checkbox Question');
			expect(QuestionTypeMap.FILE_UPLOAD).toBe('File Upload');
			expect(QuestionTypeMap.DATE).toBe('Date Response');
			expect(QuestionTypeMap.NUMBER).toBe('Number Response');
			expect(QuestionTypeMap.MULTIPLE_CHOICE_GRID).toBe('Multiple Choice Grid');
			expect(QuestionTypeMap.CHECKBOX_GRID).toBe('Checkbox Grid');
		});
	});

	describe('type safety', () => {
		it('should have consistent key-value structure', () => {
			// All keys should be uppercase strings
			Object.keys(QuestionTypeMap).forEach((key) => {
				expect(key).toMatch(/^[A-Z_]+$/);
			});

			// All values should be descriptive strings
			Object.values(QuestionTypeMap).forEach((value) => {
				expect(value).toMatch(/^[A-Za-z\s]+$/);
				expect(value.length).toBeGreaterThan(5); // Should be descriptive
			});
		});

		it('should have unique values', () => {
			const values = Object.values(QuestionTypeMap);
			const uniqueValues = new Set(values);

			expect(uniqueValues.size).toBe(values.length);
		});
	});

	describe('usage patterns', () => {
		it('should be accessible by key', () => {
			expect(QuestionTypeMap['TEXT']).toBe('Short Text Response');
			expect(QuestionTypeMap['PARAGRAPH']).toBe('Paragraph Response');
		});

		it('should be iterable', () => {
			const entries = Object.entries(QuestionTypeMap);
			expect(entries.length).toBe(10);

			entries.forEach(([key, value]) => {
				expect(typeof key).toBe('string');
				expect(typeof value).toBe('string');
				expect(key).toMatch(/^[A-Z_]+$/);
				expect(value.length).toBeGreaterThan(0);
			});
		});

		it('should support Object.keys iteration', () => {
			const keys = Object.keys(QuestionTypeMap);
			expect(keys.length).toBe(10);

			keys.forEach((key) => {
				expect(QuestionTypeMap).toHaveProperty(key);
				expect(typeof QuestionTypeMap[key as keyof typeof QuestionTypeMap]).toBe('string');
			});
		});

		it('should support Object.values iteration', () => {
			const values = Object.values(QuestionTypeMap);
			expect(values.length).toBe(10);

			values.forEach((value) => {
				expect(typeof value).toBe('string');
				expect(value.length).toBeGreaterThan(0);
			});
		});
	});

	describe('specific question types', () => {
		it('should have appropriate labels for text-based questions', () => {
			expect(QuestionTypeMap.TEXT).toContain('Text');
			expect(QuestionTypeMap.TEXT).toContain('Short');
			expect(QuestionTypeMap.PARAGRAPH).toContain('Paragraph');
		});

		it('should have appropriate labels for choice-based questions', () => {
			expect(QuestionTypeMap.MULTIPLE_CHOICE).toContain('Choice');
			expect(QuestionTypeMap.DROPDOWN).toContain('Dropdown');
			expect(QuestionTypeMap.CHECKBOX).toContain('Checkbox');
		});

		it('should have appropriate labels for input-based questions', () => {
			expect(QuestionTypeMap.FILE_UPLOAD).toContain('Upload');
			expect(QuestionTypeMap.DATE).toContain('Date');
			expect(QuestionTypeMap.NUMBER).toContain('Number');
		});

		it('should have appropriate labels for grid-based questions', () => {
			expect(QuestionTypeMap.MULTIPLE_CHOICE_GRID).toContain('Grid');
			expect(QuestionTypeMap.CHECKBOX_GRID).toContain('Grid');
		});
	});

	describe('edge cases', () => {
		it('should handle accessing non-existent properties', () => {
			expect((QuestionTypeMap as any).NON_EXISTENT).toBeUndefined();
		});

		it('should maintain consistent structure after multiple accesses', () => {
			const firstAccess = Object.keys(QuestionTypeMap);
			const secondAccess = Object.keys(QuestionTypeMap);

			expect(firstAccess).toEqual(secondAccess);
			expect(firstAccess.length).toBe(10);
		});
	});

	describe('integration scenarios', () => {
		it('should work with form validation logic', () => {
			// Simulate form validation that checks question types
			const validQuestionTypes = Object.keys(QuestionTypeMap);
			const testType = 'TEXT';

			expect(validQuestionTypes).toContain(testType);
			expect(QuestionTypeMap[testType as keyof typeof QuestionTypeMap]).toBe('Short Text Response');
		});

		it('should work with question rendering logic', () => {
			// Simulate question rendering that maps types to components
			const questionType = 'MULTIPLE_CHOICE';
			const displayLabel = QuestionTypeMap[questionType as keyof typeof QuestionTypeMap];

			expect(displayLabel).toBe('Multiple Choice Question');
			expect(displayLabel).toContain('Choice');
		});

		it('should work with form building logic', () => {
			// Simulate form building that creates question options
			const questionTypes = Object.entries(QuestionTypeMap).map(([key, value]) => ({
				value: key,
				label: value
			}));

			expect(questionTypes).toHaveLength(10);
			questionTypes.forEach((type) => {
				expect(type.value).toMatch(/^[A-Z_]+$/);
				expect(type.label).toBeTruthy();
			});
		});
	});
});
