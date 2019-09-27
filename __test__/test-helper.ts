import * as childProcess from 'child_process';

export function removeFiles(targetDir: string): void {
  const commandParam = {
    cwd: targetDir,
    stdio: [0, 1, 2],
  };
  childProcess.execSync('git clean -x -f', commandParam);
  childProcess.execSync('rm -rf node_modules', commandParam);
}
