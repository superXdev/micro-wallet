const chalk = require('chalk')
const { getAllowance, getBalance, formatAmount } = require('./modules/token')
const { getNetworkById, getConnectionStatus } = require('./modules/network')
const { getDestinationAddress, getWalletByName, unlockWallet } = require('./modules/wallet')
const { 
  getMinOut, 
  getProviderByNetwork,
  getPairBySymbol,
  calcFinalMinOut,
  getAmountsIn,
  approveToken
} = require('./modules/swap')
const { 
   getNativeBalance,
   fromWeiToEther,
   getEstimateGasLimit,
   getGasPrice,
   fromEtherToWei,
   signTransaction,
   sendingTransaction,
   fromWeiToGwei,
   getRawData
} = require('../utils/web3')
const crypto = require('../utils/crypto')
const BigNumber = require('bignumber.js')
const inquirer = require('inquirer')
const Listr = require('listr')
const { 
   SWAP_ETH_FOR_TOKEN, 
   APPROVE_TOKEN,
   SWAP_TOKEN_FOR_ETH,
   SWAP_TOKEN_FOR_TOKEN,
   AMOUNT_ALLOWANCE
} = require('../utils/constants')
const Web3 = require('web3')



exports.command = 'swap <from> <to>'
exports.desc = 'Swap token or coin instantly.'
exports.builder = (yargs) => {
   yargs.positional('from', {
      describe: 'Symbol of target coin or token',
      type: 'string'
   })
   yargs.positional('to', {
      describe: 'Symbol of output coin or token',
      type: 'string'
   })
   .option('amount', {
      demand: true,
      alias: 'a',
      type: 'string',
      desc: 'Amount of target coin to swap'
   })
   .option('slippage', {
      default: 0.5,
      alias: 's',
      type: 'number',
      desc: 'Number percent for slippage'
   })
   .option('wallet', {
      demand: true,
      alias: 'w',
      type: 'string',
      desc: 'Wallet name or identifier'
   })
   .option('receipt', {
      alias: 'r',
      type: 'string',
      desc: 'Set for different recipient'
   })
   .option('deadline', {
      default: 30,
      alias: 'd',
      type: 'number',
      desc: 'Time limit until reverted (in minutes)'
   })
   .option('network', {
      demand: true,
      alias: 'n',
      type: 'string',
      desc: 'Set network id or identifier'
   })
} 

