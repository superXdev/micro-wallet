const Web3 = require('web3')
const erc20Abi = require('../abi/erc20.json')
const BigNumber = require("bignumber.js")


function createAccount() {
	const web3 = new Web3()
	const account = web3.eth.accounts.create()

	return account
}

function getAddress(privateKey) {
	const web3 = new Web3()
	const address = web3.eth.accounts.privateKeyToAccount(privateKey).address
	return address
}

async function getBalance(address, rpc) {
	const web3 = new Web3(rpc)
	const balance = await web3.eth.getBalance(address)

	return web3.utils.fromWei(balance)
}

async function getTokenInfo(address, rpc) {
	const web3 = new Web3(rpc)
	const token = new web3.eth.Contract(erc20Abi, address)

	// get all information
	const name = await token.methods.name().call()
	const symbol = await token.methods.symbol().call()
	const decimals = await token.methods.decimals().call()
	const totalSupply = await token.methods.totalSupply().call()

	return {
		name: name,
		symbol: symbol,
		decimals: decimals,
		totalSupply: new BigNumber(totalSupply + "e-" + decimals).toString()
	}
}

module.exports = {
	createAccount,
	getAddress,
	getBalance,
	getTokenInfo
}