## ❓ What does this do?

It's an ~opinionated way to setup a Svelte or SvelteKit and ArcGIS project. It'll give you everything you need to get going quickly and will set default locations for things like config.js|ts and your .env file.

Here are the prompts that are asked when running the tool (all are optional):

**(config)**

- Enter your environment
- Enter your appName
- Enter your baseUrl (e.g. /)
- Enter your Portal URL
- Enter your webmapId

**(env)**

- Enter your ArcGIS API key (private)
- Enter your ArcGIS Client ID (private)
- Enter your ArcGIS Client Secret (public)

**(ui)**

- Do you need the Security Classification bars above and below on the UI?
- Do you want to use Calcite Components?
- Would you like a demo page?

## 🎬 Repo / NPM

- [repo](https://github.com/joe-allen/sv-arcgis)
- [npm](https://www.npmjs.com/package/sv-arcgis)

## 📋 Prereqs

- SvelteKit: `npx sv create [project_name]`
- (Or Svelte: `npm create vite@latest`)

## 🗜️ Setup

1. Install [sv-arcgis](https://www.npmjs.com/package/sv-arcgis) `npx sv-arcgis`
2. Follow instructions in terminal 👍

## 📕 Notes

- Using this will install _@arcgis/core@4.34.8_ and _@arcgis/map-components@4.34.9_. (Testing has not been done on later versions)
- If you choose 'Yes' to Calcite, _@esri/calcite-components@3.3.3_ will be installed. (Testing has not been done on later versions)
- Using this will install the following devDepenencies: _chalk_, _prompts_ and _cross-env_

## 🗺️ Roadmap

### q3 2026

- [ ] Bun support
- [ ] Option for / intergrate OAuth2 https://developers.arcgis.com/documentation/security-and-authentication/user-authentication/arcgis-apis/

### q1 2027

- [ ] i18n support
- [ ] Add prompt for ArcGIS Charts / Code components?

### q3 2027

- [ ] Create CI / CD (w/ tests)
- [ ] Create tests (see https://www.youtube.com/watch?v=Xk8yaN9_PZA)

### q1 2026

- [x] Toggle for calcite-mode-light/dark?
- [x] Update to work Svelte / Vite app (not just Kit)? (Demo would need to be different)
- [x] When selecting demo for Svelte (vite) currently we're only importing the component. Update the script to drop `<ArcGIS />` something in the html

## 🙏 Help

- ArcGIS / Calcite Issues?: Check new releases https://developers.arcgis.com/calcite-design-system/releases (see Compatibility section for each release)
- PRs, Issues, etc. are always welcome
