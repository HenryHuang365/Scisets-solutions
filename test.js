const crypto = require('crypto');
let randomBytes = crypto.randomBytes(2).toString('hex');
console.log({ randomBytes });
