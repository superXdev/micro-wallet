const yargs = require('yargs/yargs')
const { getNetworkList, getNetworkById } = require('./modules/network')
const chalk = require('chalk')
const Web3 = require('web3')
const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en.json')
const Listr = require('listr')
const { History } = require('../utils/database')


async function getRevertReason(txHash, rpcURL){
  const web3 = new Web3(rpcURL)
  const tx = await web3.eth.getTransaction(txHash)
  try {
      var result = await web3.eth.call(tx, tx.blockNumber)
  } catch(err) {
   return err
  }
}


exports.command = 'tx <tx>'
exports.desc = 'Show transaction details'
exports.builder = (yargs) => {
   yargs.positional('tx', {
      describe: 'Tx hash, latest transaction or ID',
      type: 'string'
   })
   .option('network', {
      alias: 'n',
      type: 'string',
      desc: 'Set network id or identifier'
   })
   .example([
      ['$0 tx 0x97055fc421020dfebe2ebf734bb84cb466852f393e478dc8d886d0e64d1128fe'],
      ['$0 tx latest'],
      ['$0 tx 1']
   ])
} 


exports.handler = async function (argv) {
   let opts = {
      network: argv.network,
      hash: argv.tx
   }

   // for latest tx
   if(argv.tx === 'latest') {
      const tx = await History.findAll({ 
         limit: 1,
         order: [ ['createdAt', 'DESC'] ]
      })

      opts.network = tx[0].networkId
      opts.hash = tx[0].hash
   }

   // if with tx ID
   if(opts.network === undefined) {
      // if tx value is hash
      // show warn message 
      if(argv.tx.match(/^0x[a-fA-F0-9]{64}$/g)) {
         return console.log('Network identifier is required')
      }

      const tx = await History.findByPk(argv.tx)

      opts.network = tx.networkId
      opts.hash = tx.hash
   }

   // get network data
   const network = await getNetworkById(opts.network)
   // web3js instances
   const web3 = new Web3(network.rpcURL)

   // time-ago initialize
   TimeAgo.addDefaultLocale(en)
   const timeAgo = new TimeAgo('en-US')

   let result = null
   let txReceipt = {}
   let gasPercentUsed = 0
   let time = null
   let isFailed = false
   let totalFee = 0
   let reason = null

   await new Listr([{
      title: 'Fetching data from blockchain',
      task: async () => {
         // get transaction information
         result = await web3.eth.getTransaction(opts.hash)

         // if transaction not found
         if(result === null) {
            return console.log('The transaction is not found')
         }

         totalFee = (result.gas * result.gasPrice).toString()

         // pending transaction
         if(result.blockHash === null) {
            txReceipt.status = chalk.gray.bold('Pending')
            time = '-'
         } else {
            // success transaction
            const result2 = await web3.eth.getTransactionReceipt(opts.hash)
            const block = await web3.eth.getBlock(result.blockNumber)
            gasPercentUsed = parseFloat(result2.gasUsed / result.gas * 100).toFixed(2)
            const date = new Date(block.timestamp * 1000).toLocaleString()
            time = `${timeAgo.format(block.timestamp * 1000)} (${date})`
            isFailed = (result2.status) ? false : true
            totalFee = (result2.gasUsed * result.gasPrice).toString()
            txReceipt.status = (result2.status) ? chalk.green.bold('Success') : chalk.red.bold('Failed')
         }

         
         if(isFailed) {
            reason = await getRevertReason(opts.hash, network.rpcURL)
         }
      }
   }]).run()


   console.log(chalk.white.bold("Transaction details"))
   console.log('========')
   console.log(` Status     : ${txReceipt.status}`)
   if(isFailed) {
      console.log(` Reason     :${chalk.yellow(reason.toString().split(':').slice(2).join(':'))}`)
   }
   console.log(` Block      : ${(result.blockNumber) ? chalk.cyan(result.blockNumber) : '-'}`)
   console.log(` Timestamps : ${time}`)
   console.log(` From       : ${chalk.gray(result.from)}`)
   console.log(` To         : ${chalk.gray(result.to)}`)
   console.log(` Value      : ${chalk.yellow(web3.utils.fromWei(result.value))} ${network.currencySymbol}`)
   console.log(` Gas limit  : ${result.gas} (${chalk.magenta(gasPercentUsed+'%')} used)`)
   console.log(` Gas price  : ${chalk.gray(web3.utils.fromWei(result.gasPrice, 'gwei'))} GWEI`)
   console.log(` Total fee  : ${chalk.gray(web3.utils.fromWei(totalFee))} ${network.currencySymbol}`)
}