const yargs = require('yargs/yargs')
const { getWalletInfo, getNetworkInfo, getBalance } = require('./modules/balance')
const chalk = require('chalk')
const BigNumber = require("bignumber.js")


function formatBalance(balance, decimals) {
   let balanceShow = (balance === "0") 
         ? '0' 
         : new BigNumber(balance + "e-" + decimals).toString()

   return new Intl.NumberFormat(
      'en-US', 
      { maximumSignificantDigits: 3 }
   ).format(balanceShow)
}


exports.command = 'balance [target]'
exports.desc = 'Show balance of coin or token'
exports.builder = (yargs) => {
   yargs.positional('target', {
      describe: 'Symbol of token or native coin',
      type: 'string'
   })
   .option('wallet', {
      alias: 'w',
      type: 'string',
      desc: 'Wallet name or identifier'
   })
   .option('network', {
      alias: 'n',
      type: 'string',
      desc: 'Set network id or identifier'
   })
} 


exports.handler = async function (argv) {
   if(argv.target !== 'all') {
      // show a native coin or a token balance
      // get account first
      const account = await getWalletInfo(argv.wallet)
      const networkData = await getNetworkInfo(argv.network)

      // get balance
      const balance = await getBalance({
         address: account.address,
         rpc: networkData.rpc,
         isToken: (argv.target == undefined || argv.target == networkData.currencySymbol) ? false : true,
         target: argv.target
      })

      if(balance === null) {
         return console.log(chalk.red.bold('Token symbol is not found'))
      }

      const currency = (argv.target == undefined || argv.target == networkData.currencySymbol) 
         ? networkData.currencySymbol : argv.target

      const balanceShow = formatBalance(balance.balance, balance.decimals)

      console.log(`Network      : ${(argv.testnet) ? chalk.yellow(networkData.name) : chalk.green(networkData.name)}`)
      console.log(`Your balance : ${chalk.yellow(balanceShow)} ${currency}`)
   }
}