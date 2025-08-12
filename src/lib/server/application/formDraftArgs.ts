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
							questionDraft: { include: { options: { include: { questionOptionGroup: true } } } },
							questionVersion: { include: { options: { include: { questionOptionGroup: true } } } }
						}
					}
				}
			}
		}
	});

export const FormPublishedWithSectionsWithQuestionsWithOptions =
	Prisma.validator<Prisma.ApplicationFormPublishedFindManyArgs>()({
		include: {
			group: true,
			sections: {
				orderBy: { displayOrder: 'asc' },
				include: {
					questions: {
						orderBy: { displayOrder: 'asc' },
						include: {
							questionVersion: { include: { options: { include: { questionOptionGroup: true } } } }
						}
					}
				}
			},
			responses: true
		}
	});
