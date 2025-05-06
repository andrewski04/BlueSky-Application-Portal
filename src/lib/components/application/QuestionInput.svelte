<script lang="ts">
	import type {
		ApplicationQuestion,
		TextQuestion,
		ParagraphQuestion,
		MultipleChoiceQuestion,
		DropdownQuestion,
		CheckboxQuestion,
		FileUploadQuestion,
		DateQuestion,
		NumberQuestion
	} from '$lib/server/application/applicationTypes';

	let {
		question,
		value,
		error,
		onChange
	}: {
		question: ApplicationQuestion;
		value: any;
		error: string | null;
		onChange: (value: any) => void;
	} = $props();

	// Reactive declaration to handle checkbox values
	const checkboxValues = $derived(Array.isArray(value) ? value : []);

	function handleCheckboxChange(optionId: string, checked: boolean) {
		if (checked) {
			onChange([...checkboxValues, optionId]);
		} else {
			onChange(checkboxValues.filter((id) => id !== optionId));
		}
	}
</script>

<div>
	<label for={question.id} class="mb-1 block text-sm font-medium text-gray-700">
		{question.prompt}
		{#if question.required}<span class="text-red-500">*</span>{/if}
	</label>

	{#if question.type === 'TEXT'}
		{@const textQuestion = question as TextQuestion}
		<input
			type="text"
			id={textQuestion.id}
			name={textQuestion.id}
			bind:value
			maxlength={textQuestion.maxLength}
			oninput={() => onChange(value)}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
			required={textQuestion.required}
		/>
	{:else if question.type === 'PARAGRAPH'}
		{@const paragraphQuestion = question as ParagraphQuestion}
		<textarea
			id={paragraphQuestion.id}
			name={paragraphQuestion.id}
			bind:value
			maxlength={paragraphQuestion.maxLength}
			oninput={() => onChange(value)}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
			required={paragraphQuestion.required}
			rows="4"
		></textarea>
	{:else if question.type === 'MULTIPLE_CHOICE'}
		{@const multipleChoiceQuestion = question as MultipleChoiceQuestion}
		<fieldset>
			<legend class="sr-only">{multipleChoiceQuestion.prompt}</legend>
			<div class="space-y-2">
				{#each multipleChoiceQuestion.options as option}
					<div class="flex items-center">
						<input
							type="radio"
							id={`${multipleChoiceQuestion.id}-${option.id}`}
							name={multipleChoiceQuestion.id}
							value={option.id}
							checked={value === option.id}
							onchange={() => onChange(option.id)}
							class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
							required={multipleChoiceQuestion.required}
						/>
						<label
							for={`${multipleChoiceQuestion.id}-${option.id}`}
							class="ml-3 text-sm text-gray-700"
						>
							{option.text}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>
	{:else if question.type === 'DROPDOWN'}
		{@const dropdownQuestion = question as DropdownQuestion}
		<select
			id={dropdownQuestion.id}
			name={dropdownQuestion.id}
			bind:value
			onchange={() => onChange(value)}
			required={dropdownQuestion.required}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
		>
			{#each dropdownQuestion.options as option}
				<option value={option.id}>{option.text}</option>
			{/each}
		</select>
	{:else if question.type === 'CHECKBOX'}
		{@const checkboxQuestion = question as CheckboxQuestion}
		<fieldset>
			<legend class="sr-only">{checkboxQuestion.prompt}</legend>
			<div class="space-y-2">
				{#each checkboxQuestion.options as option}
					<div class="flex items-center">
						<input
							type="checkbox"
							id={`${checkboxQuestion.id}-${option.id}`}
							name={checkboxQuestion.id}
							value={option.id}
							checked={checkboxValues.includes(option.id)}
							onchange={(e) => handleCheckboxChange(option.id, e.currentTarget.checked)}
							class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
							required={checkboxQuestion.required}
						/>
						<label for={`${checkboxQuestion.id}-${option.id}`} class="ml-3 text-sm text-gray-700">
							{option.text}
						</label>
					</div>
				{/each}
			</div>
		</fieldset>
	{:else if question.type === 'FILE_UPLOAD'}
		{@const fileUploadQuestion = question as FileUploadQuestion}
		<input
			type="file"
			id={fileUploadQuestion.id}
			name={fileUploadQuestion.id}
			required={fileUploadQuestion.required}
			accept={fileUploadQuestion.acceptedFileTypes.join(',')}
			multiple={false}
			onchange={(e) => onChange(e.currentTarget.files?.[0] || null)}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
		/>
		{#if fileUploadQuestion.acceptedFileTypes.length > 0}
			<p class="mt-1 text-xs text-gray-500">
				Accepted file types: {fileUploadQuestion.acceptedFileTypes.join(', ')}
			</p>
		{/if}
		{#if fileUploadQuestion.maxFileSizeBytes > 0}
			<p class="mt-1 text-xs text-gray-500">
				Max file size: {fileUploadQuestion.maxFileSizeBytes} bytes
			</p>
		{/if}
	{:else if question.type === 'DATE'}
		{@const dateQuestion = question as DateQuestion}
		<input
			type="date"
			id={dateQuestion.id}
			name={dateQuestion.id}
			required={dateQuestion.required}
			min={dateQuestion.minDate ? dateQuestion.minDate.toISOString().split('T')[0] : undefined}
			max={dateQuestion.maxDate ? dateQuestion.maxDate.toISOString().split('T')[0] : undefined}
			bind:value
			onchange={() => onChange(value)}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
		/>
	{:else if question.type === 'NUMBER'}
		{@const numberQuestion = question as NumberQuestion}
		<input
			type="number"
			id={numberQuestion.id}
			name={numberQuestion.id}
			required={numberQuestion.required}
			min={numberQuestion.minValue}
			max={numberQuestion.maxValue}
			bind:value
			oninput={() => onChange(value)}
			class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
			class:border-red-500={error}
		/>
	{/if}

	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}

	{#if question.type === 'TEXT' || question.type === 'PARAGRAPH'}
		<div class="mt-1 text-xs text-gray-500">
			{String(value || '').length}/{(question as TextQuestion | ParagraphQuestion).maxLength} characters
		</div>
	{/if}
</div>
