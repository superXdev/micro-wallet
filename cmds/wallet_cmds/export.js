const chalk = require('chalk')
const { exportWallet, exportWalletJson } = require('../modules/wallet')
const inquirer = require('inquirer')


exports.command = 'export'
exports.desc = 'Export wallet to private key.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Set your wallet name or identifier'
  },
  json: {
    type: 'boolean',
    desc: 'Export decrypted wallet to json file'
  },
}

exports.handler = async function (argv) {

   if(argv.json) {
      const jsonExported = await exportWalletJson(argv.name)

      if(jsonExported.success) {
         return console.log(chalk.green('Successfully exported wallet to JSON file'))
      } else {
         return console.log(jsonExported.message)
      }
   }

   console.log(chalk.blue.bold('Export your wallet\n'))

   const questions = [
     {
       type: 'password',
       name: 'password',
       message: "Enter password:",
    }
   ]

   inquirer.prompt(questions).then((answers) => {
      exportWallet(argv.name, answers.password).then((exported) => {
         if(exported === null) {
            return console.log(chalk.white.bold.bgYellow('\nInvalid wallet!'))
         }

         if(exported.privateKey == '') {
            console.log(chalk.white.bold.bgRed('\nPassword is wrong!'))
         } else {
            exported.privateKey = ((exported.privateKey.slice(0,2) == "0x") ? exported.privateKey : "0x" + exported.privateKey)
            console.log(`\nYour private key: ${chalk.white.bold(exported.privateKey)}`)
         }
         
      })
      
   })
}