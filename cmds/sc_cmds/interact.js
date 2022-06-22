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
const { History } = require('../../utils/database')


exports.command = 'interact'
exports.desc = 'Interaction with a smart contract'
exports.builder = (yargs) => {
   yargs.option('address', {
      demand: true,
      type: 'string',
      alias: 'a',
      desc: 'Contract address'
   })
   .option('abi', {
      type: 'string',
      desc: 'ABI json file of smart contract'
   })
   .option('wallet', {
      demand: true,
      type: 'string',
      alias: 'w',
      desc: 'Wallet ID or identifier'
   })
   .option('network', {
      demand: true,
      type: 'number',
      alias: 'n',
      desc: 'Set network id or identifier'
   })
	.example([
		['$0 sc interact --abi contract.abi -a 0x00000000000 -w myWallet -n 1']
	])
}


async function inputs(argv, write = true) {
   const functions = (write) ? getWriteFunctions(argv.abi) : getReadFunctions(argv.abi)

	if(functions === null) {
		return null 
	}

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

   // return selected function
   return [
      functionChoice.find(item => item.name === selectedFunction.function),
      selectedFunction
   ]

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
      while(true) {
         const input = await inputs(argv, false)

			if(input === null) {
				return console.log('ABI file not valid')
			}

         let functionInputs = null

         if(input[0].inputs.length > 0) {
            console.log(chalk.magenta('Input is required'))
            functionInputs = await inquirer.prompt(buildInputs(input[0].inputs))
         }

         const result = await callReadFunction({
            address: argv.address,
            abi: argv.abi,
            rpcURL: networkData.rpcURL,
            function: input[1].function,
            inputs: functionInputs
         })

         if(result.success) {
            console.log(`${chalk.green.bold('Result :')} ${result.data}`)
         } else {
            console.log(`${chalk.red.bold(result.data)}`)
         }
      }
   } else {
      // write function
      while(true) {
         const input = await inputs(argv)
      
			if(input === null) {
				return console.log('ABI file not valid')
			}

         let functionInputs = null

         if(input[0].inputs.length > 0) {
            console.log(chalk.magenta('Input is required'))
            functionInputs = await inquirer.prompt([
               ...buildInputs(input[0].inputs),
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
            function: input[1].function,
            inputs: functionInputs
         }, argv)

         if(!result.success) {
            console.log(`Error : ${chalk.red.bold(result.data)}`)
         } else {
            console.log(`Hash : ${chalk.cyan(result.data.transactionHash)}`)
         }

         // insert to history transaction
         History.create({
            type: 'WRITE SC',
            wallet: account.name,
            hash: result.data.transactionHash,
            networkId: networkData.id
         })
      }
   }
}
