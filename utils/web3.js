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

// get data for raw transction of token transfer
function getTransferTokenData(data) {
	const web3 = new Web3(data.rpcURL)
	const token = new web3.eth.Contract(erc20Abi, data.contractAddress)

	return token.methods.transfer(
		data.destination,
		data.amount
	).encodeABI()
}

// get current gas price
async function getGasPrice(rpcURL) {
	const web3 = new Web3(rpcURL)

	return await web3.eth.getGasPrice()
}

// sign a transaction
async function signTransaction(data) {
	const web3 = new Web3(data.rpcURL)
	const nonce = await web3.eth.getTransactionCount(data.from)
	
	// Build the transaction
	let txData = {
		nonce:    web3.utils.toHex(nonce),
		to:       data.destination,
		value:    web3.utils.toHex(web3.utils.toWei(data.value, 'ether')),
		gasLimit: web3.utils.toHex(data.gasLimit),
		gasPrice: web3.utils.toHex(data.gasPrice)
	}

	if(data.useData) {
		txData.data = data.data
	}

	// Sign the transaction
	const common = Common.custom({ chainId: data.chainId })
	const tx = Transaction.fromTxData(txData, { common })
	return tx.sign(Buffer.from(data.privateKey, 'hex'))
}

// sending a transaction
function sendingTransaction(txSigned, rpcURL) {
	const web3 = new Web3(rpcURL)
	const serializedTx = txSigned.serialize()
	return web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
}

// formatter
function fromWeiToGwei(wei) {
	const web3 = new Web3()
	return web3.utils.fromWei(wei.toString(), 'gwei')
}

function fromWeiToEther(wei) {
	const web3 = new Web3()
	return web3.utils.fromWei(wei.toString())
}

module.exports = {
	createAccount,
	getAddress,
	getNativeBalance,
	getTokenInfo,
	getTokenBalance,
	getEstimateGasLimit,
	getTransferTokenData,
	getGasPrice,
	signTransaction,
	sendingTransaction,
	fromWeiToGwei,
	fromWeiToEther
}