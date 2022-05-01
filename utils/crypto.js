const CryptoJS = require('crypto-js');

function encryptData(data, password) {
   const salt = CryptoJS.lib.WordArray.random(16);
   const iv = CryptoJS.lib.WordArray.random(16);

   const key = CryptoJS.PBKDF2(password, salt, { keySize: 256/32, iterations: 10000, hasher: CryptoJS.algo.SHA256});

   const encrypted = CryptoJS.AES.encrypt(data, key, {iv: iv}).ciphertext;

   const concatenned =  CryptoJS.lib.WordArray.create().concat(salt).concat(iv).concat(encrypted)

   return {
      iv: iv.toString(CryptoJS.enc.Base64),
      salt: salt.toString(CryptoJS.enc.Base64),
      encrypted: encrypted.toString(CryptoJS.enc.Base64),
      concatenned: concatenned.toString(CryptoJS.enc.Base64)
   }
}

function decryptData(data, password) {
   const encrypted =  CryptoJS.enc.Base64.parse(data);

   const salt_len = iv_len = 16;

   const salt = CryptoJS.lib.WordArray.create(
     encrypted.words.slice(0, salt_len / 4 )
   );
   const iv = CryptoJS.lib.WordArray.create(
     encrypted.words.slice(0 + salt_len / 4, (salt_len+iv_len) / 4 )
   );

   const key = CryptoJS.PBKDF2(
     password,
     salt,
     { keySize: 256/32, iterations: 10000, hasher: CryptoJS.algo.SHA256}
   );

   const decrypted = CryptoJS.AES.decrypt(
     {
       ciphertext: CryptoJS.lib.WordArray.create(
         encrypted.words.slice((salt_len + iv_len) / 4)
       )
     },
     key,
     {iv: iv}
   );


   return decrypted.toString(CryptoJS.enc.Utf8)
}


module.exports = {
   encryptData,
   decryptData
}
