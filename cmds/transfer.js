const yargs = require('yargs/yargs')
const inquirer = require('inquirer')
const validator = require('validator')
const Listr = require('listr')
const { getWalletByName, getDestinationAddress, unlockWallet } = require('./modules/wallet')
const { 
	getToken, 
	formatAmount, 
	formatMoney,
	getBalance,
	formatAmountNormal
} = require('./modules/token')
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
   getTxHash,
   fromEtherToWei,
	getNativeBalance
} = require('../utils/web3')
const { History } = require('../utils/database')


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
   .example([
      ['$0 transfer ETH -d 0x0000.. -a 0.1 -w myWallet -n 1'],
      ['$0 transfer UNI -d vitalik.eth -a 10 -w myWallet -n 1']
   ])
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
      tokenData = await getToken(argv.symbol, networkData.id)

      if(tokenData === null) {
         return console.log(chalk.yellow('Token or coin symbol is not found\nIf token, try to import it first'))
      }
   }

   // estimate gas fee & sign transaction
   let gasLimit = 0
   let gasPrice = 0
	let balance = 0
   let rawData = null
   let contractAddress = null
   const tasks = new Listr([
      {
         title: 'Checking balance...',
         task: async (ctx, task) => {
				// get balance

				if(isNativeTransfer) {
					balance = await getNativeBalance(account.address, networkData.rpcURL)
				} else {
					balance = await getBalance({
						rpcURL: networkData.rpcURL,
						contractAddress: tokenData.contractAddress,
						owner: account.address
					})
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
	// convert balance format
	balance = (isNativeTransfer) ? fromWeiToEther(balance) : formatAmountNormal(balance, tokenData.decimals)

   // show details before proceed the transaction
   console.log(chalk.white.bold(`\n  Transaction details`))
   console.log('  ==========')
   console.log(`  Amount    : ${chalk.magenta(formatMoney(argv.amount))} ${argv.symbol}`)
   console.log(`  Available : ${chalk.yellow(balance)} ${argv.symbol} `)
   console.log(`  Sender    : ${account.address}`)
   console.log(`  Receipt   : ${destination}`)
   console.log(`  Gas limit : ${gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ${networkData.currencySymbol}`)
   // if native transfer show total of total fee + amount to send
   if(isNativeTransfer)
      console.log(`  Total     : ${chalk.yellow(total)} ${networkData.currencySymbol}\n`)

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
         value: fromEtherToWei(argv.amount),
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
         // insert to history transaction
         History.create({
            type: 'TRANSFER',
            wallet: account.name,
            hash: data.transactionHash,
            networkId: networkData.id
         })

         // show tx hash
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}
