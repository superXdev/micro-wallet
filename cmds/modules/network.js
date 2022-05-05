const { Network } = require('../../utils/database')
const Web3 = require('web3')
const Web3HttpProvider = require('web3-providers-http')


// get list of all network
async function getNetworkList(testnet = false) {
   const result = await Network.findAll({
      where: { isTestnet: testnet }
   })

   return result
}

// check network connection
async function getConnectionStatus(rpc) {
   try {
      const provider = new Web3HttpProvider(rpc, { timeout: 2000 })
      const web3 = new Web3(provider)
      return await web3.eth.getBlockNumber()
   } catch {
      return null
   }
}

module.exports = {
	getNetworkList,
   getConnectionStatus
}
