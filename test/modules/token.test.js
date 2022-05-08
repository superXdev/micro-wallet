const { expect } = require("chai");
const wallet = require('../../cmds/modules/wallet');
const token = require('../../cmds/modules/token');
const { runSetup } = require('../../cmds/modules/setup');


describe("Token modules", () => {
	before((done) => {
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
	})

	it("getTokenBySymbol: should return token data", async () => {
		const result = await token.getTokenBySymbol('USDC')
		expect(result).to.deep.include({ id: 1 })
	})

	it("getTokenBySymbol: should return null", async () => {
		const result = await token.getTokenBySymbol('BNB')
		expect(result).to.be.a('null')
	})

})