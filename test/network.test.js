const { expect } = require("chai");
const network = require('../cmds/modules/network');
const { runSetup } = require('../cmds/modules/setup');


describe("Network modules", () => {
	before((done) => {
		runSetup().then(() => done())
	})

	it("getNetworkList: should return 3 network", async () => {
		const networks = await network.getNetworkList()
		expect(networks).to.have.lengthOf(3)
	})
})