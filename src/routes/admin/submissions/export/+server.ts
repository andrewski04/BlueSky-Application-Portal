import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireRole } from '$lib/server/auth/guard';
import { Logger } from '$lib/utils/logger';
import { prisma, prismaResult } from '$lib/server/prisma';
import { getApplicationFormWithAnswers } from '$lib/server/application/formResponseService';
import type { Prisma } from '@prisma/client';
import puppeteer from 'puppeteer';
import { formatPhoneNumber } from '$lib/utils/formatPhoneNumber';

const log = new Logger('submissions-export-api');

export const GET: RequestHandler = async ({ locals, url }) => {
	requireRole(locals, 'ADMIN');

	// Check if this is a single submission export
	const submissionId = url.searchParams.get('submissionId');

	if (submissionId) {
		// Single submission export
		return await exportSingleSubmission(submissionId);
	}

	// Get query parameters (same as the main submissions endpoint)
	const search = url.searchParams.get('search') || '';
	const statusFilter = url.searchParams.get('status') || 'all';
	const groupFilter = url.searchParams.get('group') || 'all';
	const formFilter = url.searchParams.get('form') || 'all';
	const dateFromFilter = url.searchParams.get('dateFrom') || '';
	const dateToFilter = url.searchParams.get('dateTo') || '';
	const showAdminSubmissions = url.searchParams.get('showAdminSubmissions') === 'true';

	// Build where clause for filtering (same logic as main endpoint)
	const where: Prisma.ApplicationResponseWhereInput = {};

	if (search) {
		where.OR = [
			{
				user: {
					OR: [
						{ firstName: { contains: search, mode: 'insensitive' } },
						{ lastName: { contains: search, mode: 'insensitive' } },
						{ email: { contains: search, mode: 'insensitive' } }
					]
				}
			},
			{ id: { contains: search, mode: 'insensitive' } }
		];
	}

	if (statusFilter !== 'all') {
		where.status = statusFilter as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
	}

	if (groupFilter !== 'all') {
		where.form = {
			groupId: groupFilter
		};
	}

	if (formFilter !== 'all') {
		where.formId = formFilter;
	}

	if (dateFromFilter || dateToFilter) {
		const dateFilters: Prisma.ApplicationResponseWhereInput[] = [];

		if (dateFromFilter || dateToFilter) {
			const dateCondition: Prisma.DateTimeFilter = {};
			if (dateFromFilter) dateCondition.gte = new Date(dateFromFilter);
			if (dateToFilter) dateCondition.lte = new Date(dateToFilter + 'T23:59:59');

			dateFilters.push({ submittedAt: dateCondition });
			dateFilters.push({ updatedAt: dateCondition });
		}

		if (where.OR) {
			where.OR = [...where.OR, ...dateFilters];
		} else {
			where.OR = dateFilters;
		}
	}

	// Filter out admin submissions if showAdminSubmissions is false
	if (!showAdminSubmissions) {
		where.user = {
			role: { not: 'ADMIN' }
		};
	} else {
		where.user = {
			role: { in: ['ADMIN', 'USER'] }
		};
	}

	// Get all filtered responses (no pagination for export)
	const applicationResponses = await prismaResult(
		prisma.applicationResponse.findMany({
			where,
			include: {
				user: true,
				form: {
					include: {
						group: {
							select: {
								name: true
							}
						}
					}
				}
			},
			orderBy: [
				{ form: { group: { name: 'asc' } } },
				{ form: { name: 'asc' } },
				{ user: { lastName: 'asc' } },
				{ user: { firstName: 'asc' } }
			]
		})
	);

	if (applicationResponses.isErr()) {
		log.error('Error getting application responses for export', applicationResponses.error);
		return json(
			{ error: 'An error occurred while loading the application responses.' },
			{ status: 500 }
		);
	}

	if (applicationResponses.value.length === 0) {
		return json({ error: 'No submissions found with the current filters.' }, { status: 404 });
	}

	try {
		// Generate PDF using Puppeteer
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();

		// Generate HTML content for the PDF
		const htmlContent = await generateExportHTML(applicationResponses.value);

		await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

		// Generate PDF
		const pdfBuffer = await page.pdf({
			format: 'A4',
			margin: {
				top: '0.5in',
				right: '0.5in',
				bottom: '0.5in',
				left: '0.5in'
			},
			printBackground: true
		});

		await browser.close();

		// Return PDF as response
		return new Response(pdfBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="submissions-export-${new Date().toISOString().split('T')[0]}.pdf"`,
				'Content-Length': pdfBuffer.length.toString()
			}
		});
	} catch (error) {
		log.error('Error generating PDF export', error);
		return json({ error: 'An error occurred while generating the PDF export.' }, { status: 500 });
	}
};

async function exportSingleSubmission(submissionId: string) {
	try {
		// Get the submission data
		const submissionResult = await prismaResult(
			prisma.applicationResponse.findUnique({
				where: { id: submissionId },
				include: {
					user: true,
					form: {
						include: {
							group: {
								select: {
									name: true
								}
							}
						}
					}
				}
			})
		);

		if (submissionResult.isErr() || !submissionResult.value) {
			return json({ error: 'Submission not found.' }, { status: 404 });
		}

		const submission = submissionResult.value;

		// Generate PDF using Puppeteer
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();

		// Generate HTML content for the PDF
		const htmlContent = await generateExportHTML([submission]);

		await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

		// Generate PDF
		const pdfBuffer = await page.pdf({
			format: 'A4',
			margin: {
				top: '0.5in',
				right: '0.5in',
				bottom: '0.5in',
				left: '0.5in'
			},
			printBackground: true
		});

		await browser.close();

		// Return PDF as response
		return new Response(pdfBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="submission-${submission.user.lastName}-${submission.user.firstName}-${new Date().toISOString().split('T')[0]}.pdf"`,
				'Content-Length': pdfBuffer.length.toString()
			}
		});
	} catch (error) {
		log.error('Error generating single submission PDF export', error);
		return json({ error: 'An error occurred while generating the PDF export.' }, { status: 500 });
	}
}

