const { Network } = require('../../utils/database')


// get list of all network
async function getNetworkList(testnet = false) {
   const result = await Network.findAll({
      where: { isTestnet: testnet }
   })

   return result
}

module.exports = {
	getNetworkList
}
