const { Wallet, Network, Token } = require('../../utils/database')
const web3 = require('../../utils/web3')


async function getWalletInfo(walletName) {
	const data = await Wallet.findOne({
		where: { walletName: walletName }
	})

	return {
		address: data.address,
		name: data.walletName
	}
}


async function getBalance(data) {
	try {
		if(!data.isToken) {
			return await web3.getNativeBalance(data.address, data.rpc)
		}

		const token = await Token.findOne({
			where: { symbol: data.target }
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


async function getNetworkInfo(id) {
	const result = await Network.findOne({
		where: { id: id }
	})

	return {
		name: result.networkName,
		rpc: result.rpcURL,
		currencySymbol: result.currencySymbol,
		isTestnet: result.isTestnet
	}
}

module.exports = {
	getWalletInfo,
	getNetworkInfo,
	getBalance
}