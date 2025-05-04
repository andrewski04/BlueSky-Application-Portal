import type { PageServerLoad } from './$types';
import {
	createApplicationForm,
	getAllApplicationForms
} from '$lib/server/application/applicationFormService';

export const load = (async () => {
	const applicationForms = await getAllApplicationForms();
	if (applicationForms.isErr()) {
		return { applicationForms: [], error: applicationForms.error.message };
	}
	return { applicationForms: applicationForms.value };
}) satisfies PageServerLoad;

export const actions = {
	default: async () => {
		const exampleForm = await createApplicationForm({
			name: 'Example Application Form',
			description: 'This is an example application form with various question types.',
			sections: [
				{
					id: 'personal-information-section',
					name: 'Personal Information',
					questions: [
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
				},
				{
					id: 'contact-information-section',
					name: 'Contact Information',
					questions: [
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
				},
				{
					id: 'preferences-section',
					name: 'Preferences',
					questions: [
						{
							id: 'preferences-interests',
							type: 'CHECKBOX',
							prompt: 'Which of the following are you interested in?',
							required: false,
							order: 0,
							options: [
								{ id: 'option-a', text: 'Option A' },
								{ id: 'option-b', text: 'Option B' },
								{ id: 'option-c', text: 'Option C' }
							]
						},
						{
							id: 'preferences-contact-method',
							type: 'MULTIPLE_CHOICE',
							prompt: 'What is your preferred contact method?',
							required: true,
							order: 1,
							options: [
								{ id: 'email', text: 'Email' },
								{ id: 'phone', text: 'Phone' },
								{ id: 'mail', text: 'Mail' }
							]
						},
						{
							id: 'preferences-color',
							type: 'DROPDOWN',
							prompt: 'What is your favorite color?',
							required: false,
							order: 2,
							options: [
								{ id: 'red', text: 'Red' },
								{ id: 'blue', text: 'Blue' },
								{ id: 'green', text: 'Green' }
							]
						}
					]
				},
				{
					id: 'file-upload-section',
					name: 'File Upload',
					questions: [
						{
							id: 'file-upload-resume',
							type: 'FILE_UPLOAD',
							prompt: 'Please upload your resume.',
							required: false,
							order: 0,
							acceptedFileTypes: ['.pdf', '.doc', '.docx'],
							maxFileSizeBytes: 5 * 1024 * 1024 // 5MB
						}
					]
				},
				{
					id: 'large-text-section',
					name: 'Large Text',
					questions: [
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
			]
		});

		console.log('Example form created:', exampleForm);
	}
};
