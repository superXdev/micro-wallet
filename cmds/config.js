exports.command = 'config <command>'
exports.desc = 'Set or update configuration'
exports.builder = function (yargs) {
  return yargs.commandDir('config_cmds')
}


exports.handler = function (argv) {}