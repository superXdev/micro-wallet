#!/usr/bin/env node

const boxen = require('boxen')
const yargs = require('yargs/yargs')(process.argv.slice(2))

yargs
   .command('$0', 'the default command', () => {}, (argv) => {
      console.log(boxen('Micro wallet 1.0.0', {
         borderColor: "green", 
         padding: 1, 
         margin: 1,
         borderStyle: 'bold'
      }))
   })
   .commandDir('cmds')
   .demandCommand()
   .help()
   .argv