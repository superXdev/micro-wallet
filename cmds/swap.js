const chalk = require('chalk')
const { getAllowance, getBalance } = require('./modules/token')
const { getNetworkById, getConnectionStatus } = require('./modules/network')
const { isWalletExists, getWalletByName } = require('./modules/wallet')
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
   getSwapEthForTokenData,
   signTransaction,
   sendingTransaction,
   fromWeiToGwei,
   getSwapTokenForEthData
} = require('../utils/web3')
const crypto = require('../utils/crypto')
const BigNumber = require('bignumber.js')
const inquirer = require('inquirer')
const Listr = require('listr')
const { 
   SWAP_ETH_FOR_TOKEN, 
   APPROVE_TOKEN,
   SWAP_TOKEN_FOR_ETH,
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
  const recipient = (argv.receipt) ? argv.receipt : account.address
  const deadline = (parseInt(Date.now() / 1000) + argv.deadline * 60).toString()

  // swap type
  const isFromNative = argv.from === networkData.currencySymbol
  const isFromToken = argv.from !== networkData.currencySymbol
  const isBetweenToken = isFromToken && argv.to !== networkData.currencySymbol

  let balance = 0
  let allowance = 0
  let minOut = null
  let finalOut = 0
  let gasLimit = 0
  let gasPrice = 0

  const w3 = new Web3()
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
         title: 'Checking balance & allowance',
         task: async (ctx, task) => {
            if(isFromNative) {
               balance = await getNativeBalance(account.address, networkData.rpc)
            }
            
            if(isFromToken) {
               allowance = await getAllowance({
                  rpcURL: networkData.rpc,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address,
                  spender: provider.contractAddress
               })
               balance = await getBalance({
                  rpcURL: networkData.rpc,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address
               })
            }
         }
      },
      {
         title: 'Estimating gas fee & output amount',
         task: async (ctx, task) => {
            const inAmount = (argv.from == networkData.currencySymbol)
               ? fromEtherToWei(argv.amount)
               : BigNumber(`${argv.amount}e${pair[0].decimals}`).toString()

            const minOutProp = await getMinOut({
               rpcURL: networkData.rpc,
               contractAddress: provider.contractAddress,
               amount: inAmount,
               decimals: pair[0].decimals,
               path: path
            })

            // store to minimum output for estimate
            minOut = minOutProp[1]
            // calculate minimum output with slippage
            finalOut = calcFinalMinOut(minOutProp[1], argv.slippage)

            // for estimate gas limit
            if(isFromNative) {
               gasLimit = await getEstimateGasLimit({
                  rpcURL: networkData.rpc,
                  contractAddress: provider.contractAddress,
                  type: SWAP_ETH_FOR_TOKEN,
                  value: w3.utils.toWei(argv.amount),
                  amountOutMin: finalOut.toString(),
                  path: path,
                  to: recipient,
                  from: account.address,
                  deadline: deadline
               })
            }

            if(isFromToken) {
               gasLimit = await getEstimateGasLimit({
                  rpcURL: networkData.rpc,
                  contractAddress: provider.contractAddress,
                  type: SWAP_TOKEN_FOR_ETH,
                  value: '0',
                  amountIn: BigNumber(`${argv.amount}e${pair[0].decimals}`).toString(),
                  amountOutMin: finalOut.toString(),
                  path: path,
                  to: recipient,
                  from: account.address,
                  deadline: deadline
               })
            }

            // get current gas price
            gasPrice = await getGasPrice(networkData.rpc)
         }
      }
   ])

   await tasks.run()

   const balanceRounded = (isFromNative) 
      ? balance
      : BigNumber(`${balance}e-${pair[0].decimals}`).toString()


   if(parseFloat(argv.amount) > parseFloat(balanceRounded)) {
      return console.log(chalk.yellow.bold('\nYour balance is not enough'))
   }


   // calculate total fee from gas price * gas limit
   // and convert to ether format
   const totalFee = fromWeiToEther(gasPrice * gasLimit).substr(0, 12)
   // sum from total fee + amount
   let total = parseFloat(totalFee) + parseFloat(argv.amount)
   total = (total < 1) ? total.toFixed(10) : total.toFixed(5)

   // show details before proceed the transaction
   console.log(chalk.white.bold(`\n  Transaction details`))
   console.log('  ==========')
   console.log(`  From      : ${chalk.yellow(argv.amount)} ${argv.from}`)
   console.log(`  To (est)  : ${chalk.yellow(BigNumber(`${minOut}e-${pair[1].decimals}`))} ${argv.to}`)
   console.log(`  Available : ${chalk.green(balanceRounded)} ${argv.from}`)
   console.log(`  Recipient : ${recipient}`)
   console.log(`  Gas limit : ${gasLimit}`)
   console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
   console.log(`  Total fee : ${chalk.gray(totalFee)} ${networkData.currencySymbol}`)
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

   let rawData = null
   let txSigned = null
   let txSignedParam = null

   if(isFromNative) {
      rawData = getSwapEthForTokenData({
         rpcURL: networkData.rpc,
         contractAddress: provider.contractAddress,
         amountOutMin: finalOut.toString(),
         path: path,
         to: recipient,
         from: account.address,
         deadline: deadline
      })
   }

   if(isFromToken) {
      rawData = getSwapTokenForEthData({
         rpcURL: networkData.rpc,
         contractAddress: provider.contractAddress,
         amountIn: BigNumber(`${argv.amount}e${pair[0].decimals}`).toString(),
         amountOutMin: finalOut.toString(),
         path: path,
         to: recipient,
         from: account.address,
         deadline: deadline
      })
   }



   const value = (isFromNative) ? argv.amount : '0'
   
   txSignedParam = {
      rpcURL: networkData.rpc,
      destination: provider.contractAddress,
      from: account.address,
      value: value,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      chainId: networkData.chainId,
      useData: true,
      data: rawData,
      privateKey: decryptedKey
   }

   
   if(isFromToken) {
      // approve first if allowance is not enough
      if(allowance < parseFloat(argv.amount)) {
         console.log(chalk.yellow('Approving token for the first time..'))

         const gasLimit2 = await getEstimateGasLimit({
            rpcURL: networkData.rpc,
            contractAddress: pair[0].contractAddress,
            type: APPROVE_TOKEN,
            spender: provider.contractAddress,
            amount: AMOUNT_ALLOWANCE,
            from: account.address
         })

         await approveToken({
            rpcURL: networkData.rpc,
            contractAddress: pair[0].contractAddress,
            spender: provider.contractAddress,
            owner: account.address,
            chainId: networkData.chainId,
            gasLimit: gasLimit2,
            gasPrice: gasPrice,
            privateKey: decryptedKey
         })

         txSignedParam.incNonce = true
      }
   }

   txSigned = await signTransaction(txSignedParam)
   
   // do swap transaction
   console.log('Sending transaction into blockchain')
   sendingTransaction(txSigned, networkData.rpc)
      .on('receipt', function(data) {
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}