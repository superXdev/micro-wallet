const fs = require('fs')
const { getEstimateGasLimit } = require('../../utils/web3')


async function deployContract(data) {
   const gasLimit = await getEstimateGasLimit(data)
   return gasLimit
}


module.exports = {
   deployContract
}