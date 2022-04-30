exports.command = 'wallet <command>'
exports.desc = 'Manage wallet or account'
exports.builder = function (yargs) {
  return yargs.commandDir('wallet_cmds')
}

exports.handler = function (argv) {}