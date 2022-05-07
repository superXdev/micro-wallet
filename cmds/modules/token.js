const web3 = require('../../utils/web3')
const { Network, Token } = require('../../utils/database')


async function findNetworkInfo(networkId) {
	return await Network.findOne({
		where: { id: networkId }
	})
}


async function importToken(data) {
	const result = await Token.create({
		name: data.name,
		symbol: data.symbol,
		decimals: data.decimals,
		contractAddress: data.address,
		networkId: data.networkId
	})
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

module.exports = {
	importToken,
	findNetworkInfo,
	getTokenBySymbol,
	removeToken
}