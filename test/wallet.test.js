const { expect } = require("chai");
const fs = require("fs");
const wallet = require('../cmds/modules/wallet');
const { sequelize } = require('../utils/database');
const web3 = require('../utils/web3');
const { runSetup } = require('../cmds/modules/setup');

describe("Wallet modules", () => {
	before((done) => {
		runSetup().then(() => done())
		
	})

	it("getWalletList: should return zero wallet", async () => {
		const wallets = await wallet.getWalletList()
		expect(wallets).to.be.empty
	})

	it("createWallet: should return account info", async () => {
		const result = await wallet.createWallet('test', '123')
		const wallets = await wallet.getWalletList()

		expect(wallets).to.have.lengthOf(1)
		expect(result).to.have.own.property('address')
	})

	it("isWalletExists: should return true if exists", async () => {
		const result = await wallet.isWalletExists('test')
		expect(result).to.be.true
	})

	it("exportWallet: should return encrypted privateKey", async () => {
		const result = await wallet.exportWallet('test', '123')
		
		expect(result).to.have.own.property('privateKey')
	})

	it("importWallet: should return an object", async () => {
		const account = web3.createAccount()
		account.walletName = 'test2'
		account.password = 'password'
		const result = await wallet.importWallet(account)
		
		expect(result).to.be.an('object')
	})

	it("removeWallet: should return an object", async () => {
		const result = await wallet.removeWallet('test')
		
		expect(result).to.be.equal(1)
	})
});