const chalk = require('chalk')
const { removeNetwork } = require('../modules/network')
const inquirer = require('inquirer')


exports.command = 'import'
exports.desc = 'Import new token'
exports.builder = {
  address: {
    demand: true,
    type: 'string',
    alias: 'a',
    desc: 'Contract address of token'
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