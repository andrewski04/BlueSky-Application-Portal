#!/usr/bin/env node

/**
 * Test Data Generator for BlueSky Application Portal
 *
 * This script generates comprehensive test data including:
 * - Draft forms with various question types
 * - Published forms in multiple groups with different due dates
 * - Users (both regular users and admins)
 * - Form submissions with realistic answers
 * - Announcements
 *
 * Usage: node scripts/generate-test-data.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data arrays
const sampleNames = [
	'John Smith',
	'Sarah Johnson',
	'Michael Brown',
	'Emily Davis',
	'David Wilson',
	'Lisa Anderson',
	'James Taylor',
	'Jennifer Martinez',
	'Robert Garcia',
	'Amanda Rodriguez',
	'Christopher Lee',
	'Jessica White',
	'Daniel Harris',
	'Ashley Clark',
	'Matthew Lewis',
	'Nicole Hall',
	'Andrew Young',
	'Stephanie King',
	'Joshua Wright',
	'Megan Green'
];

const sampleEmails = [
	'john.smith@example.com',
	'sarah.johnson@example.com',
	'michael.brown@example.com',
	'emily.davis@example.com',
	'david.wilson@example.com',
	'lisa.anderson@example.com',
	'james.taylor@example.com',
	'jennifer.martinez@example.com',
	'robert.garcia@example.com',
	'amanda.rodriguez@example.com',
	'christopher.lee@example.com',
	'jessica.white@example.com',
	'daniel.harris@example.com',
	'ashley.clark@example.com',
	'matthew.lewis@example.com',
	'nicole.hall@example.com',
	'andrew.young@example.com',
	'stephanie.king@example.com',
	'joshua.wright@example.com',
	'megan.green@example.com'
];

const samplePhoneNumbers = [
	'423-555-0101',
	'423-555-0102',
	'423-555-0103',
	'423-555-0104',
	'423-555-0105',
	'423-555-0106',
	'423-555-0107',
	'423-555-0108',
	'423-555-0109',
	'423-555-0110',
	'423-555-0111',
	'423-555-0112',
	'423-555-0113',
	'423-555-0114',
	'423-555-0115',
	'423-555-0116',
	'423-555-0117',
	'423-555-0118',
	'423-555-0119',
	'423-555-0120'
];

const sampleETSUEmails = [
	'smithj@etsu.edu',
	'johnsons@etsu.edu',
	'brownm@etsu.edu',
	'davise@etsu.edu',
	'wilsond@etsu.edu',
	'andersonl@etsu.edu',
	'taylorj@etsu.edu',
	'martinezj@etsu.edu',
	'garcir@etsu.edu',
	'rodrigueza@etsu.edu',
	'leec@etsu.edu',
	'whitej@etsu.edu',
	'harrisd@etsu.edu',
	'clarka@etsu.edu',
	'lewism@etsu.edu',
	'halln@etsu.edu',
	'younga@etsu.edu',
	'kings@etsu.edu',
	'wrightj@etsu.edu',
	'greenm@etsu.edu'
];

const sampleENumbers = [
	'E12345678',
	'E12345679',
	'E12345680',
	'E12345681',
	'E12345682',
	'E12345683',
	'E12345684',
	'E12345685',
	'E12345686',
	'E12345687',
	'E12345688',
	'E12345689',
	'E12345690',
	'E12345691',
	'E12345692',
	'E12345693',
	'E12345694',
	'E12345695',
	'E12345696',
	'E12345697'
];

const sampleAnnouncements = [
	{
		title: 'Welcome to BlueSky Institute!',
		message:
			'We are excited to welcome all new applicants to our accelerated computing degree program. Please review the application requirements carefully and reach out if you have any questions.'
	},
	{
		title: 'Application Deadline Reminder',
		message:
			'Just a friendly reminder that applications for the Spring 2024 semester are due by December 15th. Make sure to submit all required materials on time.'
	},
	{
		title: 'New Program Features Available',
		message:
			'We have added new features to our application portal including enhanced file upload capabilities and improved form validation. Please explore these new features!'
	},
	{
		title: 'Technical Support Available',
		message:
			'If you experience any technical difficulties while completing your application, please contact our support team at support@bluesky.edu or call 423-555-0000.'
	},
	{
		title: 'Interview Scheduling Open',
		message:
			'Interview scheduling for qualified applicants is now open. You will receive an email with instructions once your application has been reviewed.'
	}
];

const sampleFormNames = [
	'Computer Science Accelerated Program',
	'Data Science Intensive Course',
	'Cybersecurity Certification Program',
	'Software Engineering Bootcamp',
	'Artificial Intelligence Specialization',
	'Web Development Professional Track',
	'Mobile App Development Program',
	'Cloud Computing Certification',
	'Database Administration Course',
	'Network Security Program'
];

const sampleFormDescriptions = [
	'An intensive program designed to prepare students for careers in computer science through hands-on projects and real-world applications.',
	'Learn data science fundamentals including statistics, machine learning, and data visualization in this comprehensive course.',
	'Develop essential cybersecurity skills through practical exercises and industry-standard tools and techniques.',
	'Master software engineering principles with focus on modern development practices and team collaboration.',
	'Explore cutting-edge AI technologies including machine learning, neural networks, and natural language processing.',
	'Build professional web development skills with modern frameworks and responsive design principles.',
	'Create mobile applications for iOS and Android platforms using industry-standard development tools.',
	'Learn cloud computing fundamentals including AWS, Azure, and Google Cloud Platform services.',
	'Master database design, administration, and optimization techniques for various database systems.',
	'Develop network security expertise including threat detection, prevention, and incident response.'
];

const sampleQuestionPrompts = [
	'What is your primary motivation for pursuing this program?',
	'Describe a challenging project you have worked on and how you overcame obstacles.',
	'What are your career goals for the next 5 years?',
	'How do you handle working under pressure and tight deadlines?',
	'Describe your experience with programming languages and development tools.',
	'What interests you most about this field of study?',
	'How do you stay updated with the latest industry trends and technologies?',
	'Describe a time when you had to learn a new skill quickly.',
	'What are your strengths and areas for improvement?',
	'How do you approach problem-solving and critical thinking?'
];

const sampleOptions = [
	['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
	['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
	['Very Important', 'Important', 'Somewhat Important', 'Not Important'],
	['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
	['Extremely Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Extremely Dissatisfied']
];

// Utility functions
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
	const shuffled = [...array].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

function getRandomDate(start, end) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomDateInPastWeeks(weeks) {
	const now = new Date();
	const startDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
	return getRandomDate(startDate, now);
}

function getRandomDateInFutureWeeks(weeks) {
	const now = new Date();
	const endDate = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
	return getRandomDate(now, endDate);
}

async function createUsers() {
	console.log('Creating users...');

	const users = [];

	// Create admin users
	for (let i = 0; i < 3; i++) {
		const user = await prisma.user.create({
			data: {
				email: `admin${i + 1}@etsu.edu`,
				firstName: `Admin`,
				lastName: `${i + 1}`,
				role: 'ADMIN',
				isSetup: true,
				etsuApplicationComplete: true,
				etsuEmail: `admin${i + 1}@etsu.edu`,
				etsuENumber: `E9999999${i}`,
				phoneNumber: `423-555-999${i}`
			}
		});
		users.push(user);
		console.log(`Created admin user: ${user.email}`);
	}

	// Create regular users
	for (let i = 0; i < 20; i++) {
		const firstName = sampleNames[i].split(' ')[0];
		const lastName = sampleNames[i].split(' ')[1];

		const user = await prisma.user.create({
			data: {
				email: sampleEmails[i],
				firstName,
				lastName,
				role: 'USER',
				isSetup: true,
				etsuApplicationComplete: Math.random() > 0.3, // 70% have completed ETSU app
				etsuEmail: sampleETSUEmails[i],
				etsuENumber: sampleENumbers[i],
				phoneNumber: samplePhoneNumbers[i]
			}
		});
		users.push(user);
		console.log(`Created user: ${user.email}`);
	}

	return users;
}

async function createQuestionTemplates() {
	console.log('Creating question templates...');

	const templates = [];
	const questionTypes = [
		'TEXT',
		'PARAGRAPH',
		'MULTIPLE_CHOICE',
		'DROPDOWN',
		'CHECKBOX',
		'DATE',
		'NUMBER'
	];

	for (let i = 0; i < 10; i++) {
		const type = getRandomElement(questionTypes);
		const template = await prisma.questionTemplate.create({
			data: {
				slug: `template-${i + 1}`,
				displayName: `Question Template ${i + 1}`,
				inLibrary: Math.random() > 0.3,
				versions: {
					create: {
						version: 1,
						prompt: getRandomElement(sampleQuestionPrompts),
						type,
						slug: `template-${i + 1}-v1`,
						minLength: type === 'TEXT' ? 10 : null,
						maxLength: type === 'TEXT' ? 500 : null,
						minValue: type === 'NUMBER' ? 0 : null,
						maxValue: type === 'NUMBER' ? 100 : null,
						options:
							type === 'MULTIPLE_CHOICE' || type === 'DROPDOWN' || type === 'CHECKBOX'
								? {
										create: getRandomElement(sampleOptions).map((text, index) => ({
											text,
											displayOrder: index,
											slug: `option-${index}`
										}))
									}
								: undefined
					}
				}
			},
			include: {
				versions: true
			}
		});

		// Set current version
		await prisma.questionTemplate.update({
			where: { id: template.id },
			data: { currentVersionId: template.versions[0].id }
		});

		templates.push(template);
		console.log(`Created question template: ${template.displayName}`);
	}

	return templates;
}

async function createFormDrafts() {
	console.log('Creating form drafts...');

	const drafts = [];

	for (let i = 0; i < 5; i++) {
		const draft = await prisma.applicationFormDraft.create({
			data: {
				createdAt: getRandomDateInPastWeeks(4),
				updatedAt: getRandomDateInPastWeeks(2),
				name: getRandomElement(sampleFormNames),
				description: getRandomElement(sampleFormDescriptions),
				sections: {
					create: [
						{
							slug: 'personal-information',
							name: 'Personal Information',
							description: 'Basic contact and eligibility information.',
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
												prompt: 'Can ETSU and its affiliates contact you via email or phone?',
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
												slug: 'motivation',
												type: 'PARAGRAPH',
												prompt: 'What is your primary motivation for pursuing this program?',
												minLength: 100,
												maxLength: 1000
											}
										}
									}
								]
							}
						},
						{
							slug: 'academic-background',
							name: 'Academic Background',
							description: 'Your educational history and achievements.',
							displayOrder: 1,
							colorScheme: 'GREEN',
							questions: {
								create: [
									{
										displayOrder: 0,
										required: true,
										questionDraft: {
											create: {
												slug: 'gpa',
												type: 'NUMBER',
												prompt: 'What is your current GPA?',
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
												slug: 'programming-experience',
												type: 'MULTIPLE_CHOICE',
												prompt: 'How would you rate your programming experience?',
												options: {
													create: [
														{ slug: 'beginner', text: 'Beginner', displayOrder: 0 },
														{ slug: 'intermediate', text: 'Intermediate', displayOrder: 1 },
														{ slug: 'advanced', text: 'Advanced', displayOrder: 2 }
													]
												}
											}
										}
									}
								]
							}
						}
					]
				}
			}
		});

		drafts.push(draft);
		console.log(`Created form draft: ${draft.name}`);
	}

	return drafts;
}

async function createFormGroups() {
	console.log('Creating form groups...');

	const groups = [];
	const groupNames = ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025', 'Summer 2025'];

	for (let i = 0; i < 5; i++) {
		const group = await prisma.applicationFormGroup.create({
			data: {
				name: groupNames[i],
				description: `Applications for ${groupNames[i]} semester`
			}
		});

		groups.push(group);
		console.log(`Created form group: ${group.name}`);
	}

	return groups;
}

async function createPublishedForms(drafts, groups) {
	console.log('Creating published forms...');

	const publishedForms = [];

	for (let i = 0; i < drafts.length; i++) {
		const draft = drafts[i];
		const group = groups[i % groups.length];

		// Get the draft sections and questions
		const draftWithDetails = await prisma.applicationFormDraft.findUnique({
			where: { id: draft.id },
			include: {
				sections: {
					include: {
						questions: {
							include: {
								questionDraft: {
									include: {
										options: true
									}
								}
							}
						}
					}
				}
			}
		});

		// Create published form with sections first
		const publishedForm = await prisma.applicationFormPublished.create({
			data: {
				publishedAt: getRandomDateInPastWeeks(4),
				name: draft.name,
				description: draft.description,
				groupId: group.id,
				openDate: getRandomDateInPastWeeks(4), // Open within past 4 weeks
				closeDate:
					Math.random() > 0.3 ? getRandomDateInFutureWeeks(8) : getRandomDateInPastWeeks(2), // 70% future, 30% past
				active: Math.random() > 0.2, // 80% are active
				adminName: draft.name + ' (Version 1)',
				sections: {
					create: draftWithDetails.sections.map((section) => ({
						slug: section.slug,
						name: section.name,
						description: section.description,
						displayOrder: section.displayOrder,
						colorScheme: section.colorScheme
					}))
				}
			},
			include: {
				sections: true
			}
		});

		// Now create the question links for each section
		for (const section of publishedForm.sections) {
			const draftSection = draftWithDetails.sections.find((s) => s.slug === section.slug);
			if (draftSection) {
				for (const question of draftSection.questions) {
					// Create a template for this question
					const template = await prisma.questionTemplate.create({
						data: {
							slug: `form-${publishedForm.id}-q-${question.displayOrder}`,
							displayName: `Question from ${publishedForm.name}`,
							inLibrary: false
						}
					});

					// Create a QuestionVersion from the draft question
					const questionVersion = await prisma.questionVersion.create({
						data: {
							templateId: template.id,
							version: 1,
							prompt: question.questionDraft.prompt,
							type: question.questionDraft.type,
							slug: question.questionDraft.slug,
							minLength: question.questionDraft.minLength,
							maxLength: question.questionDraft.maxLength,
							minValue: question.questionDraft.minValue,
							maxValue: question.questionDraft.maxValue,
							minDate: question.questionDraft.minDate,
							maxDate: question.questionDraft.maxDate,
							acceptedTypes: question.questionDraft.acceptedTypes,
							maxFileSizeBytes: question.questionDraft.maxFileSizeBytes,
							options: question.questionDraft.options
								? {
										create: question.questionDraft.options.map((opt) => ({
											text: opt.text,
											displayOrder: opt.displayOrder,
											slug: opt.slug
										}))
									}
								: undefined
						}
					});

					// Set the current version for the template
					await prisma.questionTemplate.update({
						where: { id: template.id },
						data: { currentVersionId: questionVersion.id }
					});

					// Create the question link
					await prisma.questionLinkPublished.create({
						data: {
							sectionId: section.id,
							questionVersionId: questionVersion.id,
							displayOrder: question.displayOrder,
							required: question.required
						}
					});
				}
			}
		}

		publishedForms.push(publishedForm);
		console.log(`Published form: ${publishedForm.name}`);
	}

	return publishedForms;
}

async function createSubmissions(users, publishedForms) {
	console.log('Creating form submissions...');

	const submissions = [];

	for (const form of publishedForms) {
		// Get form details
		const formWithDetails = await prisma.applicationFormPublished.findUnique({
			where: { id: form.id },
			include: {
				sections: {
					include: {
						questions: {
							include: {
								questionVersion: {
									include: {
										options: true
									}
								}
							}
						}
					}
				}
			}
		});

		// Create submissions for this form
		const numSubmissions = Math.floor(Math.random() * 15) + 5; // 5-20 submissions per form
		const availableUsers = users.filter((u) => u.role === 'USER');
		const selectedUsers = getRandomElements(
			availableUsers,
			Math.min(numSubmissions, availableUsers.length)
		);

		for (let i = 0; i < selectedUsers.length; i++) {
			const user = selectedUsers[i];
			const status = Math.random() > 0.3 ? 'SUBMITTED' : 'DRAFT';
			const time = Math.random() > 0.5 ? getRandomDateInPastWeeks(1) : getRandomDateInPastWeeks(3);

			const submission = await prisma.applicationResponse.create({
				data: {
					userId: user.id,
					formId: form.id,
					formGroupId: form.groupId,
					status,
					submittedAt: status === 'SUBMITTED' ? time : null,
					updatedAt: time,
					answers: {
						create: formWithDetails.sections.flatMap((section) =>
							section.questions.map((q) => {
								const question = q.questionVersion;
								const answerData = {
									publishedSectionId: section.id,
									publishedDisplayOrder: q.displayOrder,
									questionVersionId: question.id
								};

								// Generate appropriate answer based on question type
								switch (question.type) {
									case 'TEXT':
									case 'PARAGRAPH':
										answerData.valueText = `Sample answer for ${question.prompt.substring(0, 50)}...`;
										break;
									case 'NUMBER':
										answerData.valueNumber = Math.floor(Math.random() * 100);
										break;
									case 'DATE':
										answerData.valueDate = getRandomDateInPastWeeks(2); // Date within past 2 weeks
										break;
									case 'MULTIPLE_CHOICE':
									case 'DROPDOWN':
										if (question.options.length > 0) {
											const selectedOption = getRandomElement(question.options);
											answerData.selectedOptions = {
												create: [
													{
														optionId: selectedOption.id
													}
												]
											};
										}
										break;
									case 'CHECKBOX':
										if (question.options.length > 0) {
											const selectedOptions = getRandomElements(
												question.options,
												Math.floor(Math.random() * question.options.length) + 1
											);
											answerData.selectedOptions = {
												create: selectedOptions.map((option) => ({
													optionId: option.id
												}))
											};
										}
										break;
								}

								return answerData;
							})
						)
					}
				}
			});

			submissions.push(submission);
			console.log(`Created submission for user ${user.email} on form ${form.name}`);
		}
	}

	return submissions;
}

async function createAnnouncements(users) {
	console.log('Creating announcements...');

	const announcements = [];
	const adminUsers = users.filter((u) => u.role === 'ADMIN');

	for (const announcementData of sampleAnnouncements) {
		const adminUser = getRandomElement(adminUsers);

		const announcement = await prisma.announcement.create({
			data: {
				userId: adminUser.id,
				title: announcementData.title,
				message: announcementData.message
			}
		});

		announcements.push(announcement);
		console.log(`Created announcement: ${announcement.title}`);
	}

	return announcements;
}

async function main() {
	try {
		console.log('Starting test data generation...');

		// Create data in order of dependencies
		const users = await createUsers();
		const questionTemplates = await createQuestionTemplates();
		const formDrafts = await createFormDrafts();
		const formGroups = await createFormGroups();
		const publishedForms = await createPublishedForms(formDrafts, formGroups);
		const submissions = await createSubmissions(users, publishedForms);
		const announcements = await createAnnouncements(users);

		console.log('\n=== Test Data Generation Complete ===');
		console.log(`Created ${users.length} users`);
		console.log(`Created ${questionTemplates.length} question templates`);
		console.log(`Created ${formDrafts.length} form drafts`);
		console.log(`Created ${formGroups.length} form groups`);
		console.log(`Created ${publishedForms.length} published forms`);
		console.log(`Created ${submissions.length} submissions`);
		console.log(`Created ${announcements.length} announcements`);
		console.log('\nYou can now test the application with this sample data!');
	} catch (error) {
		console.error('Error generating test data:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
