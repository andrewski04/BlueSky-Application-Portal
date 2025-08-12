#!/usr/bin/env node

/**
 * Test Data Cleanup Script for BlueSky Application Portal
 *
 * This script removes all test data created by the generate-test-data.js script.
 * Use with caution as it will delete data from your database.
 *
 * Usage: node scripts/cleanup-test-data.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestData() {
	try {
		console.log('Starting test data cleanup...');

		// Delete in reverse order of dependencies to avoid foreign key constraint errors

		// 1. Delete submissions and answers
		console.log('Deleting submissions and answers...');
		const deletedAnswers = await prisma.answer.deleteMany({
			where: {
				application: {
					user: {
						email: {
							in: [
								'admin1@etsu.edu',
								'admin2@etsu.edu',
								'admin3@etsu.edu',
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
							]
						}
					}
				}
			}
		});
		console.log(`Deleted ${deletedAnswers.count} answers`);

		const deletedSubmissions = await prisma.applicationResponse.deleteMany({
			where: {
				user: {
					email: {
						in: [
							'admin1@etsu.edu',
							'admin2@etsu.edu',
							'admin3@etsu.edu',
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
						]
					}
				}
			}
		});
		console.log(`Deleted ${deletedSubmissions.count} submissions`);

		// 2. Delete published form questions and sections
		console.log('Deleting published form questions and sections...');
		const deletedPublishedQuestions = await prisma.questionLinkPublished.deleteMany({
			where: {
				section: {
					form: {
						name: {
							in: [
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
							]
						}
					}
				}
			}
		});
		console.log(`Deleted ${deletedPublishedQuestions.count} published form questions`);

		const deletedPublishedSections = await prisma.formSectionPublished.deleteMany({
			where: {
				form: {
					name: {
						in: [
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
						]
					}
				}
			}
		});
		console.log(`Deleted ${deletedPublishedSections.count} published form sections`);

		// 3. Delete published forms
		console.log('Deleting published forms...');
		const deletedPublishedForms = await prisma.applicationFormPublished.deleteMany({
			where: {
				name: {
					in: [
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
					]
				}
			}
		});
		console.log(`Deleted ${deletedPublishedForms.count} published forms`);

		// 4. Delete form groups
		console.log('Deleting form groups...');
		const deletedFormGroups = await prisma.applicationFormGroup.deleteMany({
			where: {
				name: {
					in: ['Spring 2024', 'Summer 2024', 'Fall 2024', 'Spring 2025', 'Summer 2025']
				}
			}
		});
		console.log(`Deleted ${deletedFormGroups.count} form groups`);

		// 5. Delete draft form questions and sections
		console.log('Deleting draft form questions and sections...');
		const deletedDraftQuestions = await prisma.questionLinkDraft.deleteMany({
			where: {
				section: {
					form: {
						name: {
							in: [
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
							]
						}
					}
				}
			}
		});
		console.log(`Deleted ${deletedDraftQuestions.count} draft form questions`);

		const deletedDraftSections = await prisma.formSectionDraft.deleteMany({
			where: {
				form: {
					name: {
						in: [
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
						]
					}
				}
			}
		});
		console.log(`Deleted ${deletedDraftSections.count} draft form sections`);

		// 6. Delete draft forms
		console.log('Deleting draft forms...');
		const deletedDraftForms = await prisma.applicationFormDraft.deleteMany({
			where: {
				name: {
					in: [
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
					]
				}
			}
		});
		console.log(`Deleted ${deletedDraftForms.count} draft forms`);

		// 7. Delete question templates and versions
		console.log('Deleting question templates and versions...');
		const deletedQuestionOptions = await prisma.questionOption.deleteMany({
			where: {
				question: {
					template: {
						slug: {
							startsWith: 'template-'
						}
					}
				}
			}
		});
		console.log(`Deleted ${deletedQuestionOptions.count} question options`);

		const deletedQuestionVersions = await prisma.questionVersion.deleteMany({
			where: {
				template: {
					slug: {
						startsWith: 'template-'
					}
				}
			}
		});
		console.log(`Deleted ${deletedQuestionVersions.count} question versions`);

		const deletedQuestionTemplates = await prisma.questionTemplate.deleteMany({
			where: {
				slug: {
					startsWith: 'template-'
				}
			}
		});
		console.log(`Deleted ${deletedQuestionTemplates.count} question templates`);

		// 8. Delete announcements
		console.log('Deleting announcements...');
		const deletedAnnouncements = await prisma.announcement.deleteMany({
			where: {
				title: {
					in: [
						'Welcome to BlueSky Institute!',
						'Application Deadline Reminder',
						'New Program Features Available',
						'Technical Support Available',
						'Interview Scheduling Open'
					]
				}
			}
		});
		console.log(`Deleted ${deletedAnnouncements.count} announcements`);

		// 9. Delete users
		console.log('Deleting test users...');
		const deletedUsers = await prisma.user.deleteMany({
			where: {
				email: {
					in: [
						'admin1@etsu.edu',
						'admin2@etsu.edu',
						'admin3@etsu.edu',
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
					]
				}
			}
		});
		console.log(`Deleted ${deletedUsers.count} users`);

		console.log('\n=== Test Data Cleanup Complete ===');
		console.log('All test data has been removed from the database.');
	} catch (error) {
		console.error('Error during cleanup:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
	cleanupTestData();
}
