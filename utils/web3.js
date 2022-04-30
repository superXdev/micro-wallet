const Web3 = require('web3')

function createAccount() {
	const web3 = new Web3()
	const account = web3.eth.accounts.create()

	return account
}

module.exports = {
	createAccount
}