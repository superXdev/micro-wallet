exports.command = 'remove'
exports.desc = 'Remove permanently a network'
exports.builder = {
  identifier: {
    demand: true,
    type: 'number',
    alias: 'i',
    desc: 'Set network id or identifier'
  },
}

exports.handler = function (argv) {}