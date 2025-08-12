<script lang="ts">
	import type { PageData } from './$types';
	import { formatPhoneNumber } from '$lib/utils/formatPhoneNumber';

	import CheckboxQuestion from '$lib/components/application/CheckboxQuestion.svelte';
	import DateQuestion from '$lib/components/application/DateQuestion.svelte';
	import DropdownQuestion from '$lib/components/application/DropdownQuestion.svelte';
	import FileUploadQuestion from '$lib/components/application/FileUploadQuestion.svelte';
	import GridQuestion from '$lib/components/application/GridQuestion.svelte';
	import MultipleChoiceQuestion from '$lib/components/application/MultipleChoiceQuestion.svelte';
	import NumberQuestion from '$lib/components/application/NumberQuestion.svelte';
	import ParagraphQuestion from '$lib/components/application/ParagraphQuestion.svelte';
	import TextQuestion from '$lib/components/application/TextQuestion.svelte';
	import AdminNavBar from '$lib/components/dashboard/AdminNavBar.svelte';

	let { data }: { data: PageData } = $props();

	const { formWithAnswers, isReadOnly } = data;
</script>

<svelte:head>
	<title>View Submission</title>
</svelte:head>

<div class="main-content">
	<AdminNavBar
		message={`Viewing Submission: ${formWithAnswers ? formWithAnswers.user.firstName : 'Unknown'} ${formWithAnswers ? formWithAnswers.user.lastName : ''}`}
	/>

	<div class=" container mx-auto p-6">
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Submission Details</h1>
			<a href="/admin/submissions" class="btn-red px-3 py-1">Back</a>
		</div>
		{#if formWithAnswers}
			<div class="section-header mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
				<!-- Header with title and back button -->
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<h1 class="text-3xl font-bold text-gray-800">
							<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Submission</span>
							{formWithAnswers.user.lastName}, {formWithAnswers.user.firstName}
						</h1>
					</div>
				</div>
				{#if !isReadOnly && formWithAnswers.status === 'DRAFT'}
					<p class="w-fit rounded-md bg-red-100 p-2 px-4 text-sm text-red-800">
						This submission is in progress and the applicant can still edit their answers.
					</p>
				{/if}

				<!-- Metadata Grid -->
				<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Submitter
						</h3>
						<p class="text-sm text-gray-800">
							{formWithAnswers.user.firstName}
							{formWithAnswers.user.lastName}
						</p>
						<p class="text-xs text-gray-600">{formWithAnswers.user.email}</p>
						<p class="text-xs text-gray-600">
							{#if formWithAnswers.user.phoneNumber}
								{formatPhoneNumber(formWithAnswers.user.phoneNumber)}
							{:else}
								No phone number
							{/if}
						</p>
					</div>
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Form Name
						</h3>
						<p class="text-sm text-gray-800">{formWithAnswers.name}</p>
						<a
							href="/admin/published-forms/{formWithAnswers.id}"
							class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
						>
							View Form →
						</a>
					</div>
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">Status</h3>
						<p class="text-sm text-gray-800">
							<span
								class="rounded px-2 py-1 text-xs font-medium {formWithAnswers.status === 'DRAFT'
									? 'bg-yellow-100 text-yellow-800'
									: 'bg-green-100 text-green-800'}"
							>
								{formWithAnswers.status}
							</span>
						</p>
					</div>
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Last Updated
						</h3>
						<p class="text-sm text-gray-800">
							{formWithAnswers.updatedAt.toLocaleString('en-US', {
								timeZoneName: 'shortGeneric'
							})}
						</p>
					</div>
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Form Group
						</h3>
						<p class="text-sm text-gray-800">
							{formWithAnswers.group?.name ?? 'No group assigned'}
						</p>
					</div>
					<div class="rounded-lg p-4">
						<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
							Submission ID
						</h3>
						<p class="font-mono text-sm text-gray-800">{formWithAnswers.id}</p>
					</div>
				</div>
			</div>

			{#each formWithAnswers.sections as section}
				<div class="mb-8 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-2xl font-semibold">{section.name}</h2>
					{#if section.description}
						<p class="mb-6 text-gray-700">{section.description}</p>
					{/if}

					{#each section.questions as question}
						<div class="mb-4 rounded-md border border-gray-100 bg-gray-50 p-4 shadow-sm">
							{#if question.questionVersion.type === 'TEXT'}
								<TextQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.valueText}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'PARAGRAPH'}
								<ParagraphQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.valueText}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'NUMBER'}
								<NumberQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.valueNumber}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'DATE'}
								<DateQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.valueDate}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'CHECKBOX'}
								<CheckboxQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.selectedOptions?.map(
										(opt: { option: { id: string } }) => opt.option.id
									) ?? []}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'MULTIPLE_CHOICE'}
								<MultipleChoiceQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.selectedOptions[0]?.option.id}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'DROPDOWN'}
								<DropdownQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.selectedOptions[0]?.option.id}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'FILE_UPLOAD'}
								<FileUploadQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.fileUploadId}
									readonly={true}
								/>
							{:else if question.questionVersion.type === 'MULTIPLE_CHOICE_GRID' || question.questionVersion.type === 'CHECKBOX_GRID'}
								<GridQuestion
									question={question.questionVersion}
									required={question.required}
									existingAnswer={question.Answer[0]?.selectedOptions?.map(
										(opt: { option: { id: string } }) => opt.option.id
									) ?? []}
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
</div>
