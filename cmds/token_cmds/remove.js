const chalk = require('chalk')
const { removeNetwork } = require('../modules/network')
const inquirer = require('inquirer')


exports.command = 'remove'
exports.desc = 'Remove permanently a token'
exports.builder = {
  symbol: {
    demand: true,
    type: 'string',
    alias: 's',
    desc: 'Symbol of the token'
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