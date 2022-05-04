const { sequelize } = require('../utils/database')
const { rootPath } = require('../utils/path')
const fs = require('fs')
const chalk = require('chalk')

exports.command = 'setup'
exports.desc = 'initialize all configuration'
exports.builder = {
   reset: {
      type: 'boolean',
      alias: 'r',
      desc: 'Hard reset all configuration'
  },
}

exports.handler = function (argv) {
   if(argv.reset || !fs.existsSync(`${rootPath()}/user.db`)) {
      sequelize.sync({ force: true }).then(() => console.log(chalk.yellow.bold("Everything is ready!")))
   } else {
      console.log("Already setting up")
   }

   

}