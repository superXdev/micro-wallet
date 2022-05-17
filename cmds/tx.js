const yargs = require('yargs/yargs')
const { getNetworkList, getNetworkById } = require('./modules/network')
const chalk = require('chalk')
const Web3 = require('web3')
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en.json')

async function getRevertReason(txHash, rpcURL){
  const web3 = new Web3(rpcURL)
  const tx = await web3.eth.getTransaction(txHash)
  try {
      var result = await web3.eth.call(tx, tx.blockNumber)
  } catch(err) {
   return err
  }
}


exports.command = 'tx <hash>'
exports.desc = 'Show transaction details by tx hash'
exports.builder = (yargs) => {
   yargs.positional('hash', {
      describe: '64 characters length & random HEX',
      type: 'string'
   })
   .option('network', {
      demand: true,
      alias: 'n',
      type: 'string',
      desc: 'Set network id or identifier'
   })
} 


exports.handler = async function (argv) {
   const network = await getNetworkById(argv.network)

   const web3 = new Web3(network.rpc)

   // time-ago initialize
   TimeAgo.addDefaultLocale(en)
   const timeAgo = new TimeAgo('en-US')

   const result = await web3.eth.getTransaction(argv.hash)
   const result2 = await web3.eth.getTransactionReceipt(argv.hash)
   const block = await web3.eth.getBlock(result.blockNumber)
   const gasPercentUsed = parseFloat(result2.gasUsed / result.gas * 100).toFixed(2)
   const date = new Date(block.timestamp * 1000).toLocaleString()

   let reason
   if(!result2.status) {
      reason = await getRevertReason(argv.hash, network.rpc)
   }

   console.log(chalk.white.bold("Transaction details"))
   console.log('========')
   console.log(` Status     : ${(result2.status) ? chalk.green.bold('Success') : chalk.red.bold('Failed')}`)
   if(!result2.status) {
      console.log(` Reason     :${chalk.yellow(reason.toString().split(':').slice(2).join(':'))}`)
   }
   console.log(` Block      : ${chalk.cyan(result.blockNumber)}`)
   console.log(` Timestamps : ${timeAgo.format(block.timestamp * 1000)} (${date})`)
   console.log(` From       : ${chalk.gray(result.from)}`)
   console.log(` To         : ${chalk.gray(result.to)}`)
   console.log(` Value      : ${chalk.yellow(web3.utils.fromWei(result.value))} ${network.currencySymbol}`)
   console.log(` Gas limit  : ${result.gas} (${chalk.magenta(gasPercentUsed+'%')} used)`)
   console.log(` Gas price  : ${chalk.gray(web3.utils.fromWei(result.gasPrice, 'gwei'))} GWEI`)
}