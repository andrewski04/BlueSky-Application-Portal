/**
 * This contains shared type definition for `ApplicationForm`s and `Application`s
 */

// TODO: add types for phone number & email for proper validation
export type QuestionType =
	| 'TEXT'
	| 'PARAGRAPH'
	| 'MULTIPLE_CHOICE'
	| 'DROPDOWN'
	| 'CHECKBOX'
	| 'FILE_UPLOAD'
	| 'DATE'
	| 'NUMBER';

export interface BaseFormQuestion {
	id: string;
	type: QuestionType;
	prompt: string;
	required: boolean;
	order: number;
}

// Concrete implementations of specific question types
export interface TextQuestion extends BaseFormQuestion {
	type: 'TEXT';
	maxLength: number;
}

export interface ParagraphQuestion extends BaseFormQuestion {
	type: 'PARAGRAPH';
	maxLength: number;
}

export interface MultipleChoiceQuestion extends BaseFormQuestion {
	type: 'MULTIPLE_CHOICE';
	options: Array<{
		id: string;
		text: string;
	}>;
}

export interface DropdownQuestion extends BaseFormQuestion {
	type: 'DROPDOWN';
	options: Array<{
		id: string;
		text: string;
	}>;
}

export interface CheckboxQuestion extends BaseFormQuestion {
	type: 'CHECKBOX';
	options: Array<{
		id: string;
		text: string;
	}>;
}

export interface FileUploadQuestion extends BaseFormQuestion {
	type: 'FILE_UPLOAD';
	acceptedFileTypes: string[];
	maxFileSizeBytes: number;
}

export interface DateQuestion extends BaseFormQuestion {
	type: 'DATE';
	minDate?: Date;
	maxDate?: Date;
}

export interface NumberQuestion extends BaseFormQuestion {
	type: 'NUMBER';
	minValue?: number;
	maxValue?: number;
}

// Union type for all question types
export type ApplicationQuestion =
	| TextQuestion
	| ParagraphQuestion
	| MultipleChoiceQuestion
	| DropdownQuestion
	| CheckboxQuestion
	| FileUploadQuestion
	| DateQuestion
	| NumberQuestion;

// Form structure
export interface ApplicationFormSection {
	id: string;
	name: string;
	description?: string;
	questions: ApplicationQuestion[];
}

/**
 *  Note, this is separate from the Database/Prisma ApplicationForm type.
 *  It includes user editable fields and is used for application form updates.
 **/
export interface ApplicationFormData {
	name: string;
	description?: string;
	sections: ApplicationFormSection[];
}

/**
 *  Note, this is separate from the Database/Prisma ApplicationForm type.
 *  It includes structured application form data with additional metadata and is used for fetching form information.
 **/
export interface ApplicationFormMetadata extends ApplicationFormData {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	active: boolean;
	published: boolean;
}

// Response types
export type QuestionResponse = {
	questionId: string;
	value: string | string[] | boolean | null;
};

export interface ApplicationResponseSchema {
	responses: QuestionResponse[];
}
