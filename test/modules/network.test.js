const { expect } = require("chai");
const network = require('../../cmds/modules/network');
const { runSetup } = require('../../cmds/modules/setup');


describe("Network modules", () => {
	before((done) => {
		runSetup().then(() => done())
	})

	it("getNetworkList: should return more than 0", async () => {
		const networks = await network.getNetworkList()
		expect(networks).to.have.lengthOf.above(0)
	})

	it("addNetwork: should return true", async () => {
		const result = await network.addNetwork("Test", 'https://test.com/rpc', "TT", undefined, true)
		expect(result).to.deep.include({ success: true })
	})

	it("addNetwork: should return true for explorer inserted", async () => {
		const result = await network.addNetwork("Test", 'https://test.com', "TT", 'https://scan.com', true)
		expect(result).to.deep.include({ success: true })
	})

	it("addNetwork: should return false when RPC is invalid", async () => {
		const result = await network.addNetwork("Test 2", 'https://test/rpc', "TT", undefined, true)
		expect(result).to.deep.include({ success: false })
	})

	it("addNetwork: should return false when error", async () => {
		const result = await network.addNetwork("Test 2", 'https://test.com/rpc')
		expect(result).to.deep.include({ success: false })
	})

	it("getConnectionStatus: should return number", async () => {
		const ethRpc = 'https://mainnet.infura.io/v3/7699ff9dd25b4694bc711ca3abcdec3d'
		const result = await network.getConnectionStatus(ethRpc)
		expect(result).to.be.an('number')
	}).timeout(6000)

	it("isNetworkExists: should return false", async () => {
		const result = await network.isNetworkExists("New networks", "NEW")
		expect(result).to.be.false
	}).timeout(6000)

	it("isNetworkExists: should return true when already exists", async () => {
		const result = await network.isNetworkExists("Test", "TT")
		expect(result).to.be.true
	}).timeout(6000)

	it("removeNetwork: should return true", async () => {
		const result = await network.removeNetwork(2)
		expect(result).to.be.equal(1)
	})

	it("removeNetwork: should return false when ID not found", async () => {
		const result = await network.removeNetwork(20)
		expect(result).to.be.equal(0)
	})
})