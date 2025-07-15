import { Prisma } from '@prisma/client';

export const FormDraftWithSectionsWithQuestionsWithOptions =
	Prisma.validator<Prisma.ApplicationFormDraftFindManyArgs>()({
		include: {
			sections: {
				orderBy: { displayOrder: 'asc' },
				include: {
					questions: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questionDraft: { include: { options: true } },
							questionVersion: { include: { options: true } }
						}
					}
				}
			}
		}
	});

export const FormPublishedWithSectionsWithQuestionsWithOptions =
	Prisma.validator<Prisma.ApplicationFormPublishedFindManyArgs>()({
		include: {
			sections: {
				orderBy: { displayOrder: 'asc' },
				include: {
					questions: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questionVersion: { include: { options: true } }
						}
					}
				}
			}
		}
	});
