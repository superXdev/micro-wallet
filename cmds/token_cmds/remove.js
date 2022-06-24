const chalk = require('chalk')
const { getToken, removeToken } = require('../modules/token')
const inquirer = require('inquirer')
const { Network, Token } = require('../../utils/database')


exports.command = 'remove'
exports.desc = 'Remove permanently a token'
exports.builder = {
  symbol: {
    demand: true,
    type: 'string',
    alias: 's',
    desc: 'Symbol of the token'
  },
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
}

exports.handler = async function (argv) {
   const isNetworkExists = await Network.findOne({ where: { id: argv.network } })

   if(!isNetworkExists) {
      return console.log('Network ID are not valid')
   }

   const token = await getToken(argv.symbol, argv.network)

   if(!token) {
      return console.log('Token not found')
   }

   console.log(chalk.white.bold(`\n  Token information`))
   console.log('  ==========')
   console.log(`  Token name   : ${token.name}`)
   console.log(`  Symbol       : ${token.symbol}`)
   console.log(`  Decimals     : ${token.decimals}`)
   console.log(`  SC address   : ${chalk.white.bold(token.contractAddress)}\n`)

   if(!argv.yes) {
      const answers = await inquirer.prompt({
         type: 'confirm',
         name: 'toConfirmed',
         message: 'Are you sure?',
         default: false
      })

      if(!answers.toConfirmed) {
        return console.log('Canceled by user')
      }
   }

   const result = await removeToken(token.id)

   if(result) {
      console.log(chalk.green('Successfully removed!'))
   } else {
      console.log(chalk.red.bold('Something wrong!'))
   }
}