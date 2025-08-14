import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
	describe('basic functionality', () => {
		it('should convert simple text to lowercase', () => {
			expect(slugify('Hello')).toBe('hello');
			expect(slugify('WORLD')).toBe('world');
			expect(slugify('MixedCase')).toBe('mixedcase');
		});

		it('should replace spaces with hyphens', () => {
			expect(slugify('hello world')).toBe('hello-world');
			expect(slugify('multiple words here')).toBe('multiple-words-here');
			expect(slugify('  spaced  text  ')).toBe('spaced-text');
		});

		it('should remove special characters', () => {
			expect(slugify('hello!world')).toBe('helloworld');
			expect(slugify('hello@world')).toBe('helloworld');
			expect(slugify('hello#world')).toBe('helloworld');
			expect(slugify('hello$world')).toBe('helloworld');
			expect(slugify('hello%world')).toBe('helloworld');
			expect(slugify('hello^world')).toBe('helloworld');
			expect(slugify('hello&world')).toBe('helloworld');
			expect(slugify('hello*world')).toBe('helloworld');
			expect(slugify('hello(world)')).toBe('helloworld');
			expect(slugify('hello[world]')).toBe('helloworld');
			expect(slugify('hello{world}')).toBe('helloworld');
			expect(slugify('hello|world')).toBe('helloworld');
			expect(slugify('hello\\world')).toBe('helloworld');
			expect(slugify('hello:world')).toBe('helloworld');
			expect(slugify('hello;world')).toBe('helloworld');
			expect(slugify('hello"world')).toBe('helloworld');
			expect(slugify("hello'world")).toBe('helloworld');
			expect(slugify('hello<world')).toBe('helloworld');
			expect(slugify('hello>world')).toBe('helloworld');
			expect(slugify('hello?world')).toBe('helloworld');
			expect(slugify('hello/world')).toBe('helloworld');
		});
	});

	describe('edge cases', () => {
		it('should handle empty strings', () => {
			expect(slugify('')).toBe('');
			expect(slugify('   ')).toBe('');
		});

		it('should handle strings with only special characters', () => {
			expect(slugify('!@#$%^&*()')).toBe('');
			expect(slugify('   !@#$%^&*()   ')).toBe('');
		});

		it('should handle strings with only spaces', () => {
			expect(slugify(' ')).toBe('');
			expect(slugify('   ')).toBe('');
			expect(slugify('\t\n\r')).toBe('');
		});

		it('should handle strings with only hyphens', () => {
			expect(slugify('-')).toBe('');
			expect(slugify('---')).toBe('');
			expect(slugify('  ---  ')).toBe('');
		});
	});

	describe('whitespace handling', () => {
		it('should trim leading and trailing whitespace', () => {
			expect(slugify('  hello world  ')).toBe('hello-world');
			expect(slugify('\t\nhello world\r\n')).toBe('hello-world');
		});

		it('should normalize multiple spaces to single hyphens', () => {
			expect(slugify('hello   world')).toBe('hello-world');
			expect(slugify('hello    world')).toBe('hello-world');
			expect(slugify('hello     world')).toBe('hello-world');
		});

		it('should handle mixed whitespace characters', () => {
			expect(slugify('hello\tworld')).toBe('hello-world');
			expect(slugify('hello\nworld')).toBe('hello-world');
			expect(slugify('hello\rworld')).toBe('hello-world');
			expect(slugify('hello\t\n\rworld')).toBe('hello-world');
		});
	});

	describe('hyphen handling', () => {
		it('should preserve existing hyphens', () => {
			expect(slugify('hello-world')).toBe('hello-world');
			expect(slugify('hello-world-test')).toBe('hello-world-test');
		});

		it('should normalize multiple consecutive hyphens', () => {
			expect(slugify('hello--world')).toBe('hello-world');
			expect(slugify('hello---world')).toBe('hello-world');
			expect(slugify('hello----world')).toBe('hello-world');
		});

		it('should remove leading and trailing hyphens', () => {
			expect(slugify('-hello-world')).toBe('hello-world');
			expect(slugify('hello-world-')).toBe('hello-world');
			expect(slugify('-hello-world-')).toBe('hello-world');
		});

		it('should handle mixed spaces and hyphens', () => {
			expect(slugify('hello - world')).toBe('hello-world');
			expect(slugify('hello- world')).toBe('hello-world');
			expect(slugify('hello -world')).toBe('hello-world');
		});
	});

	describe('number handling', () => {
		it('should preserve numbers', () => {
			expect(slugify('hello123world')).toBe('hello123world');
			expect(slugify('123hello456world789')).toBe('123hello456world789');
		});

		it('should handle numbers with spaces', () => {
			expect(slugify('hello 123 world')).toBe('hello-123-world');
			expect(slugify('123 hello 456')).toBe('123-hello-456');
		});

		it('should handle numbers with special characters', () => {
			expect(slugify('hello!123@world')).toBe('hello123world');
			expect(slugify('123#hello$456%world')).toBe('123hello456world');
		});
	});

	describe('real-world examples', () => {
		it('should handle common titles and names', () => {
			expect(slugify('My Blog Post Title')).toBe('my-blog-post-title');
			expect(slugify('User Profile Settings')).toBe('user-profile-settings');
			expect(slugify('API Documentation')).toBe('api-documentation');
			expect(slugify('Getting Started Guide')).toBe('getting-started-guide');
		});

		it('should handle product names', () => {
			expect(slugify('iPhone 14 Pro Max')).toBe('iphone-14-pro-max');
			expect(slugify('MacBook Air M2')).toBe('macbook-air-m2');
			expect(slugify('Samsung Galaxy S23')).toBe('samsung-galaxy-s23');
		});

		it('should handle file names', () => {
			expect(slugify('my-document.pdf')).toBe('my-documentpdf');
			expect(slugify('image (1).jpg')).toBe('image-1jpg');
			expect(slugify('report_final_v2.docx')).toBe('reportfinalv2docx'); // Underscores are removed
		});

		it('should handle URLs and paths', () => {
			expect(slugify('/users/profile/settings')).toBe('usersprofilesettings');
			expect(slugify('https://example.com/page')).toBe('httpsexamplecompage');
			expect(slugify('api/v1/users/123')).toBe('apiv1users123');
		});
	});

	describe('internationalization', () => {
		it('should handle accented characters', () => {
			expect(slugify('café')).toBe('cafe');
			expect(slugify('naïve')).toBe('naive');
			expect(slugify('façade')).toBe('facade');
			expect(slugify('résumé')).toBe('resume');
		});

		it('should handle umlauts', () => {
			expect(slugify('Müller')).toBe('muller');
			expect(slugify('Schrödinger')).toBe('schrodinger');
			expect(slugify('Hölderlin')).toBe('holderlin');
		});

		it('should handle other special characters', () => {
			expect(slugify('España')).toBe('espana');
			expect(slugify('François')).toBe('francois');
			expect(slugify('João')).toBe('joao');
			expect(slugify('São Paulo')).toBe('sao-paulo');
		});

		it('should handle non-Latin scripts', () => {
			expect(slugify('北京')).toBe('');
			expect(slugify('東京')).toBe('');
			expect(slugify('Москва')).toBe('');
			expect(slugify('القاهرة')).toBe('');
		});
	});

	describe('performance and edge cases', () => {
		it('should handle very long strings', () => {
			const longString = 'a'.repeat(1000) + ' ' + 'b'.repeat(1000);
			const result = slugify(longString);

			expect(result).toBe('a'.repeat(1000) + '-' + 'b'.repeat(1000));
			expect(result.length).toBe(2001); // 1000 + 1000 + 1 hyphen
		});

		it('should handle strings with many special characters', () => {
			const specialString = '!@#$%^&*()'.repeat(100);
			const result = slugify(specialString);

			expect(result).toBe('');
		});

		it('should handle strings with many spaces', () => {
			const spacedString = 'a' + ' '.repeat(100) + 'b';
			const result = slugify(spacedString);

			expect(result).toBe('a-b');
		});

		it('should handle strings with many hyphens', () => {
			const hyphenatedString = 'a' + '-'.repeat(100) + 'b';
			const result = slugify(hyphenatedString);

			expect(result).toBe('a-b');
		});
	});

	describe('consistency', () => {
		it('should produce consistent results for same input', () => {
			const input = 'Hello World! This is a test.';
			const result1 = slugify(input);
			const result2 = slugify(input);

			expect(result1).toBe(result2);
		});

		it('should handle case variations consistently', () => {
			expect(slugify('Hello World')).toBe('hello-world');
			expect(slugify('HELLO WORLD')).toBe('hello-world');
			expect(slugify('hello world')).toBe('hello-world');
			expect(slugify('HeLLo WoRLd')).toBe('hello-world');
		});

		it('should handle spacing variations consistently', () => {
			expect(slugify('hello world')).toBe('hello-world');
			expect(slugify('hello  world')).toBe('hello-world');
			expect(slugify('hello   world')).toBe('hello-world');
			expect(slugify('  hello  world  ')).toBe('hello-world');
		});
	});

	describe('integration scenarios', () => {
		it('should work with form inputs', () => {
			// Simulate form input processing
			const formInputs = ['User Name', 'Email Address', 'Phone Number', 'Date of Birth'];

			const slugs = formInputs.map((input) => slugify(input));

			expect(slugs).toEqual(['user-name', 'email-address', 'phone-number', 'date-of-birth']);
		});

		it('should work with database field names', () => {
			// Simulate database field name generation
			const fieldNames = [
				'First Name',
				'Last Name',
				'Email Address',
				'Phone Number',
				'Created At',
				'Updated At'
			];

			const dbFields = fieldNames.map((name) => slugify(name));

			expect(dbFields).toEqual([
				'first-name',
				'last-name',
				'email-address',
				'phone-number',
				'created-at',
				'updated-at'
			]);
		});

		it('should work with URL generation', () => {
			// Simulate URL slug generation
			const titles = [
				'Getting Started with React',
				'Advanced TypeScript Patterns',
				'Building a REST API with Node.js',
				'CSS Grid Layout Tutorial'
			];

			const urlSlugs = titles.map((title) => slugify(title));

			expect(urlSlugs).toEqual([
				'getting-started-with-react',
				'advanced-typescript-patterns',
				'building-a-rest-api-with-nodejs',
				'css-grid-layout-tutorial'
			]);
		});
	});
});
