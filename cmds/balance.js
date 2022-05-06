const yargs = require('yargs/yargs')
const { getWalletInfo, getNetworkInfo } = require('./modules/balance')
const web3 = require('../utils/web3')
const chalk = require('chalk')


exports.command = 'balance [target]'
exports.desc = 'Show balance of coin or token'
exports.builder = (yargs) => {
   yargs.positional('target', {
      describe: 'Symbol of token or native coin',
      type: 'string',
      default: 'ETH'
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
   .option('testnet', {
      alias: 't',
      type: 'boolean',
      default: false,
      desc: 'Is the network are testnet'
   })
} 


exports.handler = async function (argv) {
   if(argv.target !== 'all') {
      // show a native coin or a token balance
      // get account & network first
      const account = await getWalletInfo(argv.wallet)
      const networkData = await getNetworkInfo({ symbol: argv.target, testnet: argv.testnet })

      // get balance
      const balance = await web3.getBalance(account.address, networkData.rpc)

      console.log(`Network      : ${(argv.testnet) ? chalk.yellow(networkData.name) : chalk.green(networkData.name)}`)
      console.log(`Your balance : ${chalk.blue((balance === "0") ? '0' : Number(balance).toFixed(6))} ${argv.target}`)
   }
}