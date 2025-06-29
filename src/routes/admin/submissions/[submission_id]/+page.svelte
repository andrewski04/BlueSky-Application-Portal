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

	const { formWithAnswers } = data;
</script>

<svelte:head>
	<title>View Submission</title>
</svelte:head>

<AdminNavBar
	message={`Viewing Submission: ${formWithAnswers ? formWithAnswers.user.firstName : 'Unknown'} ${formWithAnswers ? formWithAnswers.user.lastName : ''}`}
/>

<div class="container mx-auto p-6">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Submission Details</h1>
		<a href="/admin/submissions" class="btn btn-danger px-3 py-1">Back</a>
	</div>
	{#if formWithAnswers}
		<div class="mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
			<p><b>Last Updated:</b> {formWithAnswers.updatedAt}</p>
			<p>
				<b>Submitted By:</b>
				{formWithAnswers.user.lastName}, {formWithAnswers.user.firstName}
			</p>
			<p><b>Form Name:</b> {formWithAnswers.name}</p>
			<p><b>Submitter Email:</b> {formWithAnswers.user.email}</p>
			<p><b>Status:</b> {formWithAnswers.status}</p>
		</div>

		{#each formWithAnswers.sections as section}
			<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-2xl font-semibold">{section.name}</h2>
				{#if section.description}
					<p class="mb-6 text-gray-700">{section.description}</p>
				{/if}

				{#each section.questions as question}
					<div class="mb-4 rounded-md border border-gray-100 bg-gray-50 p-4 shadow-sm">
						{#if question.type === 'TEXT'}
							<TextQuestion
								{question}
								existingAnswer={question.answer?.valueText}
								readonly={true}
							/>
						{:else if question.type === 'PARAGRAPH'}
							<ParagraphQuestion
								{question}
								existingAnswer={question.answer?.valueText}
								readonly={true}
							/>
						{:else if question.type === 'NUMBER'}
							<NumberQuestion
								{question}
								existingAnswer={question.answer?.valueNumber}
								readonly={true}
							/>
						{:else if question.type === 'DATE'}
							<DateQuestion
								{question}
								existingAnswer={question.answer?.valueDate}
								readonly={true}
							/>
						{:else if question.type === 'CHECKBOX'}
							<CheckboxQuestion
								{question}
								existingAnswer={question.answer?.selections.map((opt) => opt.id)}
								readonly={true}
							/>
						{:else if question.type === 'MULTIPLE_CHOICE'}
							<MultipleChoiceQuestion
								{question}
								existingAnswer={question.answer?.selections[0]?.id}
								readonly={true}
							/>
						{:else if question.type === 'DROPDOWN'}
							<DropdownQuestion
								{question}
								existingAnswer={question.answer?.selections[0]?.id}
								readonly={true}
							/>
						{:else if question.type === 'FILE_UPLOAD'}
							<FileUploadQuestion
								{question}
								existingAnswer={question.answer?.file?.filename}
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
