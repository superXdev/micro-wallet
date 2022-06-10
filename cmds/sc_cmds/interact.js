const yargs = require('yargs/yargs')
const { getNetworkById } = require('../modules/network')
const { getWalletByName } = require('../modules/wallet')
const { 
   getReadFunctions,
   getWriteFunctions, 
   callReadFunction,
   callWriteFunction,
   buildInputs
} = require('../modules/sc')
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

   const selectedMenu = await inquirer.prompt({
      type: 'list',
      name: 'menu',
      message: 'Select type function',
      choices: ['Read', 'Write']
   })

   // for read function
   if(selectedMenu.menu === 'Read') {
      const functions = getReadFunctions(argv.abi)

      const functionChoice = functions.map(data => (
         {
            name: data.name, 
            inputs: data.inputs
         }
      ))

      const selectedFunction = await inquirer.prompt({
         type: 'list',
         name: 'function',
         message: 'Read function',
         choices: functionChoice
      })

      const input = functionChoice.find(item => item.name === selectedFunction.function)

      let functionInputs = null

      if(input.inputs.length > 0) {
         console.log(chalk.magenta('Input is required'))
         functionInputs = await inquirer.prompt(buildInputs(input.inputs))
      }

      const result = await callReadFunction({
         address: argv.address,
         abi: argv.abi,
         rpcURL: networkData.rpcURL,
         function: selectedFunction.function,
         inputs: functionInputs
      })

      if(result.success) {
         console.log(`\n${chalk.green.bold('Result :')} ${result.data}`)
      } else {
         console.log(`\n${chalk.red.bold(result.data)}`)
      }
   } else {
      // write function
      const functions = getWriteFunctions(argv.abi)

      const functionChoice = functions.map(data => (
         {
            name: data.name, 
            inputs: data.inputs
         }
      ))

      const selectedFunction = await inquirer.prompt({
         type: 'list',
         name: 'function',
         message: 'Write function',
         choices: functionChoice
      })

      const input = functionChoice.find(item => item.name === selectedFunction.function)

      let functionInputs = null

      if(input.inputs.length > 0) {
         console.log(chalk.magenta('Input is required'))
         functionInputs = await inquirer.prompt([
            ...buildInputs(input.inputs),
            {
               type: 'input',
               name: 'value_',
               message: `Value (${chalk.yellow(networkData.currencySymbol)})`
            }        
         ])
      }

      const result = await callWriteFunction({
         account: account,
         network: networkData,
         address: argv.address,
         abi: argv.abi,
         function: selectedFunction.function,
         inputs: functionInputs
      })

      if(!result.success) {
         console.log(`Error : ${chalk.red.bold(result.data)}`)
      } else {
         console.log(`Hash : ${chalk.cyan(result.data.transactionHash)}`)
      }
   }
}