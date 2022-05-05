const { Network } = require('../../utils/database')
const Web3 = require('web3')
const Web3HttpProvider = require('web3-providers-http')


const asyncCallWithTimeout = async (asyncPromise, timeLimit) => {
    let timeoutHandle;

    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(
            () => reject(new Error('timeout limit reached')),
            timeLimit
        );
    });

    return Promise.race([asyncPromise, timeoutPromise]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    })
}


// get list of all network
async function getNetworkList(testnet = false) {
   const result = await Network.findAll({
      where: { isTestnet: testnet }
   })

   return result
}

async function getBlockNumber(rpc) {
   const web3 = new Web3(rpc)
   return await web3.eth.getBlockNumber()
}

// check network connection
async function getConnectionStatus(rpc) {
   try {
      return await asyncCallWithTimeout(getBlockNumber(rpc), 2500)
   } catch {
      return null;
   }
}

module.exports = {
	getNetworkList,
   getConnectionStatus
}
