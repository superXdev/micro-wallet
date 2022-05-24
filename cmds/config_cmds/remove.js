const chalk = require('chalk')
const fs = require('fs')
const { verifyContract, getApiUrl } = require('../modules/sc')
const { getNetworkById } = require('../modules/network')



exports.command = 'remove <attribute>'
exports.desc = 'Remove value of configuration'
exports.builder = (yargs) => {
   yargs.positional('attribute', {
      type: 'string'
   })
}


exports.handler = async function (argv) {

}