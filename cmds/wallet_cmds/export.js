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
    desc: 'Export encrypted wallet to json file'
  },
}

exports.handler = async function (argv) {
   // if export wallet to JSON fiile
   if(argv.json) {
      const jsonExported = await exportWalletJson(argv.name)

      if(jsonExported.success) {
         return console.log(chalk.green('Successfully exported wallet to JSON file'))
      } else {
         return console.log(jsonExported.message)
      }
   }

   // export wallet to private key
   console.log(chalk.blue.bold('Export your wallet\n'))

   // ask user to enter password
   const answers = await inquirer.prompt({
      type: 'password',
      name: 'password',
      message: "Enter password:",
   })

   // get wallet data
   const exported = await exportWallet(argv.name, answers.password)

   if(!exported.success) {
      return console.log(exported.message)
   }

   // append 0x at start to private key
   exported.privateKey = ((exported.privateKey.slice(0,2) == "0x") 
      ? exported.privateKey 
      : "0x" + exported.privateKey)

   // show the private key
   console.log(`\nYour private key: ${chalk.white.bold(exported.privateKey)}`)
}