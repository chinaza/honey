import childProcess from 'child_process';
import fs from 'fs-extra';

function remove(loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return fs.remove(loc, (err) => {
      return !!err ? rej(err) : res();
    });
  });
}

function exec(cmd: string, loc: string): Promise<void> {
  return new Promise((res, rej) => {
    return childProcess.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
      if (!!stdout) {
        console.info(stdout);
      }
      if (!!stderr) {
        console.warn(stderr);
      }
      return !!err ? rej(err) : res();
    });
  });
}

(async () => {
  try {
    // Remove current build
    await remove('./dist/');
    await exec('tsc', './');
  } catch (err) {
    console.error(err);
  }
})();
