# Extiri Web

Extiri Web is the place where Extiri's web apps are placed. Currently, there is only Snippets Store, so it is at root.

It uses SvelteKit, TailwindCSS and DaisyUI. It is set to be deployed using Vercel.

# Security

2 vulnerabilities of high (CVE-2023-29008, CVE-2023-29003) severity were detected in SvelteKit. The newest release 1.1.0 updates it to the patched version. It is recommended not to use versions before this release.

## Developing

Once you've acquired and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
