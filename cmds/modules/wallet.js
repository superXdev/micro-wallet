const { Wallet } = require('../../utils/database')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')
const fs = require('fs')


// get list of all wallet
async function getWalletList() {
   const result = await Wallet.findAll()

   return result
}

// get a wallet by name
async function getWalletByName(walletName) {
   const data = await Wallet.findOne({
      where: { walletName: walletName }
   })

   return {
      address: data.address,
      name: data.walletName,
      privateKey: data.privateKey
   }
}

// generate new encrypted private key
// and insert in database
async function createWallet(name, password) {
  const account = web3.createAccount()
  const encryptedPrivateKey = crypto.encryptData(account.privateKey, password)

  await Wallet.create({ walletName: name, address: account.address, privateKey: encryptedPrivateKey.concatenned })

  return account
}

// for checking by wallet name
async function isWalletExists(walletName) {
   const result = await Wallet.findOne({ where: { walletName: walletName } })

   if(result === null) {
      return false
   }

   return true
}

// export decrypted private key from database
async function exportWallet(walletName, password) {
   const account = await Wallet.findOne({ where: { walletName: walletName } })

   if(account === null) {
      return { success: false, message: 'Wallet not found' }
   }

   const decryptedKey = crypto.decryptData(account.privateKey, password)

   if(decryptedKey === '') {
      return { success: false, message: 'Password is wrong' }
   }

   return {
      success: true,
      privateKey: decryptedKey
   }
}

// import wallet
async function importWallet(data) {
   return await Wallet.create(data)
}

// delete a wallet
async function removeWallet(walletName) {
   const result = await Wallet.destroy({ where: { walletName: walletName } })
   return result
}


async function exportWalletJson(walletName) {
   const data = await Wallet.findOne({
      where: { walletName: walletName }
   })

   if(data === null) {
      return { success: false, message: 'Wallet is not found' }
   }

   const finalData = {
      name: walletName,
      address: data.address,
      privateKey: data.privateKey
   }

   fs.writeFile(`./${walletName}.json`, JSON.stringify(finalData, null, 3), err => {
      return { success: false, message: 'Wallet can not be saved' }
   })

   return { success: true, }
}

module.exports = {
  createWallet,
  isWalletExists,
  exportWallet,
  importWallet,
  getWalletList,
  removeWallet,
  getWalletByName,
  exportWalletJson
}