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
})