const chalk = require('chalk')
const fs = require('fs')
const { verifyContract, getApiUrl } = require('../modules/sc')
const { getNetworkById } = require('../modules/network')
const config = require('../../config.json')


exports.command = 'verify'
exports.desc = 'Verify smart contract source code on explorer'
exports.builder = {
  address: {
  	 demand: true,
    type: 'string',
    alias: 'a',
    desc: 'Contract address'
  },
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
  erc20: {
    type: 'boolean',
    desc: 'erc20 type token'
  },
}


exports.handler = async function (argv) {
	const networkData = await getNetworkById(argv.network)

	// collection of defacult smart contract parameters
	const contractDefault = {
		erc20: {
			url: getApiUrl(networkData.currencySymbol, networkData.isTestnet),
			sourceCode: fs.readFileSync('./contracts/ERC20Token.sol').toString(),
			apiKey: config.BSCSCAN_API,
			address: argv.address,
			contractName: 'ERC20Token',
			compilerversion: 'v0.8.14+commit.80d49f37',
			OptimizationUsed: 0 // 0 false, 1 true
		}
	}

	let data = null
	if(argv.erc20) {
		// API url is null or not available
		if(contractDefault.erc20.url === null) {
			return console.log('API not available for this network')
		}

		// sign data parameters
		data = contractDefault.erc20
	}

	// verifying or submit to explorer API
	const result = await verifyContract(data)

	// show result if successfull
	if(result.data.message === 'OK') {
		console.log(chalk.green('Successfully submitted, it will processed between 30 seconds'))
	} else {
		// show error message
		console.log(`Failed with message: ${chalk.red.bold(result.data.result)}`)
	}
}