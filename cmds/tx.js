const yargs = require('yargs/yargs')
const { getNetworkList, getNetworkById } = require('./modules/network')
const chalk = require('chalk')
const Web3 = require('web3')



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

   const result = await web3.eth.getTransaction(argv.hash)
   const result2 = await web3.eth.getTransactionReceipt(argv.hash)
   const block = await web3.eth.getBlock(result.blockNumber)

   console.log(chalk.white.bold("Transaction details"))
   console.log('========')
   console.log(` Status     : ${(result2.status) ? chalk.green.bold('Success') : chalk.red.bold('Failed')}`)
   console.log(` Block      : ${chalk.cyan(result.blockNumber)}`)
   console.log(` Timestamps : ${Date(block.timestamps)}`)
   console.log(` From       : ${result.from}`)
   console.log(` To         : ${result.to}`)
   console.log(` Value      : ${chalk.yellow(web3.utils.fromWei(result.value))} ${network.currencySymbol}`)
   console.log(` Gas limit  : ${chalk.gray(result.gas)}`)
   console.log(` Gas price  : ${chalk.gray(web3.utils.fromWei(result.gasPrice, 'gwei'))} GWEI`)
}