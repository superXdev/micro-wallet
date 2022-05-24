const chalk = require('chalk')
const fs = require('fs')
const { verifyContract, getApiUrl } = require('../modules/sc')
const { getNetworkById } = require('../modules/network')
const config = require('../../config.json')
const { rootPath } = require('../../utils/path')


exports.command = 'set <attribute> <value>'
exports.desc = 'Set new value to a configuration'
exports.builder = (yargs) => {
   yargs.positional('attribute', {
      type: 'string'
   })
   yargs.positional('value', {
      type: 'string'
   })
}

exports.handler = function (argv) {
	// change or set the value to config object
	config[argv.attribute] = argv.value

	// write with new content
	fs.writeFile(`${rootPath()}/config.json`, JSON.stringify(config, null, 3), { flag: 'w' }, err => {
		if(err) {
			console.log(`Error with message: ${chalk.red.bold(err)}`)
		} else {
			console.log(chalk.green('New configuration has been updated'))
		}
	})
}