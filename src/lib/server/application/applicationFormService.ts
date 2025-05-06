/**
 * The ApplicationForm represents an Application's structure, including its fields, question types, and prompts.
 * These are created by an Admin and stored as an `Application` (see applicationService.ts) when filled out by a user.
 *
 * This contains functions for interacting with the ApplicationForm.
 */

import { AppError, err, ok, type Result } from '$lib/util/error';
import { prisma } from '$lib/server/prisma';
import type {
	ApplicationForm,
	FormSection,
	FormQuestion,
	FormQuestionOption,
	Prisma
} from '@prisma/client';

/**
 * Creates a new application form in the database.
 *
 * @param applicationForm The application form data including sections, questions, and options.
 * @returns A Result containing the ID of the newly created application form, or an error if creation fails
 */
export async function createApplicationForm(
	applicationForm: Prisma.ApplicationFormCreateInput
): Promise<Result<{ applicationFormId: string }>> {
	let form;
	try {
		form = await prisma.applicationForm.create({
			data: {
				name: applicationForm.name,
				description: applicationForm.description,
				active: true,
				published: false,
				sections: {
					create: applicationForm.sections?.create as Prisma.FormSectionCreateWithoutFormInput[]
				}
			}
		});
	} catch (error) {
		console.error(error);
		return err(new AppError('Error creating application form', 'ERR_CREATE_APPLICATION_FORM'));
	}
	return ok({ applicationFormId: form.id });
}

/**
 * Edits an existing **unpublished** application form by its ID.
 *
 * Checks if the application form exists and is not published before updating.
 * Updates the form's name, description, and sections.
 *
 * @param applicationFormId The unique identifier of the application form to edit
 * @param updatedApplicationForm The updated application form data including sections, questions, and options.
 * @returns A Result containing the ID of the edited application form, or an error if editing fails
 */
export async function editApplicationFormById(
	applicationFormId: string,
	updatedApplicationForm: Prisma.ApplicationFormUpdateInput
): Promise<Result<{ applicationFormId: string }>> {
	let applicationForm = await prisma.applicationForm.findUnique({
		where: { id: applicationFormId }
	});

	if (!applicationForm) {
		return err(new AppError('Application form not found', 'ERR_APPLICATION_FORM_NOT_FOUND'));
	}

	if (applicationForm.published) {
		return err(
			new AppError('Cannot edit published application form', 'ERR_EDIT_PUBLISHED_APPLICATION_FORM')
		);
	}

	try {
		// Delete existing sections, questions, and options
		await prisma.formQuestionOption.deleteMany({
			where: {
				question: {
					section: {
						formId: applicationFormId
					}
				}
			}
		});
		await prisma.formQuestion.deleteMany({
			where: {
				section: {
					formId: applicationFormId
				}
			}
		});
		await prisma.formSection.deleteMany({
			where: { formId: applicationFormId }
		});

		// Update the form and create new sections, questions, and options
		applicationForm = await prisma.applicationForm.update({
			where: { id: applicationFormId },
			data: {
				name: updatedApplicationForm.name,
				description: updatedApplicationForm.description,
				sections: {
					create: updatedApplicationForm.sections
						?.create as Prisma.FormSectionCreateWithoutFormInput[]
				},
				active: updatedApplicationForm.active,
				published: updatedApplicationForm.published
			}
		});
	} catch (error) {
		console.error(error);
		return err(new AppError('Error editing application form', 'ERR_EDIT_APPLICATION_FORM'));
	}
	return ok({ applicationFormId: applicationForm.id });
}

/**
 * Publishes an application form, making it visible to users.
 * Forms can not be edited after publishing, but can be deactivated and copied to a new form.
 *
 * @param applicationFormId The ID of the application to be published
 * @returns A Result containing the ID of the published application, or an error if publication fails
 */
export async function publishApplicationForm(
	applicationFormId: string
): Promise<Result<{ applicationFormId: string }>> {
	let applicationForm;
	try {
		applicationForm = await prisma.applicationForm.update({
			where: { id: applicationFormId },
			data: { published: true }
		});
	} catch (error) {
		console.error(error);
		return err(new AppError('Error publishing application form', 'ERR_PUBLISH_APPLICATION_FORM'));
	}
	return ok({ applicationFormId: applicationForm.id });
}

/**
 * Retrieves all application forms from the database.
 *
 * @returns A Result containing an array of ApplicationForm, or an error if fetching fails
 */
