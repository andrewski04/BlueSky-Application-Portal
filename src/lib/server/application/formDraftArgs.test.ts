import { describe, it, expect } from 'vitest';
import {
	FormDraftWithSectionsWithQuestionsWithOptions,
	FormPublishedWithSectionsWithQuestionsWithOptions
} from './formDraftArgs';

describe('FormDraftArgs', () => {
	describe('FormDraftWithSectionsWithQuestionsWithOptions', () => {
		it('should export a Prisma validator for form drafts', () => {
			expect(FormDraftWithSectionsWithQuestionsWithOptions).toBeDefined();
			expect(typeof FormDraftWithSectionsWithQuestionsWithOptions).toBe('object');
		});

		it('should include sections with proper ordering', () => {
			expect(FormDraftWithSectionsWithQuestionsWithOptions.include?.sections).toBeDefined();
			expect(FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.orderBy).toEqual({
				displayOrder: 'asc'
			});
		});

		it('should include questions with proper ordering', () => {
			const sections = FormDraftWithSectionsWithQuestionsWithOptions.include?.sections;
			expect(sections?.include?.questions?.orderBy).toEqual({
				displayOrder: 'asc'
			});
		});

		it('should include questionDraft with options and questionOptionGroup', () => {
			const questions =
				FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions;
			expect(
				questions?.include?.questionDraft?.include?.options?.include?.questionOptionGroup
			).toBe(true);
		});

		it('should include questionVersion with options and questionOptionGroup', () => {
			const questions =
				FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions;
			expect(
				questions?.include?.questionVersion?.include?.options?.include?.questionOptionGroup
			).toBe(true);
		});
	});

	describe('FormPublishedWithSectionsWithQuestionsWithOptions', () => {
		it('should export a Prisma validator for published forms', () => {
			expect(FormPublishedWithSectionsWithQuestionsWithOptions).toBeDefined();
			expect(typeof FormPublishedWithSectionsWithQuestionsWithOptions).toBe('object');
		});

		it('should include group', () => {
			expect(FormPublishedWithSectionsWithQuestionsWithOptions.include?.group).toBe(true);
		});

		it('should include sections with proper ordering', () => {
			expect(FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections).toBeDefined();
			expect(FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.orderBy).toEqual({
				displayOrder: 'asc'
			});
		});

		it('should include questions with proper ordering', () => {
			const sections = FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections;
			expect(sections?.include?.questions?.orderBy).toEqual({
				displayOrder: 'asc'
			});
		});

		it('should include questionVersion with options and questionOptionGroup', () => {
			const questions =
				FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions;
			expect(
				questions?.include?.questionVersion?.include?.options?.include?.questionOptionGroup
			).toBe(true);
		});

		it('should include responses', () => {
			expect(FormPublishedWithSectionsWithQuestionsWithOptions.include?.responses).toBe(true);
		});

		it('should not include questionDraft (only questionVersion for published forms)', () => {
			const questions =
				FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions;
			expect(questions?.include?.questionDraft).toBeUndefined();
		});
	});

	describe('Validator structure comparison', () => {
		it('should have different structures for draft vs published forms', () => {
			// Draft forms should include questionDraft
			expect(
				FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions?.include
					?.questionDraft
			).toBeDefined();

			// Published forms should not include questionDraft
			expect(
				FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions
					?.include?.questionDraft
			).toBeUndefined();

			// Both should include questionVersion
			expect(
				FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions?.include
					?.questionVersion
			).toBeDefined();
			expect(
				FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.include?.questions
					?.include?.questionVersion
			).toBeDefined();
		});

		it('should have consistent ordering for sections and questions', () => {
			const draftOrdering =
				FormDraftWithSectionsWithQuestionsWithOptions.include?.sections?.orderBy;
			const publishedOrdering =
				FormPublishedWithSectionsWithQuestionsWithOptions.include?.sections?.orderBy;

			expect(draftOrdering).toEqual(publishedOrdering);
			expect(draftOrdering).toEqual({ displayOrder: 'asc' });
		});
	});
});
