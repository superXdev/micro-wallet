const chalk = require('chalk')
const { Wallet } = require('../../utils/database')
const web3 = require('../../utils/web3')
const crypto = require('../../utils/crypto')
const inquirer = require('inquirer')


async function createWallet(name, password) {
  const account = web3.createAccount()
  const encryptedPrivateKey = crypto.encryptData(account.privateKey, password)

  await Wallet.create({ walletName: name, address: account.address, privateKey: encryptedPrivateKey.concatenned })

  console.log(chalk.green('Wallet created!\n'))
  console.log(`Address     : ${account.address}\nPrivate key : ${account.privateKey}\n`)
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
  },
}

exports.handler = function (argv) {
  const questions = [
   {
     type: 'password',
     name: 'password',
     message: 'Set password:',
     validate(value) {
       if (value.length >= 8) {
        return true;
       }

       return 'Password minimum length is 8 characters';
     }
  },{
     type: 'password',
     name: 'cpassword',
     message: 'Re-type password:',
     validate(value, prev) {
       if (value === prev.password) {
        return true;
       }

       return 'Password does not match';
     }
  }]

  console.log(chalk.blue.bold('Create new wallet\n'))

  inquirer.prompt(questions).then((answers) => {
    createWallet(argv.name, answers.password).then()
  })
  
}