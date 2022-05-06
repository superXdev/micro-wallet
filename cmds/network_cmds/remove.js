const chalk = require('chalk')
const { removeNetwork } = require('../modules/network')
const inquirer = require('inquirer')


exports.command = 'remove'
exports.desc = 'Remove permanently a network'
exports.builder = {
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
}

exports.handler = async function (argv) {
   const result = await removeNetwork(argv.network)

   if(result) {
      console.log(chalk.green('Successfully removed!'))
   } else {
      console.log(chalk.red.bold('Invalid network ID'))
   }
}