#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const packageJsonPath = path.join(process.cwd(), "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.error("No package.json found in current directory");
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Detect package manager
const hasPnpmLock = fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"));
const hasYarnLock = fs.existsSync(path.join(process.cwd(), "yarn.lock"));

let packageManager = "npm";
if (hasPnpmLock) {
  packageManager = "pnpm";
} else if (hasYarnLock) {
  packageManager = "yarn";
}

// Create config directory
const configDirectory = path.join(process.cwd(), ".sv-arcgis");
if (!fs.existsSync(configDirectory)) {
  fs.mkdirSync(configDirectory, { recursive: true });
  // console.log("✅ Created .sv-arcgis directory");
}

// Create sv-arcgis.js file
const initConfigPath = path.join(configDirectory, "sv-arcgis.js");
const initConfigContent = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';

import { exec } from 'node:child_process';

const packageJsonContent = fs.readFileSync(path.join(process.cwd(), './package.json'), 'utf8');
const usesTypeScript = fs.existsSync(path.join(process.cwd(), 'tsconfig.json'));
const packageInfo = JSON.parse(packageJsonContent);
const version = packageInfo.version;
let configPath;
let envPath;
let envExamplePath;

// Write to ./src/lib/config/index.js
// Prompts user for:
// portalUrl
// webmapId
// base
// appName
// securityClassification
// calcite
// API_KEY
// CLIENT_ID
// CLIENT_SECRET

// Respect terminating the process (ctrl+c)
const onCancel = () => {
  console.log("🛑 Setup canceled. Exiting...");
  process.exit(0);
};

