<script>
	import '../../app.css';
	import { goto } from '$app/navigation';
	import md5 from 'md5';
	import escape from 'lodash.escape';

	const browser = typeof window !== 'undefined';

	let isLoggedIn = false;
	let isDeletingAccount = false;

	let promise = Promise.resolve([]);

	let profileImage = '';

	let newUserName = '';
	let newUserEmail = '';
	let newUserPassword = '';
	let newUserPasswordRepeated = '';
	let agreedToTermsOfService = false;

	let loginEmail = '';
	let loginPassword = '';

	function setAvatar(email) {
		let hash = md5(email);
		profileImage = 'https://www.gravatar.com/avatar/' + hash + '?d=retro?s=300.jpg';
	}

	async function register() {
		if (!agreedToTermsOfService) {
			alert('You have to agree to Terms Of Service to register.');
		}

		loginEmail = '';
		loginPassword = '';

		if (newUserPassword != newUserPasswordRepeated) {
			alert('Password and repeated password are not the same.');
		}

		let credentials = {
			name: newUserName,
			email: newUserEmail,
			password: newUserPassword
		};

		let response = await fetch('https://extiri.com/api/1/users/signup/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(credentials)
		});

		if (response.ok) {
			newUserName = '';
			newUserEmail = '';
			newUserPassword = '';
			newUserPasswordRepeated = '';

			alert('Check your e-mail inbox for confirmation link.');

			return;
		} else {
			let text = await response.text();
			let error = JSON.parse(text);

			alert('Error: ' + error.reason);
			throw response.status;
		}
	}

	async function deleteAccount() {
		if (confirm('Are you sure you want to delete your account?')) {
			let credentials = {
				email: loginEmail,
				password: loginPassword
			};

			let response = await fetch('https://extiri.com/api/1/users/delete/', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(credentials)
			});

			if (response.ok) {
				loginEmail = '';
				loginPassword = '';
				alert(
					'Your account will be deleted within 30 days. If you want to restore it, login again.'
				);

				return;
			} else {
				let text = await response.text();
				let error = JSON.parse(text);

				alert('Error: ' + error.reason);
				throw response.status;
			}
		}
	}

	async function login() {
		newUserName = '';
		newUserEmail = '';
		newUserPassword = '';
		newUserPasswordRepeated = '';

		let credentials = {
			email: loginEmail,
			password: loginPassword
		};

		let encodedCredentials = window.btoa(credentials.email + ':' + credentials.password);

		let response = await fetch('https://extiri.com/api/1/users/login/', {
			method: 'POST',
			headers: {
				Authorization: 'Basic ' + encodedCredentials,
				'Content-Type': 'application/json; charset=utf-8'
			},
			body: JSON.stringify(credentials)
		});

		if (response.ok) {
			loginEmail = '';
			loginPassword = '';

			let text = await response.text();
			let token = JSON.parse(text);
			saveToken(token.token);
			promise = getUserDetail();
			return;
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

	function saveToken(token) {
		if (browser) {
			localStorage.setItem('token', token);
		}
	}

	function deleteToken() {
		if (browser) {
			localStorage.removeItem('token');
		}
	}

	function logout() {
		deleteToken();
		promise = getUserDetail();
	}

	async function getUserDetail() {
		let token = getToken();

		let response = await fetch('https://extiri.com/api/1/users/me/', {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});

		if (response.ok) {
			isLoggedIn = true;

			let text = await response.text();
			let info = JSON.parse(text);

			setAvatar(info.email);

			return info;
		} else {
			isLoggedIn = false;

			throw response.status;
		}
	}

	if (browser) {
		promise = getUserDetail();
	}
</script>

<div class="navbar bg-base-300 shadow">
	<div class="flex-1">
		<a class="btn btn-ghost normal-case text-xl">Extiri</a>
	</div>
	<div class="flex-none">
		<button class="btn btn-square btn-ghost" on:click={() => goto('/')}> Store </button>
	</div>
</div>

<div class="divider">Account Details</div>

{#if isLoggedIn}
	{#await promise}
		<h1>Loading...</h1>
	{:then user}
		<div class="ml-10 grid items-center md:grid-cols-2 grid-cols-1 gap-9">
			<div class="avatar">
				<div class="rounded-xl">
					<img src={profileImage} alt="User's avatar" />
				</div>
			</div>

			<div>
				<h1 class="card-title">{escape(user.name)}</h1>
				<p>E-mail: {escape(user.email)}</p>
			</div>
		</div>
	{:catch error}
		<h1>{escape(error)}</h1>
	{/await}
{:else}
	<h1 class="grid items-center justify-center">Not logged in.</h1>
{/if}

<div class="divider">Account management</div>

<div>
	{#if isLoggedIn}
		{#await promise}
			<h1>Loading...</h1>
		{:then user}
			{#if !isDeletingAccount}
				<div class="flex justify-center items-center">
					<button class="btn btn-error mr-3" on:click={() => (isDeletingAccount = true)}
						>Delete account</button
					>
					<button class="btn" on:click={() => logout()}>Log out</button>
				</div>
			{:else}
				<div class="flex justify-center items-center">
					<div class="grid card bg-base-300 rounded-box place-items-center w-1/2">
						<h1 class="card-title mt-8">Deletion</h1>

						<br />

						<div class="form-control w-full max-w-xs">
							<label class="label">
								<span class="label-text">E-mail</span>
							</label>
							<input
								bind:value={loginEmail}
								type="text"
								placeholder="Username"
								class="input input-bordered w-full max-w-xs"
							/>
						</div>

						<div class="form-control w-full max-w-xs">
							<label class="label">
								<span class="label-text">Password</span>
							</label>
							<input
								bind:value={loginPassword}
								type="password"
								placeholder="Password"
								class="input input-bordered w-full max-w-xs"
							/>
						</div>

						<br />

						<button class="btn btn-error mb-2" on:click={() => deleteAccount()}>Delete</button>
						<button class="btn mb-8" on:click={() => (isDeletingAccount = false)}>Cancel</button>
					</div>
				</div>
			{/if}
		{:catch error}
			<h1>{error}</h1>
			<p>Check whether credentials are correct. If error repeats, contact the developer.</p>
			<button class="button center" on:click={() => (isLoggedIn = false)}>Register / Login</button>
		{/await}
	{:else}
		<div class="grid md:grid-cols-2 grid-cols-1 gap-10 w-11/12 px-10 items-center justify-center">
			<div class="grid card bg-base-300 rounded-box place-items-center ">
				<h1 class="card-title mt-8">Register</h1>

				<br />

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Username</span>
					</label>
					<input
						bind:value={newUserName}
						type="text"
						placeholder="Username"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">E-mail</span>
					</label>
					<input
						bind:value={newUserEmail}
						type="text"
						placeholder="Email"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Password</span>
					</label>
					<input
						bind:value={newUserPassword}
						type="password"
						placeholder="Password"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Repeat password</span>
					</label>
					<input
						bind:value={newUserPasswordRepeated}
						type="password"
						placeholder="Repeat assword"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<div class="form-control">
					<label class="label cursor-pointer">
						<input type="checkbox" class="toggle" bind:checked={agreedToTermsOfService} />
						<span class="label-text ml-5"
							>I agree to <a
								href="https://extiri.com/codemenu/terms_of_services.html"
								class="hover:underline underline-offset-4"><b>Terms of Service</b></a
							>.</span
						>
					</label>
				</div>

				<br />

				<button
					class="btn btn-primary mb-8"
					on:click={() => register()}
					disabled={!agreedToTermsOfService}>Register</button
				>
			</div>
			<div class="grid card bg-base-300 rounded-box place-items-center">
				<h1 class="card-title mt-8">Login</h1>

				<br />

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">E-mail</span>
					</label>
					<input
						bind:value={loginEmail}
						type="text"
						placeholder="Username"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<div class="form-control w-full max-w-xs">
					<label class="label">
						<span class="label-text">Password</span>
					</label>
					<input
						bind:value={loginPassword}
						type="password"
						placeholder="Password"
						class="input input-bordered w-full max-w-xs"
					/>
				</div>

				<br />

				<button class="btn btn-primary mb-8" on:click={() => login()}>Login</button>
			</div>
		</div>
	{/if}
</div>
