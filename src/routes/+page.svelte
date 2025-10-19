<script lang="ts">
	import { onDestroy } from 'svelte';
	import '../app.css';
	import { languages } from '../langStyles.js';
	import { goto } from '$app/navigation';
	import escape from 'lodash.escape';
	import md5 from 'md5';
	import CodeMirror from '../CodeMirror.svelte';

	const browser = typeof localStorage !== 'undefined';

	const Categories = [
		{ key: 'All', value: '' },
		{ key: 'None', value: 'None' },
		{ key: 'UI', value: 'UI' },
		{ key: 'Math', value: 'Math' },
		{ key: 'Algorithms', value: 'Algorithms' },
		{ key: 'Collections', value: 'Collections' },
		{ key: 'Automations', value: 'Automations' },
		{ key: 'Debugging', value: 'Debugging' }
	];

	let isLoggedIn = false;
	let isLoading = false;

	let snippetsPromise: Promise<Snippet[] | [Snippet]> = Promise.resolve(Array<Snippet>());
	let userDetailPromise: Promise<User> = Promise.resolve({ id: '', name: '', email: '' });

	interface User {
		id: string;
		name: string;
		email: string;
	}

	interface Snippet {
		id: string;
		language: string;
		title: string;
		code: string;
		desc: string;
		creator: string;
	}

	interface Metadata {
		per: number;
		total: number;
		page: number;
	}

	interface Page {
		items: [Snippet];
		metadata: Metadata;
	}

	interface Snippets {
		totalNumberOfResults: number;
		page: Page;
	}

	type ShareCapableNavigator = Navigator & {
		share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
	};

	let pages = [1];

	let currentPage = 1;
	let search = '';
	let language = 'All';
	let currentCategory = Categories[0];
	let creator = '';
	let totalResults = 0;
	let actionMessage = '';
	let actionType: 'success' | 'error' | '' = '';
	let messageTimeout: ReturnType<typeof setTimeout> | undefined;
	let shareAvailable = browser && Boolean((navigator as ShareCapableNavigator).share);

	function searchSnippets() {
		currentPage = 1;
		snippetsPromise = getSnippets();
	}

	function nextPage() {
		if (currentPage != pages.at(-1) && !isLoading) {
			currentPage += 1;
			snippetsPromise = getSnippets();
		}
	}

	function showUsersSnippets(userID: string) {
		if (creator != '') {
			creator = '';
			snippetsPromise = getSnippets();
		} else {
			creator = userID;
			snippetsPromise = getSnippets();
		}
	}

	function previousPage() {
		if (currentPage != 1 && !isLoading) {
			currentPage -= 1;
			snippetsPromise = getSnippets();
		}
	}

	function resetFilters() {
		search = '';
		language = 'All';
		currentCategory = Categories[0];
		creator = '';
		currentPage = 1;
		snippetsPromise = getSnippets();
	}

	function selectCategory(category: (typeof Categories)[number]) {
		currentCategory = category;
		currentPage = 1;
		snippetsPromise = getSnippets();
	}

	function selectLanguage(option: string) {
		language = option;
		currentPage = 1;
		snippetsPromise = getSnippets();
	}

	function calculatePages(response: Snippets) {
		let total = Math.ceil(response.totalNumberOfResults / response.page.metadata.per);
		totalResults = response.totalNumberOfResults;

		if (total <= 1) {
			pages = [1];
		} else {
			let range = [...Array(total + 1).keys()];

			range.shift();

			let center = currentPage - 1;

			if (3 < center) {
				pages = range.filter((value) => {
					if (value == center) {
						return true;
					} else if (value < center) {
						return center - value <= 2;
					} else {
						return value - center <= 2;
					}
				});
			} else {
				pages = range.slice(0, 4);
			}
		}
	}

	async function getSnippets() {
		isLoading = true;

		let api = 'https://extiri.com/api/1/snippets/?';

		api = api + 'page=' + currentPage;

		if (currentCategory.key != 'All') {
			api = api + '&category=' + currentCategory.value;
		}

		if (language != 'All') {
			api = api + '&language=' + language;
		}

		if (search != '') {
			api = api + '&query=' + encodeURI(search);
		}

		if (creator != '') {
			api = api + '&creator=' + creator;
		}

		let response = await fetch(api);

		if (response.ok) {
			let snippets = await (response.json() as Promise<Snippets>);

			calculatePages(snippets);
			isLoading = false;
			return snippets.page.items;
		} else {
			let text = await response.text();
			isLoading = false;
			throw { status: response.status, message: text };
		}
	}

	function getToken() {
		if (browser) {
			return localStorage.getItem('token');
		} else {
			return '';
		}
	}

	let profileImage = '';

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
			notify('Clipboard not available in this environment.', 'error');
			return;
		}

		try {
			await navigator.clipboard.writeText(content);
			beep();
			notify(successMessage);
		} catch {
			notify('Unable to copy right now.', 'error');
		}
	}

	function snippetDetailUrl(snippet: Snippet) {
		return '/snippet?' + encodeURIComponent(snippet.id);
	}

	function openSnippet(snippet: Snippet) {
		goto(snippetDetailUrl(snippet));
	}

	function copySnippetCode(snippet: Snippet) {
		copyToClipboard(snippet.code, 'Snippet copied to clipboard.');
	}

	function copySnippetLink(snippet: Snippet) {
		if (!browser) {
			notify('Link not available outside the browser.', 'error');
			return;
		}

		const link = `${window.location.origin}${snippetDetailUrl(snippet)}`;
		copyToClipboard(link, 'Snippet link copied.');
	}

	async function shareSnippet(snippet: Snippet) {
		if (!browser) {
			return;
		}

		const link = `${window.location.origin}${snippetDetailUrl(snippet)}`;
		const shareNavigator = navigator as ShareCapableNavigator;

		if (shareAvailable && shareNavigator.share) {
			try {
				await shareNavigator.share({
					title: snippet.title || 'Extiri snippet',
					text: snippet.desc || 'Check out this Extiri snippet.',
					url: link
				});
				notify('Shared successfully.');
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					notify('Share failed. Copying link instead.', 'error');
					copyToClipboard(link, 'Snippet link copied.');
				}
			}
		} else {
			copyToClipboard(link, 'Snippet link copied.');
		}
	}

	function setAvatar(email: string) {
		let hash = md5(email);
		profileImage = 'https://www.gravatar.com/avatar/' + hash + '?d=retro?s=300.jpg';
	}

	async function getUserDetail() {
		let token = getToken();

		let response = await fetch('https://extiri.com/api/1/users/me/', {
			headers: { Authorization: 'Bearer ' + token }
		});

		if (response.ok) {
			isLoggedIn = true;

			let info = await (response.json() as Promise<User>);

			setAvatar(info.email);

			return info;
		} else {
			isLoggedIn = false;

			throw response.status;
		}
	}

	snippetsPromise = getSnippets().catch((reason) => {
		return Array<Snippet>();
	});
	userDetailPromise = getUserDetail().catch((reason) => {
		return { id: '', name: '', email: '' };
	});

	function beep() {
		let sound = new Audio(
			'data:audio/x-wav;base64,UklGRnIHAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YU4HAACUuNv6///////////////pyKSAWzcVAAAAAAAAAAAAAAAAACFEaY6y1fX///////////////PTsIxnQh8AAAAAAAAAAAAAAAAAGz5ih6vP8P///////////////d27l3JNKgkAAAAAAAAAAAAAAAAUNlp/pMjp////////////////58WhfFg0EgAAAAAAAAAAAAAAAA0vUnecwOL////////////////wz6uHYj4bAAAAAAAAAAAAAAAABidKb5S42/v///////////////jYtZFsRyQEAAAAAAAAAAAAAAAAH0Jmi7DT9P///////////////+G+mnVRLQwAAAAAAAAAAAAAAAAXOV2Cp8vs////////////////6cikf1o2FAAAAAAAAAAAAAAAABAxVXmewuT////////////////y0a2JZD8dAAAAAAAAAAAAAAAACClMcJW63P3///////////////rZtpJtSSYFAAAAAAAAAAAAAAAAIENnjLHU9f///////////////+K/m3ZSLg0AAAAAAAAAAAAAAAAYOl6DqMzt////////////////6silgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5JtSSYFAAAAAAAAAAAAAAABIUNojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FQAAAAAAAAAAAAAAABAyVXqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACClMcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHU9f///////////////+LAnHdSLw0AAAAAAAAAAAAAAAAZO1+DqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////y0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAACSlNcZa63f3///////////////rat5NuSSYGAAAAAAAAAAAAAAABIURojbHV9f///////////////+LAnHdSLw4AAAAAAAAAAAAAAAAZO1+EqMzt////////////////6smlgFs3FgAAAAAAAAAAAAAAABAyVnqfw+X////////////////z0a6JZEAeAAAAAAAAAAAAAAAADi1PcpW31/X//////////////+7QsZBwUDEVAAAAAAAAAAAAAAAVMU5siqjF4Pf////////////75cyxlXldQikTAAAAAAAAAAAACx82T2iCnLXM4fP//////////O3axq+YgGhRPCkYCgAAAAAAAQwaKz1SZ3ySp7rM2+jy+fz8+fLp3M69q5iFcV9NPS8jGhQQEBMYISs4R1doeYqbqrnF0Nje4eLf29TKv7Ollod4alxPRDs0LisrLTA2PkdSXmp3hJGcp7G5v8PGx8XCvbevpp2SiH1zaWBYUkxJRkZHSU1SWGBncHiAiZCXnaOnqqusq6mmop6YkoyGgHp0b2pnZGJhYWFjZWhrb3N3e3+DhomMjpCRkZGQj46MioiGhIKAfn18e3t6ent7fH1+fn+A'
		);
		sound.play();
	}

	onDestroy(() => {
		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}
	});
