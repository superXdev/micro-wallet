const chalk = require('chalk')
const { getAll } = require('../modules/book')
const Table = require('cli-table')



exports.command = 'list'
exports.desc = 'Show all of book address'


exports.handler = async function (argv) {
   const result = await getAll()

   if(result.length < 1) {
      return console.log('Book address empty')
   }

   const table = new Table({
      head: [chalk.white.bold('Name'), chalk.white.bold('Address')],
      colWidths: [15, 44]
   })
   
   result.map(data => {
      table.push([data.name, data.address])
   })

   console.log(table.toString())
} 