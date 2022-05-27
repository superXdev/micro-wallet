const yargs = require('yargs/yargs')
const inquirer = require('inquirer')
const validator = require('validator')
const Listr = require('listr')
const { getWalletByName, getDestinationAddress, unlockWallet } = require('./modules/wallet')
const { getTokenBySymbol, formatAmount } = require('./modules/token')
const { getBalance, formatBalance } = require('./modules/balance')
const { 
   getNetworkList, 
   getNetworkById, 
   getConnectionStatus 
} = require('./modules/network')
const { TRANSFER_TOKEN, TRANSFER_COIN } = require('../utils/constants')
const crypto = require('../utils/crypto')
const chalk = require('chalk')
const { 
   getEstimateGasLimit, 
   getTransferTokenData, 
   getGasPrice,
   signTransaction,
   sendingTransaction,
   fromWeiToGwei,
   fromWeiToEther,
   getTxHash
} = require('../utils/web3')



exports.command = 'transfer [symbol]'
exports.desc = 'Made transaction to transfer coin or token'
exports.builder = (yargs) => {
   yargs.positional('symbol', {
      demand: true,
      describe: 'Symbol of token or native coin',
      type: 'string'
   })
   .option('amount', {
      demand: true,
      alias: 'a',
      type: 'string',
      desc: 'Amount to transfer'
   })
   .option('destination', {
      demand: true,
      alias: 'd',
      type: 'string',
      desc: 'Address or identifier of recipient'
   })
   .option('wallet', {
      demand: true,
      alias: 'w',
      type: 'string',
      desc: 'Wallet name or identifier'
   })
   .option('network', {
      demand: true,
      type: 'number',
      alias: 'n',
      desc: 'Network ID of blockchain'
   })
   .option('bulk', {
      type: 'boolean',
      desc: 'For bulk transfer'
   })
}

exports.handler = async function (argv) {
   // get account first
   const account = await getWalletByName(argv.wallet)
   // get network data
   const networkData = await getNetworkById(argv.network)
   // get destination
   let destination = await getDestinationAddress(argv.destination, networkData.rpcURL)

   // invalid destination
   if(destination === null) {
      return console.log('Destination identifier is not valid')
   }

   const isNativeTransfer = networkData.currencySymbol === argv.symbol

   // token data
   let tokenData = null

   if(!isNativeTransfer) {
      tokenData = await getTokenBySymbol(argv.symbol)

      if(tokenData === null) {
         return console.log(chalk.yellow('Token or coin symbol is not found\nIf token, try to import it first'))
      }
   }

   // estimate gas fee & sign transaction
   let gasLimit = 0
   let gasPrice = 0
   let rawData = null
   let contractAddress = null
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
         title: 'Estimating gas fee',
         task: async (ctx, task) => {
            let data = null
            // for native transfer
            if(isNativeTransfer) {
               data = {
                  rpcURL: networkData.rpcURL,
                  type: TRANSFER_COIN
               }
            } else {
               // for token transfer

               if(tokenData === null) {
                  return console.log('')
               }

               data = {
                  rpcURL: networkData.rpcURL,
                  type: TRANSFER_TOKEN,
                  contractAddress: tokenData.contractAddress,
                  destination: destination,
                  from: account.address,
                  amount: formatAmount(argv.amount, tokenData.decimals)
               }

               // encode transfer method
               rawData = getTransferTokenData({
                  rpcURL: networkData.rpcURL,
                  contractAddress: tokenData.contractAddress,
                  destination: destination,
                  amount: formatAmount(argv.amount, tokenData.decimals)
               })

               // assign contract address
               contractAddress = tokenData.contractAddress
            }

            // get gasLimit
            gasLimit = await getEstimateGasLimit(data)
            // get gas fee
            gasPrice = await getGasPrice(networkData.rpcURL)
         }
      }
   ])

   // run tasks to check connection & estimate gas fee
   await tasks.run()

   // calculate total fee from gas price * gas limit
   // and convert to ether format
   const totalFee = fromWeiToEther(gasPrice * gasLimit).substr(0, 12)
   // sum from total fee + amount
   let total = parseFloat(totalFee) + parseFloat(argv.amount)
   total = (total < 1) ? total.toFixed(10) : total.toFixed(5)

   // show details before proceed the transaction
   console.log(chalk.white.bold(`\n  Transaction details`))
   console.log('  ==========')
   console.log(`  Amount    : ${chalk.magenta(argv.amount)} ${argv.symbol}`)
   console.log(`  Sender    : ${account.address}`)
   console.log(`  Receipt   : ${destination}`)
   console.log(`  Gas limit : ${gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ETH`)
   // if native transfer show total of total fee + amount to send
   if(isNativeTransfer)
      console.log(`  Total     : ${chalk.yellow(total)} ETH\n`)

   console.log()

   // unlock wallet to get decrypted private key
   const decryptedKey = await unlockWallet(account)

   console.log()

   let txSigned = null
   if(isNativeTransfer) {
      // sign
      txSigned = await signTransaction({
         rpcURL: networkData.rpcURL,
         destination: destination,
         from: account.address,
         value: argv.amount,
         gasLimit: gasLimit,
         gasPrice: gasPrice,
         chainId: networkData.chainId,
         privateKey: decryptedKey
      })
   } else {
      txSigned = await signTransaction({
         rpcURL: networkData.rpcURL,
         destination: contractAddress,
         from: account.address,
         value: '0',
         gasLimit: gasLimit,
         gasPrice: gasPrice,
         chainId: networkData.chainId,
         useData: true,
         data: rawData,
         privateKey: decryptedKey
      })
   }
   
   // console.log(getTxHash(txSigned.data))
   console.log('Sending transaction into blockchain')
   sendingTransaction(txSigned, networkData.rpcURL)
      .on('receipt', function(data) {
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}