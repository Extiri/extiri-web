<style>
	:global(body) {
		background-color: #f4f6fb;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	@font-face {
		font-family: 'Borel';
		font-style: normal;
		font-weight: 400;
		src: url('/Borel-Regular.ttf') format('truetype');
	}

	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f4f6fb;
		color: #0f172a;
	}

	.page-nav {
		position: sticky;
		top: 0;
		z-index: 20;
		background-color: #0f172a;
		color: #f8fafc;
		padding-inline: clamp(1.25rem, 4vw, 3rem);
		box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
	}

	.page-content {
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		padding: clamp(1.5rem, 3.5vw, 3rem);
		flex: 1 1 auto;
	}

	@media (min-width: 1024px) {
		.page-content {
			flex-direction: row;
			align-items: flex-start;
		}
	}

	.info-panel,
	.code-panel {
		background-color: #ffffff;
		border-radius: 1.25rem;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
		padding: clamp(1.75rem, 3vw, 2.25rem);
	}

	.info-panel {
		width: 100%;
		max-width: 420px;
		position: sticky;
		top: 108px;
		align-self: flex-start;
	}

	.code-panel {
		flex: 1 1 0%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		overflow: hidden;
		min-height: 520px;
	}

	.language-tag {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background-color: #e0f2fe;
		color: #0369a1;
		font-weight: 600;
		padding: 0.35rem 0.9rem;
		text-transform: uppercase;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
	}

	.snippet-title {
		font-size: clamp(1.75rem, 3vw, 2.4rem);
		font-weight: 700;
		color: #0f172a;
		margin-top: 1rem;
	}

	.meta,
	.description {
		color: #475569;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.description {
		margin-top: 1.25rem;
	}

	.meta strong {
		color: #0f172a;
	}

	.action-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.9rem;
		margin-top: 1.75rem;
	}

	.stats-card {
		background-color: #f8fafc;
		border-radius: 0.9rem;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.stats-card span {
		font-size: 0.8rem;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.stats-card strong {
		font-size: 1.35rem;
		color: #0f172a;
	}

	.code-panel__header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.code-panel__header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.code-panel__header h2 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #0f172a;
	}

	.code-panel__header p {
		font-size: 0.9rem;
		color: #64748b;
	}

	.code-panel__editor {
		flex: 1 1 auto;
		border-radius: 1rem;
		overflow: auto;
		border: 1px solid #e2e8f0;
		background-color: #282C34;
		max-height: 600px;
	}

	.code-panel__editor :global(.code-editor) {
		max-height: 600px;
	}

	.helper-text {
		margin-top: 1.5rem;
		font-size: 0.85rem;
		color: #94a3b8;
	}

	.toast {
		position: fixed;
		top: 96px;
		right: clamp(1rem, 4vw, 3rem);
		padding: 0.85rem 1.25rem;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 0.9rem;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
		z-index: 30;
		transition: opacity 0.25s ease, transform 0.25s ease;
	}

	.toast-success {
		background-color: #0f766e;
		color: #ecfeff;
	}

	.toast-error {
		background-color: #b91c1c;
		color: #fef2f2;
	}

	.page-nav__logo {
		display: inline-flex;
		align-items: center;
		border: none;
		background: transparent;
		padding: 0;
		cursor: pointer;
		font-family: 'Borel', cursive;
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		color: #f8fafc;
	}

	.page-nav__tagline {
		color: rgba(248, 250, 252, 0.7);
		font-size: 0.85rem;
	}
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 220px;
		color: #475569;
		text-align: center;
	}

	.empty-state {
		min-height: 220px;
		display: grid;
		place-items: center;
		text-align: center;
		color: #64748b;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		color: #b91c1c;
	}
