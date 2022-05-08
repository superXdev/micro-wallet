const { Wallet, Network, Token } = require('../../utils/database')
const web3 = require('../../utils/web3')


async function getBalance(data) {
	try {
		if(!data.isToken) {
			return await web3.getNativeBalance(data.address, data.rpc)
		}

		const token = await Token.findOne({
			where: { symbol: data.target, networkId: data.network }
		})

		if(token === null) {
			return null
		}

		const balance = await web3.getTokenBalance(data.address, token.contractAddress, data.rpc)

		return {
			balance: balance,
			decimals: token.decimals
		}
	} catch(err) {
		return {
			error: true,
			message: err
		}
	}
	
}




module.exports = {
	getBalance
}