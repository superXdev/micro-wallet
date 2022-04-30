exports.command = 'list'
exports.desc = 'Show all of wallet'

exports.handler = function (argv) {
  console.log('*all wallet', argv.dir)
}