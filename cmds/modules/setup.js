const { sequelize, Network, Provider, Pair } = require('../../utils/database')
const { rootPath } = require('../../utils/path')
const fs = require('fs')


const networkDefaultData = [
   // mainnet network
   {
      networkName: "Ethereum",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/eth/mainnet",
      currencySymbol: "ETH",
      explorerURL: "https://etherscan.io",
      chainId: 1,
      isTestnet: false
   },
   {
      networkName: "Polygon Mainnet",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/polygon/mainnet",
      currencySymbol: "MATIC",
      explorerURL: "https://polygonscan.com",
      chainId: 137,
      isTestnet: false
   },
   {
      networkName: "Avalanche C-Chain",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/avalanche/mainnet",
      currencySymbol: "AVAX",
      explorerURL: "https://snowtrace.io",
      chainId: 43114,
      isTestnet: false
   },
   {
      networkName: "Binance Smart Chain",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/bsc/mainnet",
      currencySymbol: "BNB",
      explorerURL: "https://bscscan.com",
      chainId: 56,
      isTestnet: false
   },
   {
      networkName: "Fantom Opera",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/fantom/mainnet",
      currencySymbol: "FTM",
      explorerURL: "https://ftmscan.com/",
      chainId: 250,
      isTestnet: false
   },
   // testnet network
   {
      networkName: "Polygon Testnet Mumbai",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/polygon/mumbai",
      currencySymbol: "MATIC",
      explorerURL: "https://mumbai.polygonscan.com",
      chainId: 80001,
      isTestnet: true
   },
   {
      networkName: "Ropsten Test Network",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/eth/ropsten",
      currencySymbol: "ETH",
      explorerURL: "https://ropsten.etherscan.io",
      chainId: 3,
      isTestnet: true
   },
   {
      networkName: "Avalanche Fuji Testnet",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/avalanche/testnet",
      currencySymbol: "AVAX",
      explorerURL: "https://testnet.snowtrace.io",
      chainId: 43113,
      isTestnet: true
   },
   {
      networkName: "Binance Smart Chain Testnet",
      rpcURL: "https://speedy-nodes-nyc.moralis.io/41082737c6efda05b1118010/bsc/testnet",
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
   // sushiswap testnet
   {
      providerName: "Sushiswap Ropsten Testnet",
      contractAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      networkId: 7
   }
]

const pairDefaultData = [
   // testnet token
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
   // reset database scheme
	await sequelize.sync({ force: true })

   // insert network data
	await Network.bulkCreate(networkDefaultData)

   // insert dex provider data
   await Provider.bulkCreate(providerDefaultData)

   // insert pair data
   await Pair.bulkCreate(pairDefaultData)
}

function initConfigFile() {
   // config object
   const config = {
      BSCSCAN_API: "",
      ETHERSCAN_API: ""
   }

   fs.writeFile(`${rootPath()}/config.json`, JSON.stringify(config, null, 3), { flag: 'w' }, err => {})
}

module.exports = {
	runSetup,
   initConfigFile
}