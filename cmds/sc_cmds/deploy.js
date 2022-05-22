const chalk = require('chalk')


exports.command = 'deploy'
exports.desc = 'Deploy a smart contract'
exports.builder = {
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