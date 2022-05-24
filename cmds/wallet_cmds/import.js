const chalk = require('chalk')
const fs = require('fs')
const { importWallet, isWalletExists } = require('../modules/wallet')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')
const inquirer = require('inquirer')



exports.command = 'import'
exports.desc = 'Import wallet with private key or file.'
exports.builder = {
  json: {
    type: 'string',
    alias: 'f',
    desc: 'Import using JSON file format'
  },
}


exports.handler = async function (argv) {
   // if export using JSON file
   if(argv.json) {
      const account = JSON.parse(fs.readFileSync(argv.json).toString())

      const walletExists = await isWalletExists(account.walletName)
      if(walletExists) {
         return console.log('Wallet name already exists')
      }

      // import wallet
      await importWallet(account)

      return console.log(chalk.green('Successfully imported'))
   }

   const questions = [
      {
         type: 'input',
         name: 'walletName',
         message: 'Wallet name:',
         validate(value) {
            const pass = value.match(/^[a-zA-Z0-9_]*$/g);
            if (pass) {
               return true;
            }

            return 'Only alpha numeric characters is allowed';
         }
      },
      {
         type: 'input',
         name: 'privateKey',
         message: "Enter private key:",
         validate(value) {
            value = (value.slice(0,2) == "0x") ? value : "0x" + value
            const pass = value.match(/^0x[a-fA-F0-9]{64}$/g);
            if (pass) {
               return true;
            }

            return 'Please enter a valid private key';
         }
      },
      {
         type: 'password',
         name: 'password',
         message: "Set password:",
         validate(value) {
            if (value.length >= 8) {
               return true;
            }

            return 'Minimum password length is 8';
         }
      },
      {
         type: 'password',
         name: 'cpassword',
         message: "Re-enter password:",
         validate(value, prev) {
            if (value === prev.password) {
               return true;
            }

            return 'Password does not match';
         }
      }
   ]

   // ask user to input wallet information
   const answers = await inquirer.prompt(questions)

   // get address & decrypt the private key
   answers.address = web3.getAddress(answers.privateKey)
   answers.privateKey = crypto.encryptData(answers.privateKey, answers.password).concatenned
   
   // insert it
   await importWallet(answers)
   console.log(chalk.green('\nSuccessfully imported'))
}