async function generateConfig() {

  // Check if Svelte/SvelteKit is installed
  const isSvelte = fs.existsSync(path.join(process.cwd(), 'src/App.svelte'));
  const isSvelteKit = fs.existsSync(path.join(process.cwd(), 'src/routes/+page.svelte'));
  if (!isSvelte && !isSvelteKit) {
    console.log("🛑 This doesn\'t seem like a Svelte/SvelteKit project.");
    console.log("🛑 Have you ran 'npx sv create ./' yet?");
    process.exit(1);
  }

  // Check if env specific config file already exists
  configPath = path.join(process.cwd(), usesTypeScript ? './src/lib/config/index.ts' : './src/lib/config/index.js');
  envPath = path.join(process.cwd(), \`.env\`);
  envExamplePath = path.join(process.cwd(), \`.env.example\`);

  // Warn if exists
  if (fs.existsSync(configPath) || fs.existsSync(envPath)) {

    console.log("⚠️  Warning");
    console.log("");

    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'Config and / or .env file already exist. Overwrite?',
      initial: false
    });

    // Show cancelled msg
    if (!overwrite) {
      console.log("Setup canceled. Existing configuration preserved.");
      return;
    }
  }

// Start config!
console.log("");
console.log("👋 Hello");
console.log("");

// Use package.json version, else...
const VERSION = { version } ? version : '0.1.0';

const environment = await prompts([
  {
    type: 'select',
    name: 'environment',
    message: 'What environment do you want to setup?',
    choices: [
      { title: 'development', value: 'development' },
      { title: 'staging', value: 'staging' },
      { title: 'production', value: 'production' },
    ],
    validate: value => {
      global.environment = \`/process.env.NODE_ENV || \${value}\`;
      return true;
    }
  }
], { onCancel });
console.log("");

// Set env
global.env = environment.environment;

const appName = await prompts([
  {
    type: 'text',
    name: 'appName',
    message: 'Enter your appName',
    validate: value => {
      global.appNameIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const base = await prompts([
  {
    type: 'text',
    name: 'base',
    message: 'Enter your base URL (e.g. /)',
    validate: value => {
      global.baseIsNull = value.length === 0;
      return true;
    },
    format: value => value.startsWith('/') ? value : \`/\${value}\`
  },
  {
    type: () => global.baseIsNull ? 'text' : null,
    name: 'base',
    message: 'Base URL is required. Otherwise, it defaults to "/"',
    initial: '/',
    format: value => value.startsWith('/') ? value : \`/\${value}\`
  }
], { onCancel });
console.log("");

const portalUrl = await prompts([
  {
    type: 'text',
    name: 'portalUrl',
    message: 'Enter your Portal URL',
    validate: value => {
      global.portalUrlIsNull = value.length === 0;
      return true;
    }
  },
  {
    type: () => global.portalUrlIsNull ? 'text' : null,
    name: 'portalUrl',
    message: 'Portal URL is required. Otherwise, it defaults to "arcgis.com"',
    initial: 'https://www.arcgis.com',
  }
], { onCancel });
console.log("");

const webmapId = await prompts([
  {
    type: 'text',
    name: 'webmapId',
    message: 'Enter your webmapId',
    validate: value => {
      global.webmapIdIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const arcGisApiKey = await prompts([
  {
    type: 'text',
    name: 'ARC_GIS_API_KEY',
    message: 'Enter your ArcGIS API key',
    validate: value => {
      global.arcGisApiKeyIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const arcGisClientId = await prompts([
  {
    type: 'text',
    name: 'ARC_GIS_CLIENT_ID',
    message: 'Enter your ArcGIS Client ID',
    validate: value => {
      global.arcGisClientIdIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const arcGisClientSecret = await prompts([
  {
    type: 'text',
    name: 'ARC_GIS_CLIENT_SECRET',
    message: 'Enter your ArcGIS Client Secret',
    validate: value => {
      global.arcGisClientSecretIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const securityClassification = await prompts([
  {
    type: 'select',
    name: 'securityClassification',
    message: 'Do you need the Security Classification bars above and below on the UI?',
    choices: [
      { title: 'None', value: false },
      { title: 'Classified', value: 'classified' },
      { title: 'Confidential', value: 'confidential' },
      { title: 'Controlled Unclassified Information', value: 'controlled_unclassified_information' },
      { title: 'Secret', value: 'secret' },
      { title: 'Top Secret', value: 'top_secret' },
      { title: 'Top Secret Sensitive Compartment Information', value: 'top_secret_sensitive_compartment_information' },
      { title: 'Unclassified', value: 'unclassified' }
    ],
    validate: value => {
      global.securityClassificationIsNull = value.length === 0;
      return true;
    }
  },
  {
    type: () => global.securityClassificationIsNull ? 'text' : null,
    name: 'securityClassification',
    initial: false,
  }
], { onCancel });
console.log("");

const calcite = await prompts([
  {
    type: 'select',
    name: 'calcite',
    message: 'Do you want to use Calcite Components?',
    choices: [
      { title: 'Yes', value: true },
      { title: 'No', value: false }
    ],
    validate: value => {
      global.calciteIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

const demo = await prompts([
  {
    type: 'select',
    name: 'DEMO',
    message: 'Would you like a demo page?',
    choices: [
      { title: 'Yes', value: true },
      { title: 'No', value: false }
    ],
    validate: value => {
      global.demoIsNull = value.length === 0;
      return true;
    }
  }
], { onCancel });
console.log("");

// Detect package manager
const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));

let packageManager = 'npm';
if (hasPnpmLock) {
  packageManager = 'pnpm';
} else if (hasYarnLock) {
  packageManager = 'yarn';
}


// Install packages with loader
const initPromises = [];

if (calcite.calcite === true) {
  console.log("📦 Installing ArcGIS Core, Map Components, and Calcite Components...");
  initPromises.push(
    new Promise((resolve, reject) => {
      exec(\`\${packageManager} install @arcgis/core@5.1.21 @arcgis/map-components@5.1.21 @esri/calcite-components@5.1.2\`, (error, stdout, stderr) => {
        if (error) {
          console.log('error:', chalk.white.bgRed(error.message));
          reject(error);
        } else {
          resolve();
        }
      });
    })
  );
} else {
 console.log("📦 Installing ArcGIS Core and Map Components...");
  initPromises.push(
    new Promise((resolve, reject) => {
      exec(\`\${packageManager} install @arcgis/core@5.1.21 @arcgis/map-components@5.1.21\`, (error, stdout, stderr) => {
        if (error) {
          console.log('error:', chalk.white.bgRed(error.message));
          reject(error);
        } else {
          resolve();
        }
      });
    })
  );
}

// Wait for all installations to complete
if (initPromises.length > 0) {
  try {
    await Promise.all(initPromises);
    console.log("");
    console.log("✅ Packages installation completed");
    } catch (error) {
    console.log("");
    console.log("❌ Package installation failed:", error.message);
    console.log("");
    console.log("❓ Do you already have one of these installed @arcgis/core, @arcgis/map-components, or @esri/calcite-components? This may be the issue. If you're comfortable with it, uninstall them, delete the node_modules folder, package-lock.json, and run this tool again.");
  }
}

// Add demo page?
if (demo.DEMO === true) {
  let arcgisRouteDir;
  if (isSvelte) {
    // console.log("✅ Created demo in './src/'.");
    // Create directory called 'arcgis' in './src/'

    arcgisRouteDir = path.join(process.cwd(), 'src', 'lib');
  } else if (isSvelteKit) {
    // console.log("✅ Created demo in './src/routes/'.");
    // Create directory called 'arcgis' in './src/routes/'

    arcgisRouteDir = path.join(process.cwd(), 'src', 'routes', 'arcgis');
  }

  if (!fs.existsSync(arcgisRouteDir)) {
    fs.mkdirSync(arcgisRouteDir, { recursive: true });
  }

  // Create a demo page within this directory
  const demoPagePath = isSvelte ? path.join(arcgisRouteDir, 'ArcGIS.svelte') : path.join(arcgisRouteDir, '+page.svelte');
  let demoPageContent;
  
  if (isSvelteKit) {
    demoPageContent = \`<script lang="ts">
      // config
      import config from "../../lib/config";

      // sk
      import { onMount } from "svelte";
      import { browser } from "$app/environment";
      import { env } from "$env/dynamic/public";

      // variables
      let mapView: HTMLArcgisMapElement | null = $state(null);

      onMount(() => {
        console.log("env", env);
        console.log("config", config);
        console.log("mapView", mapView);
      });

      if (browser) {
        import("@arcgis/map-components/dist/loader").then(
          ({ defineCustomElements }) => {
            defineCustomElements(window);
          }
        );
      }
    </script>

    <svelte:head>
      <title>🗺️ SV + ArcGIS Demo</title>
    </svelte:head>

    <main class="e-demo">
      {#if config.securityClassification}
        <div
          class="e-demo-security-bar e-demo-security-bar--{config.securityClassification}"
        >
          Security Classification: {config.securityClassification.toUpperCase()}
        </div>
      {/if}
      <div class="e-demo-container">
        <div class="e-demo-header">
          {#if config.appName}
            {config.appName}
          {:else}
            <h1>🗺️ SV-ArcGIS Demo</h1>
          {/if}
        </div>
        <div class="e-demo-map-wrap">
          <arcgis-map bind:this={mapView} item-id={config.portal.webmapId ? config.portal.webmapId : "05e015c5f0314db9a487a9b46cb37eca"}>
            <arcgis-zoom slot="top-left"></arcgis-zoom>
          </arcgis-map>
          {#if config.calcite}
            <calcite-button appearance="solid" scale="m" type="button" onclick={() => {document.body.classList.toggle('calcite-mode-dark')}}>
              Toggle Theme
            </calcite-button>
          {/if}
        </div>
      </div>
      {#if config.securityClassification}
        <div
          class="e-demo-security-bar e-demo-security-bar--{config.securityClassification}"
        >
          Security Classification: {config.securityClassification.toUpperCase()}
        </div>
      {/if}
    </main>

    <style>
      :global(body:has(.e-demo)) {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }

      :global(body.calcite-mode-dark) {
        background: #212121;

        & .e-demo-header {
          color: #fff;
        }
      }

      .e-demo {
        display: grid;
        grid-template-rows: 24px 1fr 24px;
        height: 100vh;
      }

      .e-demo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .e-demo-header {
        padding: 1rem;
        color: #212121;

        translate: 0 0;
        transition: translate 1s ease-out;

        @starting-style {
          translate: 0 -4px;
        }
      }

      .e-demo-map-wrap {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 50vmax;
        margin-inline: auto;
        margin: 0;
        padding: 0;
        padding-block-end: 2rem;

        & arcgis-map {
          width: 100%;
          height: 50vh;

          opacity: 1;
          transition: opacity 2s ease-out;

          @starting-style {
            opacity: 0;
          }
        }

        & calcite-button {
          align-self: center;
        }
      }

      .e-demo-security-bar {
        position: sticky;
        display: flex;
        align-items: center;
        justify-content: center;
        inset-block-start: 0;
        height: 24px;
        background-color: #000;
        color: #fff;
        margin: 0;
        font-size: 14px;
        z-index: 1;

        &:not(:first-of-type) {
          inset-block-end: 0;
        }

        &.e-demo-security-bar--classified {
          color: #fff;
          background-color: #723d9a;
        }
        &.e-demo-security-bar--confidential {
          color: #fff;
          background-color: #0033a0;
        }
        &.e-demo-security-bar--controlled_unclassified_information {
          color: #fff;
          background-color: #3d1e5a;
        }
        &.e-demo-security-bar--secret {
          color: #fff;
          background-color: #c8102e;
        }
        &.e-demo-security-bar--top_secret {
          color: #000;
          background-color: #ff671f;
        }
        &.e-demo-security-bar--top_secret_sensitive_compartment_information {
          color: #000;
          background-color: #f7ea48;
        }
        &.e-demo-security-bar--unclassified {
          color: #fff;
          background-color: #007a33;
        }
      }
    </style>
    \`;
  }
  
  if (isSvelte) {
    demoPageContent = \`<script>
      // config
      import config from "./config";
  
      // sk
      import { onMount } from "svelte";
  
      // variables
      let mapView = $state(null);
  
      onMount(() => {
        console.log("config", config);
        console.log("mapView", mapView);
      });
      
      import("@arcgis/map-components/dist/loader").then(
        ({ defineCustomElements }) => {
          defineCustomElements(window);
        }
      );
    </script>
  
    <svelte:head>
      <title>🗺️ SV + ArcGIS Demo</title>
    </svelte:head>
  
    <main class="e-demo">
      {#if config.securityClassification}
        <div
          class="e-demo-security-bar e-demo-security-bar--{config.securityClassification}"
        >
          Security Classification: {config.securityClassification.toUpperCase()}
        </div>
      {/if}
      <div class="e-demo-container">
        <div class="e-demo-header">
          {#if config.appName}
            {config.appName}
          {:else}
            <h1>🗺️ SV-ArcGIS Demo</h1>
          {/if}
        </div>
        <div class="e-demo-map-wrap">
          <arcgis-map bind:this={mapView} item-id={config.portal.webmapId ? config.portal.webmapId : "05e015c5f0314db9a487a9b46cb37eca"}>
            <arcgis-zoom slot="top-left"></arcgis-zoom>
          </arcgis-map>
          {#if config.calcite}
            <calcite-button appearance="solid" scale="m" type="button" onclick={() => {document.body.classList.toggle('calcite-mode-dark')}}>
              Toggle Theme
            </calcite-button>
          {/if}
        </div>
      </div>
      {#if config.securityClassification}
        <div
          class="e-demo-security-bar e-demo-security-bar--{config.securityClassification}"
        >
          Security Classification: {config.securityClassification.toUpperCase()}
        </div>
      {/if}
    </main>
  
    <style>
      :global(body:has(.e-demo)) {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }

      :global(body.calcite-mode-dark) {
        background: #212121;

        & .e-demo-header {
          color: #fff;
        }
      }
  
      .e-demo {
        display: grid;
        grid-template-rows: 24px 1fr 24px;
        height: 100vh;
      }
  
      .e-demo-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
  
      .e-demo-header {
        padding: 1rem;
        color: #212121;
  
        translate: 0 0;
        transition: translate 1s ease-out;
  
        @starting-style {
          translate: 0 -4px;
        }
      }
  
      .e-demo-map-wrap {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 50vmax;
        margin-inline: auto;
        margin: 0;
        padding: 0;
        padding-block-end: 2rem;
  
        & arcgis-map {
          width: 100%;
          height: 50vh;
  
          opacity: 1;
          transition: opacity 2s ease-out;
  
          @starting-style {
            opacity: 0;
          }
        }
  
        & calcite-button {
          align-self: center;
        }
      }
  
      .e-demo-security-bar {
        position: sticky;
        display: flex;
        align-items: center;
        justify-content: center;
        inset-block-start: 0;
        height: 24px;
        background-color: #000;
        color: #fff;
        margin: 0;
        font-size: 14px;
        z-index: 1;
  
        &:not(:first-of-type) {
          inset-block-end: 0;
        }
  
        &.e-demo-security-bar--classified {
          color: #fff;
          background-color: #723d9a;
        }
        &.e-demo-security-bar--confidential {
          color: #fff;
          background-color: #0033a0;
        }
        &.e-demo-security-bar--controlled_unclassified_information {
          color: #fff;
          background-color: #3d1e5a;
        }
        &.e-demo-security-bar--secret {
          color: #fff;
          background-color: #c8102e;
        }
        &.e-demo-security-bar--top_secret {
          color: #000;
          background-color: #ff671f;
        }
        &.e-demo-security-bar--top_secret_sensitive_compartment_information {
          color: #000;
          background-color: #f7ea48;
        }
        &.e-demo-security-bar--unclassified {
          color: #fff;
          background-color: #007a33;
        }
      }
    </style>
    \`;
  }

  fs.writeFileSync(demoPagePath, demoPageContent);
  if (isSvelte) {
    console.log(\`✅ Created demo page at ./src/lib/ArcGIS.svelte\`);
  } else {
    console.log(\`✅ Created demo page at ./src/routes/arcgis/+page.svelte\`);
  }

  // Update root page
  const rootRouteDir = isSvelte ? path.join(process.cwd(), 'src') : path.join(process.cwd(), 'src', 'routes');
  const rootPagePath = isSvelte ? path.join(rootRouteDir, 'App.svelte') : path.join(rootRouteDir, '+page.svelte');
  const rootPageUpdate = isSvelte ?  \n\`import ArcGIS from './lib/ArcGIS.svelte';\` : \`<p>Visit the <a href="arcgis">arcgis demo page</a> and view console.log output</p>\`;

  // Read existing root page content and append the demo link
  if (fs.existsSync(rootPagePath) && isSvelteKit) {
    const existingContent = fs.readFileSync(rootPagePath, 'utf8');
    if (!existingContent.includes('arcgis demo page')) {
      const updatedContent = existingContent + \`\n\` + rootPageUpdate;
      fs.writeFileSync(rootPagePath, updatedContent);
    }
    console.log(\`✅ Updated homepage with demo link\`);
  }

  if (fs.existsSync(rootPagePath) && isSvelte) {
    const existingContent = fs.readFileSync(rootPagePath, 'utf8');
    if (!existingContent.includes('ArcGIS.svelte')) {
      // First, add the import statement inside the <script> tag
      const scriptTagRegex = /(<script[^>]*>)/;
      const match = existingContent.match(scriptTagRegex);
      let updatedContent = existingContent;
      
      if (match) {
        const insertionPoint = match.index + match[0].length;
        updatedContent = existingContent.slice(0, insertionPoint) + rootPageUpdate + existingContent.slice(insertionPoint);
      }

      // Then, insert <ArcGIS /> component just after the closing </script> tag
      const closingScriptTagRegex = /(<\\/script>)/;
      const closingMatch = updatedContent.match(closingScriptTagRegex);
      
      if (closingMatch) {
        const componentInsertionPoint = closingMatch.index + closingMatch[0].length;
        updatedContent = updatedContent.slice(0, componentInsertionPoint) + \`\n\n<ArcGIS />\` + updatedContent.slice(componentInsertionPoint);
      }
      
      fs.writeFileSync(rootPagePath, updatedContent);
      console.log(\`✅ Updated App.svelte with ArcGIS component\`);
    }
  }
}

const config = {
  version: VERSION,
  environment: environment.environment,
  ...appName,
  ...base,
  portal: {
    webmapId: webmapId.webmapId,
    url: portalUrl.portalUrl
  },
  ...securityClassification,
  ...calcite
}

const env = \`ARC_GIS_API_KEY=\${arcGisApiKey.ARC_GIS_API_KEY}
ARC_GIS_CLIENT_SECRET=\${arcGisClientSecret.ARC_GIS_CLIENT_SECRET}
PUBLIC_ARC_GIS_CLIENT_ID=\${arcGisClientId.ARC_GIS_CLIENT_ID}\`;

const envExample = \`# ARC_GIS_API_KEY=
# ARC_GIS_CLIENT_SECRET=
# PUBLIC_ARC_GIS_CLIENT_ID=\`;

// Ensure the config directory exists
const configDir = path.join(process.cwd(), 'src', 'lib', 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Create proper JavaScript module content
const configContent = \`\${JSON.stringify(config, null, 2)}\`;
const envContent = env;
fs.writeFileSync(configPath, configContent);
fs.writeFileSync(envPath, envContent);
fs.writeFileSync(envExamplePath, envExample);

return {
  config,
  env
};
}

// Execute, log, handle errors
generateConfig()
  .then(data => {

    if (data) {
      if (data.config) {
        // Check if typescript is used
        const configFilePath = usesTypeScript ? './src/lib/config/index.ts' : './src/lib/config/index.js';

        // Create and write to config file
        const configFileText = usesTypeScript ? \`interface PortalConfiguration {
  webmapId: string;
  url: string;
}

interface StaticConfiguration {
  version: string;
  environment: string;
  appName: string;
  base: string;
  portal: PortalConfiguration;
  securityClassification: boolean | string;
  calcite: boolean;
}
    
export const config: StaticConfiguration = {
  version: "\${data.config.version}",
  environment: process.env.NODE_ENV || "\${data.config.environment}",
  appName: "\${data.config.appName}",
  base: "\${data.config.base}",
  portal: {
    webmapId: "\${data.config.portal.webmapId}",
    url: "\${data.config.portal.url}",
  },
  securityClassification: \${typeof data.config.securityClassification === 'string' ? \`"\${data.config.securityClassification}"\` : data.config.securityClassification},
  calcite: \${data.config.calcite},
};

export default config;\` : \`export const config = {
  version: "\${data.config.version}",
  environment: process.env.NODE_ENV || "\${data.config.environment}",
  appName: "\${data.config.appName}",
  base: "\${data.config.base}",
  portal: {
    webmapId: "\${data.config.portal.webmapId}",
    url: "\${data.config.portal.url}",
  },
  securityClassification: \${typeof data.config.securityClassification === 'string' ? \`"\${data.config.securityClassification}"\` : data.config.securityClassification},
  calcite: \${data.config.calcite},
};

export default config;\`;
        
        fs.writeFileSync(configFilePath, configFileText, { encoding: 'utf8', flag: 'w' });

        // Show that config was written
        console.log(\`✅ Updated config at \` + chalk.bold(\`./src/lib/config/index.\${usesTypeScript ? 'ts' : 'js'}\`));
      }

      if (!global.arcGisApiKeyIsNull || !global.arcGisClientIdIsNull || !global.arcGisClientSecretIsNull) {
        const envFilePath = path.join(process.cwd(), \`.env\`);
        const envFileText = data.env;
        fs.writeFileSync(envFilePath, envFileText, { encoding: 'utf8', flag: 'w' });

        // Show that env was written
        console.log(\`✅ Updated env file at \` + chalk.bold(\`./.env\`));
        console.log(\`👀 Tip: Make sure your .gitignore has the line: .env\`);
      }

      // Show that generation was successful
      console.log("");
      console.log('🔥 Welcome to your ' + chalk.white.bgBlue('ArcGIS') + ' + ' + chalk.white.bgRed('SvelteKit') + ' app');

      // Detect package manager
      const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));
      const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));

      if (hasPnpmLock) {
        console.log('👉 Now you can run \`' + chalk.white.green('pnpm run dev') + '\`');
      } else if (hasYarnLock) {
        console.log('👉 Now you can run \`' + chalk.white.green('yarn run dev') + '\`');
      } else {
        console.log('👉 Now you can run \`' + chalk.white.green('npm run dev') + '\`');
      }

    }

  })
  .catch(err => console.error('Error generating configuration:', err));
`;

fs.writeFileSync(initConfigPath, initConfigContent);
console.log("✅ Created .sv-arcgis/sv-arcgis.js");

// Add script
if (!packageJson.scripts) packageJson.scripts = {};
packageJson.scripts.config =
  "SUPPRESS_NO_CONFIG_WARNING=true node ./.sv-arcgis/sv-arcgis.js";

// Write back to package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Install required dependencies for the config script
console.log("📦 Installing required dependencies...");

try {
  if (packageManager === "pnpm") {
    execSync("pnpm add -D chalk@5.4.1 prompts@2.4.2 cross-env@10.0.0", {
      stdio: "inherit",
    });
  } else if (packageManager === "yarn") {
    execSync("yarn add -D chalk@5.4.1 prompts@2.4.2 cross-env@10.0.0", {
      stdio: "inherit",
    });
  } else {
    execSync(
      "npm install --save-dev chalk@5.4.1 prompts@2.4.2 cross-env@10.0.0",
      { stdio: "inherit" },
    );
  }
  console.log("✅ Dependencies installed successfully");
} catch (error) {
  console.error("❌ Failed to install dependencies:", error.message);
  process.exit(1);
}

console.log("✅ Added config script to package.json");
console.log("");

console.log("🚀 Now run:");
if (packageManager === "pnpm") {
  console.log("   `pnpm run config`");
} else if (packageManager === "yarn") {
  console.log("   `yarn run config`");
} else {
  console.log("   `npm run config`");
}
