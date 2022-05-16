const yargs = require('yargs/yargs')
const inquirer = require('inquirer')
const validator = require('validator')
const Listr = require('listr')
const { getWalletByName } = require('./modules/wallet')
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
      desc: 'Address or name of receipt'
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
   // get destination
   let destination = argv.destination

   if(validator.isAlphanumeric(argv.destination)) {
      destination = await getWalletByName(argv.destination)
   }

   // get network data
   const networkData = await getNetworkById(argv.network)

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
            const status = await getConnectionStatus(networkData.rpc)

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
            if(networkData.currencySymbol === argv.symbol) {
               data = {
                  rpcURL: networkData.rpc,
                  type: TRANSFER_COIN
               }
            } else {
               // for token transfer
               // get token data first
               const tokenData = await getTokenBySymbol(argv.symbol)
               data = {
                  rpcURL: networkData.rpc,
                  type: TRANSFER_TOKEN,
                  contractAddress: tokenData.contractAddress,
                  destination: destination.address,
                  from: account.address,
                  amount: formatAmount(argv.amount, tokenData.decimals)
               }

               // encode transfer method
               rawData = getTransferTokenData({
                  rpcURL: networkData.rpc,
                  contractAddress: tokenData.contractAddress,
                  destination: destination.address,
                  amount: formatAmount(argv.amount, tokenData.decimals)
               })

               // assign contract address
               contractAddress = tokenData.contractAddress
            }

            // get gasLimit
            gasLimit = await getEstimateGasLimit(data)
            // get gas fee
            gasPrice = await getGasPrice(networkData.rpc)
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
   console.log(`  Receipt   : ${destination.address}`)
   console.log(`  Gas limit : ${gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ETH`)
   // if native transfer show total of total fee + amount to send
   if(networkData.currencySymbol === argv.symbol)
      console.log(`  Total     : ${chalk.yellow(total)} ETH\n`)

   console.log()

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

   console.log()

   let txSigned = null
   if(networkData.currencySymbol === argv.symbol) {
      // sign
      txSigned = await signTransaction({
         rpcURL: networkData.rpc,
         destination: destination.address,
         from: account.address,
         value: argv.amount,
         gasLimit: gasLimit,
         gasPrice: gasPrice,
         chainId: networkData.chainId,
         privateKey: decryptedKey
      })
   } else {
      txSigned = await signTransaction({
         rpcURL: networkData.rpc,
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
   sendingTransaction(txSigned, networkData.rpc)
      .on('receipt', function(data) {
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}