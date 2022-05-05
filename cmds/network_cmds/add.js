const { addNetwork, isNetworkExists, validationURL } = require('../modules/network')
const chalk = require('chalk')


exports.command = 'add'
exports.desc = 'add new network'
exports.builder = {
   name: {
      demand: true,
      type: 'string',
      alias: 'n',
      desc: 'The network name'
   },
   ['rpc-url']: {
      demand: true,
      type: 'string',
      alias: 'r',
      desc: 'RPC URL'
   },
   symbol: {
      demand: true,
      type: 'string',
      alias: 's',
      desc: 'The symbol of currency'
   },
   explorer: {
      type: 'string',
      alias: 'e',
      desc: 'Block Explorer URL (Optional)'
   },
   testnet: {
   	  default: false,
      type: 'boolean',
      alias: 't',
      desc: 'Is network are testnet'
   },
}

exports.handler = async function (argv) {
	const isExists = await isNetworkExists(argv.name, argv.symbol)

	if(isExists) {
		return console.log(chalk.red.bold('Network already exists!'))
	}

	const result = await addNetwork(argv.name, argv.r, argv.symbol, argv.explorer, argv.testnet)

	if(result.success) {
		console.log(chalk.green('Successfully saved!'))
	} else {
		console.log(`Something wrong: ${chalk.red.bold(result.message)}`)
	}
}