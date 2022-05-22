exports.command = 'sc <command>'
exports.desc = 'Smart contract deployment & caller'
exports.builder = function (yargs) {
  return yargs.commandDir('sc_cmds')
}


exports.handler = function (argv) {}