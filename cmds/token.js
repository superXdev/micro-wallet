exports.command = 'token <command>'
exports.desc = 'Manage token'
exports.builder = function (yargs) {
  return yargs.commandDir('token_cmds')
}


exports.handler = function (argv) {}