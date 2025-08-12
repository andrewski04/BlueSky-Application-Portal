import { prisma, prismaResult } from '$lib/server/prisma';

export async function createExampleForm() {
	// First, create the option groups for the grid question
	const professionalMaturityGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Professional maturity',
			displayOrder: 0
		}
	});

	const selfAssessmentAbilityGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Ability to self-assess and seek support',
			displayOrder: 1
		}
	});

	const enthusiasmFieldGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Enthusiasm for the field',
			displayOrder: 2
		}
	});

	const interpersonalSkillsGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Interpersonal skills/relationship building',
			displayOrder: 3
		}
	});

	const leadershipAbilityGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Demonstrated interest in and ability to lead',
			displayOrder: 4
		}
	});

	const persistenceAdversityGroup = await prisma.questionOptionGroupDraft.create({
		data: {
			text: 'Persistence through adversity',
			displayOrder: 5
		}
	});

	return await prismaResult(
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
												slug: 'self-assessment-grid',
												type: 'MULTIPLE_CHOICE_GRID',
												prompt:
													'Please rate yourself on the following qualities and skills (1 = Low, 5 = High):',
												options: {
													create: [
														// Professional maturity row
														{
															slug: 'professional-maturity-1',
															text: '1',
															displayOrder: 0,
															questionOptionGroupId: professionalMaturityGroup.id
														},
														{
															slug: 'professional-maturity-2',
															text: '2',
															displayOrder: 1,
															questionOptionGroupId: professionalMaturityGroup.id
														},
														{
															slug: 'professional-maturity-3',
															text: '3',
															displayOrder: 2,
															questionOptionGroupId: professionalMaturityGroup.id
														},
														{
															slug: 'professional-maturity-4',
															text: '4',
															displayOrder: 3,
															questionOptionGroupId: professionalMaturityGroup.id
														},
														{
															slug: 'professional-maturity-5',
															text: '5',
															displayOrder: 4,
															questionOptionGroupId: professionalMaturityGroup.id
														},
														// Ability to self-assess row
														{
															slug: 'self-assess-1',
															text: '1',
															displayOrder: 5,
															questionOptionGroupId: selfAssessmentAbilityGroup.id
														},
														{
															slug: 'self-assess-2',
															text: '2',
															displayOrder: 6,
															questionOptionGroupId: selfAssessmentAbilityGroup.id
														},
														{
															slug: 'self-assess-3',
															text: '3',
															displayOrder: 7,
															questionOptionGroupId: selfAssessmentAbilityGroup.id
														},
														{
															slug: 'self-assess-4',
															text: '4',
															displayOrder: 8,
															questionOptionGroupId: selfAssessmentAbilityGroup.id
														},
														{
															slug: 'self-assess-5',
															text: '5',
															displayOrder: 9,
															questionOptionGroupId: selfAssessmentAbilityGroup.id
														},
														// Enthusiasm for the field row
														{
															slug: 'enthusiasm-1',
															text: '1',
															displayOrder: 10,
															questionOptionGroupId: enthusiasmFieldGroup.id
														},
														{
															slug: 'enthusiasm-2',
															text: '2',
															displayOrder: 11,
															questionOptionGroupId: enthusiasmFieldGroup.id
														},
														{
															slug: 'enthusiasm-3',
															text: '3',
															displayOrder: 12,
															questionOptionGroupId: enthusiasmFieldGroup.id
														},
														{
															slug: 'enthusiasm-4',
															text: '4',
															displayOrder: 13,
															questionOptionGroupId: enthusiasmFieldGroup.id
														},
														{
															slug: 'enthusiasm-5',
															text: '5',
															displayOrder: 14,
															questionOptionGroupId: enthusiasmFieldGroup.id
														},
														// Interpersonal skills row
														{
															slug: 'interpersonal-skills-1',
															text: '1',
															displayOrder: 15,
															questionOptionGroupId: interpersonalSkillsGroup.id
														},
														{
															slug: 'interpersonal-skills-2',
															text: '2',
															displayOrder: 16,
															questionOptionGroupId: interpersonalSkillsGroup.id
														},
														{
															slug: 'interpersonal-skills-3',
															text: '3',
															displayOrder: 17,
															questionOptionGroupId: interpersonalSkillsGroup.id
														},
														{
															slug: 'interpersonal-skills-4',
															text: '4',
															displayOrder: 18,
															questionOptionGroupId: interpersonalSkillsGroup.id
														},
														{
															slug: 'interpersonal-skills-5',
															text: '5',
															displayOrder: 19,
															questionOptionGroupId: interpersonalSkillsGroup.id
														},
														// Leadership ability row
														{
															slug: 'leadership-1',
															text: '1',
															displayOrder: 20,
															questionOptionGroupId: leadershipAbilityGroup.id
														},
														{
															slug: 'leadership-2',
															text: '2',
															displayOrder: 21,
															questionOptionGroupId: leadershipAbilityGroup.id
														},
														{
															slug: 'leadership-3',
															text: '3',
															displayOrder: 22,
															questionOptionGroupId: leadershipAbilityGroup.id
														},
														{
															slug: 'leadership-4',
															text: '4',
															displayOrder: 23,
															questionOptionGroupId: leadershipAbilityGroup.id
														},
														{
															slug: 'leadership-5',
															text: '5',
															displayOrder: 24,
															questionOptionGroupId: leadershipAbilityGroup.id
														},
														// Persistence through adversity row
														{
															slug: 'persistence-1',
															text: '1',
															displayOrder: 25,
															questionOptionGroupId: persistenceAdversityGroup.id
														},
														{
															slug: 'persistence-2',
															text: '2',
															displayOrder: 26,
															questionOptionGroupId: persistenceAdversityGroup.id
														},
														{
															slug: 'persistence-3',
															text: '3',
															displayOrder: 27,
															questionOptionGroupId: persistenceAdversityGroup.id
														},
														{
															slug: 'persistence-4',
															text: '4',
															displayOrder: 28,
															questionOptionGroupId: persistenceAdversityGroup.id
														},
														{
															slug: 'persistence-5',
															text: '5',
															displayOrder: 29,
															questionOptionGroupId: persistenceAdversityGroup.id
														}
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
										displayOrder: 2,
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
										displayOrder: 3,
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
}