</style>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import '../../app.css';
	import { goto } from '$app/navigation';
	import escape from 'lodash.escape';
	import CodeMirror from '../../CodeMirror.svelte';
	import sdk from '@stackblitz/sdk';

	const browser = typeof window !== 'undefined';

	interface User {
		id: string;
		name: string;
	}

	interface Snippet {
		id: string;
		language: string;
		title: string;
		code: string;
		desc: string;
		creator: string;
		category: string;
	}

	type ShareCapableNavigator = Navigator & {
		share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
	};

	let id = '';
	let creatorId = '';
	let promise: Promise<Snippet> = Promise.resolve({
		id: '',
		title: '',
		code: '',
		creator: '',
		desc: '',
		language: '',
		category: ''
	});
	let creatorName = 'Loading...';
	let isLoggedInUserTheCreator = false;
	let actionMessage = '';
	let actionType: 'success' | 'error' | '' = '';
	let messageTimeout: ReturnType<typeof setTimeout> | undefined;
	let shareAvailable = browser && Boolean((navigator as ShareCapableNavigator).share);

	let snippetTitle = '';

	// Update page title when the snippet promise resolves
	promise.then((s) => {
		if (s && s.title) snippetTitle = s.title;
	}).catch(() => {
		/* ignore */
	});

	function notify(message: string, type: 'success' | 'error' = 'success') {
		actionMessage = message;
		actionType = type;

		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}

		messageTimeout = setTimeout(() => {
			actionMessage = '';
			actionType = '';
		}, 2800);
	}

	async function copyToClipboard(content: string, successMessage: string) {
		if (!browser || !navigator.clipboard) {
			notify('Clipboard is not available in this environment.', 'error');
			return;
		}

		try {
			await navigator.clipboard.writeText(content);
			beep();
			notify(successMessage);
		} catch {
			notify('Unable to copy. Please try again.', 'error');
		}
	}

	function getExtensionForLanguage(lang: string) {
		switch (lang) {
			case 'javascript':
				return 'js';
			case 'typescript':
				return 'ts';
			case 'html':
				return 'html';
			case 'css':
				return 'css';
			case 'python':
				return 'py';
			default:
				return 'txt';
		}
	}

	function createSnippetFileName(snippet: Snippet) {
		const extension = getExtensionForLanguage(snippet.language);
		const safeTitle = snippet.title
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-_]/gi, '');

		return `${safeTitle || 'snippet'}.${extension}`;
	}

	function copySnippetCode(snippet: Snippet) {
		copyToClipboard(snippet.code, 'Code copied to clipboard.');
	}

	function copySnippetLink() {
		if (!browser) {
			notify('Link is unavailable outside the browser.', 'error');
			return;
		}

		copyToClipboard(window.location.href, 'Link copied to clipboard.');
	}

	function copySnippetDetails(snippet: Snippet) {
		const details = [
			`Title: ${snippet.title}`,
			`Language: ${snippet.language}`,
			`Category: ${snippet.category}`,
			`Creator: ${creatorName}`,
			'',
			snippet.desc,
			'',
			snippet.code
		]
			.filter(Boolean)
			.join('\n');

		copyToClipboard(details, 'Snippet details copied.');
	}

	function downloadSnippet(snippet: Snippet) {
		if (!browser) {
			return;
		}

		const fileName = createSnippetFileName(snippet);
		const blob = new Blob([snippet.code], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		notify('Download started.');
	}

	async function shareSnippet(snippet: Snippet) {
		if (!browser) {
			return;
		}

		const url = window.location.href;
		const shareNavigator = navigator as ShareCapableNavigator;

		if (shareAvailable && shareNavigator.share) {
			try {
				await shareNavigator.share({
					title: snippet.title || 'Code snippet',
					text: snippet.desc || 'Check out this snippet on Extiri.',
					url
				});
				notify('Shared successfully.');
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					notify('Unable to share right now.', 'error');
				}
			}
		} else {
			copyToClipboard(url, 'Link copied to clipboard.');
		}
	}

	function countLines(code: string) {
		if (!code) return 0;
		return code.split(/\r?\n/).length;
	}

	function countCharacters(code: string) {
		return code ? code.length : 0;
	}

	/// Check if language is supported before using.
	function generateFilesForLanguage(lang: string, code: string): [Record<string, string>, string] {
		if (lang === 'html') {
			let files: Record<string, string> = { 'index.html': code };
			return [files, 'index.html'];
		}

		let extension;
		switch (lang) {
			case 'javascript':
				extension = 'js';
				break;
			case 'typescript':
				extension = 'ts';
				break;
			case 'html':
				extension = 'html';
				break;
			default:
				extension = getExtensionForLanguage(lang);
		}

		let mainFile = 'index.' + extension;

		let files: Record<string, string> = { 'index.html': '' };
		files['index.html'] = '';
		files[mainFile] = code;

		return [files, mainFile];
	}

	function isStackBlitzAvailable(lang: string) {
		return lang === 'typescript' || lang === 'javascript' || lang === 'html';
	}

	function openInStackBlitz(code: string, lang: string, description: string, title: string) {
		if (!isStackBlitzAvailable(lang)) {
			notify(`Language ${lang} is not supported in StackBlitz yet.`, 'error');
			return;
		}

		let [files, mainFile] = generateFilesForLanguage(lang, code);

		sdk.openProject(
			{
				title: title,
				description: description,
				template: lang as 'html' | 'typescript' | 'javascript',
				files: files,
				settings: {
					compile: {
						trigger: 'auto',
						clearConsole: false
					}
				}
			},
			{
				newWindow: true,
				openFile: [mainFile]
			}
		);
		notify('Opening in StackBlitz...');
	}

	function beep() {
		let sound = new Audio(
			'data:audio/x-wav;base64,UklGRnIHAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YU4HAACUuNv6///////////////pyKSAWzcVAAAAAAAAAAAAAAAAACFEaY6y1fX///////////////PTsIxnQh8AAAAAAAAAAAAAAAAAGz5ih6vP8P///////////////d27l3JNKgkAAAAAAAAAAAAAAAAUNlp/pMjp////////////////58WhfFg0EgAAAAAAAAAAAAAAAA0vUnecwOL////////////////wz6uHYj4bAAAAAAAAAAAAAAAABidKb5S42/v///////////////jYtZFsRyQEAAAAAAAAAAAAAAAAH0Jmi7DT9P///////////////+G+mnVRLQwAAAAAAAAAAAAAAAAXOV2Cp8vs////////////////6cikf1o2FAAAAAAAAAAAAAAAABAxVXmewuT////////////////y0a2JZD8dAAAAAAAAAAAAAAAACClMcJW63P3///////////////rZtpJtSSYFAAAAAAAAAAAAAAAAIENnjLHU9f///////////////+K/m3ZSLg0AAAAAAAAAAAAAAAAYOl6DqMzt////////////////6silgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5JtSSYFAAAAAAAAAAAAAAABIUNojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAADi1PcpW31/X//////////////+7QsZBwUDEVAAAAAAAAAAAAAAAVMU5siqjF4Pf////////////75cyxlXldQikTAAAAAAAAAAAACx82T2iCnLXM4fP//////////O3axq+YgGhRPCkYCgAAAAAAAQwaKz1SZ3ySp7rM2+jy+fz8+fLp3M69q5iFcV9NPS8jGhQQEBMYISs4R1doeYqbqrnF0Nje4eLf29TKv7Ollod4alxPRDs0LisrLTA2PkdSXmp3hJGcp7G5v8PGx8XCvbevpp2SiH1zaWBYUkxJRkZHSU1SWGBncHiAiZCXnaOnqqusq6mmop6YkoyGgHp0b2pnZGJhYWFjZWhrb3N3e3+DhomMjpCRkZGQj46MioiGhIKAfn18e3t6ent7fH1+fn+A'
		);
		sound.play();
	}

	async function getUser(id: string) {
		let response = await fetch('https://extiri.com/api/1/users/get/' + id);

		if (response.ok) {
			let user = await (response.json() as Promise<User>);
			creatorId = user.id;
			return user.name;
		} else {
			throw response.status;
		}
	}

	async function getSnippetsDetail() {
		if (browser) {
			id = window.location.toString().split('?')[1];
			let response = await fetch('https://extiri.com/api/1/snippets/get/' + id);

			if (response.ok) {
				let snippet = await (response.json() as Promise<Snippet>);
				creatorName = await getUser(snippet.creator);
				checkIfCreator();
				return snippet;
			} else {
				throw response.status;
			}
		}

		throw 'App is run o server-side.';
	}

	async function deleteSnippet() {
		if (browser) {
			const shouldDelete = confirm(
				'Are you sure you want to delete this snippet? This action cannot be undone.'
			);

			if (!shouldDelete) {
				return;
			}

			id = window.location.toString().split('?')[1];
			let response = await fetch('https://extiri.com/api/1/snippets/delete/' + id, {
				method: 'DELETE',
				headers: { Authorization: 'Bearer ' + getToken() }
			});

			if (response.ok) {
				notify('Snippet deleted successfully.');
				setTimeout(() => {
					goto('/');
				}, 600);
			} else {
				let text = await response.text();
				let error = JSON.parse(text);

				notify('Error: ' + error.reason, 'error');
			}
		}
	}

	function getToken() {
		if (browser) {
			return localStorage.getItem('token');
		} else {
			return '';
		}
	}

	async function checkIfCreator() {
		let token = getToken();

		let response = await fetch('https://extiri.com/api/1/users/me/', {
			headers: { Authorization: 'Bearer ' + token }
		});

		if (response.ok) {
			let text = await response.text();
			let info = JSON.parse(text);

			if (info.id == creatorId) {
				isLoggedInUserTheCreator = true;
			} else {
				isLoggedInUserTheCreator = false;
			}
		} else {
			isLoggedInUserTheCreator = false;
		}
	}

	if (browser) {
		promise = getSnippetsDetail();
	}

	onDestroy(() => {
		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}
	});
