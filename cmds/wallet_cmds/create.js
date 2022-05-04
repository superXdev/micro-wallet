const chalk = require('chalk')
const inquirer = require('inquirer')
const { createWallet, isWalletExists } = require('../modules/wallet')




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

  isWalletExists(argv.name).then(result => {
    if(result === true) {
      console.log(chalk.red.bold('Wallet name already exists'))
    } else {
      console.log(chalk.blue.bold('Create new wallet\n'))

      inquirer.prompt(questions).then((answers) => {
        createWallet(argv.name, answers.password).then()
      })
    }
  })

  
  
}