const { Network } = require('../../utils/database')


// get list of all network
async function getNetworkList() {
   const result = await Network.findAll()

   return result
}

module.exports = {
	getNetworkList
}
