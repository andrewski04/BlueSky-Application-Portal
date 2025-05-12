import { createApplicationForm } from './applicationFormService';

export async function createExampleForm() {
	const exampleForm = await createApplicationForm({
		name: 'Example Application Form',
		description: 'This is an example application form with various question types.',
		sections: {
			create: [
				{
					slug: 'personal-information',
					name: 'Personal Information',
					displayOrder: 0,
					questions: {
						create: [
							{
								slug: 'personal-name',
								type: 'TEXT',
								prompt: 'What is your full name?',
								required: true,
								displayOrder: 0,
								maxLength: 100
							},
							{
								slug: 'personal-age',
								type: 'NUMBER',
								prompt: 'What is your age?',
								required: true,
								displayOrder: 1,
								minValue: 0
							},
							{
								slug: 'personal-dob',
								type: 'DATE',
								prompt: 'What is your date of birth?',
								required: true,
								displayOrder: 2
							}
						]
					}
				},
				{
					slug: 'contact-information',
					name: 'Contact Information',
					displayOrder: 1,
					questions: {
						create: [
							{
								slug: 'contact-email',
								type: 'TEXT',
								prompt: 'What is your email address?',
								required: true,
								displayOrder: 0,
								maxLength: 100
							},
							{
								slug: 'contact-phone',
								type: 'TEXT',
								prompt: 'What is your phone number?',
								required: false,
								displayOrder: 1,
								maxLength: 20
							}
						]
					}
				},
				{
					slug: 'preferences-section',
					name: 'Preferences',
					displayOrder: 2,
					questions: {
						create: [
							{
								slug: 'preferences-interests',
								type: 'CHECKBOX',
								prompt: 'Which of the following are you interested in?',
								required: false,
								displayOrder: 0,
								options: {
									create: [
										{ slug: 'option-a', text: 'Option A', displayOrder: 0 },
										{ slug: 'option-b', text: 'Option B', displayOrder: 1 },
										{ slug: 'option-c', text: 'Option C', displayOrder: 2 }
									]
								}
							},
							{
								slug: 'preferences-contact-method',
								type: 'MULTIPLE_CHOICE',
								prompt: 'What is your preferred contact method?',
								required: true,
								displayOrder: 1,
								options: {
									create: [
										{ slug: 'email', text: 'Email', displayOrder: 0 },
										{ slug: 'phone', text: 'Phone', displayOrder: 1 },
										{ slug: 'mail', text: 'Mail', displayOrder: 2 }
									]
								}
							},
							{
								slug: 'preferences-color',
								type: 'DROPDOWN',
								prompt: 'What is your favorite color?',
								required: false,
								displayOrder: 2,
								options: {
									create: [
										{ slug: 'red', text: 'Red', displayOrder: 0 },
										{ slug: 'blue', text: 'Blue', displayOrder: 1 },
										{ slug: 'green', text: 'Green', displayOrder: 2 }
									]
								}
							}
						]
					}
				},
				/**{
                            slug: 'file-upload',
                            name: 'File Upload',
                            displayOrder: 3,
                            questions: {
                                create: [
                                    {
                                        slug: 'file-upload-resume',
                                        type: 'FILE_UPLOAD',
                                        prompt: 'Please upload your resume.',
                                        required: false,
                                        displayOrder: 0,
                                        acceptedTypes: '.pdf,.doc,.docx', // Changed to string
                                        maxFileSizeBytes: 5 * 1024 * 1024 // 5MB
                                    }
                                ]
                            }
                        },*/
				{
					slug: 'large-text',
					name: 'Large Text',
					displayOrder: 4,
					questions: {
						create: [
							{
								slug: 'large-text-about',
								type: 'PARAGRAPH',
								prompt: 'Tell us about yourself.',
								required: false,
								displayOrder: 0,
								maxLength: 500
							}
						]
					}
				}
			]
		}
	});

	if (exampleForm.isErr()) {
		console.error('Error creating example form:', exampleForm.error);
		throw exampleForm.error;
	}

	return exampleForm.value;
}
