const { Network } = require('../../utils/database')
const Web3 = require('web3')
const Web3HttpProvider = require('web3-providers-http')
const validator = require('validator')


async function asyncCallWithTimeout(asyncPromise, timeLimit) {
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
   } catch(err) {
      return null;
   }
}

// add new network
async function addNetwork(name, rpc, symbol, explorer, testnet) {
   if(!validator.isURL(rpc, { require_protocol: true, require_host: true })) {
      return {
         success: false,
         message: "URL is not valid"
      }
   }

   try {
      const data = {
         networkName: name,
         rpcURL: rpc,
         currencySymbol: symbol,
         isTestnet: testnet
      }

      if(explorer !== undefined) {
         data.explorerURL = explorer
      }

      await Network.create(data)

      return {
         success: true
      }
   } catch(err) {
      return {
         success: false,
         message: err.message
      }
   }
}

// check if network is already exists
async function isNetworkExists(name, symbol) {
   const result = await Network.findOne({ where: { networkName: name, currencySymbol: symbol } })

   if(result === null) {
      return false
   }

   return true
}

// delete a network
async function removeNetwork(id) {
   const isExists = await Network.findOne({ where: { id: id } })

   if(isExists) {
      return await Network.destroy({ where: { id: id } })
   }

   return 0
}



module.exports = {
	getNetworkList,
   getConnectionStatus,
   addNetwork,
   isNetworkExists,
   getBlockNumber,
   removeNetwork
}
