const yargs = require('yargs/yargs')
const chalk = require('chalk')

exports.command = 'history'
exports.desc = 'Show latest transaction history'
exports.builder = (yargs) => {
   yargs.option('wallet', {
      type: 'string',
      desc: 'Spesified wallet identifier'
   })
   .option('network', {
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

exports.handler = function (argv) {

}