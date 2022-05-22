const web3 = require('../../utils/web3')
const { Network, Token } = require('../../utils/database')
const erc20Abi = require('../../abi/erc20.json')
const Web3 = require('web3')
const BigNumber = require("bignumber.js")


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


async function getTokenList(networkId) {
	const data = Token.findAll({
		where: { networkId: networkId }
	})

	return data
}


async function importToken(data) {
	const result = await Token.create({
		name: data.name,
		symbol: data.symbol,
		decimals: data.decimals,
		contractAddress: data.address,
		networkId: data.networkId
	})

	return result.id
}

async function getTokenBySymbol(symbol) {
	return await Token.findOne({ where: { symbol } })
}

async function removeToken(id) {
	const isExists = await Token.findOne({ where: { id: id } })

   if(isExists) {
      return await Token.destroy({ where: { id: id } })
   }

   return 0
}

async function getAllowance(data) {
	const web3 = new Web3(data.rpcURL)
	const token = new web3.eth.Contract(erc20Abi, data.contractAddress)
	return await token.methods.allowance(data.owner, data.spender).call()
}


async function getBalance(data) {
	const web3 = new Web3(data.rpcURL)
	const token = new web3.eth.Contract(erc20Abi, data.contractAddress)
	return await token.methods.balanceOf(data.owner).call()
}

function formatAmount(amount, decimals) {
	const big = new BigNumber(amount.toString() + "e" + decimals).toString()

	return parseFloat(big).noExponents()
}

module.exports = {
	importToken,
	getTokenList,
	getTokenBySymbol,
	removeToken,
	formatAmount,
	getAllowance,
	getBalance
}