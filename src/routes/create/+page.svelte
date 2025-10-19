<style>
	.main {
		background-color: #282C34;
		height: 100vh;
	}
</style>
<script lang="ts">
	import '../../app.css';
	import { goto } from '$app/navigation';
	import escape from 'lodash.escape';
	import CodeMirror from '../../CodeMirrorEditor.svelte';
	import { languages } from '../../langStyles.js';
	import { languageStore } from '../../store.js';

	const categories = ['None', 'UI', 'Math', 'Collections', 'Automations', 'Debugging'];

	let title = '';
	let category = 'None';
	let description = '';
	let language = 'javascript';
	let code = '';

	languageStore.subscribe((newLanguage) => {
		language = newLanguage;
	});

	const browser = typeof window !== 'undefined';

	async function share() {
		let snippet = {
			title: title,
			description: description,
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
			alert('Your snippet has been shared.');
		} else {
			let text = await response.text();
			let error = JSON.parse(text);

			alert('Error: ' + error.reason);
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
</script>

<svelte:head>
	<title>Extiri Snippets — Create</title>
</svelte:head>

<div class="main">
	<div class="navbar bg-base-300 shadow">
		<div class="flex-none">
			<button class="btn btn-square btn-ghost" on:click={() => goto('/')}> Store </button>
		</div>
	</div>

	<div class="sidebar">
		<div class="sidebar-content bg-white">
			<div class="flex justify-center items-center">
				<button
					class="btn btn-primary mt-5 ml-8"
					on:click={() => {
						share();
					}}
				>
					Share
				</button>
			</div>

			<div class="ml-8">
				<div class="form-control w-full">
					<label class="label">
						<span class="label-text">Title</span>
					</label>
					<input
						type="text"
						placeholder="Title..."
						bind:value={title}
						class="input input-bordered mr-8"
					/>
				</div>

				<div class="form-control mt-2">
					<label class="label">
						<span class="label-text">Language</span>
					</label>

					<select class="select select-bordered mr-8" bind:value={$languageStore}>
						{#each languages as language (language)}
							<option value={language}>{language}</option>
						{/each}
					</select>
				</div>

				<div class="form-control max-v-xs mt-2">
					<label class="label">
						<span class="label-text">Category</span>
					</label>

					<select bind:value={category} class="select select-bordered mr-8">
						{#each categories as category (category)}
							<option value={category}>{category}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label">
						<span class="label-text">Description</span>
					</label>
					<textarea
						class="textarea textarea-bordered h-24 mr-8 mb-8"
						bind:value={description}
						placeholder="Description..."
					/>
				</div>
			</div>
		</div>
	</div>

	<div>
		<code>
			<div class="w-screen">
				<CodeMirror bind:code />
			</div>
		</code>
	</div>
</div>
