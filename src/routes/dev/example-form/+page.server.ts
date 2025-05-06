import type { PageServerLoad } from './$types';
import {
	createApplicationForm,
	getAllApplicationForms,
	deleteApplicationFormById
} from '$lib/server/application/applicationFormService';

export const load = (async () => {
	const applicationForms = await getAllApplicationForms();
	if (applicationForms.isErr()) {
		return { applicationForms: [], error: applicationForms.error.message };
	}
	return { applicationForms: applicationForms.value };
}) satisfies PageServerLoad;

export const actions = {
	create: async () => {
		const exampleForm = await createApplicationForm({
			name: 'Example Application Form',
			description: 'This is an example application form with various question types.',
			sections: {
				create: [
					{
						id: 'personal-information-section',
						name: 'Personal Information',
						displayOrder: 0,
						questions: {
							create: [
								{
									id: 'personal-name',
									type: 'TEXT',
									prompt: 'What is your full name?',
									required: true,
									order: 0,
									maxLength: 100
								},
								{
									id: 'personal-age',
									type: 'NUMBER',
									prompt: 'What is your age?',
									required: true,
									order: 1,
									minValue: 0
								},
								{
									id: 'personal-dob',
									type: 'DATE',
									prompt: 'What is your date of birth?',
									required: true,
									order: 2
								}
							]
						}
					},
					{
						id: 'contact-information-section',
						name: 'Contact Information',
						displayOrder: 1,
						questions: {
							create: [
								{
									id: 'contact-email',
									type: 'TEXT',
									prompt: 'What is your email address?',
									required: true,
									order: 0,
									maxLength: 100
								},
								{
									id: 'contact-phone',
									type: 'TEXT',
									prompt: 'What is your phone number?',
									required: false,
									order: 1,
									maxLength: 20
								}
							]
						}
					},
					{
						id: 'preferences-section',
						name: 'Preferences',
						displayOrder: 2,
						questions: {
							create: [
								{
									id: 'preferences-interests',
									type: 'CHECKBOX',
									prompt: 'Which of the following are you interested in?',
									required: false,
									order: 0,
									options: {
										create: [
											{ id: 'option-a', text: 'Option A', order: 0 },
											{ id: 'option-b', text: 'Option B', order: 1 },
											{ id: 'option-c', text: 'Option C', order: 2 }
										]
									}
								},
								{
									id: 'preferences-contact-method',
									type: 'MULTIPLE_CHOICE',
									prompt: 'What is your preferred contact method?',
									required: true,
									order: 1,
									options: {
										create: [
											{ id: 'email', text: 'Email', order: 0 },
											{ id: 'phone', text: 'Phone', order: 1 },
											{ id: 'mail', text: 'Mail', order: 2 }
										]
									}
								},
								{
									id: 'preferences-color',
									type: 'DROPDOWN',
									prompt: 'What is your favorite color?',
									required: false,
									order: 2,
									options: {
										create: [
											{ id: 'red', text: 'Red', order: 0 },
											{ id: 'blue', text: 'Blue', order: 1 },
											{ id: 'green', text: 'Green', order: 2 }
										]
									}
								}
							]
						}
					},
					{
						id: 'file-upload-section',
						name: 'File Upload',
						displayOrder: 3,
						questions: {
							create: [
								{
									id: 'file-upload-resume',
									type: 'FILE_UPLOAD',
									prompt: 'Please upload your resume.',
									required: false,
									order: 0,
									acceptedTypes: '.pdf,.doc,.docx', // Changed to string
									maxFileSizeBytes: 5 * 1024 * 1024 // 5MB
								}
							]
						}
					},
					{
						id: 'large-text-section',
						name: 'Large Text',
						displayOrder: 4,
						questions: {
							create: [
								{
									id: 'large-text-about',
									type: 'PARAGRAPH',
									prompt: 'Tell us about yourself.',
									required: false,
									order: 0,
									maxLength: 500
								}
							]
						}
					}
				]
			}
		});

		console.log('Example form created:', exampleForm);
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const formId = formData.get('formId')?.toString();

		if (!formId) {
			return { success: false, error: 'Form ID is required' };
		}

		const result = await deleteApplicationFormById(formId);

		if (result.isErr()) {
			return { success: false, error: result.error.message };
		}

		return { success: true };
	}
};
