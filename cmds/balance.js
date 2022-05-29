const yargs = require('yargs/yargs')
const { getWalletByName } = require('./modules/wallet')
const { getBalance } = require('./modules/balance')
const { formatAmountNormal, formatMoney } = require('./modules/token')
const { getNetworkList, getNetworkById } = require('./modules/network')
const chalk = require('chalk')
const Table = require('cli-table')
const Listr = require('listr')


async function getBalanceTable(argv, account) {
   const table = new Table({
      head: [chalk.white.bold('Network'), chalk.white.bold('Balance')],
      colWidths: [36, 20]
   });

   const networks = await getNetworkList(argv.testnet)

   const promises = networks.map(async data => {
      // get balance
      const balance = await getBalance({
         address: account.address,
         rpc: data.rpcURL,
         isToken: false,
         target: argv.target
      })

      if(!balance.error) {
         table.push([data.networkName, `${chalk.yellow(formatMoney(balance))} ${data.currencySymbol}`])
      }
   })

   await Promise.all(promises)

   return table
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
   .option('testnet', {
      alias: 't',
      type: 'boolean',
      desc: 'Enable testnet network only for "all"'
   })
} 


exports.handler = async function (argv) {
   // get account first
   const account = await getWalletByName(argv.wallet)

   if(argv.target !== 'all') {
      if(argv.wallet === undefined || argv.network === undefined) {
         return console.log('Missing flags : wallet, network')
      }

      // show a native coin or a token balance
      const networkData = await getNetworkById(argv.network)

      const isToken = (argv.target == undefined || argv.target == networkData.currencySymbol) ? false : true

      // get balance
      const balance = await getBalance({
         address: account.address,
         rpc: networkData.rpcURL,
         isToken: isToken,
         target: argv.target,
         network: argv.network
      })

      if(balance === null) {
         return console.log(chalk.red.bold('Token symbol is not found'))
      }


      const currency = (
         argv.target == undefined 
         || argv.target == networkData.currencySymbol
      ) ? networkData.currencySymbol : argv.target

      // format to readable number
      const balanceShow = (isToken) 
         ? formatMoney(formatAmountNormal(balance.balance, balance.decimals)) 
         : formatMoney(balance)

      console.log(`Network      : ${(networkData.isTestnet) ? chalk.cyan(networkData.networkName) : chalk.green(networkData.name)}`)
      console.log(`Your balance : ${chalk.yellow(balanceShow)} ${currency}`)
   } else {
      // show all native balance
      let balances = null
      await new Listr([{
         title: 'Loading all balances...',
         task: async () => {
            balances = await getBalanceTable(argv, account)
         }
      }]).run()

      console.log(
         `\nNetwork : ${(argv.testnet) ? chalk.cyan('Testnet') : chalk.green('Mainnet')}`
      )

      console.log(balances.toString())
   }
}