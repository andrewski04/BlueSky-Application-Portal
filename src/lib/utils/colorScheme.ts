import type { ColorScheme } from '@prisma/client';

export const colorSchemeOptions: {
	value: ColorScheme | null;
	label: string;
	color: string;
	className: string;
}[] = [
	{ value: 'BLUE', label: 'Blue', color: '#3b82f6', className: 'application-section-header-blue' },
	{
		value: 'GREEN',
		label: 'Green',
		color: '#22c55e',
		className: 'application-section-header-green'
	},
	{
		value: 'PURPLE',
		label: 'Purple',
		color: '#a855f7',
		className: 'application-section-header-purple'
	},
	{ value: 'RED', label: 'Red', color: '#ef4444', className: 'application-section-header-red' },
	{ value: 'TEAL', label: 'Teal', color: '#14b8a6', className: 'application-section-header-teal' },
	{
		value: 'ORANGE',
		label: 'Orange',
		color: '#f97316',
		className: 'application-section-header-orange'
	},
	{ value: 'PINK', label: 'Pink', color: '#ec4899', className: 'application-section-header-pink' },
	{
		value: 'INDIGO',
		label: 'Indigo',
		color: '#6366f1',
		className: 'application-section-header-indigo'
	},
	{ value: 'CYAN', label: 'Cyan', color: '#06b6d4', className: 'application-section-header-cyan' },
	{
		value: 'EMERALD',
		label: 'Emerald',
		color: '#10b981',
		className: 'application-section-header-emerald'
	},
	{
		value: 'AMBER',
		label: 'Amber',
		color: '#f59e0b',
		className: 'application-section-header-amber'
	},
	{ value: 'ROSE', label: 'Rose', color: '#f43f5e', className: 'application-section-header-rose' },
	{
		value: 'VIOLET',
		label: 'Violet',
		color: '#8b5cf6',
		className: 'application-section-header-violet'
	},
	{
		value: 'SLATE',
		label: 'Slate',
		color: '#64748b',
		className: 'application-section-header-slate'
	}
];

export function getColorSchemeColor(scheme: ColorScheme | null): string {
	const option = colorSchemeOptions.find((opt) => opt.value === scheme);
	return option?.color || '#6b7280';
}

export function getColorSchemeClassName(scheme: ColorScheme | null): string {
	const option = colorSchemeOptions.find((opt) => opt.value === scheme);
	return option?.className || 'application-section-header-slate';
}

export function getColorSchemeLabel(scheme: ColorScheme | null): string {
	const option = colorSchemeOptions.find((opt) => opt.value === scheme);
	return option?.label || 'No Color';
}
