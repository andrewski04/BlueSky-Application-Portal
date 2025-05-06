import { z } from 'zod';
import type {
	ApplicationFormMetadata,
	ApplicationQuestion
} from '$lib/server/application/applicationTypes';

export function createQuestionSchema(question: ApplicationQuestion) {
	switch (question.type) {
		case 'TEXT':
			return z
				.string()
				.max(question.maxLength, `Maximum length is ${question.maxLength} characters`);
		case 'PARAGRAPH':
			return z
				.string()
				.max(question.maxLength, `Maximum length is ${question.maxLength} characters`);
		case 'MULTIPLE_CHOICE':
			return z
				.string()
				.refine(
					(val) => question.options.some((opt) => opt.id === val),
					'Please select a valid option'
				);
		case 'DROPDOWN':
			return z
				.string()
				.refine(
					(val) => question.options.some((opt) => opt.id === val),
					'Please select a valid option'
				);
		case 'CHECKBOX':
			return z
				.array(z.string())
				.refine(
					(vals) => vals.every((val) => question.options.some((opt) => opt.id === val)),
					'Please select valid options'
				);
		case 'FILE_UPLOAD':
			// File validation will be handled separately
			return z.any();
		case 'DATE':
			return z
				.date()
				.refine(
					(date) => !question.minDate || date >= new Date(question.minDate),
					`Date must be after ${question.minDate}`
				)
				.refine(
					(date) => !question.maxDate || date <= new Date(question.maxDate),
					`Date must be before ${question.maxDate}`
				);
		case 'NUMBER':
			return z
				.number()
				.refine(
					(num) => !question.minValue || num >= question.minValue,
					`Number must be at least ${question.minValue}`
				)
				.refine(
					(num) => !question.maxValue || num <= question.maxValue,
					`Number must be at most ${question.maxValue}`
				);
		default:
			return z.any();
	}
}

export function createFormSchema(form: ApplicationFormMetadata) {
	const schemaObj: Record<string, any> = {};

	form.sections.forEach((section) => {
		section.questions.forEach((question) => {
			schemaObj[question.id] = question.required
				? createQuestionSchema(question)
				: createQuestionSchema(question).optional();
		});
	});

	return z.object(schemaObj);
}
