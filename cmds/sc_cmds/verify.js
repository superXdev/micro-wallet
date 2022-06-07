const chalk = require('chalk')
const fs = require('fs')
const { verifyContract, getApiUrl, findSolcVersion } = require('../modules/sc')
const { getNetworkById } = require('../modules/network')
const config = require('../../config.json')
const { rootPath } = require('../../utils/path')


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
  source: {
    type: 'string',
    desc: 'The source code of smart contract'
  },
  contract: {
    type: 'string',
    desc: 'Contract name'
  },
  compiler: {
    type: 'string',
    desc: 'Compiler version'
  },
  optimization: {
    type: 'boolean',
    default: false,
    desc: 'If use optimization'
  },
}


exports.handler = async function (argv) {
	const networkData = await getNetworkById(argv.network)
	const url = getApiUrl(networkData.currencySymbol, networkData.isTestnet)
	const compilerVersion = findSolcVersion(argv.compiler)

	// API url is null or not available
	if(url === null) {
		return console.log('API not available for this network')
	}


	// collection of default smart contract parameters
	const contractDefault = {
		erc20: {
			url: url.url,
			sourceCode: fs.readFileSync(`${rootPath()}/contracts/ERC20Token.sol`).toString(),
			apiKey: config.BSCSCAN_API,
			address: argv.address,
			contractName: 'ERC20Token',
			compilerversion: 'v0.8.14+commit.80d49f37',
			OptimizationUsed: 0 // 0 false, 1 true
		}
	}

	let params = null

	// ERC20 type contract
	if(argv.erc20) {
		params = contractDefault.erc20
	} else {
		// compiler version not found
		if(compilerVersion === undefined) {
			return console.log('Compiler version for this contract are not found')
		}

		// no contract name
		if(argv.contract === undefined) {
			return console.log('Contract name not set')
		}

		// no source code
		if(argv.source === undefined) {
			return console.log('No source code specified')
		}

		// custom source
		params = {
			url: url.url,
			sourceCode: fs.readFileSync(argv.source, 'utf8').toString(),
			apiKey: config[url.apiKey],
			address: argv.address,
			compilerversion: compilerVersion,
			contractName: argv.contract,
			OptimizationUsed: (argv.optimization) ? 1 : 0
		} 
	}

	// verifying or submit to explorer API
	const result = await verifyContract(params)

	// show result if successfull
	if(result.data.message === 'OK') {
		console.log(chalk.green('Successfully submitted, it will processed between 30 seconds'))
	} else {
		// show error message
		console.log(`Failed with message: ${chalk.red.bold(result.data.result)}`)
	}
}