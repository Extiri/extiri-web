<script lang="ts">
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

	let pages = [1];

	let currentPage = 1;
	let search = '';
	let language = 'All';
	let currentCategory = Categories[0];
	let creator = '';

	function searchSnippets() {
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

	function calculatePages(response: Snippets) {
		let total = Math.ceil(response.totalNumberOfResults / response.page.metadata.per);

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
</script>

<div class="main">
	<div class="drawer drawer-mobile">
		<input id="main-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content flex flex-col items-center justify-center w-full">
			<label
				for="main-drawer"
				style="z-index: 2"
				class="btn btn-primary drawer-button lg:hidden fixed z-90 bottom-10 right-8 w-20 h-20 rounded-full flex justify-center items-center text-white text-4xl shadow-2xl"
				>☰</label
			>

			<div class="min-h-screen">
				<div class="grid 2xl:grid-cols-2 gap-x-8 gap-y-10 grid-cols-1 mb-10 mt-8">
					{#await snippetsPromise}
						<h1>Loading...</h1>
					{:then snippets}
						{#each snippets as snippet (escape(snippet.id))}
							<div
								style="width: 550px"
								class="card md:card-side md:h-96 h-fit bg-base-300 shadow-xl"
							>
								<figure class="md:h-auto md:w-96 w-full h-96">
									<CodeMirror language={snippet.language} code={snippet.code} />
								</figure>
								<div class="card-body md:w-6/12 w-full">
									<span class="badge badge-md">{escape(snippet.language)}</span>
									<h1 class="card-title">{escape(snippet.title)}</h1>
									<p class="truncate-description">{escape(snippet.desc)}</p>
									<div class="card-actions justify-end">
										<button
											class="btn btn-primary"
											on:click={() => goto('/snippet?' + escape(snippet.id))}>Open</button
										>
									</div>
								</div>
								<br />
							</div>
						{/each}
					{:catch error}
						<div>
							<h1 class="text-error">{error.status}</h1>
							<p class="text-error">{escape(error.message)}</p>
						</div>
					{/await}
				</div>
			</div>
		</div>
		<div class="drawer-side w-full" style="width: 290px">
			<label for="main-drawer" class="drawer-overlay" />
			<div class="px-4 bg-base-300">
				<div class="card w-full h-48 mt-10 bg-base-100 text-primary-content">
					<div class="card-content">
						{#if isLoggedIn}
							{#await userDetailPromise}
								<h1>Loading...</h1>
							{:then user}
								<div class="flex flex-row">
									<div class="avatar basis-1/3">
										<div class="w-15 rounded-xl ml-5 mt-5">
											<img
												src={profileImage}
												class="profile-image"
												width="20px"
												height="20px"
												alt="User's avatar"
											/>
										</div>
									</div>

									<h1 class="ml-5 card-title text-base-content basis-1/2">
										{escape(user.name)}
									</h1>
								</div>

								<br />

								<button class="btn ml-5" on:click={() => goto('/account')}>Settings</button>
								<button class="ml-3 mt-3 btn" on:click={() => goto('/create')}>Create</button>
							{:catch error}
								<h1>{error}</h1>
							{/await}
						{:else}
							<button class="btn mt-14 ml-11" on:click={() => goto('/account')}
								>Register / Login</button
							>
						{/if}
					</div>
				</div>
				<form on:submit|preventDefault={searchSnippets}>
					<div class="form-control w-full max-w-xs px-2 mt-8">
						<div class="input-group">
							<input
								type="search"
								placeholder="Search..."
								bind:value={search}
								class="input input-bordered w-full max-w-xs"
							/>
							<button class="btn btn-square" on:click={searchSnippets}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/></svg
								>
							</button>
						</div>
					</div>
				</form>

				<div class="btn-group px-2 mt-10">
					<span class="btn" on:click={previousPage}><h3 class="navbar-page-text">«</h3></span>

					{#each pages as page}
						{#if page == currentPage}
							<span class="btn active"><h3 class="navbar-page-text">{page}</h3></span>
						{:else}
							<span class="btn">{page}</span>
						{/if}
					{/each}

					<span class="btn" on:click={nextPage}>»</span>
				</div>

				<div class="divider mt-10">Filters</div>

				{#if isLoggedIn}
					{#await userDetailPromise then user}
						<div class="form-control">
							<label class="label cursor-pointer">
								<span class="label-text">Show only my snippets</span>
								<input type="checkbox" class="toggle" on:click={() => showUsersSnippets(user.id)} />
							</label>
						</div>
					{/await}
				{/if}

				<div class="form-control w-full max-v-xs px-2 mt-3">
					<label class="label">
						<span class="label-text">Language</span>
					</label>

					<select
						class="select select-bordered w-full max-w-xs"
						bind:value={language}
						on:change={() => (snippetsPromise = getSnippets())}
					>
						<option value="All">All</option>
						{#each languages as language (language)}
							<option value={language}>{language}</option>
						{/each}
					</select>
				</div>

				<div class="form-control w-full max-v-xs px-2 mt-3">
					<label class="label">
						<span class="label-text">Category</span>
					</label>

					<select
						class="select select-bordered w-full max-w-xs"
						bind:value={currentCategory}
						on:change={() => (snippetsPromise = getSnippets())}
					>
						{#each Categories as category (category.key)}
							<option value={category}>{category.key}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.truncate-description {
		height: 90%;
		text-overflow: ellipsis;
		overflow: hidden;
		-webkit-box-orient: vertical;
		display: inline-block;
		width: 100%;
		display: -webkit-box;
		overflow: hidden !important;
		text-overflow: ellipsis;
		-webkit-line-clamp: 4;
	}
</style>
