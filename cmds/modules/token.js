const web3 = require('../../utils/web3')
const { Network, Token } = require('../../utils/database')
const erc20Abi = require('../../abi/erc20.json')
const Web3 = require('web3')
const BigNumber = require("bignumber.js")




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
	const web3 = new Web3()
	return new BigNumber(amount.toString() + "e" + decimals).toString()
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