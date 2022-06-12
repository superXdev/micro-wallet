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
      ['$0 history'],
      ['$0 history -w myWallet -n 1']
   ])
}

exports.handler = function (argv) {

}