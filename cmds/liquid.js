exports.command = 'liquid <command>'
exports.desc = 'Liquidity management'
exports.builder = function (yargs) {
  return yargs.commandDir('liquid_cmds')
}


exports.handler = function (argv) {}