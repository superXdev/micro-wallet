const { expect } = require("chai");
const wallet = require('../../cmds/modules/wallet');
const { getBalance } = require('../../cmds/modules/balance');
const network = require('../../cmds/modules/network');
const { Token } = require('../../utils/database')
const { runSetup } = require('../../cmds/modules/setup');


describe("Balance modules", () => {
	before((done) => {
		runSetup().then(() => done())
	})

	it("getBalance: should return native coin balance", async () => {
		// create new wallet
		await wallet.createWallet('test', '123')

		const account = await wallet.getWalletByName('test')
		const networkData = await network.getNetworkById(7)
		const balance = await getBalance({
            address: account.address,
            rpc: networkData.rpc,
            isToken: false
         })

		expect(balance).to.be.equal('0')
	}).timeout(5000)

	it("getBalance: should return token balance", async () => {
		// import testnet token
		Token.create({
			name: 'USD Coin',
			symbol: 'USDC',
			decimals: 8,
			contractAddress: '0x45c45697f64a5b8aba1a3300ac8db568a36b4666',
			networkId: 7
		})

		const account = await wallet.getWalletByName('test')
		const networkData = await network.getNetworkById(7)
		const balance = await getBalance({
			address: account.address,
			rpc: networkData.rpc,
			isToken: true,
			target: 'USDC',
			network: 7
		})

		expect(balance).to.deep.include({ balance: '0' })
	})
})