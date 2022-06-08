const fs = require('fs')
const Web3 = require('web3')
const { getEstimateGasLimit } = require('../../utils/web3')
const { rootPath } = require('../../utils/path')
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
         testnet: 'https://api-testnet.bscscan.com/api',
         apiKey: 'BSCSCAN_API'
      }
   }

   if(data[networkId] === undefined) {
      return null
   }

   const typeNetwork = isTestnet ? 'testnet' : 'mainnet'

   return {
      url: data[networkId][typeNetwork],
      apiKey: data[networkId].apiKey
   }
}

function findSolcVersion(ver) {
   const data = fs.readFileSync(`${rootPath()}/cmds/modules/misc/solc-list.txt`, 'utf8')
   const versions = data.split('\n')

   const index = versions.findIndex((version) => {
      if(version.includes(ver)) {
         return true
      }
   })

   return versions[index]
}

function readAbiFile(source) {
   return JSON.parse(fs.readFileSync(source, 'utf8').toString())
}


function getReadFunctions(abi) {
   const abiData = readAbiFile(abi)

   let results = abiData.filter(data => {
      return data.type === 'function' && data.stateMutability === 'view'
   })

   return results
}


async function callReadFunction(data) {
   const abiData = readAbiFile(data.abi)

   const web3 = new Web3(data.rpcURL)

   const contract = new web3.eth.Contract(abiData, data.address)

   return await contract.methods[data.function]().call()
}

function buildInputs(inputs) {
}

module.exports = {
   deployContract,
   verifyContract,
   getApiUrl,
   findSolcVersion,
   getReadFunctions,
   callReadFunction
}