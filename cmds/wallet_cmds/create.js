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

exports.handler = async function (argv) {
   // check walle name
   const walletExists = await isWalletExists(argv.name)

   // return warning when wallet name already exists
   if(walletExists) {
      return console.log(`Wallet name already exists`)
   }

   console.log(chalk.blue.bold('Create new wallet\n'))

   // password questions
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
   // ask user to set password
   const answers = await inquirer.prompt(questions)

   // create wallet & insert into database
   const account = await createWallet(argv.name, answers.password)
   
   // show result
   console.log(chalk.green('\nWallet created!\n'))
   console.log(`Address     : ${account.address}\nPrivate key : ${account.privateKey}\n`)
   console.log('Please backup the private key in a safe place.')
  
}