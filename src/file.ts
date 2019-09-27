const editJsonFile = require('edit-json-file');

export function initFile(path: string) {
  const file = editJsonFile(path);

  function addLibToExtends(libName: string): Promise<void> {
    const extendsFieldName = 'extends';
    const currentExtends = file.get(extendsFieldName) || [];

    const newExtends = currentExtends.includes(libName)
      ? currentExtends
      : [...currentExtends, libName];
    file.set(extendsFieldName, newExtends);

    return save();
  }

  function save(): Promise<void> {
    return new Promise((resolve, reject) => {
      file.save((err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  return {
    addLibToExtends,
  };
}
