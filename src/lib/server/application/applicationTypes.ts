/**
 * Contains types for composite Prisma objects.
 */

import { Prisma } from '@prisma/client';

/**
 * Full application form with sections, questions, and options.
 */
export type ApplicationFormFull = Prisma.ApplicationFormGetPayload<{
	include: {
		sections: {
			include: {
				questions: {
					include: {
						options: true;
					};
				};
			};
		};
	};
}>;

/**
 * Application form with sections.
 */
export type ApplicationFormWithSections = Prisma.ApplicationFormGetPayload<{
	include: { sections: true };
}>;

/**
 * Form section with questions, options, and navigation (Next and Previous section) slugs.
 */
export type FormSectionWithNavigationSlugs = Prisma.FormSectionGetPayload<{
	include: {
		questions: {
			include: {
				options: true;
			};
		};
	};
}> & {
	nextFormSectionSlug: string | null;
	previousFormSectionSlug: string | null;
};

/**
 * ApplicationResponse with only user relation
 */
export type ApplicationResponseWithUser = Prisma.ApplicationResponseGetPayload<{
	include: {
		user: true;
	};
}>;

/**
 * ApplicationResponse with answers, selected options, and user.
 */
export type ApplicationResponseFull = Prisma.ApplicationResponseGetPayload<{
	include: {
		answers: {
			include: {
				selectedOptions: true;
				question: {
					include: {
						section: true;
					};
				};
			};
		};
		user: true;
	};
}>;

/**
 * Application Response Answer with selectedOptions and question
 */
export type ApplicationResponseAnswer = Prisma.AnswerGetPayload<{
	include: {
		selectedOptions: true;
		question: true;
	};
}>;
