const chalk = require('chalk')
const fs = require('fs')
const Table = require('cli-table')
const config = require('../../config.json')


exports.command = 'value'
exports.desc = 'Show all value configuration'

exports.handler = async function (argv) {
	const table = new Table({
      head: [chalk.white.bold('Attribute'), chalk.white.bold('Value')],
      colWidths: [20, 40]
   })
   
   for(let key in config) {
   	table.push([key, config[key]])
   }

   console.log(table.toString())
}