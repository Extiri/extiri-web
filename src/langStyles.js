import { StreamLanguage } from '@codemirror/language';

import { apl } from '@codemirror/legacy-modes/mode/apl';
import { asn1 } from '@codemirror/legacy-modes/mode/asn1';
import {
	c,
	csharp,
	scala,
	kotlin,
	objectiveC,
	dart
} from '@codemirror/legacy-modes/mode/clike';
import { cmake } from '@codemirror/legacy-modes/mode/cmake';
import { cobol } from '@codemirror/legacy-modes/mode/cobol';
import { coffeeScript } from '@codemirror/legacy-modes/mode/coffeescript';
import { commonLisp } from '@codemirror/legacy-modes/mode/commonlisp';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { erlang } from '@codemirror/legacy-modes/mode/erlang';
import { fortran } from '@codemirror/legacy-modes/mode/fortran';
import { go } from '@codemirror/legacy-modes/mode/go';
import { groovy } from '@codemirror/legacy-modes/mode/groovy';
import { haskell } from '@codemirror/legacy-modes/mode/haskell';
import { http } from '@codemirror/legacy-modes/mode/http';
import { typescript } from '@codemirror/legacy-modes/mode/javascript';
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2';
import { ntriples } from '@codemirror/legacy-modes/mode/ntriples';
import { pascal } from '@codemirror/legacy-modes/mode/pascal';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { powerShell } from '@codemirror/legacy-modes/mode/powershell';
import { properties } from '@codemirror/legacy-modes/mode/properties';
import { protobuf } from '@codemirror/legacy-modes/mode/protobuf';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { r } from '@codemirror/legacy-modes/mode/r';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { scheme } from '@codemirror/legacy-modes/mode/scheme';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import {
	standardSQL,
	mySQL,
	sqlite,
} from '@codemirror/legacy-modes/mode/sql';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { turtle } from '@codemirror/legacy-modes/mode/turtle';
import { vb } from '@codemirror/legacy-modes/mode/vb';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';

import { php } from '@codemirror/lang-php';
import { html } from '@codemirror/lang-html';
import { rust } from '@codemirror/lang-rust';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';

const languages = [
	'apl',
	'pgp',
	'asn',
	'cmake',
	'c',
	'c++',
	'objective-c',
	'kotlin',
	'scala',
	'c#',
	'java',
	'cobol',
	'coffescript',
	'lisp',
	'css/scss',
	'django',
	'dart',
	'dockerfile',
	'erlang',
	'fortran',
	'go',
	'groovy',
	'haskell',
	'html',
	'http',
	'javascript',
	'typescript',
	'json',
	'ecma',
	'jinja',
	'lua',
	'markdown',
	'maths',
	'ntriples',
	'pascal',
	'perl',
	'php',
	'powershell',
	'properties',
	'protobuf',
	'python',
	'r',
	'ruby',
	'rust',
	'sass',
	'scheme',
	'shell',
	'sql',
	'sqlite',
	'sparql',
	'mysql',
	'latex',
	'swift',
	'text',
	'toml',
	'turtle',
	'vb',
	'vue',
	'xml',
	'yaml'
];

const getLang = (lang) => {
	const streamLangs = {
		apl: apl,
		asn: asn1,
		cmake: cmake,
		c: c,
		'objective-c': objectiveC,
		kotlin: kotlin,
		scala: scala,
		'c#': csharp,
		cobol: cobol,
		coffescript: coffeeScript,
		lisp: commonLisp,
		dart: dart,
		dockerfile: dockerFile,
		erlang: erlang,
		fortran: fortran,
		go: go,
		groovy: groovy,
		haskell: haskell,
		http: http,
		typescript: typescript,
		jinja: jinja2,
		lua: lua,
		ntriples: ntriples,
		pascal: pascal,
		perl: perl,
		powershell: powerShell,
		properties: properties,
		protobuf: protobuf,
		r: r,
		ruby: ruby,
		scheme: scheme,
		shell: shell,
		sql: standardSQL,
		sqlite: sqlite,
		sparql: sparql,
		mysql: mySQL,
		swift: swift,
		toml: toml,
		turtle: turtle,
		vb: vb,
		yaml: yaml
	};
	const langs = {
		php: php,
		html: html,
		rust: rust,
		javascript: javascript,
		java: java,
		json: json,
		xml: xml,
		'c++': cpp,
		'css/scss': css,
		markdown: markdown,
		python: python,
		ecma: javascript
	};

	if (lang in streamLangs) {
		return StreamLanguage.define(streamLangs[lang]);
	} else if (lang in langs) {
		return langs[lang]();
	} else {
		return undefined;
	}
};

export { getLang, languages };
