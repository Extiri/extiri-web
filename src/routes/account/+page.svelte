<script lang="ts">
	import { onDestroy } from 'svelte';
	import '../../app.css';
	import { goto } from '$app/navigation';
	import md5 from 'md5';
	import escape from 'lodash.escape';

	const browser = typeof window !== 'undefined';

	let isLoggedIn = false;
	let isDeletingAccount = false;
	let isLoadingAction = false;

	let promise: Promise<User> = Promise.resolve({ name: '', email: '' });

	interface User {
		name: string;
		email: string;
	}

	let profileImage = '';

	let newUserName = '';
	let newUserEmail = '';
	let newUserPassword = '';
	let newUserPasswordRepeated = '';
	let agreedToTermsOfService = false;

	let loginEmail = '';
	let loginPassword = '';

	let actionMessage = '';
	let actionType: 'success' | 'error' | '' = '';
	let messageTimeout: ReturnType<typeof setTimeout> | undefined;

	function setAvatar(email: string) {
		let hash = md5(email.trim().toLowerCase());
		profileImage = 'https://www.gravatar.com/avatar/' + hash + '?d=retro?s=300.jpg';
	}

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

	async function register() {
		if (!agreedToTermsOfService) {
			notify('Please accept the Terms of Service.', 'error');
			return;
		}

		if (newUserPassword !== newUserPasswordRepeated) {
			notify('Passwords do not match.', 'error');
			return;
		}

		loginEmail = '';
		loginPassword = '';

		let credentials = {
			name: newUserName.trim(),
			email: newUserEmail.trim(),
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
			agreedToTermsOfService = false;
			notify('Check your email inbox to confirm your account.');
		} else {
			let text = await response.text();
			let error = JSON.parse(text);

			notify('Error: ' + error.reason, 'error');
			throw response.status;
		}
	}

	async function deleteAccount() {
		if (isLoadingAction) return;

		isLoadingAction = true;

		let credentials = {
			email: loginEmail.trim(),
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
			isLoadingAction = false;
			isDeletingAccount = false;
			deleteToken();
			isLoggedIn = false;
			notify('Account scheduled for deletion. Log in again within 30 days to restore.');
		} else {
			let text = await response.text();
			let error = JSON.parse(text);
			isLoadingAction = false;
			notify('Error: ' + error.reason, 'error');
			throw response.status;
		}
	}

	async function login() {
		if (isLoadingAction) return;

		newUserName = '';
		newUserEmail = '';
		newUserPassword = '';
		newUserPasswordRepeated = '';

		let credentials = {
			email: loginEmail.trim(),
			password: loginPassword
		};

		isLoadingAction = true;

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
			await refreshUser();
			isLoadingAction = false;
			notify('Welcome back. You are now signed in.');
		} else {
			let text = await response.text();
			let error = JSON.parse(text);
			isLoadingAction = false;
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

	function saveToken(token: string) {
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
		isLoggedIn = false;
		promise = Promise.resolve({ name: '', email: '' });
		profileImage = '';
		notify('Logged out successfully.');
	}

	async function refreshUser() {
		promise = getUserDetail().catch(() => {
			isLoggedIn = false;
			return { name: '', email: '' };
		});
		await promise;
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

			let info = await (response.json() as Promise<User>);

			setAvatar(info.email);

			return info;
		} else {
			isLoggedIn = false;

			throw response.status;
		}
	}

	if (browser) {
		refreshUser();
	}

	function scrollToRegister() {
		if (!browser) return;
		const section = document.getElementById('register');
		if (section) {
			section.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	onDestroy(() => {
		if (messageTimeout) {
			clearTimeout(messageTimeout);
		}
	});
</script>

<svelte:head>
	<title>Extiri Snippets — Account</title>
</svelte:head>

{#if actionMessage}
	<div class="toast {actionType === 'error' ? 'toast-error' : 'toast-success'}">
		{actionMessage}
	</div>
{/if}

<div class="account-page">
	<header class="account-header">
		<div class="account-header__brand">
			<a class="account-logo" href="https://extiri.com" target="_blank" rel="noreferrer">
				<img src="/extiri-text-only.png" alt="Extiri logo" />
			</a>
			<span>Manage your snippex workspace and keep your favourite snippets close.</span>
		</div>
		<button class="account-header__link" on:click={() => goto('/')}>Back to Library</button>
	</header>

	<section class="account-hero">
		<div>
			<p class="account-eyebrow">Account</p>
			<h1>Stay in control of your snippet space.</h1>
			<p>Update details, manage access, and make sure the right snippets follow you everywhere.</p>
		</div>
		<div class="account-hero__panel">
			{#if isLoggedIn}
				{#await promise}
					<div class="account-hero__profile loading">Loading your profile…</div>
				{:then user}
					<div class="account-hero__profile">
						<img src={profileImage} alt="User avatar" width="72" height="72" />
						<div>
							<h3>{escape(user.name)}</h3>
							<p>{escape(user.email)}</p>
							<button type="button" on:click={() => logout()}>Log out</button>
						</div>
					</div>
				{:catch}
					<div class="account-hero__profile error">
						We couldn’t load your profile. Try refreshing the page.
					</div>
				{/await}
			{:else}
				<div class="account-hero__cta">
					<h3>New to snippex?</h3>
					<p>Create an account to publish snippets, sync favourites, and build a private stash.</p>
					<button type="button" on:click={scrollToRegister}>Create account</button>
				</div>
			{/if}
		</div>
	</section>

	{#if isLoggedIn}
		<section class="account-layout">
			{#await promise}
				<div class="account-panel loading-state">Loading account details…</div>
			{:then user}
				<div class="account-panel">
					<h2>Profile overview</h2>
					<p class="detail">Signed in as <strong>{escape(user.name)}</strong></p>
					<p class="detail">Email: <strong>{escape(user.email)}</strong></p>
					<div class="account-panel__actions">
						<button type="button" on:click={() => goto('/')}>Browse snippets</button>
						<button type="button" on:click={() => goto('/create')}>Share a snippet</button>
					</div>
				</div>

				<div class="account-panel">
					<h2>Account controls</h2>
					{#if !isDeletingAccount}
						<p class="detail">Need a fresh start? You can log out or request deletion below.</p>
						<div class="account-panel__actions">
							<button type="button" on:click={() => logout()}>Log out</button>
							<button class="danger" type="button" on:click={() => (isDeletingAccount = true)}>
								Delete account
							</button>
						</div>
					{:else}
						<p class="detail">
							Enter your credentials to confirm deletion. You can recover your account within 30 days.
						</p>
						<div class="form-grid">
							<label>
								<span>Email</span>
								<input type="email" bind:value={loginEmail} placeholder="name@email.com" />
							</label>
							<label>
								<span>Password</span>
								<input type="password" bind:value={loginPassword} placeholder="********" />
							</label>
						</div>
						<div class="account-panel__actions">
							<button class="danger" type="button" on:click={deleteAccount} disabled={isLoadingAction}>
								{isLoadingAction ? 'Deleting…' : 'Confirm deletion'}
							</button>
							<button type="button" on:click={() => (isDeletingAccount = false)}>Cancel</button>
						</div>
					{/if}
				</div>
			{:catch error}
				<div class="account-panel error-panel">
					<h2>We hit a snag</h2>
					<p>{escape(error)}</p>
					<button type="button" on:click={() => refreshUser()}>Try again</button>
				</div>
			{/await}
		</section>
	{:else}
		<section class="auth-grid">
			<article class="auth-card" id="register">
				<h2>Create an account</h2>
				<div class="form-grid">
					<label>
						<span>Username</span>
						<input type="text" bind:value={newUserName} placeholder="Preferred display name" />
					</label>
					<label>
						<span>Email</span>
						<input type="email" bind:value={newUserEmail} placeholder="name@email.com" />
					</label>
					<label>
						<span>Password</span>
						<input type="password" bind:value={newUserPassword} placeholder="********" />
					</label>
					<label>
						<span>Repeat password</span>
						<input type="password" bind:value={newUserPasswordRepeated} placeholder="********" />
					</label>
				</div>
				<label class="tos">
					<input type="checkbox" bind:checked={agreedToTermsOfService} />
					<span
						>I agree to the
						<a href="https://extiri.com/codemenu/terms_of_services.html" target="_blank" rel="noreferrer"
							>Terms of Service</a
						>.</span
					>
				</label>
				<button class="primary" type="button" on:click={register} disabled={!agreedToTermsOfService}>
					Create account
				</button>
			</article>

			<article class="auth-card">
				<h2>Sign in</h2>
				<div class="form-grid">
					<label>
						<span>Email</span>
						<input type="email" bind:value={loginEmail} placeholder="name@email.com" />
					</label>
					<label>
						<span>Password</span>
						<input type="password" bind:value={loginPassword} placeholder="********" />
					</label>
				</div>
				<button class="primary" type="button" on:click={login} disabled={isLoadingAction}>
					{isLoadingAction ? 'Signing in…' : 'Sign in'}
				</button>
				<p class="helper">
					Forgotten your password?
					<a href="mailto:support@extiri.com">Contact support</a>
				</p>
			</article>
		</section>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #f4f6fb;
		color: #0f172a;
		font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.account-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 4vw, 3rem);
		padding: clamp(1.5rem, 5vw, 3.5rem);
	}

	.account-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	@media (min-width: 768px) {
		.account-header {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.account-header__brand {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.account-logo {
		border: none;
		background: transparent;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		align-self: flex-start;
	}

	.account-logo img {
		height: clamp(24px, 3vw, 32px);
		width: auto;
		display: block;
	}

	.account-header__brand span {
		color: #475569;
		font-size: 0.95rem;
	}

	.account-header__link {
		align-self: flex-start;
		border: 1px solid rgba(15, 23, 42, 0.16);
		border-radius: 999px;
		background: transparent;
		padding: 0.45rem 1.1rem;
		font-weight: 600;
		color: #0f172a;
		cursor: pointer;
	}

	.account-hero {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: clamp(1.25rem, 3vw, 2.5rem);
		background-color: #0f172a;
		color: #f8fafc;
		padding: clamp(1.75rem, 5vw, 3rem);
		border-radius: 1.75rem;
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.3);
	}

	.account-eyebrow {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 600;
		color: rgba(248, 250, 252, 0.65);
	}

	.account-hero h1 {
		font-size: clamp(1.9rem, 4vw, 2.9rem);
		font-weight: 700;
		margin-top: 0.6rem;
	}

	.account-hero p {
		margin-top: 0.75rem;
		line-height: 1.6;
		color: rgba(248, 250, 252, 0.75);
	}

	.account-hero__panel {
		background-color: rgba(15, 23, 42, 0.45);
		border-radius: 1.5rem;
		padding: clamp(1.25rem, 3vw, 2rem);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.account-hero__profile {
		display: flex;
		gap: 1rem;
		align-items: center;
		color: #f8fafc;
	}

	.account-hero__profile.loading,
	.account-hero__profile.error {
		font-size: 0.95rem;
		color: rgba(248, 250, 252, 0.85);
		text-align: center;
	}

	.account-hero__profile img {
		width: 72px;
		height: 72px;
		border-radius: 1.2rem;
		object-fit: cover;
	}

	.account-hero__profile button,
	.account-hero__cta button {
		background-color: #f8fafc;
		color: #0f172a;
		border: none;
		border-radius: 999px;
		padding: 0.5rem 1.1rem;
		font-weight: 600;
		cursor: pointer;
	}

	.account-hero__cta {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: center;
	}

	.account-hero__cta p {
		color: rgba(248, 250, 252, 0.75);
	}

	.account-layout {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: clamp(1.5rem, 4vw, 2.75rem);
	}

	.account-panel {
		background-color: #ffffff;
		border-radius: 1.5rem;
		padding: clamp(1.5rem, 4vw, 2.25rem);
		box-shadow: 0 22px 44px rgba(15, 23, 42, 0.1);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.account-panel h2 {
		font-size: 1.2rem;
		font-weight: 600;
		color: #0f172a;
	}

	.detail {
		color: #475569;
		font-size: 0.95rem;
	}

	.account-panel__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.account-panel__actions button {
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		background-color: #ffffff;
		color: #0f172a;
		font-weight: 600;
		padding: 0.55rem 1.2rem;
		cursor: pointer;
	}

	.account-panel__actions .danger {
		border-color: #b91c1c;
		color: #b91c1c;
	}

	.account-panel__actions .danger:disabled {
		opacity: 0.45;
		cursor: progress;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.form-grid label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #475569;
	}

	.form-grid input {
		border-radius: 0.9rem;
		border: 1px solid #e2e8f0;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		color: #0f172a;
		background-color: #ffffff;
	}

	.error-panel {
		align-items: flex-start;
	}

	.auth-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: clamp(1.5rem, 4vw, 2.75rem);
	}

	.auth-card {
		background-color: #ffffff;
		border-radius: 1.5rem;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		box-shadow: 0 22px 44px rgba(15, 23, 42, 0.1);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.auth-card h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #0f172a;
	}

	.tos {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		font-size: 0.85rem;
		color: #475569;
	}

	.tos input {
		margin-top: 0.2rem;
	}

	.tos a {
		color: #0f172a;
		font-weight: 600;
		text-decoration: underline;
	}

	.auth-card .primary {
		border: none;
		border-radius: 999px;
		background-color: #0f172a;
		color: #f8fafc;
		padding: 0.65rem 1.4rem;
		font-weight: 600;
		cursor: pointer;
	}

	.auth-card .primary:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.helper {
		color: #94a3b8;
		font-size: 0.85rem;
	}

	.helper a {
		color: #0f172a;
		font-weight: 600;
	}

	.loading-state {
		align-items: center;
		justify-content: center;
		font-size: 0.95rem;
		color: #64748b;
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
