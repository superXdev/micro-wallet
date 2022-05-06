const Web3 = require('web3')


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

module.exports = {
	createAccount,
	getAddress,
	getBalance
}