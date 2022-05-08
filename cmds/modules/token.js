const web3 = require('../../utils/web3')
const { Network, Token } = require('../../utils/database')



async function getTokenList(networkId) {
	const data = Token.findAll({
		where: { networkId: networkId }
	})

	return data
}


async function importToken(data) {
	const result = await Token.create({
		name: data.name,
		symbol: data.symbol,
		decimals: data.decimals,
		contractAddress: data.address,
		networkId: data.networkId
	})

	return result.id
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
	getTokenList,
	getTokenBySymbol,
	removeToken
}