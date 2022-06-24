const chalk = require('chalk')
const { importToken, formatMoney, isTokenExists } = require('../modules/token')
const { getConnectionStatus, getNetworkById } = require('../modules/network')
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
   // check if token is already exists or not
   const tokenExists = await isTokenExists(argv.address, argv.network)

   if(tokenExists) {
      return console.log('Token already imported')
   }

   // get network data
   const network = await getNetworkById(argv.network)

   if(network === null) {
      return console.log('Network ID are not valid')
   }

   let tokenInfo = null
   let balance = 0

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
            tokenInfo = await web3.getTokenInfo(argv.address, network.rpcURL)
         }
      }
   ])

   await tasks.run()

   // currency format
   const totalSupply = formatMoney(tokenInfo.totalSupply)
   
   console.log(chalk.white.bold(`\n  Token information`))
   console.log('  ==========')
   console.log(`  Token name   : ${tokenInfo.name}`)
   console.log(`  Symbol       : ${tokenInfo.symbol}`)
   console.log(`  Decimal      : ${tokenInfo.decimals}`)
   console.log(`  Total supply : ${totalSupply}\n`)

   if(!argv.yes) {
      const answers = await inquirer.prompt({
         type: 'confirm',
         name: 'toConfirmed',
         message: 'Import token?',
         default: false
      })

      if(!answers.toConfirmed) {
         return console.log('Canceled by user')
      }
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