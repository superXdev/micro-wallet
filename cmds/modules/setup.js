const { sequelize, Network, Provider, Pair } = require('../../utils/database')
const { rootPath } = require('../../utils/path')
const { networks } = require('./misc/networks')
const fs = require('fs')


const providerDefaultData = [
   // sushiswap testnet
   {
      providerName: "Sushiswap Testnet",
      contractAddress: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      networkId: 10
   }
]

const pairDefaultData = [
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