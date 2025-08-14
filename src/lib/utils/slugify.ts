export function slugify(str: string) {
	return str
		.trim() // Remove leading/trailing whitespace
		.toLowerCase() // Convert to lowercase
		.normalize('NFD') // Normalize unicode characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
		.replace(/\s+/g, '-') // Replace spaces (and multiple spaces) with hyphens
		.replace(/[^a-z0-9-]/g, '') // Remove any character that's not a letter, number, or hyphen
		.replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
		.replace(/^-|-$/g, ''); // Remove leading or trailing hyphens
}
