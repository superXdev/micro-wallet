const chalk = require('chalk')
const { isWalletExists, getWalletByName } = require('../modules/wallet')
const inquirer = require('inquirer')
const qrcode = require('qrcode-terminal')


exports.command = 'qr'
exports.desc = 'Generate QR code image for a wallet.'
exports.builder = {
  wallet: {
    demand: true,
    type: 'string',
    alias: 'w',
    desc: 'Your wallet name or identifier'
  }
}
exports.handler = async function (argv) {
   const isExists = await isWalletExists(argv.wallet)

   if(!isExists) {
      return console.log(chalk.red.bold('The wallet is not found'))
   }

   const account = await getWalletByName(argv.wallet)
   const address = account.address.substr(0,13) + "..." + account.address.substr(27,30)

   qrcode.generate(account.address, {small: true})
   console.log(chalk.white.bold(address))
}