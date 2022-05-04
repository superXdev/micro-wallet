const chalk = require('chalk')
const { isWalletExists, removeWallet } = require('../modules/wallet')
const inquirer = require('inquirer')


exports.command = 'remove'
exports.desc = 'Remove permanently a wallet.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Your wallet name or identifier'
  }
}
exports.handler = function (argv) {
   isWalletExists(argv.name).then((result) => {
      if(result === false) {
         console.log(chalk.white.bold.bgRed('Wallet is not found!'))
      } else {
         removeWallet(argv.name).then(() => console.log(chalk.green('Successfully deleted')))
      }
   })
}