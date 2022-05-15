const chalk = require('chalk')
const { isWalletExists, getWalletByName } = require('./modules/wallet')
const inquirer = require('inquirer')


exports.command = 'swap <from> <direction> <to>'
exports.desc = 'Swap token or coin instantly.'
exports.builder = (yargs) => {
   yargs.positional('from', {
      describe: 'Symbol of target coin or token',
      type: 'string'
   })
   yargs.positional('to', {
      describe: 'Symbol of output coin or token',
      type: 'string'
   })
   yargs.positional('direction', {
      demand: true,
      default: '>',
      describe: 'Between > or <',
      type: 'string'
   })
   .option('wallet', {
      demand: true,
      alias: 'w',
      type: 'string',
      desc: 'Wallet name or identifier'
   })
   .option('network', {
      demand: true,
      alias: 'n',
      type: 'string',
      desc: 'Set network id or identifier'
   })
} 

exports.handler = async function (argv) {

}