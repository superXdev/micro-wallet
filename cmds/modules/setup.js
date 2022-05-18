const { sequelize, Network, Provider, Pair } = require('../../utils/database')


const networkDefaultData = [
   // mainnet network
   {
      networkName: "Ethereum",
      rpcURL: "https://mainnet.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://etherscan.io",
      chainId: 1,
      isTestnet: false
   },
   {
      networkName: "Polygon Mainnet",
      rpcURL: "https://polygon-rpc.com/",
      currencySymbol: "MATIC",
      explorerURL: "https://polygonscan.com",
      chainId: 137,
      isTestnet: false
   },
   {
      networkName: "Avalanche C-Chain",
      rpcURL: "https://api.avax.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://snowtrace.io",
      chainId: 43114,
      isTestnet: false
   },
   {
      networkName: "Binance Smart Chain",
      rpcURL: "https://bsc-dataseed1.binance.org",
      currencySymbol: "BNB",
      explorerURL: "https://bscscan.com",
      chainId: 56,
      isTestnet: false
   },
   {
      networkName: "Fantom Opera",
      rpcURL: "https://rpc.ftm.tools/",
      currencySymbol: "FTM",
      explorerURL: "https://ftmscan.com/",
      chainId: 250,
      isTestnet: false
   },
   // testnet network
   {
      networkName: "Polygon Testnet Mumbai",
      rpcURL: "https://matic-mumbai.chainstacklabs.com",
      currencySymbol: "MATIC",
      explorerURL: "https://mumbai.polygonscan.com",
      chainId: 80001,
      isTestnet: true
   },
   {
      networkName: "Ropsten Test Network",
      rpcURL: "https://ropsten.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d",
      currencySymbol: "ETH",
      explorerURL: "https://ropsten.etherscan.io",
      chainId: 3,
      isTestnet: true
   },
   {
      networkName: "Avalanche Fuji Testnet",
      rpcURL: "https://api.avax-test.network/ext/bc/C/rpc",
      currencySymbol: "AVAX",
      explorerURL: "https://testnet.snowtrace.io",
      chainId: 43113,
      isTestnet: true
   },
   {
      networkName: "Binance Smart Chain Testnet",
      rpcURL: "https://data-seed-prebsc-1-s1.binance.org:8545",
      currencySymbol: "BNB",
      explorerURL: "https://testnet.bscscan.com",
      chainId: 97,
      isTestnet: true
   },
   {
      networkName: "Fantom testnet",
      rpcURL: "https://rpc.testnet.fantom.network/",
      currencySymbol: "FTM",
      explorerURL: "https://testnet.ftmscan.com",
      chainId: 4002,
      isTestnet: true
   },
   {
      networkName: "Localhost 8545",
      rpcURL: "http://localhost:8545",
      currencySymbol: "ETH",
      chainId: 1337,
      isTestnet: true
   },
]

const providerDefaultData = [
   {
      providerName: "Sushiswap Ropsten Testnet",
      contractAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      networkId: 7
   }
]

const pairDefaultData = [
   {
      name: "Wrapped Ether",
      symbol: "ETH",
      contractAddress: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      decimals: 18,
      networkId: 7
   },
   {
      name: "USD Coin",
      symbol: "USDC",
      contractAddress: "0x0D9C8723B343A8368BebE0B5E89273fF8D712e3C",
      decimals: 6,
      networkId: 7
   },
   {
      name: "Uniswap",
      symbol: "UNI",
      contractAddress: "0x71d82Eb6A5051CfF99582F4CDf2aE9cD402A4882",
      decimals: 18,
      networkId: 7
   },
]

async function runSetup() {
	await sequelize.sync({ force: true })
	await Network.bulkCreate(networkDefaultData)
   await Provider.bulkCreate(providerDefaultData)
   await Pair.bulkCreate(pairDefaultData)
}

module.exports = {
	runSetup
}