export async function getAllApplicationForms(): Promise<Result<ApplicationForm[]>> {
	try {
		const applicationForms = await prisma.applicationForm.findMany({
			include: {
				sections: {
					include: {
						questions: {
							include: {
								options: true
							}
						}
					}
				}
			}
		});
		return ok(applicationForms);
	} catch (error) {
		console.error(error);
		return err(new AppError('Error fetching application forms', 'ERR_FETCH_APPLICATION_FORMS'));
	}
}

/**
 * Retrieves all active and published (available for users) application forms from the database
 *
 * @returns A Result containing an array of ApplicationForm for active and published forms, or an error if fetching fails
 */
export async function getActivePublishedApplicationForms(): Promise<Result<ApplicationForm[]>> {
	try {
		const applicationForms = await prisma.applicationForm.findMany({
			where: { active: true, published: true },
			include: {
				sections: {
					include: {
						questions: {
							include: {
								options: true
							}
						}
					}
				}
			}
		});
		return ok(applicationForms);
	} catch (error) {
		console.error(error);
		return err(new AppError('Error fetching application forms', 'ERR_FETCH_APPLICATION_FORMS'));
	}
}

/**
 * Deletes an application form by its ID, if no applications are using it.
 * This is intended for draft forms, if a form has already been used by applicants, it should instead be deactivated.
 *
 * @param applicationFormId - The unique identifier of the application form to delete
 * @returns A Result containing the deleted application form's ID, or an error if deletion is not possible
 * @throws {AppError} If the application form is not found or has existing applications
 */
export async function deleteApplicationFormById(
	applicationFormId: string
): Promise<Result<{ applicationFormId: string }>> {
	try {
		const applicationForm = await prisma.applicationForm.findUnique({
			where: { id: applicationFormId },
			include: { ApplicationResponse: true }
		});

		if (!applicationForm) {
			return err(new AppError('Application form not found', 'ERR_APPLICATION_FORM_NOT_FOUND'));
		}

		if (applicationForm.ApplicationResponse.length > 0) {
			return err(
				new AppError(
					'Cannot delete application form with applications, deactivate instead',
					'ERR_APPLICATION_FORM_HAS_APPLICATIONS'
				)
			);
		}

		await prisma.applicationForm.delete({
			where: { id: applicationFormId }
		});

		return ok({ applicationFormId });
	} catch (error) {
		console.error(error);
		return err(new AppError('Error deleting application form', 'ERR_DELETE_APPLICATION_FORM'));
	}
}

export async function getApplicationFormById(
	applicationFormId: string
): Promise<Result<ApplicationForm | null>> {
	try {
		const applicationForm = await prisma.applicationForm.findUnique({
			where: { id: applicationFormId },
			include: {
				sections: {
					include: {
						questions: {
							include: {
								options: true
							}
						}
					}
				}
			}
		});

		if (!applicationForm) {
			return err(new AppError('Application form not found', 'ERR_APPLICATION_FORM_NOT_FOUND'));
		}

		return ok(applicationForm);
	} catch (error) {
		console.error(error);
		return err(new AppError('Error fetching application form', 'ERR_FETCH_APPLICATION_FORM'));
	}
}

/**
 * Retrieves a specific section of an application form by form ID and section slug.
 *
 * @param applicationFormId The ID of the application form
 * @param sectionSlug The slug of the section
 * @returns A Result containing the FormSection, or an error if not found
 */
export async function getFormSectionByFormIdAndSlug(
	applicationFormId: string,
	sectionSlug: string
): Promise<
	Result<(FormSection & { questions: (FormQuestion & { options: FormQuestionOption[] })[] }) | null>
> {
	try {
		const applicationForm = await prisma.applicationForm.findUnique({
			where: { id: applicationFormId },
			include: {
				sections: {
					where: {
						name: {
							equals: sectionSlug.replace(/-/g, ' '),
							mode: 'insensitive'
						}
					},
					include: {
						questions: {
							include: {
								options: true
							}
						}
					}
				}
			}
		});

		if (!applicationForm) {
			return err(new AppError('Application form not found', 'ERR_APPLICATION_FORM_NOT_FOUND'));
		}

		const section = applicationForm.sections[0] || null;

		if (!section) {
			return err(
				new AppError('Application form section not found', 'ERR_APPLICATION_FORM_SECTION_NOT_FOUND')
			);
		}

		return ok(section);
	} catch (error) {
		console.error(error);
		return err(
			new AppError('Error fetching application form section', 'ERR_FETCH_APPLICATION_FORM_SECTION')
		);
	}
}
