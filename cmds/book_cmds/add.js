const chalk = require('chalk')
const { saveAddress } = require('../modules/book')


exports.command = 'add'
exports.desc = 'Add new address'
exports.builder = (yargs) => {
	yargs.option('address', {
		demand: true,
		type: 'string',
		alias: 'a',
		desc: 'An wallet address'
	})
	.option('name', {
		demand: true,
		type: 'string',
		alias: 'n',
		desc: 'Name or identifier'
	})
	.example([
		['$0 book add -a 0x00000000000 -n myWallet']
	])
}

exports.handler = async function (argv) {
	const result = await saveAddress(argv.name, argv.address)

	if(!result) {
		return console.log(`Address is not valid or name not alpha numeric characters`)
	}

	console.log(chalk.green('Address successfully saved'))
}