async function generateExportHTML(
	submissions: {
		id: string;
		form: { id: string };
	}[]
): Promise<string> {
	const submissionHTMLs = await Promise.all(
		submissions.map(async (submission) => {
			// Get the full form data with answers for each submission
			const formWithAnswers = await getApplicationFormWithAnswers(
				submission.id,
				submission.form.id
			);
			if (formWithAnswers.isErr()) {
				log.error(`Error getting form data for submission ${submission.id}`, formWithAnswers.error);
				return '';
			}

			return generateSubmissionHTML(formWithAnswers.value, submission);
		})
	);

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>Submissions Export</title>
			<style>
				body {
					font-family: Arial, sans-serif;
					line-height: 1.6;
					color: #333;
					margin: 0;
					padding: 20px;
				}
				.submission {
					page-break-inside: avoid;
					margin-bottom: 40px;
					border: 1px solid #ddd;
					padding: 20px;
					border-radius: 8px;
				}
				.submission-header {
					background-color: #f8f9fa;
					padding: 15px;
					margin: -20px -20px 20px -20px;
					border-radius: 8px 8px 0 0;
					border-bottom: 1px solid #ddd;
				}
				.submission-title {
					font-size: 24px;
					font-weight: bold;
					color: #2c3e50;
					margin: 0 0 10px 0;
				}
				.metadata-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 15px;
					margin-bottom: 20px;
				}
				.metadata-item {
					background-color: #fff;
					padding: 10px;
					border-radius: 4px;
					border: 1px solid #e9ecef;
				}
				.metadata-label {
					font-size: 12px;
					font-weight: bold;
					color: #6c757d;
					text-transform: uppercase;
					margin-bottom: 5px;
				}
				.metadata-value {
					font-size: 14px;
					color: #333;
				}
				.section {
					margin-bottom: 25px;
				}
				.section-title {
					font-size: 20px;
					font-weight: bold;
					color: #495057;
					margin-bottom: 15px;
					padding-bottom: 5px;
					border-bottom: 2px solid #007bff;
				}
				.section-description {
					color: #6c757d;
					margin-bottom: 20px;
					font-style: italic;
				}
				.question {
					background-color: #f8f9fa;
					padding: 15px;
					margin-bottom: 15px;
					border-radius: 6px;
					border-left: 4px solid #007bff;
				}
				.question-text {
					font-weight: bold;
					color: #495057;
					margin-bottom: 10px;
					font-size: 16px;
				}
				.question-required {
					color: #dc3545;
					font-size: 14px;
				}
				.answer {
					background-color: #fff;
					padding: 10px;
					border-radius: 4px;
					border: 1px solid #dee2e6;
					min-height: 20px;
				}
				.answer-text {
					color: #333;
					font-size: 14px;
				}
				.answer-placeholder {
					color: #6c757d;
					font-style: italic;
				}
				.file-upload-info {
					background-color: #e3f2fd;
					padding: 10px;
					border-radius: 4px;
					border: 1px solid #2196f3;
				}
				.page-break {
					page-break-before: always;
				}
				@media print {
					.submission {
						page-break-inside: avoid;
					}
				}
			</style>
		</head>
		<body>
			${submissionHTMLs.join('')}
		</body>
		</html>
	`;
}

// @ts-expect-error - formWithAnswers and submission are not typed
async function generateSubmissionHTML(formWithAnswers, submission): Promise<string> {
	const sectionsHTML = formWithAnswers.sections
		// @ts-expect-error - see above
		.map((section) => {
			const questionsHTML = section.questions
				// @ts-expect-error - see above
				.map((question) => {
					const answer = question.Answer[0];
					let answerHTML = '';

					if (answer) {
						switch (question.questionVersion.type) {
							case 'TEXT':
							case 'PARAGRAPH':
								answerHTML =
									answer.valueText || '<span class="answer-placeholder">No answer provided</span>';
								break;
							case 'NUMBER':
								answerHTML =
									answer.valueNumber?.toString() ||
									'<span class="answer-placeholder">No answer provided</span>';
								break;
							case 'DATE':
								answerHTML = answer.valueDate
									? new Date(answer.valueDate).toLocaleDateString()
									: '<span class="answer-placeholder">No answer provided</span>';
								break;
							case 'CHECKBOX':
							case 'MULTIPLE_CHOICE':
							case 'DROPDOWN':
								if (answer.selectedOptions && answer.selectedOptions.length > 0) {
									// @ts-expect-error - see above
									answerHTML = answer.selectedOptions.map((opt) => opt.option.text).join(', ');
								} else {
									answerHTML = '<span class="answer-placeholder">No answer provided</span>';
								}
								break;
							case 'FILE_UPLOAD':
								if (answer.fileUploadId) {
									answerHTML = `
								<div class="file-upload-info">
									<strong>File uploaded:</strong> ${answer.FileUpload?.originalName || 'Unknown file'}
								</div>
							`;
								} else {
									answerHTML = '<span class="answer-placeholder">No file uploaded</span>';
								}
								break;
							case 'MULTIPLE_CHOICE_GRID':
							case 'CHECKBOX_GRID':
								if (answer.selectedOptions && answer.selectedOptions.length > 0) {
									answerHTML = answer.selectedOptions
										// @ts-expect-error - see above
										.map((opt) => {
											return `<div class="answer-text">${opt.option.questionOptionGroup?.text} - ${opt.option.text}</div>`;
										})
										.join('');
								} else {
									answerHTML = '<span class="answer-placeholder">No answer provided</span>';
								}
								break;
							default:
								answerHTML = '<span class="answer-placeholder">Unsupported question type</span>';
						}
					} else {
						answerHTML = '<span class="answer-placeholder">No answer provided</span>';
					}

					return `
				<div class="question">
					<div class="question-text">${question.questionVersion.prompt} ${
						question.required ? '<span class="question-required">* Required</span>' : ''
					}</div>
					<div class="answer">
						<div class="answer-text">${answerHTML}</div>
					</div>
				</div>
			`;
				})
				.join('');

			return `
			<div class="section">
				<h2 class="section-title">${section.name}</h2>
				${section.description ? `<div class="section-description">${section.description}</div>` : ''}
				${questionsHTML}
			</div>
		`;
		})
		.join('');

	return `
		<div class="submission">
			<div class="submission-header">
				<h1 class="submission-title">
					${submission.user.lastName}, ${submission.user.firstName}
				</h1>
				<div class="metadata-grid">
					<div class="metadata-item">
						<div class="metadata-label">Submitter</div>
						<div class="metadata-value">
							${submission.user.firstName} ${submission.user.lastName}
						</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Email</div>
						<div class="metadata-value">${submission.user.email}</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Phone</div>
						<div class="metadata-value">
							${submission.user.phoneNumber ? formatPhoneNumber(submission.user.phoneNumber) : 'No phone number'}
						</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Form</div>
						<div class="metadata-value">${submission.form.name}</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Group</div>
						<div class="metadata-value">${submission.form.group?.name || 'No group assigned'}</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Status</div>
						<div class="metadata-value">${submission.status}</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Submitted</div>
						<div class="metadata-value">
							${submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
						</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Last Updated</div>
						<div class="metadata-value">
							${new Date(submission.updatedAt).toLocaleString()}
						</div>
					</div>
					<div class="metadata-item">
						<div class="metadata-label">Submission ID</div>
						<div class="metadata-value">${submission.id}</div>
					</div>
				</div>
			</div>
			${sectionsHTML}
		</div>
	`;
}
