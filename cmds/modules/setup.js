const { sequelize, Network } = require('../../utils/database')


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

async function runSetup() {
	await sequelize.sync({ force: true })
	await Network.bulkCreate(networkDefaultData)
}

module.exports = {
	runSetup
}