<script>
	import { EditorState } from '@codemirror/state';
	import { basicSetup, EditorView } from 'codemirror';
	import { getLang } from './langStyles.js';
	import { onMount } from 'svelte';
	import { oneDark } from '@codemirror/theme-one-dark';

	export let language;
	export let code;

	let codeEditor;

	onMount(() => {
		var startState;

		let lang = getLang(language);

		if (lang != undefined) {
			startState = EditorState.create({
				doc: code,
				extensions: [basicSetup, EditorView.editable.of(false), lang, oneDark]
			});
		} else {
			startState = EditorState.create({
				doc: code,
				extensions: [basicSetup, EditorView.editable.of(false)]
			});
		}

		let view = new EditorView({
			state: startState,
			parent: codeEditor
		});
	});
</script>

<div class="code-editor" bind:this={codeEditor}></div>