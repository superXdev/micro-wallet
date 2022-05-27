const chalk = require('chalk')
const { getAllowance, getBalance, formatAmount } = require('./modules/token')
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
   getSwapTokenForEthData,
   getSwapTokenForTokenData
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
  const isFromToken = argv.from !== networkData.currencySymbol && argv.to === networkData.currencySymbol
  const isBetweenToken = argv.from !== networkData.currencySymbol && argv.to !== networkData.currencySymbol

  const swapType = isFromNative
    ? SWAP_ETH_FOR_TOKEN 
    : (isFromToken ? SWAP_TOKEN_FOR_ETH : SWAP_TOKEN_FOR_TOKEN)

  // return console.log(swapType)
  const value = (isFromNative) ? w3.utils.toWei(argv.amount) : '0'

  let balance = 0
  let allowance = 0
  let minOut = null
  let finalOut = 0
  let gasLimit = 0
  let gasPrice = 0
  let decryptedKey = null

  const w3 = new Web3()


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
               balance = await getNativeBalance(account.address, networkData.rpcURL)
            }
            
            if(isFromToken || isBetweenToken) {
               allowance = await getAllowance({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address,
                  spender: provider.contractAddress
               })
               balance = await getBalance({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  owner: account.address
               })
            }
         }
      },
      
   ])

   await tasks.run()

   if(isFromToken || isBetweenToken) {
      // approve first if allowance is not enough
      if(parseFloat(allowance) < parseFloat(argv.amount)) {
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
               gasPrice = await getGasPrice(networkData.rpcURL)

               await approveToken({
                  rpcURL: networkData.rpcURL,
                  contractAddress: pair[0].contractAddress,
                  spender: provider.contractAddress,
                  owner: account.address,
                  chainId: networkData.chainId,
                  gasLimit: gasLimit2,
                  gasPrice: gasPrice,
                  privateKey: decryptedKey
               })
            }
         }]).run()
      }
   }
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
         minOut = minOutProp[1]
         // calculate minimum output with slippage
         finalOut = calcFinalMinOut(minOutProp[1], pair[0].decimals, argv.slippage)

         // for estimate gas limit
         const estParam = {
            rpcURL: networkData.rpcURL,
            contractAddress: provider.contractAddress,
            type: swapType,
            value: value,
            amountOutMin: finalOut.noExponents(),
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

         gasLimit = await getEstimateGasLimit(estParam)

         // get current gas price
         gasPrice = await getGasPrice(networkData.rpcURL)
      }
   }]).run()

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

   let rawData = null
   let txSigned = null
   let txSignedParam = null

   if(isFromNative) {
      rawData = getSwapEthForTokenData({
         rpcURL: networkData.rpcURL,
         contractAddress: provider.contractAddress,
         amountOutMin: finalOut.noExponents(),
         path: path,
         to: recipient,
         from: account.address,
         deadline: deadline
      })
   }

   if(isFromToken) {
      rawData = getSwapTokenForEthData({
         rpcURL: networkData.rpcURL,
         contractAddress: provider.contractAddress,
         amountIn: BigNumber(`${argv.amount}e${pair[0].decimals}`).toString(),
         amountOutMin: finalOut.noExponents(),
         path: path,
         to: recipient,
         from: account.address,
         deadline: deadline
      })
   }

   if(isBetweenToken) {
      rawData = getSwapTokenForTokenData({
         rpcURL: networkData.rpcURL,
         contractAddress: provider.contractAddress,
         amountIn: BigNumber(`${argv.amount}e${pair[0].decimals}`).toString(),
         amountOutMin: finalOut.noExponents(),
         path: path,
         to: recipient,
         from: account.address,
         deadline: deadline
      })
   }



   
   txSignedParam = {
      rpcURL: networkData.rpcURL,
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

   
   

   txSigned = await signTransaction(txSignedParam)
   
   // do swap transaction
   console.log('Sending transaction into blockchain')
   sendingTransaction(txSigned, networkData.rpcURL)
      .on('receipt', function(data) {
         console.log(`Hash     : ${chalk.cyan(data.transactionHash)}`)
         console.log(`Explorer : ${networkData.explorerURL}/tx/${data.transactionHash}`)
      })
}