const Web3 = require('web3')

const web3 = new Web3()

function createAccount() {
	const account = web3.eth.accounts.create()

	return account
}

function getAddress(privateKey) {
	const address = web3.eth.accounts.privateKeyToAccount(privateKey).address
	return address
}

module.exports = {
	createAccount,
	getAddress
}