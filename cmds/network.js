exports.command = 'network <command>'
exports.desc = 'Manage network of blockchain'
exports.builder = function (yargs) {
  return yargs.commandDir('network_cmds')
}


exports.handler = function (argv) {}