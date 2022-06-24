const chalk = require('chalk')
const { removeNetwork, getNetworkById, isNetworkExistsById } = require('../modules/network')
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
   const isExists = await isNetworkExistsById(argv.network)

   if(!isExists) {
      return console.log('Network not found')
   }

   const network = await getNetworkById(argv.network)

   console.log(`Remove network: ${chalk.yellow(network.networkName)}`)
   
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

   const result = await removeNetwork(argv.network)

   if(result) {
      console.log(chalk.green('Successfully removed!'))
   } else {
      console.log(chalk.red.bold('Invalid network ID'))
   }
}