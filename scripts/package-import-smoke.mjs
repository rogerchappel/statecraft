import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const temp = await mkdtemp(path.join(tmpdir(), 'statecraft-pack-'));
const packageName = '@rogerchappel/statecraft';
try {
  const { stdout } = await exec('npm', ['pack', '--json'], { cwd: root });
  const [pack] = JSON.parse(stdout);
  if (pack.name !== packageName) {
    throw new Error(`packed package name mismatch: expected ${packageName}, received ${pack.name}`);
  }
  const tarball = path.join(root, pack.filename);
  await writeFile(path.join(temp, 'package.json'), '{"type":"module"}\n');
  await exec('npm', ['install', tarball], { cwd: temp });
  const installedManifest = JSON.parse(await readFile(path.join(temp, 'node_modules', ...packageName.split('/'), 'package.json'), 'utf8'));
  if (installedManifest.name !== packageName || installedManifest.bin?.statecraft !== './dist/src/cli.js') {
    throw new Error('installed package name/bin contract mismatch');
  }
  const cli = path.join(temp, 'node_modules', '.bin', process.platform === 'win32' ? 'statecraft.cmd' : 'statecraft');
  await access(cli);
  await exec('node', ['--input-type=module', '-e', `import('${packageName}').then((m)=>{ if (typeof m.auditProject !== 'function') throw new Error('auditProject export missing'); })`], { cwd: temp });
  const fixture = path.join(temp, 'node_modules', ...packageName.split('/'), 'examples', 'fixtures', 'redux-clean');
  const { stdout: report } = await exec(cli, ['scan', fixture, '--format', 'json', '--min-score', '80'], { cwd: temp });
  if (JSON.parse(report).score !== 100) {
    throw new Error('installed CLI execution contract mismatch');
  }
  await rm(tarball, { force: true });
  console.log(`${packageName} package import/bin smoke ok`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
