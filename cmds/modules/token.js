const web3 = require('../../utils/web3')
const { Network, Token } = require('../../utils/database')


async function findNetworkInfo(networkId) {
	return await Network.findOne({
		where: { id: networkId }
	})
}


async function importToken(data, network) {
	const result = await Token.create({
		name: data.name,
		symbol: data.symbol,
		decimals: data.decimals,
		contractAddress: data.address,
		networkId: network
	})
}

module.exports = {
	importToken,
	findNetworkInfo
}