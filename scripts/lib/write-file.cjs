const fs = require('node:fs');
const transient = new Set(['UNKNOWN', 'EBUSY', 'EPERM']);
module.exports = function writeFile(file, contents, options) {
  for (let attempt = 0; ; attempt++) {
    try { return fs.writeFileSync(file, contents, options); }
    catch (error) {
      if (!transient.has(error.code) || attempt >= 5) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30 * 2 ** attempt);
    }
  }
};
