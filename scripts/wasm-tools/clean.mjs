import { rmSync } from 'node:fs';
import { distRoot } from './definitions.mjs';

rmSync(distRoot, { recursive: true, force: true });
console.log(`cleaned ${distRoot}`);
