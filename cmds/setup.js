const { sequelize, Network } = require('../utils/database')
const { rootPath } = require('../utils/path')
const fs = require('fs')
const chalk = require('chalk')


const networkDefaultData = [
   {
      networkName: "Ethereum",
      rpcURL: "https://mainnet.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://etherscan.io"
   },
   {
      networkName: "Ropsten Test Network",
      rpcURL: "https://ropsten.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://ropsten.etherscan.io"
   },
   {
      networkName: "Rinkeby Test Network",
      rpcURL: "https://rinkeby.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://rinkeby.etherscan.io"
   }
]


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
      sequelize.sync({ force: true }).then(() => {
         Network.bulkCreate(networkDefaultData).then(() => {
            console.log(chalk.yellow.bold("Everything is ready!"))
         })
         
      })
   } else {
      console.log("Already setting up")
   }


}