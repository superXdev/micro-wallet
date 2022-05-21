exports.command = 'book <command>'
exports.desc = 'Manage book address'
exports.builder = function (yargs) {
  return yargs.commandDir('book_cmds')
}


exports.handler = function (argv) {}