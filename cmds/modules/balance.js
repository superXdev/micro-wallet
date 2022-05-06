const { Wallet, Network } = require('../../utils/database')

async function getWalletInfo(walletName) {
	const data = await Wallet.findOne({
		where: { walletName: walletName }
	})

	return {
		address: data.address,
		name: data.walletName
	}
}


async function getNetworkInfo(query) {
	let result = null
	if(query.symbol !== undefined && query.testnet !== undefined) {
		result = await Network.findOne({
			where: { currencySymbol: query.symbol, isTestnet: query.testnet }
		})
	}

	if(query.id !== undefined) {
		result = await Network.findOne({
			where: { id: query.id }
		})
	}

	return {
		name: result.networkName,
		rpc: result.rpcURL
	}
}

module.exports = {
	getWalletInfo,
	getNetworkInfo
}