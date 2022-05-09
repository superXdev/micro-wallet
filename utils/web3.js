const Web3 = require('web3')
const erc20Abi = require('../abi/erc20.json')
const BigNumber = require("bignumber.js")
const { Transaction } = require('@ethereumjs/tx')
const Common = require('@ethereumjs/common').default
const { TRANSFER_TOKEN } = require('./constants')

// generate new account
// return address, privateKey, etc
function createAccount() {
	const web3 = new Web3()
	const account = web3.eth.accounts.create()

	return account
}

// get address from private key
function getAddress(privateKey) {
	const web3 = new Web3()
	const address = web3.eth.accounts.privateKeyToAccount(privateKey).address
	return address
}

// get coin or native coin balance from specific address & network
async function getNativeBalance(address, rpc) {
	const web3 = new Web3(rpc)
	const balance = await web3.eth.getBalance(address)

	return web3.utils.fromWei(balance)
}

// get token balance from specific network
async function getTokenBalance(userAddress, contractAddress, rpc) {
	const web3 = new Web3(rpc)
	const token = new web3.eth.Contract(erc20Abi, contractAddress)

	return await token.methods.balanceOf(userAddress).call()
}

// get token information from specific contract
// address and network
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

// get gas estimate for token transfer
async function getEstimateGasLimit(data) {
	// web3 instances
	const web3 = new Web3(data.rpcURL)
	// for transfer token
	if(data.type == TRANSFER_TOKEN) {
		// token contract
		const token = new web3.eth.Contract(erc20Abi, data.contractAddress)

		return await token.methods.transfer(
			data.destination,
			data.amount
		).estimateGas({ from: data.from })
	}

	// transfer native
	return 21000
}

module.exports = {
	createAccount,
	getAddress,
	getNativeBalance,
	getTokenInfo,
	getTokenBalance,
	getEstimateGasLimit
}