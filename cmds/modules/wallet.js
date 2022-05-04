const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')


// get list of all wallet
async function getWalletList(walletTable) {
   const result = await Wallet.findAll()

   return result
}

// generate new encrypted private key
// and insert in database
async function createWallet(name, password) {
  const account = web3.createAccount()
  const encryptedPrivateKey = crypto.encryptData(account.privateKey, password)

  await Wallet.create({ walletName: name, address: account.address, privateKey: encryptedPrivateKey.concatenned })

  console.log(chalk.green('\nWallet created!\n'))
  console.log(`Address     : ${account.address}\nPrivate key : ${account.privateKey}\n`)
  console.log('Please backup the private key in a safe place.')
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
      return null
   }

   return {
      privateKey: crypto.decryptData(account.privateKey, password)
   }
}

// import wallet
async function importWallet(data) {
   await Wallet.create(data)
}

// delete a wallet
async function removeWallet(walletName) {
   const result = await Wallet.destroy({ where: { walletName: walletName } })
   return result
}

module.exports = {
  createWallet,
  isWalletExists,
  exportWallet,
  importWallet,
  getWalletList,
  removeWallet
}