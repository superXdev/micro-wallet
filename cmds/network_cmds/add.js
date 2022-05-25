const { addNetwork, isNetworkExists, validationURL } = require('../modules/network')
const chalk = require('chalk')
const inquirer = require('inquirer')
const validator = require('validator')
const web3 = require('../../utils/web3')


exports.command = 'add'
exports.desc = 'add new network'

exports.handler = async function (argv) {
   const questions = [
      {
         type: 'input',
         name: 'name',
         message: 'Network name:'
      },      
      {
         type: 'input',
         name: 'rpc',
         message: 'RPC url:',
         validate(value) {
            if(!validator.isURL(value, { require_protocol: true, require_host: true })) {
               return 'Invalid URL!'
            }

            return true
         }
      },      
      {
         type: 'input',
         name: 'chainId',
         message: 'Chain ID:',
         async validate(value, prev) {
            let chainId = await web3.getChainId(prev.rpc)
            if(chainId == value) {
               return true
            }

            return 'Invalid chain id!'
         }
      },
      {
         type: 'input',
         name: 'symbol',
         message: 'Currency symbol:'
      },      
      {
         type: 'input',
         name: 'explorer',
         message: 'Explorer url (optional):'
      },      
      {
         type: 'confirm',
         name: 'isTestnet',
         message: 'Is the testnet network?',
         default: false
      }
   ]

   // ask user to input
   const answers = await inquirer.prompt(questions)

   // check if network is not exists
	const isExists = await isNetworkExists(answers.name, answers.symbol)

   // show warning
	if(isExists) {
		return console.log(chalk.red.bold('Network already exists!'))
	}

   // insert new network data
	const result = await addNetwork({
      name: answers.name,
      rpc: answers.rpc,
      chainId: answers.chainId,
      symbol: answers.symbol,
      explorer: answers.explorer,
      isTestnet: answers.isTestnet
   })

   // show message
	if(result.success) {
		console.log(chalk.green('Successfully saved!'))
	} else {
		console.log(`Something wrong: ${chalk.red.bold(result.message)}`)
	}
}