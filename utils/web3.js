const Web3 = require('web3')
const erc20Abi = require('../abi/erc20.json')
const swapAbi = require('../abi/swapv2.json')
const BigNumber = require("bignumber.js")
const { Transaction } = require('@ethereumjs/tx')
const Common = require('@ethereumjs/common').default
const { 
	TRANSFER_TOKEN, 
	SWAP_ETH_FOR_TOKEN, 
	APPROVE_TOKEN,
	AMOUNT_ALLOWANCE,
	SWAP_TOKEN_FOR_ETH,
	SWAP_TOKEN_FOR_TOKEN,
	DEPLOY_ERC20,
	DEPLOY_CUSTOM_CONTRACT
} = require('./constants')

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

// get chain id
async function getChainId(rpc) {
	const web3 = new Web3(rpc)
	return await web3.eth.getChainId()
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
	// swap contract
	const token = new web3.eth.Contract(erc20Abi, data.contractAddress)
	const swap = new web3.eth.Contract(swapAbi, data.contractAddress)

	// for transfer token
	if(data.type == TRANSFER_TOKEN) {

		return await token.methods.transfer(
			data.destination,
			data.amount
		).estimateGas({ from: data.from })
	}

	if(data.type === SWAP_ETH_FOR_TOKEN) {
		return await swap.methods.swapExactETHForTokens(
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).estimateGas({ from: data.from, value: data.value })
	}

	if(data.type === SWAP_TOKEN_FOR_ETH) {
		return await swap.methods.swapExactTokensForETH(
			data.amountIn,
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).estimateGas({ from: data.from, value: data.value })
	}

	if(data.type === SWAP_TOKEN_FOR_TOKEN) {
		return await swap.methods.swapExactTokensForTokens(
			data.amountIn,
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).estimateGas({ from: data.from, value: data.value })
	}

	if(data.type === APPROVE_TOKEN) {
		return await token.methods.approve(
			data.spender,
			data.amount
		).estimateGas({ from: data.from })
	}

	if(data.type === DEPLOY_ERC20) {
		const newContract = new web3.eth.Contract(erc20Abi)
		return await newContract.deploy({
	        data: '0x' + data.bytecode,
	        arguments: data.arguments
	    }).estimateGas({ from: data.from })
	}

	if(data.type === DEPLOY_CUSTOM_CONTRACT) {
		const newContract = new web3.eth.Contract(data.abi)

		const param = {
	        data: '0x' + data.bytecode
	    }

	    if(data.arguments !== undefined){
	    	param.arguments = data.arguments
	    }

		return await newContract.deploy(param)
			.estimateGas({ from: data.from })
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

function getRawData(data) {
	const web3 = new Web3(data.rpcURL)
	const token = new web3.eth.Contract(erc20Abi, data.contractAddress)
	const swap = new web3.eth.Contract(swapAbi, data.contractAddress)
	
	if(data.type === SWAP_ETH_FOR_TOKEN) {
		return swap.methods.swapExactETHForTokens(
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).encodeABI()
	}

	if(data.type === SWAP_TOKEN_FOR_ETH) {
		return swap.methods.swapExactTokensForETH(
			data.amountIn,
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).encodeABI()
	}

	if(data.type === SWAP_TOKEN_FOR_TOKEN) {
		return swap.methods.swapExactTokensForTokens(
			data.amountIn,
			data.amountOutMin,
			data.path,
			data.to,
			data.deadline
		).encodeABI()
	}

	if(data.type === APPROVE_TOKEN) {
		return token.methods.approve(
			data.spender,
			AMOUNT_ALLOWANCE
		).encodeABI()
	}
}

// get data for deploy smart contract
function getContractData(data) {
	const web3 = new Web3(data.rpcURL)
	const newContract = new web3.eth.Contract(data.abi)

	const param = {
        data: '0x' + data.bytecode
    }

    if(data.arguments !== undefined){
    	param.arguments = data.arguments
    }

	return newContract.deploy(param).encodeABI()
}

// get current gas price
async function getGasPrice(rpcURL) {
	const web3 = new Web3(rpcURL)

	return await web3.eth.getGasPrice()
}

// sign a transaction
async function signTransaction(data) {
	const web3 = new Web3(data.rpcURL)
	let nonce = await web3.eth.getTransactionCount(data.from)
	nonce = (data.incNonce) ? nonce + 1 : nonce
	
	// Build the transaction
	let txData = {
		nonce:    web3.utils.toHex(nonce),
		to:       data.destination,
		value:    web3.utils.toHex(data.value),
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

function fromEtherToWei(ether) {
	const web3 = new Web3()
	return web3.utils.toWei(ether)
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
	fromWeiToEther,
	fromEtherToWei,
	getContractData,
	getChainId,
	getRawData
}