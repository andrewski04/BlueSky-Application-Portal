import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'BlueSky Application Portal',
	favicon: 'img/favicon.ico',

	// Production URL
	url: 'https://andrewski04.github.io',

	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	// organizationName: 'facebook', // Usually your GitHub org/user name.
	// projectName: 'docusaurus', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	i18n: {
		defaultLocale: 'en',
		locales: ['en']
	},

	markdown: {
		format: 'detect',
		mermaid: true
	},

	themes: ['@docusaurus/theme-mermaid'],

	plugins: [
		//		[
		//			'docusaurus-plugin-typedoc',
		//			{
		//				name: 'API Documentation',
		//				entryPoints: ['../src/**/*.ts'],
		//				exclude: ['**/*.test.ts'],
		//				tsconfig: '../tsconfig.json',
		//				out: './docs/api',
		//				entryPointStrategy: 'expand',
		//				sidebar: {
		//					autoConfiguration: true,
		//					pretty: false,
		//					typescript: true,
		//					deprecatedItemClassName: 'typedoc-sidebar-item-deprecated'
		//				}
		//			}
		//		]
	],

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					routeBasePath: '/'
					//editUrl:'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
				},
				blog: false,
				theme: {
					customCss: './src/css/custom.css'
				}
			} satisfies Preset.Options
		]
	],

	themeConfig: {
		// Replace with your project's social card
		navbar: {
			title: 'BlueSky Application Portal',
			logo: {
				alt: 'Logo',
				src: 'img/logo.svg'
			},
			items: [
				{
					href: 'https://github.com/andrewski04/BlueSky-Application-Portal',
					label: 'GitHub',
					position: 'right'
				}
			]
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula
		}
	} satisfies Preset.ThemeConfig
};

export default config;
