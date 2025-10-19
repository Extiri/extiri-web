<script>
	import { EditorState, Compartment } from '@codemirror/state';
	import { basicSetup, EditorView } from 'codemirror';
	import { getLang } from './langStyles.js';
	import { onMount } from 'svelte';
	import { languageStore } from './store.js';
	import { oneDark } from '@codemirror/theme-one-dark';

	export let code;

	let view;
	let codeEditorDiv;

	let previousLanguage;

	let languageCompartment = new Compartment();

	onMount(() => {
		var startState;

		let lang = getLang('javascript');

		if (lang != undefined) {
			startState = EditorState.create({
				doc: code,
				extensions: [
					oneDark,
					basicSetup,
					languageCompartment.of(lang),
					EditorView.updateListener.of((view) => {
						if (view.docChanged) {
							code = view.state.doc.toString();
						}
					})
				]
			});
		} else {
			startState = EditorState.create({
				doc: code,
				extensions: [basicSetup, oneDark]
			});
		}
		view = new EditorView({
			state: startState,
			parent: codeEditorDiv
		});
	});

	languageStore.subscribe((language) => {
		if (view != undefined) {
			if (language != previousLanguage) {
				let lang = getLang(language);
				if (lang == undefined) {
					alert(
						'Highligting in this language is not supported, therefore highlighter will not change.'
					);
				} else {
					view.dispatch({ effects: languageCompartment.reconfigure(lang) });
				}
			}
		}
	});
</script>

<div class="code-editor" bind:this={codeEditorDiv}></div>
