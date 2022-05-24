const chalk = require('chalk')
const fs = require('fs')
const { verifyContract, getApiUrl } = require('../modules/sc')
const { getNetworkById } = require('../modules/network')



exports.command = 'value'
exports.desc = 'Show all value configuration'

exports.handler = async function (argv) {

}