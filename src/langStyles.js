import { language, StreamLanguage } from '@codemirror/language';

import { apl } from '@codemirror/legacy-modes/mode/apl';
import { asciiArmor } from '@codemirror/legacy-modes/mode/asciiarmor';
import { asn1 } from '@codemirror/legacy-modes/mode/asn1';
import { asterisk } from '@codemirror/legacy-modes/mode/asterisk';
import { brainfuck } from '@codemirror/legacy-modes/mode/brainfuck';
import {
	c,
	csharp,
	scala,
	kotlin,
	shader,
	nesC,
	objectiveC,
	objectiveCpp,
	squirrel,
	ceylon,
	dart
} from '@codemirror/legacy-modes/mode/clike';
import { clojure } from '@codemirror/legacy-modes/mode/clojure';
import { cmake } from '@codemirror/legacy-modes/mode/cmake';
import { cobol } from '@codemirror/legacy-modes/mode/cobol';
import { coffeeScript } from '@codemirror/legacy-modes/mode/coffeescript';
import { commonLisp } from '@codemirror/legacy-modes/mode/commonlisp';
import { crystal } from '@codemirror/legacy-modes/mode/crystal';
import { sCSS, less, gss } from '@codemirror/legacy-modes/mode/css';
import { cypher } from '@codemirror/legacy-modes/mode/cypher';
import { d } from '@codemirror/legacy-modes/mode/d';
import { diff } from '@codemirror/legacy-modes/mode/diff';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { dtd } from '@codemirror/legacy-modes/mode/dtd';
import { dylan } from '@codemirror/legacy-modes/mode/dylan';
import { ebnf } from '@codemirror/legacy-modes/mode/ebnf';
import { ecl } from '@codemirror/legacy-modes/mode/ecl';
import { eiffel } from '@codemirror/legacy-modes/mode/eiffel';
import { elm } from '@codemirror/legacy-modes/mode/elm';
import { erlang } from '@codemirror/legacy-modes/mode/erlang';
import { factor } from '@codemirror/legacy-modes/mode/factor';
import { fcl } from '@codemirror/legacy-modes/mode/fcl';
import { forth } from '@codemirror/legacy-modes/mode/forth';
import { fortran } from '@codemirror/legacy-modes/mode/fortran';
import { gas, gasArm } from '@codemirror/legacy-modes/mode/gas';
import { gherkin } from '@codemirror/legacy-modes/mode/gherkin';
import { go } from '@codemirror/legacy-modes/mode/go';
import { groovy } from '@codemirror/legacy-modes/mode/groovy';
import { haskell } from '@codemirror/legacy-modes/mode/haskell';
import { haxe, hxml } from '@codemirror/legacy-modes/mode/haxe';
import { http } from '@codemirror/legacy-modes/mode/http';
import { idl } from '@codemirror/legacy-modes/mode/idl';
import { jsonld, typescript } from '@codemirror/legacy-modes/mode/javascript';
import { jinja2 } from '@codemirror/legacy-modes/mode/jinja2';
import { julia } from '@codemirror/legacy-modes/mode/julia';
import { liveScript } from '@codemirror/legacy-modes/mode/livescript';
import { mathematica } from '@codemirror/legacy-modes/mode/mathematica';
import { mbox } from '@codemirror/legacy-modes/mode/mbox';
import { mirc } from '@codemirror/legacy-modes/mode/mirc';
import { oCaml, fSharp, sml } from '@codemirror/legacy-modes/mode/mllike';
import { modelica } from '@codemirror/legacy-modes/mode/modelica';
import { mscgen, msgenny, xu } from '@codemirror/legacy-modes/mode/mscgen';
import { mumps } from '@codemirror/legacy-modes/mode/mumps';
import { nginx } from '@codemirror/legacy-modes/mode/nginx';
import { ntriples } from '@codemirror/legacy-modes/mode/ntriples';
import { octave } from '@codemirror/legacy-modes/mode/octave';
import { oz } from '@codemirror/legacy-modes/mode/oz';
import { pascal } from '@codemirror/legacy-modes/mode/pascal';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { pig } from '@codemirror/legacy-modes/mode/pig';
import { powerShell } from '@codemirror/legacy-modes/mode/powershell';
import { properties } from '@codemirror/legacy-modes/mode/properties';
import { protobuf } from '@codemirror/legacy-modes/mode/protobuf';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { cython } from '@codemirror/legacy-modes/mode/python';
import { q } from '@codemirror/legacy-modes/mode/q';
import { r } from '@codemirror/legacy-modes/mode/r';
import { rpmChanges, rpmSpec } from '@codemirror/legacy-modes/mode/rpm';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { sas } from '@codemirror/legacy-modes/mode/sas';
import { scheme } from '@codemirror/legacy-modes/mode/scheme';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { sieve } from '@codemirror/legacy-modes/mode/sieve';
import { smalltalk } from '@codemirror/legacy-modes/mode/smalltalk';
import { solr } from '@codemirror/legacy-modes/mode/solr';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { spreadsheet } from '@codemirror/legacy-modes/mode/spreadsheet';
import {
	standardSQL,
	msSQL,
	mySQL,
	mariaDB,
	sqlite,
	cassandra,
	plSQL,
	hive,
	pgSQL,
	gpSQL,
	sparkSQL,
	esper
} from '@codemirror/legacy-modes/mode/sql';
import { stex, stexMath } from '@codemirror/legacy-modes/mode/stex';
import { stylus } from '@codemirror/legacy-modes/mode/stylus';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { tcl } from '@codemirror/legacy-modes/mode/tcl';
import { textile } from '@codemirror/legacy-modes/mode/textile';
import { tiddlyWiki } from '@codemirror/legacy-modes/mode/tiddlywiki';
import { tiki } from '@codemirror/legacy-modes/mode/tiki';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { troff } from '@codemirror/legacy-modes/mode/troff';
import { ttcnCfg } from '@codemirror/legacy-modes/mode/ttcn-cfg';
import { ttcn } from '@codemirror/legacy-modes/mode/ttcn';
import { turtle } from '@codemirror/legacy-modes/mode/turtle';
import { vb } from '@codemirror/legacy-modes/mode/vb';
import { vbScript, vbScriptASP } from '@codemirror/legacy-modes/mode/vbscript';
import { velocity } from '@codemirror/legacy-modes/mode/velocity';
import { verilog, tlv } from '@codemirror/legacy-modes/mode/verilog';
import { vhdl } from '@codemirror/legacy-modes/mode/vhdl';
import { wast } from '@codemirror/legacy-modes/mode/wast';
import { webIDL } from '@codemirror/legacy-modes/mode/webidl';
import { xQuery } from '@codemirror/legacy-modes/mode/xquery';
import { yacas } from '@codemirror/legacy-modes/mode/yacas';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { ez80, z80 } from '@codemirror/legacy-modes/mode/z80';

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
