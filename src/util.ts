const npmInstallPackage = require('npm-install-package');

export function installDevPackages(packages: string[]) {
  return new Promise((resolve, reject) => {
    npmInstallPackage(packages, {
      saveDev: true,
    }, (err: Error) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}