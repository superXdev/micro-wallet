const chalk = require('chalk')
const { removeAddress } = require('../modules/book')


exports.command = 'remove'
exports.desc = 'Remove an address from book'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Name or identifier'
  },
}

exports.handler = async function (argv) {
   const result = await removeAddress(argv.name)

   if(result) {
      return console.log(chalk.green('Successfully deleted'))
   }

   console.log('Not found!')
}