</script>

<svelte:head>
	<title>Snippex — Store</title>
</svelte:head>

{#if actionMessage}
	<div class="toast {actionType === 'error' ? 'toast-error' : 'toast-success'}">
		{actionMessage}
	</div>
{/if}

<div class="store-page">
	<header class="store-header">
		<div class="store-header__brand">
			<button class="store-logo" on:click={() => goto('/')}>Snippex</button>
			<span class="store-header__byline">Crafted by <a href="https://extiri.com" target="_blank" rel="noreferrer"><img style="height: 15px !important; display: inline;" src="/extiri-text-only.png" alt="Extiri logo" /></a></span>
		</div>
		<div class="store-header__actions">
			{#if isLoggedIn}
				<button class="store-action" on:click={() => goto('/create')}>Create Snippet</button>
				<button class="store-action store-action--ghost" on:click={() => goto('/account')}>
					Account
				</button>
			{:else}
				<button class="store-action" on:click={() => goto('/account')}>Register / Login</button>
			{/if}
		</div>
	</header>

	<section class="store-hero">
		<div class="store-hero__content">
			<p class="store-eyebrow">Snippex Library</p>
			<h1>Thoughtful snippets that make shipping smoother.</h1>
			<p>Explore Snippex, remix ready-made building blocks, and stay in flow while you build.</p>
			<div class="store-hero__meta">
				<div class="store-hero__stat">
					<span>Catalog</span>
					<strong>{totalResults > 0 ? totalResults : isLoading ? '—' : 0}</strong>
				</div>
				<div class="store-hero__stat">
					<span>Filters</span>
					<strong>
						{[search ? 1 : 0, language !== 'All' ? 1 : 0, currentCategory.key !== 'All' ? 1 : 0, creator !== '' ? 1 : 0].reduce(
							(acc, value) => acc + value,
							0
						)}
					</strong>
				</div>
				<div class="store-hero__stat">
					<span>Page</span>
					<strong>{currentPage}</strong>
				</div>
			</div>
		</div>
		<div class="store-hero__panel">
			{#if isLoggedIn}
				{#await userDetailPromise}
					<div class="store-hero__profile loading">Loading profile…</div>
				{:then user}
					<div class="store-hero__profile">
						<img src={profileImage} alt="User avatar" width="64" height="64" />
						<div>
							<h3>{escape(user.name)}</h3>
							<p>{escape(user.email)}</p>
							<div class="store-hero__profile-actions">
								<button type="button" on:click={() => goto('/account')}>Manage account</button>
								<button type="button" on:click={() => goto('/create')}>Share next snippet</button>
							</div>
						</div>
					</div>
				{:catch}
					<div class="store-hero__profile error">We couldn’t load your profile. Try refreshing.</div>
				{/await}
			{:else}
				<div class="store-hero__cta">
					<h3>Ready to contribute?</h3>
					<p>Create an account to publish snippets and sync your favourites.</p>
					<button on:click={() => goto('/account')}>Start an account</button>
				</div>
			{/if}
		</div>
	</section>

	<div class="store-layout">
		<aside class="store-sidebar">
			<section class="sidebar-card">
				<form class="sidebar-search" on:submit|preventDefault={searchSnippets}>
					<label for="snippet-search">Search the library</label>
					<div class="sidebar-search__control">
						<input
							id="snippet-search"
							type="search"
							placeholder="Find a snippet or keyword"
							bind:value={search}
						/>
						<button type="submit">Search</button>
					</div>
				</form>
				<button class="sidebar-reset" type="button" on:click={resetFilters}>Reset filters</button>
			</section>

			<section class="sidebar-card">
				<h2>Language</h2>
				<select bind:value={language} on:change={() => selectLanguage(language)}>
					<option value="All">All languages</option>
					{#each languages as option (option)}
						<option value={option}>{option}</option>
					{/each}
				</select>
			</section>

			<section class="sidebar-card">
				<h2>Category</h2>
				<div class="chip-group">
					{#each Categories as category (category.key)}
						<button
							type="button"
							class="chip {currentCategory.key === category.key ? 'chip--active' : ''}"
							on:click={() => selectCategory(category)}
						>
							{category.key}
						</button>
					{/each}
				</div>
			</section>

			{#if isLoggedIn}
				<section class="sidebar-card sidebar-card--subtle">
					{#await userDetailPromise then user}
						<button
							type="button"
							class="chip chip--wide {creator !== '' ? 'chip--active' : ''}"
							on:click={() => showUsersSnippets(user.id)}
						>
							Show only my snippets
						</button>
					{/await}
				</section>
			{/if}

			<section class="sidebar-card sidebar-card--info">
				<h3>Tip</h3>
				<p>
					Curating snippets into a collection? Use the copy buttons on each card to build a library in
					seconds.
				</p>
			</section>
		</aside>

		<section class="store-results">
			<header class="results-header">
				<div>
					<h2>Snippets</h2>
					<p>
						{#if isLoading}
							Hang tight, fetching the freshest code…
						{:else}
							{totalResults === 0
								? 'No snippets match the filters yet.'
								: `page ${currentPage}`}
						{/if}
					</p>
				</div>
				<nav class="pagination">
					<button type="button" on:click={previousPage} disabled={currentPage === 1}>Prev</button>
					<ul>
						{#each pages as page}
							<li>
								<button
									type="button"
									class:active={page === currentPage}
									on:click={() => {
										currentPage = page;
										snippetsPromise = getSnippets();
									}}
								>
									{page}
								</button>
							</li>
						{/each}
					</ul>
					<button
						type="button"
						on:click={nextPage}
						disabled={currentPage === pages.at(-1)}
					>
						Next
					</button>
				</nav>
			</header>

			{#await snippetsPromise}
				<div class="results-loading">
					<div class="loading-card"></div>
					<div class="loading-card"></div>
					<div class="loading-card"></div>
				</div>
			{:then snippets}
				{#if snippets.length === 0}
					<div class="results-empty">
						<h3>No snippets found</h3>
						<p>Try adjusting your filters or resetting back to the full catalog.</p>
					</div>
				{:else}
					<div class="snippet-grid">
						{#each snippets as snippet (escape(snippet.id))}
							<article class="snippet-card">
								<header class="snippet-card__header">
									<span class="snippet-card__language">{escape(snippet.language)}</span>
									<h3>{snippet.title ? escape(snippet.title) : 'Untitled snippet'}</h3>
									<p class="snippet-card__description">
										{snippet.desc ? escape(snippet.desc) : 'No description provided yet.'}
									</p>
								</header>
								<div class="snippet-card__preview">
									<CodeMirror language={snippet.language} code={snippet.code} />
								</div>
								<footer class="snippet-card__footer">
									<div class="snippet-card__actions">
										<button type="button" on:click={() => copySnippetCode(snippet)}>
											Copy code
										</button>
										<button type="button" on:click={() => copySnippetLink(snippet)}>
											Copy link
										</button>
										<button type="button" on:click={() => shareSnippet(snippet)}>
											{shareAvailable ? 'Share' : 'Share link'}
										</button>
									</div>
									<button type="button" class="snippet-card__primary" on:click={() => openSnippet(snippet)}>
										View details
									</button>
								</footer>
							</article>
						{/each}
					</div>
				{/if}
			{:catch error}
				<div class="results-error">
					<h3>Something went wrong</h3>
					<p>{escape(error.message)}</p>
					<button type="button" on:click={() => (snippetsPromise = getSnippets())}>Try again</button>
				</div>
			{/await}
		</section>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f4f6fb;
		color: #0f172a;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	@font-face {
		font-family: 'Borel';
		font-style: normal;
		font-weight: 400;
		src: url('/Borel-Regular.ttf') format('truetype');
	}

	.store-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 3vw, 3rem);
		padding: clamp(1.5rem, 4vw, 3.5rem);
		background-color: #f4f6fb;
	}

	.store-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.store-header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.store-header__brand {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.store-logo {
		width: fit-content;
		display: inline-flex;
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		font-family: 'Borel', cursive;
		font-size: clamp(1.8rem, 3vw, 2.4rem);
		color: #0f172a;
	}

	.store-logo:focus-visible {
		outline: 3px solid #0f172a;
		outline-offset: 3px;
	}

	.store-header__tagline {
		color: #475569;
		font-size: 0.95rem;
	}

	.store-header__byline {
		font-size: 0.8rem;
		color: #94a3b8;
	}

	.store-header__actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.store-action {
		border: none;
		background-color: #0f172a;
		color: #f8fafc;
		padding: 0.65rem 1.25rem;
		border-radius: 999px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.store-action:hover {
		transform: translateY(-1px);
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
	}

	.store-action--ghost {
		background-color: transparent;
		color: #0f172a;
		border: 1px solid rgba(15, 23, 42, 0.16);
	}

	.store-hero {
		display: grid;
		gap: clamp(1.5rem, 4vw, 3rem);
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		background-color: #0f172a;
		color: #f8fafc;
		padding: clamp(1.75rem, 4vw, 3rem);
		border-radius: 1.75rem;
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.3);
	}

	.store-hero__content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.store-eyebrow {
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-weight: 600;
		color: rgba(248, 250, 252, 0.7);
	}

	.store-hero__content h1 {
		font-size: clamp(1.9rem, 4vw, 2.9rem);
		font-weight: 700;
		line-height: 1.2;
	}

	.store-hero__content p {
		color: rgba(248, 250, 252, 0.75);
		font-size: 1rem;
		line-height: 1.6;
	}

	.store-hero__meta {
		display: flex;
		gap: clamp(1rem, 3vw, 2rem);
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}

	.store-hero__stat {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 100px;
	}

	.store-hero__stat span {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(248, 250, 252, 0.6);
	}

	.store-hero__stat strong {
		font-size: 1.6rem;
		font-weight: 700;
		color: #f8fafc;
	}

	.store-hero__panel {
		background-color: rgba(15, 23, 42, 0.45);
		border-radius: 1.5rem;
		padding: clamp(1.25rem, 3vw, 2rem);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.store-hero__profile {
		display: flex;
		gap: 1rem;
		align-items: center;
		color: #f8fafc;
	}

	.store-hero__profile.loading,
	.store-hero__profile.error {
		font-size: 0.95rem;
		color: rgba(248, 250, 252, 0.85);
		text-align: center;
	}

	.store-hero__profile img {
		width: 64px;
		height: 64px;
		border-radius: 1rem;
		object-fit: cover;
	}

	.store-hero__profile-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.store-hero__profile-actions button,
	.store-hero__cta button {
		background-color: #f8fafc;
		color: #0f172a;
		border: none;
		border-radius: 999px;
		padding: 0.5rem 1.1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.store-hero__cta {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: center;
	}

	.store-hero__cta p {
		color: rgba(248, 250, 252, 0.75);
	}

	.store-layout {
		display: flex;
		flex-direction: column;
		gap: clamp(1.75rem, 4vw, 3rem);
	}

	@media (min-width: 1100px) {
		.store-layout {
			flex-direction: row;
		}
	}

	.store-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		width: 100%;
		max-width: 350px;
	}

	.sidebar-card {
		background-color: #ffffff;
		border-radius: 1.25rem;
		padding: 1.5rem;
		box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar-card h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #0f172a;
	}

	.sidebar-card--subtle {
		background-color: #f8fafc;
		box-shadow: none;
	}

	.sidebar-card--info {
		background-color: #0f172a;
		color: #f8fafc;
		box-shadow: none;
	}

	.sidebar-card--info h3 {
		font-size: 0.95rem;
		font-weight: 600;
	}

	.sidebar-card--info p {
		font-size: 0.9rem;
		line-height: 1.5;
		color: rgba(248, 250, 252, 0.8);
	}

	.sidebar-search label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #64748b;
	}

		.sidebar-search__control {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 0.5rem;
		}

	.sidebar-search__control input {
		flex: 1;
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		padding: 0.65rem 0.9rem;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.sidebar-search__control input:focus {
		outline: 2px solid #0f172a;
		outline-offset: 2px;
	}

	.sidebar-search__control button {
		border-radius: 0.75rem;
		border: none;
		padding: 0.65rem 0.95rem;
		font-weight: 600;
		flex-shrink: 0;
 		display: inline-flex;
 		align-items: center;
 		justify-content: center;
		background-color: #0f172a;
		color: #f8fafc;
		cursor: pointer;
	}

	@media (max-width: 640px) {
		.sidebar-search__control {
			grid-template-columns: 1fr;
		}

		.sidebar-search__control button {
			width: 100%;
		}
	}
	.sidebar-reset {
		align-self: flex-start;
		border: none;
		background: transparent;
		color: #0f172a;
		font-weight: 600;
		cursor: pointer;
	}

	.sidebar-card select {
		border-radius: 0.75rem;
		border: 1px solid #e2e8f0;
		padding: 0.65rem 0.9rem;
		font-size: 0.95rem;
		color: #0f172a;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.chip {
		border-radius: 999px;
		padding: 0.45rem 0.9rem;
		font-weight: 600;
		font-size: 0.85rem;
		border: 1px solid #e2e8f0;
		background: #ffffff;
		color: #0f172a;
		cursor: pointer;
	}

	.chip--active {
		background-color: #0f172a;
		color: #f8fafc;
		border-color: #0f172a;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
	}

	.chip--wide {
		width: 100%;
		justify-content: center;
	}

	.store-results {
		flex: 1 1 0%;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.results-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}

	.results-header h2 {
		font-size: 1.3rem;
		font-weight: 600;
		color: #0f172a;
	}

	.results-header p {
		color: #64748b;
		font-size: 0.95rem;
	}

	@media (min-width: 768px) {
		.results-header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.results-header > div:first-child {
			max-width: 60%;
		}
	}

	.pagination {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.pagination button {
		border: none;
		border-radius: 999px;
		padding: 0.45rem 0.95rem;
		font-weight: 600;
		font-size: 0.85rem;
		background-color: #0f172a;
		color: #f8fafc;
		cursor: pointer;
	}

	.pagination button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.pagination ul {
		display: flex;
		list-style: none;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.pagination ul button {
		background-color: #e2e8f0;
		color: #0f172a;
	}

	.pagination ul button.active,
	.pagination ul button:focus-visible {
		background-color: #0f172a;
		color: #f8fafc;
	}

	.snippet-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: clamp(1.25rem, 3vw, 2rem);
	}

	.snippet-card {
		background-color: #ffffff;
		border-radius: 1.5rem;
		box-shadow: 0 22px 44px rgba(15, 23, 42, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 460px;
	}

	.snippet-card__header {
		padding: 1.5rem 1.75rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.snippet-card__language {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		color: #0369a1;
		background-color: #e0f2fe;
		align-self: flex-start;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
	}

	.snippet-card__header h3 {
		font-size: 1.2rem;
		font-weight: 600;
		color: #0f172a;
		line-height: 1.35;
	}

	.snippet-card__description {
		color: #64748b;
		font-size: 0.95rem;
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.snippet-card__preview {
		border-top: 1px solid #e2e8f0;
		border-bottom: 1px solid #e2e8f0;
		background-color: #282C34;
		flex: 1 1 auto;
		max-height: 340px;
		overflow: auto;
	}

	.snippet-card__preview :global(.code-editor) {
		max-height: 340px;
	}

	.snippet-card__footer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.75rem 1.5rem;
	}

	@media (min-width: 640px) {
		.snippet-card__footer {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.snippet-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.snippet-card__actions button {
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		background-color: #ffffff;
		color: #0f172a;
		font-weight: 600;
		padding: 0.45rem 0.9rem;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.snippet-card__primary {
		border: none;
		border-radius: 999px;
		padding: 0.55rem 1.15rem;
		font-weight: 600;
		font-size: 0.95rem;
		background-color: #0f172a;
		color: #f8fafc;
		cursor: pointer;
	}

	.results-loading {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.loading-card {
		height: 320px;
		border-radius: 1.5rem;
		background-color: #e2e8f0;
		animation: pulse 1.6s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.65;
		}
		50% {
			opacity: 1;
		}
	}

	.results-empty,
	.results-error {
		background-color: #ffffff;
		border-radius: 1.25rem;
		padding: 2rem;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
		text-align: center;
	}

	.results-empty h3,
	.results-error h3 {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #0f172a;
	}

	.results-empty p,
	.results-error p {
		color: #64748b;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.results-error button {
		margin-top: 1rem;
		border: none;
		border-radius: 999px;
		padding: 0.55rem 1.15rem;
		background-color: #0f172a;
		color: #f8fafc;
		font-weight: 600;
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
