exports.command = 'import'
exports.desc = 'Import wallet with private key.'

exports.handler = function (argv) {
  console.log('*import wallet', argv.dir)
}