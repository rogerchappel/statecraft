import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const readme = await readFile(path.join(root, 'README.md'), 'utf8');
const artifactName = manifest.name.split('/').at(-1);
const releaseUrl = `https://github.com/rogerchappel/statecraft/releases/download/v${manifest.version}/${artifactName}-${manifest.version}.tgz`;
const installCommand = `npm install --global ${releaseUrl}`;

if (!readme.includes(installCommand)) {
  throw new Error(`README release install command must be: ${installCommand}`);
}
if (readme.includes(`npm install --global ${manifest.name}`) || readme.includes(`npx --package=${manifest.name}`)) {
  throw new Error('README must not direct users to the unpublished npm-registry package');
}
if (manifest.bin?.statecraft !== './dist/src/cli.js') {
  throw new Error('package artifact no longer provides the documented statecraft CLI');
}

console.log(`${manifest.name}@${manifest.version} documentation/package contract ok`);
