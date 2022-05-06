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
exports.handler = async function (argv) {
   const answers = await inquirer.prompt({
      type: 'confirm',
      name: 'toConfirmed',
      message: 'Are you sure?',
      default: false
   })

   if(!answers.toConfirmed) {
      return
   }

   const isExists = await isWalletExists(argv.name)

   if(isExists === false) {
      console.log(chalk.white.bold.bgRed('Wallet is not found!'))
   } else {
      removeWallet(argv.name).then(() => console.log(chalk.green('Successfully deleted')))
   }
}