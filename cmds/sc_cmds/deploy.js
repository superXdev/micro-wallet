const chalk = require('chalk')
const fs = require('fs')
const Listr = require('listr')
const { rootPath } = require('../../utils/path')
const { deployContract, normalizeString } = require('../modules/sc')
const { importToken, formatAmount } = require('../modules/token')
const { getNetworkById, getConnectionStatus } = require('../modules/network')
const { isWalletExists, getWalletByName, unlockWallet } = require('../modules/wallet')
const { DEPLOY_ERC20, DEPLOY_CUSTOM_CONTRACT } = require('../../utils/constants')
const { 
   getEstimateGasLimit, 
   getContractData,
   getGasPrice,
   signTransaction,
   sendingTransaction,
   fromWeiToEther,
   fromWeiToGwei
} = require('../../utils/web3')
const BigNumber = require('bignumber.js')
const inquirer = require('inquirer')
const crypto = require('../../utils/crypto')





exports.command = 'deploy'
exports.desc = 'Deploy a smart contract'
exports.builder = {
  bin: {
    type: 'string',
    desc: 'Bytecode file of smart contract'
  },
  abi: {
    type: 'string',
    desc: 'ABI json file of smart contract'
  },
  erc20: {
    type: 'boolean',
    desc: 'Deploy erc20 type token'
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
   // get account first
   const account = await getWalletByName(argv.wallet)
   const networkData = await getNetworkById(argv.network)

   const binContractPath = (argv.bin !== undefined) 
      ? argv.bin 
      : (argv.erc20 ? `${rootPath()}/contracts/ERC20Token.bin` : '')

   const abiContractPath = (argv.abi !== undefined) 
      ? argv.abi 
      : (argv.erc20 ? `${rootPath()}/contracts/ERC20Token.abi` : '')

   if(binContractPath === '') {
      return console.log(chalk.yellow('Select bytecode file or type of contracts'))
   }

   if(abiContractPath === '') {
      return console.log(chalk.yellow('Select ABI file or type of contracts'))
   }

   if(!fs.existsSync(binContractPath)) {
      return console.log('The bytecode file not found')
   }

   if(!fs.existsSync(abiContractPath)) {
      return console.log('The ABI file not found')
   }

   // read JSON from abi file
   const jsonAbi = JSON.parse(fs.readFileSync(abiContractPath, 'utf8').toString())

   let constructorQuestions = []

   // checking if there is constructor arguments input
   jsonAbi.map(data => {
      if(data.type === 'constructor') {
         if(data.inputs.length === 0) {
            return
         }

         data.inputs.forEach(input => {
            constructorQuestions.push({
               type: 'input',
               name: input.name,
               message: `${normalizeString(input.name)} (${chalk.gray(input.type)}) :`
            })
         })

         return
      }
   })

   // constructor input data
   let argument = {}

   // if there are questions
   if(constructorQuestions.length > 0) {
      const contractInput = await inquirer.prompt(constructorQuestions)

      argument.inputs = Object.keys(contractInput).map(key => contractInput[key])

      // for ERC20 template, add total supply value
      // and token information properties to argument object
      if(argv.erc20) {
         argument.totalSupply = formatAmount(contractInput.totalSupply, contractInput.decimals)
         argument.tokenInfo = contractInput
      }
   }


   const bytecode = fs.readFileSync(binContractPath)

   let gasLimit = 0
   let gasPrice = 0
   const tasks = new Listr([
      {
         title: 'Checking connection...',
         task: async (ctx, task) => {
            // checking connection if ok
            // process will be continue
            const status = await getConnectionStatus(networkData.rpcURL)

            if(status === null) {
                throw new Error('Connection failed')
            }
         }
      },
      {
         title: 'Estimating gas limit & price',
         task: async () => {
            const estParam = {
               rpcURL: networkData.rpcURL,
               from: account.address,
               bytecode: bytecode.toString(),
               abi: jsonAbi
            }

            estParam.type = (argv.erc20) ? DEPLOY_ERC20 : DEPLOY_CUSTOM_CONTRACT

            if(argument.inputs !== undefined) {
               estParam.arguments = argument.inputs
            }

            gasLimit = await getEstimateGasLimit(estParam)

            gasPrice = await getGasPrice(networkData.rpcURL)
         }
      }
   ])

   console.log()
   await tasks.run()

   const totalFee = fromWeiToEther(gasPrice * gasLimit).substr(0, 12)

   console.log(chalk.white.bold(`\n  Transaction details`))
   console.log('  ==========')
   console.log(`  Creator   : ${account.address}`)
   console.log(`  Gas limit : ${gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ${networkData.currencySymbol}`)
   console.log()

   
   const decryptedKey = await unlockWallet(account)
   
   // raw data
   const rawDataParam = {
      rpcURL: networkData.rpcURL,
      bytecode: bytecode.toString(),
      abi: jsonAbi
   }

   if(argument.inputs !== undefined) {
      rawDataParam.arguments = argument.inputs
   }

   const rawData = getContractData(rawDataParam)

   const txSigned = await signTransaction(txSignedParam = {
      rpcURL: networkData.rpcURL,
      from: account.address,
      value: '0',
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      chainId: networkData.chainId,
      useData: true,
      data: rawData,
      privateKey: decryptedKey
   })

   console.log()
   console.log('Sending transaction into blockchain')
   sendingTransaction(txSigned, networkData.rpcURL)
      .on('receipt', async function(data) {
         console.log(`Contract : ${chalk.yellow(data.contractAddress)}`)
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
         console.log()
         
         // ask to import token for ERC20 deploy
         if(argv.erc20) {
            const answers = await inquirer.prompt({
               type: 'confirm',
               name: 'toConfirmed',
               message: 'Import token now?'
            })

            if(answers.toConfirmed) {
               await importToken({
                  name: argument.tokenInfo.name,
                  symbol: argument.tokenInfo.symbol,
                  decimals: argument.tokenInfo.decimals,
                  address: data.contractAddress,
                  networkId: networkData.id
               })

               console.log(chalk.green('Token imported succussfully'))
            }
         }
      })
   
}