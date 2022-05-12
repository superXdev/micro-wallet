const { expect } = require("chai");
const {
	createAccount,
	getAddress,
	getTokenInfo
} = require('../utils/web3');

describe("Web3 utility", () => {

	it("createAccount: should return address & privateKey", async () => {
		const result = createAccount()
		expect(result).to.have.own.property('address')
		expect(result).to.have.own.property('privateKey')
	})

	it("getAddress: should return address", async () => {
		const account = createAccount()
		const result = getAddress(account.privateKey)
		expect(result).to.be.equal(account.address)
	})

	it("getTokenInfo: should return token property", async () => {
		const result = await getTokenInfo(
			'0x45c45697f64a5b8aba1a3300ac8db568a36b4666',
			'https://ropsten.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d'
		)
		expect(result).to.have.own.property('name')
		expect(result).to.have.own.property('symbol')
		expect(result).to.have.own.property('decimals')
		expect(result).to.have.own.property('totalSupply')
	}).timeout(5000)
})