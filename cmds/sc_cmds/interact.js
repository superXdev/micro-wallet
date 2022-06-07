const yargs = require('yargs/yargs')
const { getNetworkList, getNetworkById } = require('../modules/network')
const chalk = require('chalk')
const Listr = require('listr')


exports.command = 'interact'
exports.desc = 'Interaction with a smart contract'
exports.builder = {
   address: {
      demand: true,
      type: 'string',
      alias: 'a',
      desc: 'Contract address'
   },
  wallet: {
    demand: true,
    type: 'string',
    alias: 'w',
    desc: 'Wallet ID or identifier'
  },
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
}


exports.handler = async function (argv) {

}