</script>

<svelte:head>
	<title>{snippetTitle && snippetTitle.trim() !== '' ? escape(snippetTitle) + ' — Snippex' : 'Snippex Snippet'}</title>
</svelte:head>

{#if actionMessage}
	<div class="toast {actionType === 'error' ? 'toast-error' : 'toast-success'}">
		{actionMessage}
	</div>
{/if}

<div class="page">
	<div class="navbar page-nav">
		<div class="flex-1 flex items-center gap-3">
			<button class="page-nav__logo" on:click={() => goto('/')}>
				Snippex
			</button>
			<span class="hidden lg:inline page-nav__tagline">Reusable snippets, carefully gathered by Extiri.</span>
		</div>
		<div class="flex-none flex items-center gap-3">
			<button
				class="btn btn-sm btn-outline border-white/40 text-white hover:border-white/70"
				on:click={() => goto('/')}
			>
				Back to Store
			</button>
		</div>
	</div>

	<div class="page-content">
		<section class="info-panel">
			{#if id !== undefined && id !== ''}
				{#await promise}
					<div class="loading-state">
						<span class="loading loading-ring loading-lg text-primary"></span>
						<p>Loading snippet...</p>
					</div>
				{:then snippet}
					<span class="language-tag">{escape(snippet.language)}</span>
					<h1 class="snippet-title">
						{snippet.title ? escape(snippet.title) : 'Untitled snippet'}
					</h1>
					<p class="meta mt-4">
						Created by <strong>{escape(creatorName)}</strong>
					</p>
					<p class="meta">
						Category: <strong>{snippet.category ? escape(snippet.category) : 'Uncategorized'}</strong>
					</p>
					{#if snippet.desc && snippet.desc.trim() !== ''}
						<p class="description">{escape(snippet.desc)}</p>
					{:else}
						<p class="description">No description provided yet.</p>
					{/if}

					<div class="stats-grid">
						<div class="stats-card">
							<span>Lines</span>
							<strong>{countLines(snippet.code)}</strong>
						</div>
						<div class="stats-card">
							<span>Characters</span>
							<strong>{countCharacters(snippet.code)}</strong>
						</div>
						<div class="stats-card">
							<span>Language</span>
							<strong>{escape(snippet.language)}</strong>
						</div>
					</div>

					<div class="action-bar">
						<button class="btn btn-sm btn-primary" on:click={() => copySnippetCode(snippet)}>
							Copy Code
						</button>
						<button class="btn btn-sm btn-outline" on:click={copySnippetLink}>
							Copy Link
						</button>
						<button class="btn btn-sm btn-outline" on:click={() => copySnippetDetails(snippet)}>
							Copy Details
						</button>
						<button class="btn btn-sm btn-outline" on:click={() => downloadSnippet(snippet)}>
							Download
						</button>
						{#if isStackBlitzAvailable(snippet.language)}
							<button
								class="btn btn-sm btn-secondary"
								on:click={() =>
									openInStackBlitz(snippet.code, snippet.language, snippet.desc, snippet.title)}
							>
								Open in StackBlitz
							</button>
						{/if}
						<button class="btn btn-sm btn-accent" on:click={() => shareSnippet(snippet)}>
							{shareAvailable ? 'Share' : 'Share Link'}
						</button>
						{#if isLoggedInUserTheCreator}
							<button class="btn btn-sm btn-error ml-auto" on:click={deleteSnippet}>
								Delete
							</button>
						{/if}
					</div>
				{:catch error}
					<div class="error-state">
						<h2>We hit a snag.</h2>
						<p>{escape(error)}</p>
						<p>Reload the page or double-check the snippet link.</p>
					</div>
				{/await}
			{:else}
				<div class="empty-state">
					<p>Invalid snippet ID.</p>
				</div>
			{/if}
		</section>

		<section class="code-panel">
			{#if id !== undefined && id !== ''}
				{#await promise}
					<div class="loading-state">
						<span class="loading loading-ring loading-lg text-primary"></span>
						<p>Loading editor...</p>
					</div>
				{:then snippet}
					<div class="code-panel__header">
						<h2>Snippet preview</h2>
						<p>{countLines(snippet.code)} lines • {countCharacters(snippet.code)} characters</p>
					</div>
					<div class="code-panel__editor">
						<CodeMirror language={snippet.language} code={snippet.code} />
					</div>
				{:catch error}
					<div class="error-state">
						<h2>Unable to load snippet</h2>
						<p>{escape(error)}</p>
						<p>Double-check the snippet URL. If it keeps happening, reach out to Extiri support.</p>
					</div>
				{/await}
			{:else}
				<div class="empty-state">
					<p>Provide a snippet ID to preview the code.</p>
				</div>
			{/if}
		</section>
	</div>
</div>
