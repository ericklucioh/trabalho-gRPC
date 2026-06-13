import { rmSync } from 'node:fs';
import { outputRoot } from './definitions.mjs';

rmSync(outputRoot, { recursive: true, force: true });
console.log(`cleaned ${outputRoot}`);
