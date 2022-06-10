const fs = require('fs')
const chalk = require('chalk')
const Web3 = require('web3')
const { unlockWallet } = require('./wallet')
const { 
   getEstimateGasLimit, 
   getGasPrice,
   fromWeiToEther,
   fromWeiToGwei,
   fromEtherToWei,
   sendingTransaction,
   signTransaction
} = require('../../utils/web3')
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

function normalizeString(str) {
   let result = str.replace(/([A-Z])/g,' $1')
   result = result.charAt(0).toUpperCase() + result.slice(1)

   return result
}


function getReadFunctions(abi) {
   const abiData = readAbiFile(abi)

   let results = abiData.filter(data => {
      return data.type === 'function' && data.stateMutability === 'view'
   })

   return results
}

function getWriteFunctions(abi) {
   const abiData = readAbiFile(abi)

   let results = abiData.filter(data => {
      return data.type === 'function' && data.stateMutability !== 'view'
   })

   return results
}

async function callReadFunction(data) {
   try {
      const abiData = readAbiFile(data.abi)

      const web3 = new Web3(data.rpcURL)

      const contract = new web3.eth.Contract(abiData, data.address)

      let result = {}

      if(data.inputs !== null) {
         const args = Object.values(data.inputs)

         result.result = await contract.methods[data.function](...args).call()
      }

      result.data =  await contract.methods[data.function]().call()
      result.success = true

      return result
   } catch(err) {
      return {
         success: false,
         data: err
      }
   }
   
}

async function callWriteFunction(data) {
   try{
      // get JSON of abi from file
      const abiData = readAbiFile(data.abi)

      // web3 instances
      const web3 = new Web3(data.network.rpcURL)

      // smart contract instances
      const contract = new web3.eth.Contract(abiData, data.address)

      // declare result & method variable
      let result = {}
      let method = null

      // if inputs not zero or null
      if(data.inputs !== null) {
         // convert inputs object to array
         const args = Object.values(data.inputs)
         args.pop()

         method = contract.methods[data.function](...args)
      } else {
         method = contract.methods[data.function]()
      }

      // estimate gas limit
      const gasLimit = await method.estimateGas({
         from: data.account.address, 
         value: fromEtherToWei(data.inputs.value_)
      })

      // estimate gas price
      const gasPrice = await getGasPrice(data.network.rpcURL)

      // encode method data
      const rawData = method.encodeABI()

      // calculate total fee from gas price * gas limit
      const totalFee = fromWeiToEther(gasPrice * gasLimit).substr(0, 12)

      // show details before proceed the transaction
      console.log(chalk.white.bold(`\n  Transaction details`))
      console.log('  ==========')
      console.log(`  Sender    : ${data.account.address}`)
      console.log(`  Gas limit : ${gasLimit}`)
      console.log(`  Gas price : ${chalk.gray(fromWeiToGwei(gasPrice))} gwei`)
      console.log(`  Total fee : ${chalk.gray(totalFee)} ${data.network.currencySymbol}`)
      console.log()

      // unlock wallet to get decrypted private key
      const decryptedKey = await unlockWallet(data.account)

      const txSigned = await signTransaction({
         rpcURL: data.network.rpcURL,
         from: data.account.address,
         destination: data.address,
         value: fromEtherToWei(data.inputs.value_),
         gasLimit: gasLimit,
         gasPrice: gasPrice,
         chainId: data.network.chainId,
         useData: true,
         data: rawData,
         privateKey: decryptedKey
      })

      console.log('\nSending transaction into blockchain')

      result.data = await sendingTransaction(txSigned, data.network.rpcURL)
      result.success = true


      return result
   } catch(err) {
      if(err.toString().includes('insufficient funds')) {
         return {
            success: false,
            data: 'insufficient funds'
         }
      }

      if(err.toString().includes('execution reverted')) {
         return {
            success: false,
            data: 'execution reverted'
         }
      }

      return {
         success: false,
         data: err
      }
   }
}

function buildInputs(inputs) {
   const internalTypes = {
      string: 'string',
      address: 'string',
      uint8: 'string',
      uint256: 'string'
   }

   let results = inputs.map(data => (
      {
         type: 'input', 
         name: data.name, 
         message: `${normalizeString(data.name)} (${chalk.gray(data.type)}) :`
      }
   ))

   return results
}

module.exports = {
   deployContract,
   verifyContract,
   getApiUrl,
   findSolcVersion,
   getReadFunctions,
   callReadFunction,
   normalizeString,
   buildInputs,
   getWriteFunctions,
   callWriteFunction
}