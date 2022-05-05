const { Network } = require('../../utils/database')
const Web3 = require('web3')


// get list of all network
async function getNetworkList(testnet = false) {
   const result = await Network.findAll({
      where: { isTestnet: testnet }
   })

   return result
}

// check network connection
async function getConnectionStatus(id) {
   try {
      const networkData = await Network.findOne({ where: { id: id } })
      const web3 = new Web3(networkData.rpcURL)
      return await web3.eth.getBlockNumber()
   } catch {
      return null
   }
}

module.exports = {
	getNetworkList,
   getConnectionStatus
}
