const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const web3 = require('../../utils/web3')

async function createWallet(name) {
  const account = web3.createAccount()
  // await Wallet.sync({ force: true })
  await Wallet.create({ walletName: name, address: account.address, privateKey: account.privateKey })

  console.log(chalk.green('Wallet created!\n'))
  console.log(`Address   : ${account.address}\nPrivate key: ${account.privateKey}\n`)
  console.log('Please backup the private key in a safe place.')
}


exports.command = 'create'
exports.desc = 'Create new wallet or account.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Set your wallet name or identifier'
  }
}

exports.handler = function (argv) {
  createWallet(argv.name).then()
}