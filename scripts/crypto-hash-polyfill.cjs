'use strict';

const crypto = require('node:crypto');

if (typeof crypto.hash !== 'function') {
  crypto.hash = (algorithm, data, outputEncoding) => {
    const h = crypto.createHash(algorithm);
    h.update(data);
    const buf = h.digest();
    return outputEncoding ? buf.toString(outputEncoding) : buf;
  };
}

if (typeof globalThis.crypto === 'object' && globalThis.crypto) {
  if (typeof globalThis.crypto.hash !== 'function') {
    globalThis.crypto.hash = crypto.hash;
  }
}
