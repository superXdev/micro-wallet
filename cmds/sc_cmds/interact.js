const yargs = require('yargs/yargs')
const { getNetworkById } = require('../modules/network')
const { getWalletByName } = require('../modules/wallet')
const { getReadFunctions, callReadFunction } = require('../modules/sc')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Listr = require('listr')


exports.command = 'interact'
exports.desc = 'Interaction with a smart contract'
exports.builder = {
   address: {
      demand: true,
      type: 'string',
      alias: 'a',
      desc: 'Contract address'
   },
   abi: {
      type: 'string',
      desc: 'ABI json file of smart contract'
   },
   wallet: {
      demand: true,
      type: 'string',
      alias: 'w',
      desc: 'Wallet ID or identifier'
   },
   network: {
      demand: true,
      type: 'number',
      alias: 'n',
      desc: 'Set network id or identifier'
   },
}


exports.handler = async function (argv) {
   // get account & network
   const account = await getWalletByName(argv.wallet)
   const networkData = await getNetworkById(argv.network)

   const mainMenu = {
      type: 'list',
      name: 'menu',
      message: 'Select type function',
      choices: ['Read', 'Write']
   }

   const selectedMenu = await inquirer.prompt(mainMenu)

   if(selectedMenu.menu === 'Read') {
      const functions = getReadFunctions(argv.abi)

      let functionChoice = []

      functions.map(data => {
         functionChoice.push(data.name)
      })

      const selectedFunction = await inquirer.prompt({
         type: 'list',
         name: 'function',
         message: 'Read function',
         choices: functionChoice
      })

      const result = await callReadFunction({
         address: argv.address,
         abi: argv.abi,
         rpcURL: networkData.rpcURL,
         function: selectedFunction.function
      })

      console.log(`\n${chalk.green.bold('Result :')} ${result}`)
   }
}