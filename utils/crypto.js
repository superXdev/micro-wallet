const crypto = require('crypto');

function encryptData(data, password) {
   salt = crypto.randomBytes(16)
   iv = crypto.randomBytes(16)
   key = crypto.pbkdf2Sync(password, salt, 100000, 256/8, 'sha256')

   cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

   cipher.write(data)
   cipher.end()

   encrypted = cipher.read()
   return {
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      encrypted: encrypted.toString('base64'),
      concatenned: Buffer.concat([salt, iv, encrypted]).toString('base64')
   }
}

function decryptData(encrypted, password) {
   encrypted = Buffer.from(encrypted, 'base64');
   const salt_len = iv_len = 16;

   salt = encrypted.slice(0, salt_len);
   iv = encrypted.slice(password, salt, 100000, 256/8, 'sha256');

   decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

   decipher.write(encrypted.slice(salt_len+iv_len));
   decipher.end();

   decrypted = decipher.read();
   return decrypted.toString();
}


module.exports = {
   encryptData,
   decryptData
}
