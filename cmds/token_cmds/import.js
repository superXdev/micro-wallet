const chalk = require('chalk')
const { importToken, findNetworkInfo } = require('../modules/token')
const { getConnectionStatus } = require('../modules/network')
const web3 = require('../../utils/web3')
const inquirer = require('inquirer')
const Listr = require('listr')


exports.command = 'import'
exports.desc = 'Import new token'
exports.builder = {
  address: {
    demand: true,
    type: 'string',
    alias: 'a',
    desc: 'Contract address of token'
  },
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
}

exports.handler = async function (argv) {
   const network = await findNetworkInfo(argv.network)

   let tokenInfo = null

   const tasks = new Listr([
      {
         title: 'Checking connection...',
         task: async (ctx, task) => {
            const status = await getConnectionStatus(network.rpcURL)

            if(status === null) {
                throw new Error('Connection failed')
            }
         }
      },
      {
         title: 'Fetching token information',
         task: async (ctx, task) => {
            const result = await web3.getTokenInfo(argv.address, network.rpcURL)
            tokenInfo = result
         }
      }
   ])

   await tasks.run()

   // supply formatted
   const totalSupply = new Intl.NumberFormat(
      'en-US', 
      { maximumSignificantDigits: 3 }
   ).format(tokenInfo.totalSupply)
   
   console.log(chalk.white.bold(`\n  Token information`))
   console.log('  ==========')
   console.log(`  Token name   : ${tokenInfo.name}`)
   console.log(`  Symbol       : ${tokenInfo.symbol}`)
   console.log(`  Decimal      : ${tokenInfo.decimals}`)
   console.log(`  Total supply : ${totalSupply}\n`)

   const answers = await inquirer.prompt({
      type: 'confirm',
      name: 'toConfirmed',
      message: 'Import token?',
      default: false
   })

   if(!answers.toConfirmed) {
      return
   }

   const result = await importToken({
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      address: argv.address,
      networkId: argv.network
   })

   console.log(chalk.green('Successfully imported'))
}