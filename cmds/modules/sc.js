const fs = require('fs')
const { getEstimateGasLimit } = require('../../utils/web3')
const axios = require('axios')


async function deployContract(data) {
   const gasLimit = await getEstimateGasLimit(data)
   return gasLimit
}


async function verifyContract(data) {
   const params = new URLSearchParams()

   params.append('apikey', data.apiKey)
   params.append('module', 'contract')
   params.append('action', 'verifysourcecode')
   params.append('sourceCode', data.sourceCode)
   params.append('contractaddress', data.address)
   params.append('codeformat', 'solidity-single-file')
   params.append('contractname', data.contractName)
   params.append('compilerversion', data.compilerversion)
   params.append('OptimizationUsed', data.OptimizationUsed)

   const config = {
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
      }
   }

   const result = await axios.post(data.url, params, config)

   return result
}


function getApiUrl(networkId, isTestnet) {
   const data = {
      BNB: {
         mainnet: 'https://api.bscscan.com/api',
         testnet: 'https://api-testnet.bscscan.com/api'
      }
   }

   if(data[networkId] === undefined) {
      return null
   }

   const typeNetwork = isTestnet ? 'testnet' : 'mainnet'

   return data[networkId][typeNetwork]
}


module.exports = {
   deployContract,
   verifyContract,
   getApiUrl
}