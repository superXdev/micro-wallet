exports.command = 'remove'
exports.desc = 'Remove permanently a wallet.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Your wallet name or identifier'
  }
}
exports.handler = function (argv) {
  console.log('*remove wallet', argv.dir)
}