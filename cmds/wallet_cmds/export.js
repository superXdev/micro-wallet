exports.command = 'export'
exports.desc = 'Export wallet to private key.'

exports.handler = function (argv) {
  console.log('*export wallet', argv.dir)
}