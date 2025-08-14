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
	import { enhance } from '$app/forms';
	import nProgress from 'nprogress';
	import { addNotif } from '$lib/utils/notify';
	import type { Prisma } from '@prisma/client';
	import { confirm } from '$lib/utils/confirmModal';

	type ApplicationComment = Prisma.ApplicationCommentGetPayload<{
		include: { reviewer: true };
	}>;

	let { data }: { data: PageData } = $props();

	let { formWithAnswers, isReadOnly, user, reviews: initialReviews } = data;

	let comments = $state(data.comments);
	let reviewAggregate = $state(data.reviewAggregate);
	let status = $state(formWithAnswers.status);

	let reviews = $state(initialReviews);
	let currentReview = $derived(reviews.find((r) => r.reviewer.id === user.id));
	let reviewRating = $state(initialReviews.find((r) => r.reviewer.id === user.id)?.rating ?? 5);

	let reviewOpen = $state(false);
	let commentOpen = $state(false);
	let comment = $state('');
	let isUpdatingStatus = $state(false);
	let isExporting = $state(false);

	async function exportSubmission() {
		try {
			nProgress.start();
			isExporting = true;

			// Create the export URL for this specific submission
			const exportUrl = `/admin/submissions/export?submissionId=${formWithAnswers.id}`;

			// Create a temporary link and trigger download
			const link = document.createElement('a');
			link.href = exportUrl;
			link.download = `submission-${formWithAnswers.user.lastName}-${formWithAnswers.user.firstName}-${new Date().toISOString().split('T')[0]}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			console.error('Error exporting submission:', error);
			alert('An error occurred while exporting the submission.');
		} finally {
			isExporting = false;
			nProgress.done();
		}
	}
</script>

<svelte:head>
	<title>View Submission</title>
</svelte:head>

<div class="main-content">
	<AdminNavBar
		message={`Viewing Submission: ${formWithAnswers ? formWithAnswers.user.firstName : 'Unknown'} ${formWithAnswers ? formWithAnswers.user.lastName : ''}`}
	/>

	<div class="mx-auto {reviewOpen || commentOpen ? 'max-w-[90%]' : 'max-w-[70%]'} p-6">
		<a href="/admin/submissions" class="btn-red mb-2 px-4 py-2">Back</a>

		{#if formWithAnswers}
			<div class="flex gap-6">
				<!-- Main Content - Submission Details -->
				<div class="flex-1">
					<div class="section-header mb-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
						<!-- Header with title and export button -->
						<div class="mb-4 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<h1 class="text-3xl font-bold text-gray-800">
									<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Submission</span>
									{formWithAnswers.user.lastName}, {formWithAnswers.user.firstName}
								</h1>
							</div>
							<button
								onclick={exportSubmission}
								disabled={isExporting}
								class="btn-blue flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
								title="Export this submission as PDF"
							>
								{#if isExporting}
									<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Generating PDF...
								{:else}
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Export PDF
								{/if}
							</button>
						</div>
						{#if !isReadOnly && status === 'DRAFT'}
							<p class="w-fit rounded-md bg-red-100 p-2 px-4 text-sm text-red-800">
								This submission is in progress and the applicant can still edit their answers.
							</p>
						{/if}

						<!-- Metadata Grid -->
						<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							<div class="rounded-lg p-4">
								<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
									Submitter
								</h3>
								<p class="mb-1 text-sm text-gray-800">
									{formWithAnswers.user.firstName}
									{formWithAnswers.user.lastName}
								</p>

								<p class="mb-1 text-xs text-gray-600">{formWithAnswers.user.email}</p>
								<p class="mb-1 text-xs text-gray-600">
									{#if formWithAnswers.user.phoneNumber}
										{formatPhoneNumber(formWithAnswers.user.phoneNumber)}
									{:else}
										No phone number
									{/if}
								</p>
								<a
									href="/admin/users/{formWithAnswers.user.id}"
									class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
								>
									View User →
								</a>
							</div>
							<div class="rounded-lg p-4">
								<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
									Form Name
								</h3>
								<p class="text-sm text-gray-800">{formWithAnswers.name}</p>
								<a
									href="/admin/published-forms/{formWithAnswers.form.id}"
									class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
								>
									View Form →
								</a>
							</div>
							<div class="rounded-lg p-4">
								<h3 class="mb-1 text-sm font-semibold tracking-wide text-gray-600 uppercase">
									Status
								</h3>
								{#if status !== 'DRAFT'}
									<!-- Current Status Badge -->
									<div class="mb-2">
										<span class="text-xs text-gray-600">Current Status:</span>

										{#if status === 'SUBMITTED'}
											<span class="ml-2 rounded-lg bg-blue-300 px-2 py-1 text-xs text-blue-800"
												>Submitted</span
											>
										{:else if status === 'UNDER_REVIEW'}
											<span class="ml-2 rounded-lg bg-purple-300 px-2 py-1 text-xs text-purple-800"
												>Under Review</span
											>
										{:else if status === 'APPROVED'}
											<span class="ml-2 rounded-lg bg-green-300 px-2 py-1 text-xs text-green-800"
												>Approved</span
											>
										{:else if status === 'REJECTED'}
											<span class="ml-2 rounded-lg bg-red-300 px-2 py-1 text-xs text-red-800"
												>Rejected</span
											>
										{/if}
									</div>

									<form
										method="POST"
										action="?/updateStatus"
										class="flex items-stretch gap-2"
										use:enhance={({ formData }) => {
											nProgress.start();
											isUpdatingStatus = true;
											return async ({ result }) => {
												isUpdatingStatus = false;
												if (result.type === 'success') {
													// Update local state
													status = (result.data as any)?.status;
													addNotif('Status updated successfully', 'success');
												} else if (result.type === 'failure') {
													addNotif(result.data?.error as string, 'error');
												}
												nProgress.done();
											};
										}}
									>
										<select
											name="status"
											class="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
										>
											<option value="DRAFT"> Draft </option>
											<option value="SUBMITTED" selected={status === 'SUBMITTED'}>
												Submitted
											</option>
											<option value="UNDER_REVIEW" selected={status === 'UNDER_REVIEW'}>
												Under Review
											</option>
											<option value="APPROVED" selected={status === 'APPROVED'}> Approved </option>
											<option value="REJECTED" selected={status === 'REJECTED'}> Rejected </option>
										</select>
										<button
											type="submit"
											class="btn-blue rounded px-2 py-1 text-xs"
											disabled={isUpdatingStatus}
										>
											{isUpdatingStatus ? 'Updating...' : 'Update'}
										</button>
									</form>
								{:else}
									<p class="text-sm text-gray-800">
										{#if status === 'DRAFT'}
											<span class="rounded-lg bg-yellow-300 px-2 py-1 text-yellow-800">Draft</span>
										{:else if status === 'SUBMITTED'}
											<span class="rounded-lg bg-blue-300 px-2 py-1 text-blue-800">Submitted</span>
										{:else if status === 'UNDER_REVIEW'}
											<span class="rounded-lg bg-purple-300 px-2 py-1 text-purple-800">
												Under Review
											</span>
										{:else if status === 'APPROVED'}
											<span class="rounded-lg bg-green-300 px-2 py-1 text-green-800">Approved</span>
										{:else if status === 'REJECTED'}
											<span class="rounded-lg bg-red-300 px-2 py-1 text-red-800">Rejected</span>
										{/if}
									</p>
								{/if}
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
						<button
							class="btn-blue w-fit rounded-md px-4 py-2 text-sm"
							onclick={() => (reviewOpen = !reviewOpen)}
						>
							{reviewOpen ? 'Close Reviews' : 'Open Reviews'}
						</button>
						<button
							class="btn-blue w-fit rounded-md px-4 py-2 text-sm"
							onclick={() => (commentOpen = !commentOpen)}
						>
							{commentOpen ? 'Close Comments' : 'Open Comments'}
						</button>
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
				</div>

				{#if reviewOpen}
					<!-- Reviews Sidebar -->
					<div class="w-80 flex-shrink-0">
						<div class="sticky top-6 space-y-6">
							<!-- Add Review Form -->
							<div class="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
								<div class="mb-4 flex items-center justify-between">
									{#if currentReview}
										<h3 class=" text-lg font-semibold text-gray-900">Update Review</h3>
									{:else}
										<h3 class=" text-lg font-semibold text-gray-900">Add Review</h3>
									{/if}
									<button
										aria-label="Close Review"
										class="btn-red p-2"
										onclick={() => (reviewOpen = false)}
									>
										<svg
											fill="#FFFFFF"
											height="8px"
											width="8px"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink"
											viewBox="0 0 460.775 460.775"
											xml:space="preserve"
										>
											<path
												d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
	c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
	c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
	c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
	l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
	c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
											/>
										</svg>
									</button>
								</div>
								<form
									method="POST"
									action="?/review"
									class="space-y-4"
									use:enhance={() => {
										nProgress.start();
										return ({ result }) => {
											if (result.type === 'success') {
												if (!currentReview) {
													reviews.push({
														id: '',
														createdAt: new Date(),
														updatedAt: new Date(),
														reviewerId: user.id,
														reviewer: user,
														rating: reviewRating,
														applicationId: formWithAnswers.id
													});
												} else {
													reviews = reviews.map((r) => {
														if (r.reviewer.id === user.id) {
															return { ...r, rating: reviewRating };
														}
														return r;
													});
												}
												currentReview = reviews.find((r) => r.reviewer.id === user.id);

												reviewAggregate = result.data?.reviewAggregate as number;

												addNotif('Review submitted successfully', 'success');
											} else if (result.type === 'failure') {
												addNotif(result.data?.error as string, 'error');
											} else {
												addNotif('An unknown error occurred', 'error');
											}
											nProgress.done();
										};
									}}
								>
									<div>
										<label for="rating" class="mb-2 block text-sm font-medium text-gray-700">
											Rating (1-10)
										</label>
										<div class="flex items-center gap-4">
											<input
												type="range"
												id="rating"
												name="rating"
												min="1"
												max="10"
												bind:value={reviewRating}
												class="flex-1"
											/>
											<span class="w-12 text-center text-lg font-semibold text-blue-600">
												{reviewRating}
											</span>
										</div>
										{#if currentReview}
											<div class="mt-2 w-full text-center">
												<p class="text-sm font-medium text-gray-700">
													Current Review: {currentReview.rating}/10
												</p>
											</div>
										{/if}
									</div>

									<button
										type="submit"
										class="btn-blue w-full rounded-md px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
									>
										{currentReview ? 'Update Review' : 'Submit Review'}
									</button>
								</form>
							</div>

							<!-- Reviews List -->
							{#if reviews && reviews.length > 0}
								<div class="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
									<h3 class="mb-4 text-lg font-semibold text-gray-900">Reviews</h3>
									{#if reviewAggregate !== -1}
										<div class="mb-4 rounded-md border border-gray-100 bg-gray-50 p-4">
											<div class="mb-2">
												<div class="mb-2">
													<span class="text-sm font-bold text-gray-700"> Average Rating </span>
												</div>
												<div class="flex items-center gap-2">
													<!-- Number rating out of 10 -->
													<span class="text-lg font-semibold text-blue-600">
														{reviewAggregate.toFixed(1)}/10
													</span>
													<!-- Stars on 1-5 scale (converting from 1-10 to 1-5) -->
													<div class="flex items-center gap-1">
														{#each Array(5) as _, i}
															{#if i < Math.round(reviewAggregate / 2)}
																<svg
																	class="h-6 w-6 fill-current text-yellow-400"
																	viewBox="0 0 20 20"
																>
																	<path
																		d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																	/>
																</svg>
															{:else}
																<svg class="h-6 w-6 fill-current text-gray-300" viewBox="0 0 20 20">
																	<path
																		d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																	/>
																</svg>
															{/if}
														{/each}
													</div>
												</div>
											</div>
										</div>
									{/if}
									<div class="space-y-4">
										{#each reviews as review}
											<div class="rounded-md border border-gray-100 bg-gray-50 p-4">
												<div class="mb-2">
													<div class="mb-2">
														<span class="text-sm font-medium text-gray-700">
															{review.reviewer.firstName}
															{review.reviewer.lastName}
														</span>
														{#if review.reviewer.id === user.id}
															<span class="ml-1 text-xs text-gray-500"> (You) </span>
														{:else}
															<span class="ml-1 text-xs text-gray-500"
																>({review.reviewer.email})</span
															>
														{/if}
													</div>
													<div class="flex items-center gap-2">
														<!-- Number rating out of 10 -->
														<span class="text-lg font-semibold text-blue-600">
															{review.rating}/10
														</span>
														<!-- Stars on 1-5 scale (converting from 1-10 to 1-5) -->
														<div class="flex items-center gap-1">
															{#each Array(5) as _, i}
																{#if i < Math.round(review.rating / 2)}
																	<svg
																		class="h-6 w-6 fill-current text-yellow-400"
																		viewBox="0 0 20 20"
																	>
																		<path
																			d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																		/>
																	</svg>
																{:else}
																	<svg
																		class="h-6 w-6 fill-current text-gray-300"
																		viewBox="0 0 20 20"
																	>
																		<path
																			d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
																		/>
																	</svg>
																{/if}
															{/each}
														</div>
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{:else}
								<div class="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
									<h3 class="mb-4 text-lg font-semibold text-gray-900">Reviews</h3>
									<p class="text-sm text-gray-500">
										No reviews yet. Be the first to review this submission!
									</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				{#if commentOpen}
					<!-- Comments Section -->
					<div class="w-80 flex-shrink-0">
						<div class="sticky top-6 space-y-6">
							<div class="rounded-md border border-gray-200 bg-white p-6 shadow-sm">
								<div class="mb-4 flex items-center justify-between">
									<h3 class=" text-lg font-semibold text-gray-900">Comments</h3>
									<button
										aria-label="Close Comments"
										class="btn-red p-2"
										onclick={() => (commentOpen = false)}
									>
										<svg
											fill="#FFFFFF"
											height="8px"
											width="8px"
											xmlns="http://www.w3.org/2000/svg"
											xmlns:xlink="http://www.w3.org/1999/xlink"
											viewBox="0 0 460.775 460.775"
											xml:space="preserve"
										>
											<path
												d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
											/>
										</svg>
									</button>
								</div>
								<!-- Add Comment Form  -->
								<form
									method="POST"
									action="?/addComment"
									class="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4"
									use:enhance={() => {
										nProgress.start();
										return async ({ result }) => {
											if (result.type === 'success') {
												addNotif('Comment added successfully', 'success');
												comments = [...comments, result.data?.comment as ApplicationComment];
												comment = '';
											} else if (result.type === 'failure') {
												addNotif(result.data?.error as string, 'error');
											} else {
												addNotif('An unknown error occurred', 'error');
											}
											nProgress.done();
										};
									}}
								>
									<div class="mb-3">
										<label for="comment" class="mb-2 block text-sm font-medium text-gray-700">
											Add Comment
										</label>
										<textarea
											name="comment"
											class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
											rows="3"
											bind:value={comment}
											placeholder="Add your comment here..."
										></textarea>
									</div>
									<button
										type="submit"
										class="btn-blue rounded-md px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
									>
										Add Comment
									</button>
								</form>

								<!-- Comments List -->
								{#if comments && comments.length > 0}
									<div class="space-y-4">
										{#each comments as comment}
											<div class="rounded-md border border-gray-100 bg-gray-50 p-4">
												<div class="mb-2">
													<div class="mb-2 flex items-center justify-between">
														<div>
															<span class="text-sm font-medium text-gray-700">
																{comment.reviewer.firstName}
																{comment.reviewer.lastName}
															</span>
															{#if comment.reviewer.id === user.id}
																<span class="ml-1 text-xs text-gray-500"> (You) </span>
															{:else}
																<span class="ml-1 text-xs text-gray-500"
																	>({comment.reviewer.email})</span
																>
															{/if}
														</div>
														{#if comment.reviewer.id === user.id}
															<form
																method="POST"
																action="?/deleteComment"
																class="inline"
																use:enhance={async ({ cancel, formData }) => {
																	if (
																		!(await confirm(
																			'Are you sure you want to delete this comment?',
																			'Delete Comment',
																			'Cancel',
																			'Confirm Comment Deletion'
																		))
																	) {
																		cancel();
																		return;
																	}
																	formData.append('commentId', comment.id);
																	nProgress.start();
																	return async ({ result }) => {
																		if (result.type === 'success') {
																			addNotif('Comment deleted successfully', 'success');
																			comments = comments.filter((c) => c.id !== comment.id);
																		} else if (result.type === 'failure') {
																			addNotif(result.data?.error as string, 'error');
																		} else {
																			addNotif('An unknown error occurred', 'error');
																		}
																		nProgress.done();
																	};
																}}
															>
																<input type="hidden" name="commentId" value={comment.id} />
																<button
																	type="submit"
																	class="text-xs font-medium text-red-600 hover:text-red-800"
																	title="Delete comment"
																>
																	Delete
																</button>
															</form>
														{/if}
													</div>
													<div class="text-sm text-gray-600">
														{comment.comment}
													</div>
													<div class="mt-2 text-xs text-gray-500">
														{new Date(comment.createdAt).toLocaleDateString()} at {new Date(
															comment.createdAt
														).toLocaleTimeString()}
													</div>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="rounded-md border border-gray-100 bg-gray-50 p-4">
										<p class="text-sm text-gray-500">
											No comments yet. Be the first to comment on this submission!
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<p>Could not load submission details.</p>
		{/if}
	</div>
</div>
