import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';

const log = new Logger('exampleForm');

export async function createExampleForm() {
	const exampleForm = await prismaResult(
		prisma.applicationFormDraft.create({
			data: {
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
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'personal-name',
												type: 'TEXT',
												prompt: 'What is your full name?',
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 1,
										required: true,
										questionDraft: {
											create: {
												slug: 'personal-age',
												type: 'NUMBER',
												prompt: 'What is your age?',
												minValue: 0
											}
										}
									},
									{
										displayOrder: 2,
										required: true,
										questionDraft: {
											create: {
												slug: 'personal-dob',
												type: 'DATE',
												prompt: 'What is your date of birth?'
											}
										}
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
										displayOrder: 0,
										required: true,

										questionDraft: {
											create: {
												slug: 'contact-email',
												type: 'TEXT',
												prompt: 'What is your email address?',
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 1,
										required: false,
										questionDraft: {
											create: {
												slug: 'contact-phone',
												type: 'TEXT',
												prompt: 'What is your phone number?',
												maxLength: 20
											}
										}
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
										displayOrder: 0,
										required: false,
										questionDraft: {
											create: {
												slug: 'preferences-interests',
												type: 'CHECKBOX',
												prompt: 'Which of the following are you interested in?',
												options: {
													create: [
														{ slug: 'option-a', text: 'Option A', displayOrder: 0 },
														{ slug: 'option-b', text: 'Option B', displayOrder: 1 },
														{ slug: 'option-c', text: 'Option C', displayOrder: 2 }
													]
												}
											}
										}
									},
									{
										displayOrder: 1,
										required: true,

										questionDraft: {
											create: {
												slug: 'preferences-contact-method',
												type: 'MULTIPLE_CHOICE',
												prompt: 'What is your preferred contact method?',
												options: {
													create: [
														{ slug: 'email', text: 'Email', displayOrder: 0 },
														{ slug: 'phone', text: 'Phone', displayOrder: 1 },
														{ slug: 'mail', text: 'Mail', displayOrder: 2 }
													]
												}
											}
										}
									},
									{
										displayOrder: 2,
										required: true,
										questionDraft: {
											create: {
												slug: 'preferences-color',
												type: 'DROPDOWN',
												prompt: 'What is your favorite color?',
												options: {
													create: [
														{ slug: 'red', text: 'Red', displayOrder: 0 },
														{ slug: 'blue', text: 'Blue', displayOrder: 1 },
														{ slug: 'green', text: 'Green', displayOrder: 2 }
													]
												}
											}
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
                                        displayOrder: 0,
                                        questionDraft: {
                                            create: {
                                                slug: 'file-upload-resume',
                                                type: 'FILE_UPLOAD',
                                                prompt: 'Please upload your resume.',
                                                required: false,
                                                acceptedTypes: '.pdf,.doc,.docx',
                                                maxFileSizeBytes: 5 * 1024 * 1024 // 5MB
                                            }
                                        }
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
										displayOrder: 0,
										required: false,

										questionDraft: {
											create: {
												slug: 'large-text-about',
												type: 'PARAGRAPH',
												prompt: 'Tell us about yourself.',
												maxLength: 500
											}
										}
									}
								]
							}
						}
					]
				}
			}
		})
	);

	if (exampleForm.isErr()) {
		log.error('Error creating example form', exampleForm.error);
		throw exampleForm.error;
	}

	return exampleForm.value;
}
