const chalk = require('chalk')
const { saveAddress } = require('../modules/book')


exports.command = 'add'
exports.desc = 'Add new address'
exports.builder = {
  address: {
    demand: true,
    type: 'string',
    alias: 'a',
    desc: 'An wallet address'
  },
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Name or identifier'
  },
}

exports.handler = async function (argv) {
   const result = await saveAddress(argv.name, argv.address)

   if(!result) {
      return console.log('Address is not valid!')
   }

   console.log(chalk.green('Address successfully saved'))
}