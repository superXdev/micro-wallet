const { getNetworkList } = require('../modules/network')
const Table = require('cli-table')
const chalk = require('chalk')

exports.command = 'list'
exports.desc = 'Show all available network'

exports.handler = function (argv) {
   const walletTable = new Table({
      head: [chalk.white.bold('ID'), chalk.white.bold('Network name'), chalk.white.bold('Currency')],
      colWidths: [5, 30, 13]
   });

   getNetworkList().then((data) => {
      data.forEach(row =>  {
         const date = new Date(row.createdAt)
         walletTable.push([
            row.id,
            row.networkName,
            row.currencySymbol
         ])
      })

      console.log(walletTable.toString())
   })

}