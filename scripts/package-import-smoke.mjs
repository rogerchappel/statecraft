import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const temp = await mkdtemp(path.join(tmpdir(), 'statecraft-pack-'));
try {
  const { stdout } = await exec('npm', ['pack', '--json'], { cwd: root });
  const [pack] = JSON.parse(stdout);
  const tarball = path.join(root, pack.filename);
  await writeFile(path.join(temp, 'package.json'), '{"type":"module"}\n');
  await exec('npm', ['install', tarball], { cwd: temp });
  await exec('node', ['--input-type=module', '-e', "import('statecraft').then((m)=>{ if (typeof m.auditProject !== 'function') throw new Error('auditProject export missing'); })"], { cwd: temp });
  await rm(tarball, { force: true });
  console.log('statecraft package import smoke ok');
} finally {
  await rm(temp, { recursive: true, force: true });
}
