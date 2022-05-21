const { expect } = require("chai");
const wallet = require('../../cmds/modules/wallet');
const token = require('../../cmds/modules/token');
const { runSetup } = require('../../cmds/modules/setup');


describe("Token modules", () => {

	before(function(done) {
		this.timeout(5000)
		runSetup().then(() => done())
	})

	it("importToken: should return token ID", async () => {
		const result = await token.importToken({
			name: 'USD Coin',
			symbol: 'USDC',
			decimals: 8,
			address: '0x45c45697f64a5b8aba1a3300ac8db568a36b4666',
			networkId: 7
		})
		expect(result).to.be.equal(1)
	}).timeout(5000)

	it("getTokenBySymbol: should return token data", async () => {
		const result = await token.getTokenBySymbol('USDC')
		expect(result).to.deep.include({ id: 1 })
	})

	it("getTokenBySymbol: should return null", async () => {
		const result = await token.getTokenBySymbol('BNB')
		expect(result).to.be.a('null')
	})

	it("getTokenList: should return 1 token", async () => {
		const result = await token.getTokenList(7)
		expect(result).to.have.lengthOf(1)
	})

	it("getTokenList: should return null", async () => {
		await token.removeToken(1)
		const result = await token.getTokenList(7)
		expect(result).to.be.empty
	})

	it("removeToken: should return 1 or true", async () => {
		await token.importToken({
			name: 'USD Coin',
			symbol: 'USDC',
			decimals: 8,
			address: '0x45c45697f64a5b8aba1a3300ac8db568a36b4666',
			networkId: 7
		})
		const result = await token.removeToken(2)
		expect(result).to.be.equal(1)
	})

	it("removeToken: should return 0 or false", async () => {
		const result = await token.removeToken(2)
		expect(result).to.be.equal(0)
	})

})