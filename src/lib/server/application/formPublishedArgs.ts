import { Prisma } from '@prisma/client';

export const PublishedFormWithSections =
	Prisma.validator<Prisma.ApplicationFormPublishedFindManyArgs>()({
		include: {
			sections: {
				orderBy: {
					displayOrder: 'asc'
				}
			}
		}
	});
