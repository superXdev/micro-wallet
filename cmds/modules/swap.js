const Web3 = require('web3')
const { Provider, Pair } = require('../../utils/database')
const web3 = require('../../utils/web3')
const swapAbi = require('../../abi/swapv2.json')
const BigNumber = require('bignumber.js')


async function getMinOut(data) {
	const web3 = new Web3(data.rpcURL)
	const swap = new web3.eth.Contract(swapAbi, data.contractAddress)
	return await swap.methods.getAmountsOut(data.amount, data.path).call()
}


async function getProviderByNetwork(id) {
	return await Provider.findOne({
		where: { networkId: id }
	})
}

async function getPairBySymbol(data) {
	const a = await Pair.findOne({
		where: { symbol: data.a }
	})

	const b = await Pair.findOne({
		where: { symbol: data.b }
	})

	return [
		{ 
			symbol: a.symbol, 
			decimals: a.decimals,
			contractAddress: a.contractAddress 
		}, 
		{ 
			symbol: b.symbol, 
			decimals: b.decimals,
			contractAddress: b.contractAddress 
		}
	]
}

function calcFinalMinOut(amount, slippage) {
	const div = amount * slippage / 100
	return amount - parseInt(div)
}

async function getAmountsIn(data) {
	const web3 = new Web3(data.rpcURL)
	const swap = new web3.eth.Contract(swapAbi, data.contractAddress)

	return await swap.methods.getAmountsIn(data.amount, data.path).call()
}

async function approveToken(data) {
	const rawData = web3.getApproveData({
	rpcURL: data.rpcURL,
		spender: data.spender,
		owner: data.owner
	})

   const txSigned = await web3.signTransaction({
      rpcURL: data.rpcURL,
      destination: data.contractAddress,
      from: data.owner,
      value: '0',
      gasLimit: data.gasLimit,
      gasPrice: data.gasPrice,
      chainId: data.chainId,
      useData: true,
      data: rawData,
      privateKey: data.privateKey
   })

   await web3.sendingTransaction(txSigned, data.rpcURL)

}

module.exports = {
	getMinOut,
	getProviderByNetwork,
	getPairBySymbol,
	calcFinalMinOut,
	getAmountsIn,
	approveToken
}