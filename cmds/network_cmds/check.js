const { getConnectionStatus } = require('../modules/network')
const { Network } = require('../../utils/database')
const chalk = require('chalk')


exports.command = 'check'
exports.desc = 'Check status connection of network'
exports.builder = {
   network: {
      demand: true,
      type: 'number',
      alias: 'n',
      desc: 'The ID of network'
   },
}

exports.handler = async function (argv) {
   const networkData = await Network.findOne({ where: { id: argv.n } })
   const status = await getConnectionStatus(networkData.rpcURL)

   // console.log(status)

   console.log(`Network : ${networkData.networkName}`)
   console.log(`Status  : ${(typeof status === 'number') ? chalk.green.bold('OK') : chalk.red.bold('BAD')}`)
}