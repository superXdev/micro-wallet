const chalk = require('chalk')
const { 
   getTokenList, 
   removeToken, 
   formatAmountNormal,
   formatMoney
} = require('../modules/token')
const { getWalletByName } = require('../modules/wallet')
const { getNetworkById } = require('../modules/network')
const web3 = require('../../utils/web3')
const inquirer = require('inquirer')
const Listr = require('listr')
const Table = require('cli-table')


async function getTokenTable(argv) {
   const head = [chalk.white.bold('Token name'), chalk.white.bold('Balance')]
   const colWidths = [20, 25]

   const tokenTable = new Table({
      head: head,
      colWidths: colWidths
   });

   const account = await getWalletByName(argv.wallet)
   const networkData = await getNetworkById(argv.network)
   const tokens = await getTokenList(argv.network)

   const promises = tokens.map(async row =>  {
      // get balance
      const balance = await web3.getTokenBalance(account.address, row.contractAddress, networkData.rpcURL)

      tokenTable.push([
         row.name,
         `${chalk.yellow(formatMoney(formatAmountNormal(balance, row.decimals)))} ${row.symbol}`
      ])
   })

   await Promise.all(promises)

   return tokenTable
}

exports.command = 'balance'
exports.desc = 'Show all of token balance'
exports.builder = {
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
  wallet: {
    demand: true,
    alias: 'w',
    type: 'string',
    desc: 'Wallet name or identifier'
  }
}

exports.handler = async function (argv) {
  let table = null
   const tasks = new Listr([{
      title: 'Loading all tokens...',
      task: async () => {
         table = await getTokenTable(argv)
      }
   }])

   await tasks.run()

   console.log(chalk.green.bold('\nToken balance'))
   console.log('========')
   console.log(table.toString())
}