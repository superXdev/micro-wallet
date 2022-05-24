const ENS = require('@ensdomains/ensjs')
const Web3 = require('web3')


async function getAddressOfEns(rpcURL, domain) {
	const provider = new Web3.providers.HttpProvider(rpcURL)

	const ens = new ENS.default({
		provider,
		ensAddress: ENS.getEnsAddress('1')
	})

	return await ens.name(domain).getAddress()
}

module.exports = {
	getAddressOfEns
}