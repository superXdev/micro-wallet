exports.command = 'create'
exports.desc = 'Create new wallet or account.'
exports.builder = {
  name: {
    demand: true,
    type: 'string',
    alias: 'n',
    desc: 'Set your wallet name or identifier'
  }
}

exports.handler = function (argv) {
  console.log('*create wallet', argv.dir)
}