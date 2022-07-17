const Web3 = require('web3')
const { Provider, Pair, Token } = require('../../utils/database')
const web3 = require('../../utils/web3')
const swapAbi = require('../../abi/swapv2.json')
const BigNumber = require('bignumber.js')
const { APPROVE_TOKEN } = require('../../utils/constants')


// prototype of Number object
Number.prototype.noExponents = function() {
   var data = String(this).split(/[eE]/)
   if (data.length == 1) return data[0]

   var z = '',
      sign = this < 0 ? '-' : '',
      str = data[0].replace('.', ''),
      mag = Number(data[1]) + 1

   if (mag < 0) {
      z = sign + '0.'
      while (mag++) z += '0'
      return z + str.replace(/^\-/, '')
   }

   mag -= str.length
   while (mag--) z += '0';
   return str + z;
}


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

async function getPairSwap(data) {
	let a = await Pair.findOne({
		where: { symbol: data.a, networkId: data.networkId }
	})

	let b = await Pair.findOne({
		where: { symbol: data.b, networkId: data.networkId }
	})

	if(a === null) {
		a = await Token.findOne({
			where: { symbol: data.a, networkId: data.networkId }
		})

		if(a === null) return null
	}

	if(b === null) {
		b = await Token.findOne({
			where: { symbol: data.b, networkId: data.networkId }
		})

		if(b === null) return null
	}

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

function calcFinalMinOut(amount, decimals, slippage) {
	// amount = BigNumber(`${amount}e-${decimals}`).toString()
	const div = parseInt(amount) * slippage / 100
	const result = amount - parseInt(div)

	return result.noExponents()
}

async function getAmountsIn(data) {
	const web3 = new Web3(data.rpcURL)
	const swap = new web3.eth.Contract(swapAbi, data.contractAddress)

	return await swap.methods.getAmountsIn(data.amount, data.path).call()
}

async function approveToken(data) {
	const rawData = web3.getRawData({
		type: APPROVE_TOKEN,
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
	getPairSwap,
	calcFinalMinOut,
	getAmountsIn,
	approveToken
}