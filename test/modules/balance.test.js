const { expect } = require("chai");
const wallet = require('../../cmds/modules/wallet');
const { getBalance, formatBalance } = require('../../cmds/modules/balance');
const network = require('../../cmds/modules/network');
const { Token } = require('../../utils/database')
const { runSetup } = require('../../cmds/modules/setup');


describe("Balance modules", () => {

	before(function(done) {
		this.timeout(5000)
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
	}).timeout(10000)

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
	}).timeout(10000)

	it("getBalance: should return null", async () => {
		const account = await wallet.getWalletByName('test')
		const networkData = await network.getNetworkById(7)
		const balance = await getBalance({
			address: account.address,
			rpc: networkData.rpc,
			isToken: true,
			target: 'USDT',
			network: 7
		})

		expect(balance).to.be.a('null')
	})

	it("getBalance: should return error", async () => {
		const balance = await getBalance({
			isToken: false,
			target: 'USDT',
			network: 7
		})
		expect(balance).to.deep.include({ error: true })
	})

	it("formatBalance: should return right format", async () => {
		const balance = formatBalance('1000000', 4)
		expect(balance).to.be.equal('100.00000')
	})

	it("formatBalance: should return 0", async () => {
		const balance = formatBalance('0', 4)
		expect(balance).to.be.equal('0')
	})
})