exports.handler = async function (argv) {
   // get account first
   const account = await getWalletByName(argv.wallet)
   const networkData = await getNetworkById(argv.network)

   // swap provider & path direction
   const provider = await getProviderByNetwork(argv.network)
   const pair = await getPairBySymbol({ a: argv.from, b: argv.to })
   const path = [pair[0].contractAddress, pair[1].contractAddress]

   // setting
   const recipient = (argv.receipt) ? await getDestinationAddress(argv.receipt) : account.address

   // check if recipient is valid
   if(recipient === null) {
      return console.log('Recipient identifier is not valid')
   }

   const deadline = (parseInt(Date.now() / 1000) + argv.deadline * 60).toString()

   // swap type
   const isFromNative = argv.from === networkData.currencySymbol
   const isFromToken = argv.from !== networkData.currencySymbol && argv.to === networkData.currencySymbol
   const isBetweenToken = argv.from !== networkData.currencySymbol && argv.to !== networkData.currencySymbol

   const swapType = isFromNative
    ? SWAP_ETH_FOR_TOKEN 
    : (isFromToken ? SWAP_TOKEN_FOR_ETH : SWAP_TOKEN_FOR_TOKEN)

   // return console.log(swapType)
   const value = (isFromNative) ? fromEtherToWei(argv.amount) : '0'

   // transaction input
   let inputTransaction = {}

   // decrypted private key
   let decryptedKey = null

   // tasks to checking connection & balance
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
         title: 'Checking balance & allowance',
         task: async (ctx, task) => {
            if(isFromNative) {
               inputTransaction.balance = await getNativeBalance(account.address, networkData.rpcURL)
            }
            
            if(isFromToken || isBetweenToken) {
               inputTransaction.allowance = await getAllowance({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address,
                  spender: provider.contractAddress
               })
               inputTransaction.balance = await getBalance({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address
               })
            }
         }
      },
      
   ])

   await tasks.run()

   // run approve token if first time
   if(isFromToken || isBetweenToken) {
      // approve first if allowance is not enough
      if(parseFloat(inputTransaction.allowance) < parseFloat(formatAmount(argv.amount, pair[0].decimals))) {
         console.log(chalk.white.bgBlue('\nNeed to approve token'))
         decryptedKey = await unlockWallet(account)

         await new Listr([{
            title: 'Approving token for the first time.',
            task: async () => {
               const gasLimit2 = await getEstimateGasLimit({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  type: APPROVE_TOKEN,
                  spender: provider.contractAddress,
                  amount: AMOUNT_ALLOWANCE,
                  from: account.address
               })

               // get current gas price
               inputTransaction.gasPrice = await getGasPrice(networkData.rpcURL)

               await approveToken({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  spender: provider.contractAddress,
                  owner: account.address,
                  chainId: networkData.chainId,
                  gasLimit: gasLimit2,
                  gasPrice: inputTransaction.gasPrice,
                  privateKey: decryptedKey
               })
            }
         }]).run()
      }
   }

   // run tasks for estimating gas fee & min output
   await new Listr([{
      title: 'Estimating gas fee & output amount',
      task: async (ctx, task) => {
         const inAmount = (isFromNative)
            ? fromEtherToWei(argv.amount)
            : formatAmount(argv.amount, pair[0].decimals)

         const minOutProp = await getMinOut({
            rpcURL: networkData.rpcURL,
            contractAddress: provider.contractAddress,
            amount: inAmount,
            path: path
         })

         // store to minimum output for estimate
         inputTransaction.minOut = minOutProp[1]
         // calculate minimum output with slippage
         inputTransaction.finalOut = calcFinalMinOut(minOutProp[1], pair[0].decimals, argv.slippage)

         // for estimate gas limit
         const estParam = {
            rpcURL: networkData.rpcURL,
            contractAddress: provider.contractAddress,
            type: swapType,
            value: value,
            amountOutMin: inputTransaction.finalOut,
            path: path,
            to: recipient,
            from: account.address,
            deadline: deadline
         }

         if(swapType === SWAP_TOKEN_FOR_ETH || swapType === SWAP_TOKEN_FOR_TOKEN) {
            estParam.amountIn = inAmount
         }

         // temp = estParam
         // return

         inputTransaction.gasLimit = await getEstimateGasLimit(estParam)

         // get current gas price
         inputTransaction.gasPrice = await getGasPrice(networkData.rpcURL)
      }
   }]).run()

   const balanceRounded = (isFromNative) 
      ? inputTransaction.balance
      : BigNumber(`${inputTransaction.balance}e-${pair[0].decimals}`)


   if(parseFloat(argv.amount) > parseFloat(balanceRounded)) {
      return console.log(chalk.yellow.bold('\nYour balance is not enough'))
   }


   // calculate total fee from gas price * gas limit
   // and convert to ether format
   const totalFee = fromWeiToEther(inputTransaction.gasPrice * inputTransaction.gasLimit).substr(0, 12)
   // sum from total fee + amount
   let total = parseFloat(totalFee) + parseFloat(argv.amount)
   total = (total < 1) ? total.toFixed(10) : total.toFixed(5)

   // show details before proceed the transaction
   console.log(chalk.white.bold(`\n  Transaction details`))
   console.log('  ==========')
   console.log(`  Provider  : ${chalk.cyan(provider.providerName)}`)
   console.log(`  From      : ${chalk.yellow(argv.amount)} ${argv.from}`)
   console.log(`  To (est)  : ${chalk.yellow(BigNumber(`${inputTransaction.minOut}e-${pair[1].decimals}`))} ${argv.to}`)
   console.log(`  Available : ${chalk.green(balanceRounded)} ${argv.from}`)
   console.log(`  Recipient : ${recipient}`)
   console.log(`  Gas limit : ${inputTransaction.gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(inputTransaction.gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ${networkData.currencySymbol}`)
   console.log()

   // ask password to unlock wallet
   if(decryptedKey === null) {
      decryptedKey = await unlockWallet(account)
   } else {
      const answers = await inquirer.prompt({
         type: 'confirm',
         name: 'toConfirmed',
         message: 'Proceed this transaction?:'
      })

      if(!answers.toConfirmed) {
         return console.log('Operation cancelled by user')
      }
   }

   console.log()


   let paramRawData = {
      type: swapType,
      rpcURL: networkData.rpcURL,
      contractAddress: provider.contractAddress,
      amountOutMin: inputTransaction.finalOut,
      path: path,
      to: recipient,
      from: account.address,
      deadline: deadline
   }

   if(isFromToken || isBetweenToken) {
      paramRawData.amountIn = BigNumber(`${argv.amount}e${pair[0].decimals}`).toString()
   } 

   const rawData = getRawData(paramRawData)

   // sign transaction
   const txSigned = await signTransaction({
      rpcURL: networkData.rpcURL,
      destination: provider.contractAddress,
      from: account.address,
      value: value,
      gasLimit: inputTransaction.gasLimit,
      gasPrice: inputTransaction.gasPrice,
      chainId: networkData.chainId,
      useData: true,
      data: rawData,
      privateKey: decryptedKey
   })
   
   // do swap transaction
   console.log('Sending transaction into blockchain')
   sendingTransaction(txSigned, networkData.rpcURL)
      .on('receipt', function(data) {
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}