const { Wallet, Book } = require('../../utils/database')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')
const { rootPath } = require('../../utils/path')
const inquirer = require('inquirer')
const fs = require('fs')
const chalk = require('chalk')
const validator = require('validator')
const { getAddressOfEns } = require('./ens')
const Cache = require('node-file-cache')


// get list of all wallet
async function getWalletList() {
   const result = await Wallet.findAll()

   return result
}

// unlock wallet to get decrypted private key
async function unlockWallet(account, argv) {
	// file cache instances
	const cache = Cache.create({
      file: `${rootPath()}/cache.json`,
      life: 1800
   })

   let decryptedKey = null
   let password = null
	
	const cachePass = cache.get(account.name)

	if(cachePass) {
      if(!argv.yes) {
         const confirm = await inquirer.prompt({
            type: 'confirm',
            name: 'answer',
            message: 'Confirm the transaction?'
         })

         if(!confirm.answer) {
            return null
         }
      }

		decryptedKey = crypto.decryptData(account.privateKey, cachePass)
	} else {
		const answers = await inquirer.prompt({
			type: 'password',
			name: 'password',
			message: 'Enter password to continue:'
		})

		decryptedKey = crypto.decryptData(account.privateKey, answers.password)
		password = answers.password
	}

   decryptedKey = (decryptedKey.slice(0,2) == "0x") ? decryptedKey.slice(2) : decryptedKey

   if(decryptedKey == "") {
      return console.log(chalk.red.bold('Password is wrong!'))
   }

   // when password already saved to cache file
   // just return decrypted key
   if(!password) {
      return decryptedKey
   }
	
	// asking if user want save temporary password
	if(argv.yes){
      // store tempPassword to cache file
      cache.set(account.name, password)
      return decryptedKey
   }

   const tempPassword = await inquirer.prompt({
      type: 'confirm',
      name: 'answer',
      message: 'Stop asking password for 30 minutes?'
   })
   
   if(tempPassword.answer) {
      // store tempPassword to cache file
      cache.set(account.name, password)
   }

   return decryptedKey
}

// get address from various type of destination
async function getDestinationAddress(identifier, rpcURL) {
   // hex address
   if(identifier.match(/^0x[a-fA-F0-9]{40}$/g)) {
      return identifier
   }

   // if alpha numeric char
   if(validator.isAlphanumeric(identifier)) {
      // get from book address
      const bookAddress = await Book.findOne({ where: { name: identifier } })

      if(bookAddress) {
         return bookAddress.address
      }

      // from wallet account
      const wallet = await Wallet.findOne({ where: { walletName: identifier } })

      if(wallet) {
         return wallet.address
      }

   }

   // if url char
   if(validator.isURL(identifier)) {
      const address = await getAddressOfEns(rpcURL, identifier)

      return address
   }

   // not valid
   return null
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
      walletName: walletName,
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
  exportWalletJson,
  unlockWallet,
  getDestinationAddress
}
