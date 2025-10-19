<script lang="ts">
	import { onDestroy } from 'svelte';
	import '../../app.css';
	import { goto } from '$app/navigation';
	import CodeMirror from '../../CodeMirrorEditor.svelte';
	import { languages } from '../../langStyles.js';
	import { languageStore } from '../../store.js';

	const categories = ['None', 'UI', 'Math', 'Collections', 'Automations', 'Debugging'];

	let title = '';
	let category = 'None';
	let description = '';
	let language = 'javascript';
	let code = '';
	let isSubmitting = false;
	let actionMessage = '';
	let actionType: 'success' | 'error' | '' = '';
	let messageTimeout: ReturnType<typeof setTimeout> | undefined;

	const browser = typeof window !== 'undefined';

	languageStore.subscribe((newLanguage) => {
		language = newLanguage;
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

	async function share() {
		if (isSubmitting) return;

		isSubmitting = true;

		let snippet = {
			title: title.trim(),
			description: description.trim(),
			category: category,
			language: language,
			code: code
		};

		let response = await fetch('https://extiri.com/api/1/snippets/create/', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + getToken(),
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify(snippet)
		});

		if (response.ok) {
			isSubmitting = false;
			notify('Snippet published to the library.');
		} else {
			let text = await response.text();
			let error = JSON.parse(text);

			isSubmitting = false;
			notify('Error: ' + error.reason, 'error');
			throw response.status;
		}
	}

	function getToken() {
		if (browser) {
			return localStorage.getItem('token');
		} else {
			return '';
		}
	}

	function resetForm() {
		title = '';
		category = 'None';
		description = '';
		code = '';
		notify('Form cleared.');
	}

	async function copyCode() {
		if (!browser || !navigator.clipboard) {
			notify('Clipboard is unavailable here.', 'error');
			return;
		}

		try {
			await navigator.clipboard.writeText(code);
			notify('Code copied to clipboard.');
		} catch {
			notify('Unable to copy code.', 'error');
		}
	}

	function lineCount() {
		if (!code) return 0;
		return code.split(/\r?\n/).length;
	}

	onDestroy(() => {
		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}
	});
</script>

<svelte:head>
	<title>Extiri Snippets — Create</title>
</svelte:head>

