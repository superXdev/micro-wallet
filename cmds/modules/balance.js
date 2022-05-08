const { Wallet, Network, Token } = require('../../utils/database')
const web3 = require('../../utils/web3')
const BigNumber = require("bignumber.js")


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

function formatBalance(balance, decimals) {
	if(balance === "0")
		return balance

   let newFormat = new BigNumber(balance + "e-" + decimals).toString()

   return Number(newFormat).toFixed(5)
}


module.exports = {
	getBalance,
	formatBalance
}