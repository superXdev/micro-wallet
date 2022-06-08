const { getNetworkList, getConnectionStatus } = require('../modules/network')
const Table = require('cli-table')
const chalk = require('chalk')
const Listr = require('listr')



async function getNetworkTable(status, isTestnet) {
   const head = [chalk.white.bold('ID'), chalk.white.bold('Network name'), chalk.white.bold('Currency')]
   const colWidths = [5, 30, 13]

   if(status) {
      head.push(chalk.white.bold('Status'))
      colWidths.push(8)
   }

   const table = new Table({
      head: head,
      colWidths: colWidths
   });

   const lists = await getNetworkList(isTestnet)

   const promises = lists.map(async row =>  {
      const date = new Date(row.createdAt)
      let data = []

      data.push(
         row.id,
         row.networkName,
         row.currencySymbol
      )

      if(status) {
         const status = await getConnectionStatus(row.rpcURL)

         if(typeof status === 'number') {
            data.push(chalk.green.bold('OK'))
         } else {
            data.push(chalk.red.bold('BAD'))
         }

         
      }

      table.push(data)
   })

   await Promise.all(promises)

   return table
}


exports.command = 'list'
exports.desc = 'Show all available network'
exports.builder = {
   status: {
      type: 'boolean',
      alias: 's',
      desc: 'Show connection status for all networks'
   },
   type: {
      type: 'string',
      alias: 't',
      desc: 'Spesific type of network to show'
   },
}

exports.handler = async function (argv) {
   let table = null
   let tables = {}
   const tasks = new Listr([{
      title: 'Loading the networks...',
      task: async () => {
         if(argv.type !== undefined) {
            if(argv.type === 'mainnet') {
               table = await getNetworkTable(argv.status, false)
            } else if(argv.type === 'testnet') {
               table = await getNetworkTable(argv.status, true)
            } else {
               console.log(chalk.red.bold(`Invalid type: ${arg.type}`))
            }

         } else {
            tables.mainnet = await getNetworkTable(argv.status, false)
            tables.testnet = await getNetworkTable(argv.status, true)

            
         }
      }
   }])

   await tasks.run()

   if(argv.type !== undefined) {
      console.log(chalk.blue.bold(`\n${(argv.type === "mainnet") ? 'Mainnet' : 'Testnet'}`))
      console.log(table.toString())
   } else {
      console.log(chalk.blue.bold('\nMainnet'))
      console.log(tables.mainnet.toString())
      console.log(chalk.blue.bold('\nTestnet'))
      console.log(tables.testnet.toString())
   }
}