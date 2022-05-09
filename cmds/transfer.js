const { runSetup } = require('./modules/setup')
const { rootPath } = require('../utils/path')
const fs = require('fs')
const chalk = require('chalk')

exports.command = 'transfer'
exports.desc = 'Made transaction to transfer coin or token'
exports.builder = {
   network: {
      demand: true,
      type: 'number',
      alias: 'n',
      desc: 'Network ID of blockchain'
   },
   wallet: {
      demand: true,
      alias: 'w',
      type: 'string',
      desc: 'Wallet name or identifier'
   }
}

exports.handler = function (argv) {

}