{#if actionMessage}
	<div class="toast {actionType === 'error' ? 'toast-error' : 'toast-success'}">
		{actionMessage}
	</div>
{/if}

<div class="create-page">
	<header class="create-header">
		<div class="create-header__brand">
			<a class="create-logo" href="https://extiri.com" target="_blank" rel="noreferrer">
				<img src="/extiri-text-only.png" alt="Extiri logo" />
			</a>
			<span>snippex helps you craft reusable snippets without breaking flow.</span>
		</div>
		<button class="create-header__link" on:click={() => goto('/')}>Back to Library</button>
	</header>

	<section class="create-hero">
		<div>
			<p class="create-eyebrow">Create snippet</p>
			<h1>Capture the idea, ship the snippet.</h1>
			<p>Describe the context, paste the code, and share it with teammates in a couple of clicks.</p>
		</div>
		<div class="create-actions">
			<button class="primary" on:click={share} disabled={isSubmitting || !code.trim()}>
				{isSubmitting ? 'Publishing…' : 'Publish snippet'}
			</button>
			<button class="secondary" type="button" on:click={resetForm}>Clear form</button>
			<button class="secondary" type="button" on:click={copyCode}>Copy code</button>
		</div>
	</section>

	<div class="create-layout">
		<form class="create-form" on:submit|preventDefault={share}>
			<div class="form-field">
				<label for="snippet-title">Title</label>
				<input
					id="snippet-title"
					type="text"
					placeholder="Short and clear title"
					bind:value={title}
					maxlength="80"
				/>
				<span class="helper">{title.length}/80</span>
			</div>

			<div class="form-row">
				<div class="form-field">
					<label for="snippet-language">Language</label>
					<select id="snippet-language" bind:value={$languageStore}>
						{#each languages as language (language)}
							<option value={language}>{language}</option>
						{/each}
					</select>
				</div>

				<div class="form-field">
					<label for="snippet-category">Category</label>
					<select id="snippet-category" bind:value={category}>
						{#each categories as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-field">
				<label for="snippet-description">Description</label>
				<textarea
					id="snippet-description"
					rows="4"
					placeholder="Explain when to reach for this snippet, and what makes it special."
					bind:value={description}
				></textarea>
				<span class="helper">{description.length} characters</span>
			</div>

			<div class="form-footer">
				<button class="primary" type="submit" disabled={isSubmitting || !code.trim()}>
					{isSubmitting ? 'Publishing…' : 'Publish snippet'}
				</button>
				<button type="button" class="link" on:click={copyCode}>
					Copy code
				</button>
			</div>
		</form>

		<section class="create-preview">
			<header>
				<h2>Live preview</h2>
				<p>{title ? title : 'Untitled snippet'} — {language} • {lineCount()} lines</p>
			</header>
			<div class="preview-editor">
				<CodeMirror bind:code />
			</div>
			<footer>
				<button type="button" on:click={copyCode}>Copy code</button>
				<button type="button" on:click={resetForm}>Start over</button>
			</footer>
		</section>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f4f6fb;
		color: #0f172a;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.create-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding: clamp(1.5rem, 5vw, 3.5rem);
	}

	.create-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.create-header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.create-header__brand {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.create-logo {
		border: none;
		background: transparent;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		align-self: flex-start;
	}

	.create-logo img {
		height: clamp(24px, 3vw, 32px);
		width: auto;
		display: block;
	}

	.create-header__brand span {
		color: #475569;
		font-size: 0.95rem;
	}

	.create-header__link {
		align-self: flex-start;
		border: 1px solid rgba(15, 23, 42, 0.16);
		border-radius: 999px;
		background: transparent;
		padding: 0.45rem 1.1rem;
		font-weight: 600;
		color: #0f172a;
		cursor: pointer;
	}

	.create-hero {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: clamp(1.25rem, 3vw, 2.5rem);
		background-color: #0f172a;
		color: #f8fafc;
		padding: clamp(1.75rem, 5vw, 3rem);
		border-radius: 1.75rem;
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.3);
	}

	.create-eyebrow {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 600;
		color: rgba(248, 250, 252, 0.65);
	}

	.create-hero h1 {
		font-size: clamp(1.9rem, 4vw, 2.9rem);
		font-weight: 700;
		margin-top: 0.6rem;
	}

	.create-hero p {
		margin-top: 0.75rem;
		line-height: 1.6;
		color: rgba(248, 250, 252, 0.75);
	}

	.create-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-self: flex-start;
	}

	.create-actions button {
		border-radius: 999px;
		font-weight: 600;
		padding: 0.55rem 1.2rem;
		cursor: pointer;
		border: none;
	}

	.create-actions .primary {
		background-color: #f8fafc;
		color: #0f172a;
	}

	.create-actions .secondary {
		background-color: rgba(248, 250, 252, 0.08);
		color: #f8fafc;
		border: 1px solid rgba(248, 250, 252, 0.4);
	}

	.create-actions .primary:disabled {
		opacity: 0.45;
		cursor: progress;
	}

	.create-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: clamp(1.5rem, 4vw, 2.75rem);
	}

	.create-form,
	.create-preview {
		background-color: #ffffff;
		border-radius: 1.5rem;
		padding: clamp(1.5rem, 4vw, 2.25rem);
		box-shadow: 0 22px 44px rgba(15, 23, 42, 0.1);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.form-field label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #0f172a;
	}

	.form-field input,
	.form-field select,
	.form-field textarea {
		border-radius: 0.9rem;
		border: 1px solid #e2e8f0;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		color: #0f172a;
		background-color: #ffffff;
	}

	.form-field textarea {
		resize: vertical;
		min-height: 120px;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.helper {
		font-size: 0.75rem;
		color: #94a3b8;
		align-self: flex-end;
	}

	.form-footer {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.form-footer .primary {
		border: none;
		border-radius: 999px;
		background-color: #0f172a;
		color: #f8fafc;
		padding: 0.6rem 1.4rem;
		font-weight: 600;
		cursor: pointer;
	}

	.form-footer .primary:disabled {
		opacity: 0.45;
		cursor: progress;
	}

	.form-footer .link {
		background: transparent;
		border: none;
		color: #475569;
		font-weight: 600;
		cursor: pointer;
	}

	.create-preview header h2 {
		font-size: 1.15rem;
		font-weight: 600;
		color: #0f172a;
	}

	.create-preview header p {
		color: #64748b;
		font-size: 0.9rem;
	}

	.preview-editor {
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
		overflow: auto;
		background-color: #0b1120;
		max-height: 420px;
	}

	.preview-editor :global(.code-editor) {
		max-height: 420px;
	}

	.create-preview footer {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.create-preview footer button {
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		background-color: #ffffff;
		color: #0f172a;
		font-weight: 600;
		padding: 0.5rem 1.1rem;
		cursor: pointer;
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
		z-index: 40;
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
</style>
