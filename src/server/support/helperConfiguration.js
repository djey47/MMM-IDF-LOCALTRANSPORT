/* @flow */

import childProcess  from 'child_process';

let cachedNPMConfig = undefined;
/**
 * @return Whole NPM config
 */
export function getNPMConfig() {
  if (cachedNPMConfig) { return cachedNPMConfig; }

  const npmConfigOutput = childProcess.execSync('npm config list --json').toString();
  cachedNPMConfig = JSON.parse(npmConfigOutput);

  return cachedNPMConfig;
}
