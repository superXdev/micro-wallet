const { dirname } = require('path')

function rootPath() {
	return dirname(require.main.filename)
}

module.exports = { rootPath }