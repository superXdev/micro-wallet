const chalk = require('chalk')
const fs = require('fs')
const config = require('../../config.json')
const { rootPath } = require('../../utils/path')



exports.command = 'remove <attribute>'
exports.desc = 'Remove value of configuration'
exports.builder = (yargs) => {
   yargs.positional('attribute', {
      type: 'string'
   })
}


exports.handler = async function (argv) {
   if(config[argv.attribute] === undefined) {
      return console.log('Attribute are not valid')
   }

   config[argv.attribute] = ''

   // write with new content
   fs.writeFile(`${rootPath()}/config.json`, JSON.stringify(config, null, 3), { flag: 'w' }, err => {
      if(err) {
         console.log(`Error with message: ${chalk.red.bold(err)}`)
      } else {
         console.log(chalk.green('Configuration has been updated'))
      }
   })
}