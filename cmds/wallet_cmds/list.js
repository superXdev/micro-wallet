const { Wallet } = require('../../utils/database')
const Table = require('cli-table')
const chalk = require('chalk')


async function getWalletList(walletTable) {
   const result = await Wallet.findAll()

   return result
}


exports.command = 'list'
exports.desc = 'Show all of wallet'

exports.handler = function (argv) {
   const walletTable = new Table({
      head: [chalk.white.bold('Wallet name'), chalk.white.bold('Address'), chalk.white.bold('Created at')],
      colWidths: [18, 45, 17]
   });

   getWalletList().then((data) => {
      data.forEach(row =>  {
         const date = new Date(row.createdAt)
         walletTable.push([
            row.walletName,
            row.address,
            date.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric'})
         ])
      })

      console.log(walletTable.toString())
   })

}