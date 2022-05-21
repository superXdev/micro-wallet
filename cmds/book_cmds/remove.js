const chalk = require('chalk')
const { importToken } = require('../modules/token')
const { getConnectionStatus, getNetworkById } = require('../modules/network')
const web3 = require('../../utils/web3')
const inquirer = require('inquirer')
const Listr = require('listr')


exports.command = 'remove'
exports.desc = 'Remove an address from book'
exports.builder = {
  address: {
    demand: true,
    type: 'string',
    alias: 'a',
    desc: 'An wallet address'
  },
  name: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Name or identifier'
  },
}

exports.handler = async function (argv) {

}