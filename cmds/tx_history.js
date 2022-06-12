const yargs = require('yargs/yargs')
const chalk = require('chalk')
const Table = require('cli-table')
const { History } = require('../utils/database')

exports.command = 'history'
exports.desc = 'Show latest transaction history'
exports.builder = (yargs) => {
   yargs.option('wallet', {
      alias: 'w',
      type: 'string',
      desc: 'Spesified wallet identifier'
   })
   .option('network', {
      alias: 'n',
      type: 'string',
      desc: 'Spesified network ID'
   })
   .example([
      ['$0 history', 'show all history'],
      ['$0 history -w myWallet', 'show only for spesified wallet'],
      ['$0 history -n 1', 'show only for spesified network'],
      ['$0 history -w myWallet -n 1', 'show only for spesified wallet & network']
   ])
}

exports.handler = async function (argv) {
   let query = { 
      limit: 10,
      order: [ ['createdAt', 'DESC'] ]
   }

   if(argv.wallet && argv.network) {
      // if specified wallet & network
      query.where = {
         wallet: argv.wallet,
         networkId: argv.network
      }
   } else {
      // wallet only
      if(argv.wallet) {
         query.where = {
            wallet: argv.wallet
         }
      }
      
      // network only
      if(argv.network) {
         query.where = {
            networkId: argv.network
         }
      }
   }

   // get history data
   const result = await History.findAll(query)
   
   // check result length
   if(result.length < 1) {
      return console.log('History empty')
   }
   
   const data = result.map(data => (
      [data.id, data.type, data.hash]
   ))

   const table = new Table({
      head: [
         chalk.white.bold('ID'), 
         chalk.white.bold('Type'), 
         chalk.white.bold('Hash')
      ],
      colWidths: [5, 15, 68],
      rows: data
   })

   console.log(table.toString())
}