import { prisma, prismaResult } from '$lib/server/prisma';
import { Logger } from '$lib/utils/logger';

const log = new Logger('exampleForm');

export async function createExampleForm() {
	const exampleForm = await prismaResult(
		prisma.applicationFormDraft.create({
			data: {
				name: 'BlueSky Institute Application Form',
				description:
					'Complete application form for the BlueSky Institute accelerated computing degree program. This form evaluates your qualifications, personal qualities, and readiness for an intensive academic program.',
				sections: {
					create: [
						{
							slug: 'personal-information',
							name: 'Personal Information',
							description:
								'Basic contact and eligibility information required for program consideration.',
							displayOrder: 0,
							colorScheme: 'BLUE',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'contact-permission',
												type: 'MULTIPLE_CHOICE',
												prompt:
													'Can ETSU and its affiliates contact you via your Email Address or Phone Number?',
												options: {
													create: [
														{ slug: 'yes', text: 'Yes', displayOrder: 0 },
														{ slug: 'no', text: 'No', displayOrder: 1 }
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
												slug: 'text-permission',
												type: 'MULTIPLE_CHOICE',
												prompt: 'Can ETSU and its affiliates contact you via text?',
												options: {
													create: [
														{ slug: 'yes', text: 'Yes', displayOrder: 0 },
														{ slug: 'no', text: 'No', displayOrder: 1 }
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
												slug: 'high-school',
												type: 'TEXT',
												prompt:
													'Name of current or most recent high school (If home-schooled, please enter "Home Schooled.")',
												minLength: 1,
												maxLength: 200
											}
										}
									},
									{
										displayOrder: 3,
										required: true,
										questionDraft: {
											create: {
												slug: 'work-eligibility',
												type: 'MULTIPLE_CHOICE',
												prompt:
													'Are you eligible to work in the US and for the duration of the program?',
												options: {
													create: [
														{ slug: 'yes', text: 'Yes', displayOrder: 0 },
														{ slug: 'no', text: 'No', displayOrder: 1 }
													]
												}
											}
										}
									}
								]
							}
						},
						{
							slug: 'self-assessment',
							name: 'Self-Assessment and Essay Questions',
							description:
								'Evaluation of your personal qualities, skills, and motivation for the program. Please be thoughtful and specific in your responses.',
							displayOrder: 1,
							colorScheme: 'GREEN',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'professional-maturity',
												type: 'DROPDOWN',
												prompt: 'Professional maturity',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
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
												slug: 'self-assessment-ability',
												type: 'DROPDOWN',
												prompt: 'Ability to self-assess and seek support',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
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
												slug: 'enthusiasm-field',
												type: 'DROPDOWN',
												prompt: 'Enthusiasm for the field',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
													]
												}
											}
										}
									},
									{
										displayOrder: 3,
										required: true,
										questionDraft: {
											create: {
												slug: 'interpersonal-skills',
												type: 'DROPDOWN',
												prompt: 'Interpersonal skills/relationship building',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
													]
												}
											}
										}
									},
									{
										displayOrder: 4,
										required: true,
										questionDraft: {
											create: {
												slug: 'leadership-ability',
												type: 'DROPDOWN',
												prompt: 'Demonstrated interest in and ability to lead',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
													]
												}
											}
										}
									},
									{
										displayOrder: 5,
										required: true,
										questionDraft: {
											create: {
												slug: 'persistence-adversity',
												type: 'DROPDOWN',
												prompt: 'Persistence through adversity',
												options: {
													create: [
														{ slug: '1', text: '1', displayOrder: 0 },
														{ slug: '2', text: '2', displayOrder: 1 },
														{ slug: '3', text: '3', displayOrder: 2 },
														{ slug: '4', text: '4', displayOrder: 3 },
														{ slug: '5', text: '5', displayOrder: 4 }
													]
												}
											}
										}
									},
									{
										displayOrder: 6,
										required: true,
										questionDraft: {
											create: {
												slug: 'why-bluesky',
												type: 'PARAGRAPH',
												prompt:
													'Why do you want to pursue an accelerated degree in computing through the BlueSky Institute? (Please keep in mind the personal qualities and skills mentioned above.) (1 - 2 paragraphs)',
												minLength: 100,
												maxLength: 2000
											}
										}
									},
									{
										displayOrder: 7,
										required: true,
										questionDraft: {
											create: {
												slug: 'challenge-overcome',
												type: 'PARAGRAPH',
												prompt:
													'Tell us about a time you overcame a challenge – how did you identify and address the issue/situation? What was the outcome and what did you learn from the experience? (Please keep in mind the personal qualities and skills mentioned above.) (1 - 2 paragraphs)',
												minLength: 100,
												maxLength: 2000
											}
										}
									},
									{
										displayOrder: 8,
										required: true,
										questionDraft: {
											create: {
												slug: 'why-choose-you',
												type: 'PARAGRAPH',
												prompt:
													'Why should we choose you? (Please keep in mind the personal qualities and skills mentioned above.) (1 - 2 paragraphs)',
												minLength: 100,
												maxLength: 2000
											}
										}
									}
								]
							}
						},
						{
							slug: 'references',
							name: 'References',
							description:
								'Please provide contact information for two professional or academic references who can speak to your qualifications and character.',
							displayOrder: 2,
							colorScheme: 'PURPLE',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference1-title',
												type: 'DROPDOWN',
												prompt: 'Reference 1 - Title',
												options: {
													create: [
														{ slug: 'dr', text: 'Dr.', displayOrder: 0 },
														{ slug: 'mr', text: 'Mr.', displayOrder: 1 },
														{ slug: 'mrs', text: 'Mrs.', displayOrder: 2 },
														{ slug: 'ms', text: 'Ms.', displayOrder: 3 },
														{ slug: 'miss', text: 'Miss', displayOrder: 4 },
														{ slug: 'unknown', text: 'Unknown', displayOrder: 5 }
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
												slug: 'reference1-first',
												type: 'TEXT',
												prompt: 'Reference 1 - First Name',
												minLength: 1,
												maxLength: 50
											}
										}
									},
									{
										displayOrder: 2,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference1-last',
												type: 'TEXT',
												prompt: 'Reference 1 - Last Name',
												minLength: 1,
												maxLength: 50
											}
										}
									},
									{
										displayOrder: 3,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference1-organization',
												type: 'TEXT',
												prompt: 'Reference 1 - School/Organization',
												minLength: 1,
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 4,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference1-email',
												type: 'TEXT',
												prompt: 'Reference 1 - Email',
												minLength: 5,
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 5,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference1-phone',
												type: 'TEXT',
												prompt: 'Reference 1 - Phone',
												minLength: 10,
												maxLength: 20
											}
										}
									},
									{
										displayOrder: 6,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-title',
												type: 'DROPDOWN',
												prompt: 'Reference 2 - Title',
												options: {
													create: [
														{ slug: 'dr', text: 'Dr.', displayOrder: 0 },
														{ slug: 'mr', text: 'Mr.', displayOrder: 1 },
														{ slug: 'mrs', text: 'Mrs.', displayOrder: 2 },
														{ slug: 'ms', text: 'Ms.', displayOrder: 3 },
														{ slug: 'miss', text: 'Miss', displayOrder: 4 },
														{ slug: 'unknown', text: 'Unknown', displayOrder: 5 }
													]
												}
											}
										}
									},
									{
										displayOrder: 7,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-first',
												type: 'TEXT',
												prompt: 'Reference 2 - First Name',
												minLength: 1,
												maxLength: 50
											}
										}
									},
									{
										displayOrder: 8,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-last',
												type: 'TEXT',
												prompt: 'Reference 2 - Last Name',
												minLength: 1,
												maxLength: 50
											}
										}
									},
									{
										displayOrder: 9,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-organization',
												type: 'TEXT',
												prompt: 'Reference 2 - School/Organization',
												minLength: 1,
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 10,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-email',
												type: 'TEXT',
												prompt: 'Reference 2 - Email',
												minLength: 5,
												maxLength: 100
											}
										}
									},
									{
										displayOrder: 11,
										required: true,
										questionDraft: {
											create: {
												slug: 'reference2-phone',
												type: 'TEXT',
												prompt: 'Reference 2 - Phone',
												minLength: 10,
												maxLength: 20
											}
										}
									}
								]
							}
						},
						{
							slug: 'resume-upload',
							name: 'Resume Upload',
							description: 'Please upload your current resume or CV in PDF, DOC, or DOCX format.',
							displayOrder: 3,
							colorScheme: 'ORANGE',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'resume-file',
												type: 'FILE_UPLOAD',
												prompt: 'Upload your resume or CV',
												acceptedTypes: '.pdf,.doc,.docx',
												maxFileSizeBytes: 10 * 1024 * 1024 // 10MB
											}
										}
									}
								]
							}
						},
						{
							slug: 'additional-questions',
							name: 'Additional Information',
							description:
								'Additional questions to help us better understand your background and qualifications.',
							displayOrder: 4,
							colorScheme: 'TEAL',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: false,
										questionDraft: {
											create: {
												slug: 'gpa',
												type: 'NUMBER',
												prompt: 'What is your current GPA? (if applicable)',
												minValue: 0.0,
												maxValue: 4.0
											}
										}
									},
									{
										displayOrder: 1,
										required: false,
										questionDraft: {
											create: {
												slug: 'graduation-date',
												type: 'DATE',
												prompt: 'Expected or actual graduation date (if applicable)',
												minDate: new Date('2010-01-01'),
												maxDate: new Date('2030-12-31')
											}
										}
									},
									{
										displayOrder: 2,
										required: false,
										questionDraft: {
											create: {
												slug: 'programming-experience',
												type: 'CHECKBOX',
												prompt:
													'Which programming languages or technologies are you familiar with? (Select all that apply)',
												options: {
													create: [
														{ slug: 'python', text: 'Python', displayOrder: 0 },
														{ slug: 'java', text: 'Java', displayOrder: 1 },
														{ slug: 'javascript', text: 'JavaScript', displayOrder: 2 },
														{ slug: 'c-plus-plus', text: 'C++', displayOrder: 3 },
														{ slug: 'c-sharp', text: 'C#', displayOrder: 4 },
														{ slug: 'html-css', text: 'HTML/CSS', displayOrder: 5 },
														{ slug: 'sql', text: 'SQL', displayOrder: 6 },
														{ slug: 'none', text: 'None', displayOrder: 7 }
													]
												}
											}
										}
									},
									{
										displayOrder: 3,
										required: false,
										questionDraft: {
											create: {
												slug: 'additional-info',
												type: 'PARAGRAPH',
												prompt:
													'Is there anything else you would like us to know about you or your application?',
												maxLength: 1000
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
