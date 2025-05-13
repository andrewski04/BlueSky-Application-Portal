<script lang="ts">
	import type { PageData } from './$types';
	import type { Answer, AnswerOptionSelection } from '@prisma/client';

	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';

	let { data }: { data: PageData } = $props();

	const { applicationForm, applicationResponse, user } = data;

	function findExistingAnswer(
		questionId: string
	): (Answer & { selectedOptions: AnswerOptionSelection[] }) | undefined {
		const answer = applicationResponse?.answers.find((answer) => answer.questionId === questionId);
		return answer as (Answer & { selectedOptions: AnswerOptionSelection[] }) | undefined;
	}
</script>

<svelte:head>
	<title>View Submission</title>
</svelte:head>

<AdminNavBar message={`Welcome to the admin dashboard, ${user.firstName}!`} />

<div class="container mx-auto p-6">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Submission Details</h1>
		<a href="/admin/submissions" class="btn btn-danger px-3 py-1">Back</a>
	</div>
	{#if applicationForm && applicationResponse}
		<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
			<p><b>Last Updated:</b> {applicationResponse.updatedAt}</p>
			<p>
				<b>Submitted By:</b>
				{applicationResponse.user.lastName}, {applicationResponse.user.firstName}
			</p>
			<p><b>Form Name:</b> {applicationForm.name}</p>
			<p><b>Submitter Email:</b> {applicationResponse.user.email}</p>
			<p><b>Status:</b> {applicationResponse.status}</p>
		</div>

		{#each applicationForm.sections as section}
			<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-2xl font-semibold">{section.name}</h2>
				{#if section.description}
					<p class="mb-6 text-gray-700">{section.description}</p>
				{/if}

				{#each section.questions as question}
					{@const existingAnswer = findExistingAnswer(question.id)}
					<div class="mb-4 rounded-md border border-gray-100 bg-gray-50 p-4 shadow-sm">
						{#if question.type === 'TEXT'}
							<TextQuestion {question} existingAnswer={existingAnswer?.valueText} readonly={true} />
						{:else if question.type === 'PARAGRAPH'}
							<ParagraphQuestion
								{question}
								existingAnswer={existingAnswer?.valueText}
								readonly={true}
							/>
						{:else if question.type === 'NUMBER'}
							<NumberQuestion
								{question}
								existingAnswer={existingAnswer?.valueNumber}
								readonly={true}
							/>
						{:else if question.type === 'DATE'}
							<DateQuestion {question} existingAnswer={existingAnswer?.valueDate} readonly={true} />
						{:else if question.type === 'CHECKBOX'}
							<CheckboxQuestion
								{question}
								existingAnswer={existingAnswer?.selectedOptions.map((opt) => opt.optionId)}
								readonly={true}
							/>
						{:else if question.type === 'MULTIPLE_CHOICE'}
							<MultipleChoiceQuestion
								{question}
								existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
								readonly={true}
							/>
						{:else if question.type === 'DROPDOWN'}
							<DropdownQuestion
								{question}
								existingAnswer={existingAnswer?.selectedOptions[0]?.optionId}
								readonly={true}
							/>
						{:else if question.type === 'FILE_UPLOAD'}
							<FileUploadQuestion
								{question}
								existingAnswer={existingAnswer?.fileUploadId}
								readonly={true}
							/>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	{:else}
		<p>Could not load submission details.</p>
	{/if}
</div>
