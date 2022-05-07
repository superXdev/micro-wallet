const chalk = require('chalk')
const { getTokenBySymbol, removeToken } = require('../modules/token')
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
    return console.log(chalk.red.bold('Invalid network ID'))
  }

  const token = await getTokenBySymbol(argv.symbol)

  if(!token) {
    return console.log(chalk.red.bold('Token symbol is not found'))
  }

  console.log(chalk.white.bold(`\n  Token information`))
  console.log('  ==========')
  console.log(`  Token name   : ${token.name}`)
  console.log(`  Symbol       : ${token.symbol}`)
  console.log(`  Decimal      : ${token.decimals}`)
  console.log(`  SC address   : ${chalk.white.bold(token.contractAddress)}\n`)

  const answers = await inquirer.prompt({
      type: 'confirm',
      name: 'toConfirmed',
      message: 'Are you sure?',
      default: false
   })

   if(!answers.toConfirmed) {
      return
   }

   const result = await removeToken(token.id)

   if(result) {
      console.log(chalk.green('Successfully removed!'))
   } else {
      console.log(chalk.red.bold('Something wrong!'))
   }
}