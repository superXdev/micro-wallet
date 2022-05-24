const { getWalletList } = require('../modules/wallet')
const Table = require('cli-table')
const chalk = require('chalk')


exports.command = 'list'
exports.desc = 'Show all of wallet'

exports.handler = async function (argv) {
   // create table instances
   const walletTable = new Table({
      head: [chalk.white.bold('Wallet name'), chalk.white.bold('Address'), chalk.white.bold('Created at')],
      colWidths: [18, 45, 17]
   });

   // get wallet list
   const lists = await getWalletList()

   // re-format and push to table
   lists.forEach(row =>  {
      const date = new Date(row.createdAt)
      walletTable.push([
         row.walletName,
         row.address,
         date.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric'})
      ])
   })

   // show the table
   console.log(walletTable.toString())
}