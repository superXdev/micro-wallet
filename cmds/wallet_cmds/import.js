const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')
const inquirer = require('inquirer')

async function importWallet(data) {
   await Wallet.create(data)
}

exports.command = 'import'
exports.desc = 'Import wallet with private key.'

exports.handler = function (argv) {
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
       },
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
       },
   }]

   console.log(chalk.blue.bold('Import your wallet\n'))

   inquirer.prompt(questions).then((answers) => {
      answers.address = web3.getAddress(answers.privateKey)
      answers.privateKey = crypto.encryptData(answers.privateKey, answers.password).concatenned
      importWallet(answers).then(() => console.log(chalk.green('Successfully imported')))
   })
}