const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const inquirer = require('inquirer')


async function isWalletExist(walletName) {
   const result = await Wallet.findOne({ where: { walletName: walletName } })

   if(result === null) {
      return false
   }

   return true
}


async function removeWallet(walletName) {
   const result = await Wallet.destroy({ where: { walletName: walletName } })
   return result
}


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
   isWalletExist(argv.name).then((result) => {
      if(result === false) {
         console.log(chalk.white.bold.bgRed('Wallet is not found!'))
      } else {
         removeWallet(argv.name).then(() => console.log(chalk.green('Successfully deleted')))
      }
   })
}