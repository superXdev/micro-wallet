const { sequelize, Network } = require('../../utils/database')


const networkDefaultData = [
   // mainnet network
   {
      networkName: "Ethereum",
      rpcURL: "https://mainnet.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://etherscan.io"
   },
   {
      networkName: "Polygon Mainnet",
      rpcURL: "https://polygon-rpc.com/",
      currencySymbol: "MATIC",
      explorerURL: "https://polygonscan.com"
   },
   {
      networkName: "Avalanche C-Chain",
      rpcURL: "https://api.avax.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://snowtrace.io"
   },
   {
      networkName: "Binance Smart Chain",
      rpcURL: "https://bsc-dataseed1.binance.org",
      currencySymbol: "BNB",
      explorerURL: "https://bscscan.com"
   },
   {
      networkName: "Fantom Opera",
      rpcURL: "https://rpc.ftm.tools/",
      currencySymbol: "FTM",
      explorerURL: "https://ftmscan.com/"
   },
   // testnet network
   {
      networkName: "Polygon Testnet Mumbai",
      rpcURL: "https://matic-mumbai.chainstacklabs.com",
      currencySymbol: "MATIC",
      explorerURL: "https://mumbai.polygonscan.com"
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
   },
   {
      networkName: "Avalanche Fuji Testnet",
      rpcURL: "https://api.avax-test.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://testnet.snowtrace.io"
   },
   {
      networkName: "Binance Smart Chain Testnet",
      rpcURL: "https://data-seed-prebsc-1-s1.binance.org:8545",
      currencySymbol: "BNB",
      explorerURL: "https://testnet.bscscan.com"
   },
   {
      networkName: "Fantom testnet",
      rpcURL: "https://rpc.testnet.fantom.network/",
      currencySymbol: "FTM",
      explorerURL: "https://testnet.ftmscan.com"
   },
   {
      networkName: "Localhost 8545",
      rpcURL: "http://localhost:8545",
      currencySymbol: "ETH"
   },
]

async function runSetup() {
	await sequelize.sync({ force: true })
	await Network.bulkCreate(networkDefaultData)
}

module.exports = {
	runSetup
}