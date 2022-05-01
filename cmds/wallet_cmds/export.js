const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const crypto = require('../../utils/crypto')
const inquirer = require('inquirer')


async function exportWallet(walletName, password) {
   const account = await Wallet.findOne({ where: { walletName: walletName } })

   if(account === null) {
      return null
   }

   return {
      privateKey: crypto.decryptData(account.privateKey, password)
   }
}


exports.command = 'export'
exports.desc = 'Export wallet to private key.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Set your wallet name or identifier'
  },
}

exports.handler = function (argv) {
   const questions = [
     {
       type: 'password',
       name: 'password',
       message: "Enter password:",
    }
   ]

   console.log(chalk.blue.bold('Export your wallet\n'))

   inquirer.prompt(questions).then((answers) => {
      exportWallet(argv.name, answers.password).then((exported) => {
         if(exported === null) {
            return console.log(chalk.white.bold.bgYellow('\nInvalid wallet!'))
         }

         if(exported.privateKey == '') {
            console.log(chalk.white.bold.bgRed('\nPassword is wrong!'))
         } else {
            exported.privateKey = ((exported.privateKey.slice(0,2) == "0x") ? exported.privateKey : "0x" + exported.privateKey)
            console.log(`Your private key: ${chalk.white.bold(exported.privateKey)}`)
         }
         
      })
      
   })
}