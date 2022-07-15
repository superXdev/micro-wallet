const { sequelize, Network, Provider, Pair } = require('../../utils/database')
const { rootPath } = require('../../utils/path')
const { networks } = require('./misc/networks')
const fs = require('fs')


const providerDefaultData = [
   // pancakeswap
   {
      providerName: "Pancakeswap",
      contractAddress: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
      networkId: 4
   },
   // sushiswap Polygon
   {
      providerName: "Sushiswap",
      contractAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      networkId: 2
   },
   // sushiswap testnet
   {
      providerName: "Sushiswap Testnet",
      contractAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      networkId: 10
   }
]

const pairDefaultData = [
   // mainnet token
   {
      name: "Wrapped Matic",
      symbol: "MATIC",
      contractAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
      networkId: 2
   },
   {
      name: "USD Coin",
      symbol: "USDC",
      contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
      networkId: 2
   },
   {
      name: "Wrapped BNB",
      symbol: "BNB",
      contractAddress: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      decimals: 18,
      networkId: 4
   },
   {
      name: "Binance-Peg BUSD",
      symbol: "BUSD",
      contractAddress: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      decimals: 18,
      networkId: 4
   },
   // testnet token
   {
      name: "Wrapped Ether",
      symbol: "ETH",
      contractAddress: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      decimals: 18,
      networkId: 10
   },
   {
      name: "USD Coin",
      symbol: "USDC",
      contractAddress: "0x88CdDc7Ce9A2a982a51b0f5a272bBa17009686E2",
      decimals: 8,
      networkId: 10
   },
   {
      name: "Uniswap",
      symbol: "UNI",
      contractAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      decimals: 18,
      networkId: 10
   }
]

async function runSetup() {
   // reset database scheme
	await sequelize.sync({ force: true })

   // insert network data
	await Network.bulkCreate(networks)

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