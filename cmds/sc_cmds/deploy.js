const chalk = require('chalk')
const fs = require('fs')
const Listr = require('listr')
const { rootPath } = require('../../utils/path')
const { deployContract } = require('../modules/sc')
const { importToken } = require('../modules/token')
const { getNetworkById, getConnectionStatus } = require('../modules/network')
const { isWalletExists, getWalletByName } = require('../modules/wallet')
const { DEPLOY_ERC20 } = require('../../utils/constants')
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


async function unlockWallet(account) {
   const answers = await inquirer.prompt({
      type: 'password',
      name: 'password',
      message: 'Enter password to continue:'
   })

   let decryptedKey = crypto.decryptData(account.privateKey, answers.password)
   decryptedKey = (decryptedKey.slice(0,2) == "0x") ? decryptedKey.slice(2) : decryptedKey

   if(decryptedKey == "") {
      return console.log(chalk.red.bold('Password is wrong!'))
   }

   return decryptedKey
}


// prototype of Number object
Number.prototype.noExponents = function() {
   var data = String(this).split(/[eE]/)
   if (data.length == 1) return data[0]

   var z = '',
      sign = this < 0 ? '-' : '',
      str = data[0].replace('.', ''),
      mag = Number(data[1]) + 1

   if (mag < 0) {
      z = sign + '0.'
      while (mag++) z += '0'
      return z + str.replace(/^\-/, '')
   }

   mag -= str.length
   while (mag--) z += '0';
   return str + z;
}


exports.command = 'deploy'
exports.desc = 'Deploy a smart contract'
exports.builder = {
  source: {
    type: 'string',
    alias: 's',
    desc: 'Bytecode file of smart contract'
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

   const contractPath = (argv.source !== undefined) 
      ? `./${argv.source}` 
      : (argv.erc20 ? `${rootPath()}/contracts/ERC20Token.dat` : '')

   if(contractPath === '') {
      return console.log(chalk.yellow('Select bytecode file or type of contracts'))
   }

   const questions = [
      {
         type: 'input',
         name: 'name',
         message: 'Token name:'
      },
      {
         type: 'input',
         name: 'symbol',
         message: 'Symbol:'
      },
      {
         type: 'input',
         name: 'decimals',
         message: 'Decimals:'
      },
      {
         type: 'input',
         name: 'totalSupply',
         message: 'Total supply:'
      }
   ]

   const tokenInfo = await inquirer.prompt(questions)

   const totalSupply = tokenInfo.totalSupply * 10**tokenInfo.decimals

   const bytecode = fs.readFileSync(contractPath)

   let gasLimit = 0
   let gasPrice = 0
   const tasks = new Listr([
      {
         title: 'Checking connection...',
         task: async (ctx, task) => {
            // checking connection if ok
            // process will be continue
            const status = await getConnectionStatus(networkData.rpc)

            if(status === null) {
                throw new Error('Connection failed')
            }
         }
      },
      {
         title: 'Estimating gas limit & price',
         task: async () => {

            gasLimit = await getEstimateGasLimit({
               rpcURL: networkData.rpc,
               from: account.address,
               bytecode: bytecode.toString(),
               type: DEPLOY_ERC20,
               arguments: [tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals, totalSupply.noExponents()]
            })

            gasPrice = await getGasPrice(networkData.rpc)
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
   
   const rawData = getContractData({
      rpcURL: networkData.rpc,
      bytecode: bytecode.toString(),
      arguments: [tokenInfo.name, tokenInfo.symbol, tokenInfo.decimals, totalSupply.noExponents()]
   })

   const txSigned = await signTransaction(txSignedParam = {
      rpcURL: networkData.rpc,
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
   sendingTransaction(txSigned, networkData.rpc)
      .on('receipt', async function(data) {
         console.log(`Contract : ${chalk.yellow(data.contractAddress)}`)
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
         console.log()
         
         const answers = await inquirer.prompt({
            type: 'confirm',
            name: 'toConfirmed',
            message: 'Import token now?'
         })

         if(answers.toConfirmed) {
            await importToken({
               name: tokenInfo.name,
               symbol: tokenInfo.symbol,
               decimals: tokenInfo.decimals,
               address: data.contractAddress,
               networkId: networkData.id
            })

            console.log(chalk.green('Token imported succussfully'))
         }
      })
   
}