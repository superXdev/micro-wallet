
const { getNetworkList } = require('../modules/network')
const Table = require('cli-table')
const chalk = require('chalk')

exports.command = 'list'
exports.desc = 'Show all available network'

exports.handler = function (argv) {
   const mainnetTable = new Table({
      head: [chalk.white.bold('ID'), chalk.white.bold('Network name'), chalk.white.bold('Currency')],
      colWidths: [5, 30, 13]
   });

   const testnetTable = new Table({
      head: [chalk.white.bold('ID'), chalk.white.bold('Network name'), chalk.white.bold('Currency')],
      colWidths: [5, 30, 13]
   });

   getNetworkList().then((data) => {
      data.forEach(row =>  {
         const date = new Date(row.createdAt)
         mainnetTable.push([
            row.id,
            row.networkName,
            row.currencySymbol
         ])
      })

      console.log(chalk.green.bold('\nMainnet'))
      console.log(mainnetTable.toString())

      getNetworkList(true).then((data) => {
         data.forEach(row =>  {
            const date = new Date(row.createdAt)
            testnetTable.push([
               row.id,
               row.networkName,
               row.currencySymbol
            ])
         })

         console.log(chalk.yellow.bold('\nTestnet'))
         console.log(testnetTable.toString())
      })

   })

}