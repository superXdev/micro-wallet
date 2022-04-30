const { sequelize } = require('../utils/database')
const fs = require('fs')

exports.command = 'setup'
exports.desc = 'initialize all configuration'

exports.handler = function (argv) {
   if(!fs.existsSync('./user.db')) {
      sequelize.sync({ force: true }).then(() => console.log("DB created"))
   }

}