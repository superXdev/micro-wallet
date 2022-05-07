const chalk = require('chalk')
const { getTokenBySymbol, removeToken } = require('../modules/token')
const inquirer = require('inquirer')


exports.command = 'balance'
exports.desc = 'Show all of token balance'
exports.builder = {
  network: {
    demand: true,
    type: 'number',
    alias: 'n',
    desc: 'Set network id or identifier'
  },
}

exports.handler = async function (argv) {

}